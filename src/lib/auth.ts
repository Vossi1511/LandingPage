/**
 * Secure Authentication System
 * 
 * This module provides a secure client-side authentication system with:
 * - SHA-256 password hashing with salt
 * - Role-based access control (Admin/User)
 * - LocalStorage persistence
 * - Profile management
 * - Statistics tracking
 * 
 * Default Users:
 * - vossi (password: "password", role: admin)
 * - hannes (password: "1511", role: user)
 * 
 * Security Note: This is for demo/portfolio purposes only.
 * For production, use server-side authentication with bcrypt, JWT, etc.
 */

// Hash function using SHA-256 with salt
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'vossi-salt-2024'); // Add salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// User interface
export interface User {
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
}

// Profile data interface
export interface ProfileData {
  name: string;
  alternateNames: string[];
  hobbies: Array<{
    icon: string;
    label: string;
    color: string;
  }>;
  badges: Array<{
    icon: string;
    label: string;
    color: string;
  }>;
  quote: {
    text: string;
    author: string;
  };
  socialLinks: Array<{
    icon: string;
    label: string;
    href: string;
    color: string;
  }>;
  profileImage: string;
}

// Initialize default users with proper password hashing
async function createDefaultUsers(): Promise<User[]> {
  return [
    {
      username: 'vossi',
      passwordHash: await hashPassword('password'),
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      username: 'hannes',
      passwordHash: await hashPassword('1511'),
      role: 'user',
      createdAt: new Date().toISOString(),
    },
  ];
}

// Initialize users in localStorage
export async function initializeAuth() {
  if (!localStorage.getItem('users')) {
    const defaultUsers = await createDefaultUsers();
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
}

// Get all users
export function getUsers(): User[] {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

// Validate credentials
export async function validateCredentials(username: string, password: string): Promise<boolean> {
  const users = getUsers();
  const hashedPassword = await hashPassword(password);
  return users.some(
    user => user.username === username && user.passwordHash === hashedPassword
  );
}

// Get user by username
export function getUser(username: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.username === username);
}

// Add new user
export async function addUser(username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<boolean> {
  const users = getUsers();
  
  if (users.some(u => u.username === username)) {
    return false; // User already exists
  }
  
  const newUser: User = {
    username,
    passwordHash: await hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

// Update user password
export async function updateUserPassword(username: string, newPassword: string): Promise<boolean> {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex === -1) return false;
  
  users[userIndex].passwordHash = await hashPassword(newPassword);
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

// Delete user
export function deleteUser(username: string): boolean {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.username !== username);
  
  if (filteredUsers.length === users.length) return false;
  
  localStorage.setItem('users', JSON.stringify(filteredUsers));
  return true;
}

// Session management
export function setCurrentUser(username: string) {
  localStorage.setItem('currentUser', username);
}

export function getCurrentUser(): string | null {
  return localStorage.getItem('currentUser');
}

export function logout() {
  localStorage.removeItem('currentUser');
}

export function isAdmin(username: string): boolean {
  // First check if role is stored in localStorage from server auth
  const storedRole = localStorage.getItem('userRole');
  if (storedRole === 'admin') {
    return true;
  }
  
  // Fallback to local user check
  const user = getUser(username);
  return user?.role === 'admin';
}

// Profile data management
const DEFAULT_PROFILE: ProfileData = {
  name: 'Vossi',
  alternateNames: ['vossi1511', 'vxssi', 'vxssi_', 'vxssi1511'],
  hobbies: [
    { icon: 'CarFront', label: 'Sim Racing', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
    { icon: 'Plane', label: 'Flight Simming', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    { icon: 'Cpu', label: 'Tech', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { icon: 'Flag', label: 'F1', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
    { icon: 'Music', label: 'Music', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  ],
  badges: [
    { icon: 'GraduationCap', label: 'Student', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    { icon: 'Flag', label: '🇩🇪 Germany', color: 'bg-slate-700/50 text-slate-200 border-slate-600' },
  ],
  quote: {
    text: 'Wer lesen kann ist klar im vorteil',
    author: 'T.G.',
  },
  socialLinks: [
    { icon: 'Mail', label: 'Email', href: 'mailto:vossi@vossi.qzz.io', color: 'hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300' },
    { icon: 'MessageCircle', label: 'Discord', href: 'https://discord.com/users/vossi1511', color: 'hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-300' },
  ],
  profileImage: '',
};

export function getProfile(): ProfileData {
  const profile = localStorage.getItem('profile');
  return profile ? JSON.parse(profile) : DEFAULT_PROFILE;
}

export function updateProfile(data: Partial<ProfileData>): void {
  const currentProfile = getProfile();
  const updatedProfile = { ...currentProfile, ...data };
  localStorage.setItem('profile', JSON.stringify(updatedProfile));
}

// Statistics
export interface Statistics {
  totalUsers: number;
  totalLogins: number;
  lastLogin: string | null;
  profileViews: number;
}

export function getStatistics(): Statistics {
  const stats = localStorage.getItem('statistics');
  if (stats) {
    return JSON.parse(stats);
  }
  
  const defaultStats: Statistics = {
    totalUsers: getUsers().length,
    totalLogins: 0,
    lastLogin: null,
    profileViews: 0,
  };
  
  localStorage.setItem('statistics', JSON.stringify(defaultStats));
  return defaultStats;
}

export function incrementLogins() {
  const stats = getStatistics();
  stats.totalLogins += 1;
  stats.lastLogin = new Date().toISOString();
  localStorage.setItem('statistics', JSON.stringify(stats));
}

export function incrementProfileViews() {
  const stats = getStatistics();
  stats.profileViews += 1;
  localStorage.setItem('statistics', JSON.stringify(stats));
}