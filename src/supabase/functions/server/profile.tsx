/**
 * Profile Management System
 * 
 * Centralized profile storage in database
 * Admin edits affect everyone viewing the profile
 */

import * as kv from "./kv_store.tsx";

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
  updatedAt: string;
}

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
  updatedAt: new Date().toISOString(),
};

// Initialize profile if it doesn't exist
export async function initializeProfile() {
  const profile = await kv.get('profile');
  
  if (!profile) {
    console.log('Initializing default profile...');
    await kv.set('profile', DEFAULT_PROFILE);
  }
}

// Get profile
export async function getProfile(): Promise<ProfileData> {
  const profile = await kv.get('profile') as ProfileData | null;
  
  if (!profile) {
    await initializeProfile();
    return DEFAULT_PROFILE;
  }
  
  return profile;
}

// Update profile (admin only)
export async function updateProfile(updates: Partial<ProfileData>): Promise<{ success: boolean; error?: string }> {
  try {
    const currentProfile = await getProfile();
    
    const updatedProfile: ProfileData = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set('profile', updatedProfile);
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// Increment profile views
export async function incrementProfileViews() {
  const stats = await kv.get('statistics') as any || {
    totalLogins: 0,
    lastLogin: null,
    profileViews: 0,
  };
  
  stats.profileViews += 1;
  await kv.set('statistics', stats);
}

// Get statistics
export async function getStatistics() {
  const stats = await kv.get('statistics') as any;
  
  if (!stats) {
    const defaultStats = {
      totalLogins: 0,
      lastLogin: null,
      profileViews: 0,
    };
    await kv.set('statistics', defaultStats);
    return defaultStats;
  }
  
  return stats;
}
