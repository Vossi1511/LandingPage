# Secure Authentication System

## Overview

This bio page now features a **secure authentication system** with:
- SHA-256 password hashing with salt
- Role-based access control (Admin/User)
- LocalStorage persistence
- Admin dashboard for user and profile management

## Default Users

| Username | Password | Role  |
|----------|----------|-------|
| ******   | ******** | Admin |
| ******   | ****     | User  |

## Security Features

### Password Security
- Passwords are hashed using SHA-256 with a salt
- Passwords are NEVER stored in plain text
- Hash comparison for authentication
- Secure password update functionality

### Access Control
- Admin role has full dashboard access
- User role has limited terminal access
- Protected admin routes
- Session management via localStorage

## Admin Dashboard Features

### 1. Statistics Dashboard
- Total users count
- Total login attempts
- Profile view tracking
- Last login timestamp

### 2. User Management
- Add new users with role assignment
- Edit user passwords (secure hash update)
- Delete users (except main admin)
- View user creation dates and roles

### 3. Profile Editor
- Change profile picture (upload custom image)
- Edit display name
- Manage alternate usernames
- Update quote and author
- Add/remove hobbies and interests
- Modify social media links

### 4. Settings
- System information
- Data reset functionality

## How to Access Admin Dashboard

1. Login via terminal using the `su` command
2. Use admin credentials (vossi / password)
3. Click the "Admin Panel" button that appears in the top-right corner
4. Navigate through the dashboard tabs

## Adding Users via Admin Dashboard

1. Access Admin Dashboard
2. Go to "User Management" tab
3. Click "Add User" button
4. Enter username, password, and select role
5. Click "Add User" to create

## Adding Users Programmatically

To add users in code, use the auth utilities in `/lib/auth.ts`:

```typescript
import { addUser } from './lib/auth';

// Add a new user
await addUser('username', 'password', 'admin'); // or 'user'
```

## Password Hashing

Passwords are hashed using the following method:

```typescript
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'vossi-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **This is a client-side demo** - All data is stored in localStorage
2. **Not for production** - Real applications should use server-side authentication
3. **No PII** - Do not store sensitive personal information
4. **Portfolio/Demo use** - This is designed for showcase purposes

For production applications, use:
- Backend authentication (JWT, OAuth, etc.)
- Database storage (PostgreSQL, MongoDB, etc.)
- Proper bcrypt hashing
- HTTPS encryption
- Session management
- CSRF protection

## Data Storage

All data is stored in localStorage:
- `users` - User accounts and hashed passwords
- `currentUser` - Current logged-in user
- `profile` - Profile data (name, hobbies, etc.)
- `statistics` - Usage statistics

## Resetting the System

To reset all data:
1. Go to Admin Dashboard → Settings tab
2. Click "Reset All Data"
3. Page will reload with fresh default data

Or manually clear localStorage in browser console:
```javascript
localStorage.clear();
location.reload();
```
