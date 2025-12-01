/**
 * Production-Ready Client Authentication Library
 * 
 * This module provides secure client-side authentication with:
 * - Server-backed JWT token authentication
 * - Secure session storage
 * - Role-based access control
 * - Profile management via API
 * - Statistics tracking
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-58d40dac`;

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export interface Session {
  token: string;
  username: string;
  role: 'admin' | 'user';
}

// Store session securely in sessionStorage (cleared on browser close)
function getSession(): Session | null {
  try {
    const sessionData = sessionStorage.getItem('session');
    return sessionData ? JSON.parse(sessionData) : null;
  } catch {
    return null;
  }
}

function setSession(session: Session): void {
  sessionStorage.setItem('session', JSON.stringify(session));
  // Also emit storage event for cross-tab updates
  window.dispatchEvent(new Event('storage'));
}

function clearSession(): void {
  sessionStorage.removeItem('session');
  window.dispatchEvent(new Event('storage'));
}

// Get auth headers for API requests
function getAuthHeaders(): HeadersInit {
  const session = getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': session ? `Bearer ${session.token}` : `Bearer ${publicAnonKey}`,
  };
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setSession({
        token: data.token,
        username: data.username,
        role: data.role,
      });
      
      // Trigger storage event for UI updates
      window.dispatchEvent(new Event('storage'));
      
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error - please try again' };
  }
}

export async function logout(): Promise<void> {
  const session = getSession();
  
  if (session) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  clearSession();
}

export async function validateSession(): Promise<boolean> {
  const session = getSession();
  if (!session) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return data.valid === true;
    }
    
    // Session invalid, clear it
    clearSession();
    return false;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

export function getCurrentUser(): string | null {
  const session = getSession();
  return session?.username || null;
}

export function isAdmin(username?: string): boolean {
  const session = getSession();
  if (!session) return false;
  
  // If username provided, check if it matches the session
  if (username && username !== session.username) return false;
  
  return session.role === 'admin';
}

export function setCurrentUser(username: string): void {
  // This function is kept for backwards compatibility
  // but sessions are now managed by the login function
  console.warn('setCurrentUser is deprecated - use login() instead');
}

// ============================================================================
// USER MANAGEMENT API (Admin only)
// ============================================================================

export interface User {
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return data.users || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function addUser(username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to create user' };
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function updateUserPassword(username: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${username}/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to update password' };
    }
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function deleteUser(username: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${username}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to delete user' };
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Network error' };
  }
}

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

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

// Local cache for profile data
let profileCache: ProfileData | null = null;

export async function getProfile(): Promise<ProfileData> {
  // Return cached profile if available
  if (profileCache) {
    return profileCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      profileCache = data;
      return data;
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }

  // Return default profile if fetch fails
  return {
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
}

export async function updateProfile(updates: Partial<ProfileData>): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (response.ok) {
      // Clear cache to force refresh
      profileCache = null;
      
      // Trigger storage event for UI updates
      window.dispatchEvent(new Event('storage'));
      
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to update profile' };
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Network error' };
  }
}

// Clear profile cache (useful after updates)
export function clearProfileCache(): void {
  profileCache = null;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface Statistics {
  totalUsers: number;
  totalLogins: number;
  lastLogin: string | null;
  profileViews: number;
}

export async function getStatistics(): Promise<Statistics> {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }

  return {
    totalUsers: 0,
    totalLogins: 0,
    lastLogin: null,
    profileViews: 0,
  };
}

// Deprecated functions kept for backwards compatibility
export async function initializeAuth(): Promise<void> {
  // No longer needed - server handles initialization
  await validateSession();
}

export function incrementProfileViews(): void {
  // No longer needed - server increments views automatically
}

export function incrementLogins(): void {
  // No longer needed - server tracks logins
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  const result = await login(username, password);
  return result.success;
}

export function getUser(username: string): User | undefined {
  // This function is deprecated - use getUsers() instead
  console.warn('getUser() is deprecated - use getUsers() instead');
  return undefined;
}
