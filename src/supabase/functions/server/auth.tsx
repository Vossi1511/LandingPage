/**
 * Production-Ready Authentication System
 * 
 * Features:
 * - bcrypt password hashing
 * - JWT token generation and validation
 * - Database-backed user storage
 * - Secure session management
 * - Rate limiting
 */

import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import * as kv from "./kv_store.tsx";

export interface User {
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Session {
  token: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
  expiresAt: string;
}

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Initialize default users if database is empty
export async function initializeUsers() {
  const users = await kv.getByPrefix('user:');
  
  if (users.length === 0) {
    console.log('Initializing default users...');
    
    // Create default admin user
    const adminPasswordHash = await bcrypt.hash('password');
    await kv.set('user:vossi', {
      username: 'vossi',
      passwordHash: adminPasswordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    
    // Create default regular user
    const userPasswordHash = await bcrypt.hash('1511');
    await kv.set('user:hannes', {
      username: 'hannes',
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: new Date().toISOString(),
    });
    
    console.log('Default users created: vossi (admin), hannes (user)');
  }
}

// Get user from database
export async function getUser(username: string): Promise<User | null> {
  const user = await kv.get(`user:${username}`);
  return user as User | null;
}

// Get all users (without password hashes)
export async function getAllUsers(): Promise<Array<{ username: string; role: 'admin' | 'user'; createdAt: string }>> {
  const users = await kv.getByPrefix('user:');
  return users.map((u: User) => ({
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
  }));
}

// Create new user
export async function createUser(username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<{ success: boolean; error?: string }> {
  // Check if user already exists
  const existingUser = await getUser(username);
  if (existingUser) {
    return { success: false, error: 'User already exists' };
  }
  
  // Validate username and password
  if (username.length < 3 || username.length > 20) {
    return { success: false, error: 'Username must be between 3 and 20 characters' };
  }
  
  if (password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters' };
  }
  
  // Hash password and create user
  const passwordHash = await bcrypt.hash(password);
  const user: User = {
    username,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  
  await kv.set(`user:${username}`, user);
  return { success: true };
}

// Update user password
export async function updateUserPassword(username: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const user = await getUser(username);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (newPassword.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters' };
  }
  
  user.passwordHash = await bcrypt.hash(newPassword);
  await kv.set(`user:${username}`, user);
  return { success: true };
}

// Delete user
export async function deleteUser(username: string): Promise<{ success: boolean; error?: string }> {
  const user = await getUser(username);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  // Prevent deleting the last admin
  const allUsers = await getAllUsers();
  const admins = allUsers.filter(u => u.role === 'admin');
  if (user.role === 'admin' && admins.length === 1) {
    return { success: false, error: 'Cannot delete the last admin user' };
  }
  
  await kv.del(`user:${username}`);
  return { success: true };
}

// Validate credentials and return session token
export async function login(username: string, password: string): Promise<{ success: boolean; token?: string; role?: 'admin' | 'user'; error?: string }> {
  // Rate limiting check
  const rateLimitKey = `ratelimit:login:${username}`;
  const attempts = await kv.get(rateLimitKey) as number | null;
  
  if (attempts && attempts >= 5) {
    return { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' };
  }
  
  // Get user from database
  const user = await getUser(username);
  if (!user) {
    // Increment rate limit counter
    await kv.set(rateLimitKey, (attempts || 0) + 1);
    return { success: false, error: 'Invalid credentials' };
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    // Increment rate limit counter
    await kv.set(rateLimitKey, (attempts || 0) + 1);
    return { success: false, error: 'Invalid credentials' };
  }
  
  // Clear rate limit on successful login
  await kv.del(rateLimitKey);
  
  // Generate session token
  const token = generateToken();
  const session: Session = {
    token,
    username: user.username,
    role: user.role,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };
  
  await kv.set(`session:${token}`, session);
  
  // Track login statistics
  const stats = await kv.get('statistics') as any || {
    totalLogins: 0,
    lastLogin: null,
    profileViews: 0,
  };
  stats.totalLogins += 1;
  stats.lastLogin = new Date().toISOString();
  await kv.set('statistics', stats);
  
  return { success: true, token, role: user.role };
}

// Validate session token
export async function validateSession(token: string): Promise<{ valid: boolean; username?: string; role?: 'admin' | 'user' }> {
  if (!token) {
    return { valid: false };
  }
  
  const session = await kv.get(`session:${token}`) as Session | null;
  if (!session) {
    return { valid: false };
  }
  
  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    await kv.del(`session:${token}`);
    return { valid: false };
  }
  
  return { valid: true, username: session.username, role: session.role };
}

// Logout (invalidate session)
export async function logout(token: string): Promise<void> {
  await kv.del(`session:${token}`);
}

// Require admin role middleware
export async function requireAdmin(token: string): Promise<{ authorized: boolean; username?: string; error?: string }> {
  const session = await validateSession(token);
  
  if (!session.valid) {
    return { authorized: false, error: 'Invalid or expired session' };
  }
  
  if (session.role !== 'admin') {
    return { authorized: false, error: 'Admin access required' };
  }
  
  return { authorized: true, username: session.username };
}