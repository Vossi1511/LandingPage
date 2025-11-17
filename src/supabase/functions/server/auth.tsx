/**
 * Server-side authentication with credentials from environment variables
 * 
 * SETUP INSTRUCTIONS:
 * 1. Click on the "Secrets" tab in the Supabase dashboard
 * 2. Add a new secret called "ADMIN_CREDENTIALS"
 * 3. Format: username1:password1:role1,username2:password2:role2
 * 4. Example: hannes:1511:user,vossi:password:admin
 * 5. Roles can be "admin" or "user" (defaults to "user" if not specified)
 * 
 * DEFAULT CREDENTIALS (if secret is not set):
 * - vossi / password (admin)
 * - hannes / 1511 (user)
 */

interface User {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

/**
 * Parse credentials from environment variable
 * Format: username1:password1:role1,username2:password2:role2
 * Example: hannes:1511:user,vossi:password:admin
 */
export function parseCredentials(): User[] {
  const credentials = Deno.env.get('ADMIN_CREDENTIALS');
  
  if (!credentials) {
    console.log('No ADMIN_CREDENTIALS found, using defaults');
    return [
      { username: 'vossi', password: 'password', role: 'admin' },
      { username: 'hannes', password: '1511', role: 'user' },
    ];
  }

  try {
    // Split by comma for multiple users
    const userEntries = credentials.split(',');
    return userEntries.map(entry => {
      const parts = entry.trim().split(':');
      const username = parts[0]?.trim() || '';
      const password = parts[1]?.trim() || '';
      const role = parts[2]?.trim() || 'user';
      
      // Skip invalid entries
      if (!username || !password) {
        console.warn(`Skipping invalid credential entry: ${entry}`);
        return null;
      }
      
      return {
        username,
        password,
        role: (role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
      };
    }).filter((user): user is User => user !== null);
  } catch (error) {
    console.error('Error parsing credentials:', error);
    return [
      { username: 'vossi', password: 'password', role: 'admin' },
      { username: 'hannes', password: '1511', role: 'user' },
    ];
  }
}

/**
 * Validate user credentials
 */
export function validateUser(username: string, password: string): { valid: boolean; role?: 'admin' | 'user' } {
  const users = parseCredentials();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    return { valid: true, role: user.role };
  }
  
  return { valid: false };
}

/**
 * Get all users (without passwords)
 */
export function getUsers(): Array<{ username: string; role: 'admin' | 'user' }> {
  const users = parseCredentials();
  return users.map(({ username, role }) => ({ username, role }));
}