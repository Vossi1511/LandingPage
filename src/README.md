# Vossi's Interactive Bio Page

A modern, interactive bio landing page with terminal interface and secure admin dashboard.

## Features

### 🖥️ Interactive Terminal
- Realistic typing animation on load
- Full command-line interface with Linux commands
- User authentication via `su` command
- Multiple Linux commands: `ls`, `cat`, `echo`, `pwd`, `date`, `neofetch`, and more

### 🔐 Secure Authentication
- SHA-256 password hashing with salt
- Role-based access control (Admin/User)
- Secure session management
- Password protection for admin features

### 👨‍💼 Admin Dashboard
Complete web interface for managing your bio page:

#### Statistics & Analytics
- Total users counter
- Login tracking
- Profile view metrics
- Last login timestamp

#### User Management
- Add new users with role assignment
- Change user passwords securely
- Delete users (protected main admin)
- View user details and creation dates

#### Profile Editor
- Upload custom profile picture
- Edit display name
- Manage alternate usernames
- Update quote and author
- Add/remove hobbies and interests
- Modify social media links

#### Settings
- System information
- Data reset functionality

### 🎨 Modern Design
- Gradient backgrounds with animated particles
- Smooth Motion animations
- Glassmorphic design elements
- Responsive layout
- Font-cycling animation for username

## Getting Started

### Default Login Credentials

**Admin Account:**
- Username: `vossi`
- Password: `password`

**User Account:**
- Username: `hannes`
- Password: `1511`

### How to Access Admin Dashboard

1. Type `su` in the terminal
2. Enter admin credentials (vossi / password)
3. Click the "Admin Panel" button in the top-right corner
4. Explore the dashboard features

**Keyboard Shortcut:** Press `Ctrl + Shift + A` to open the admin panel (when logged in as admin)

### Terminal Commands

Type `help` in the terminal to see all available commands:

```bash
su         - Switch user (login)
neofetch   - Display system information
whoami     - Print current user
pwd        - Print working directory
ls [opts]  - List directory contents (-l, -la)
cat [file] - Display file contents
echo [txt] - Print text
date       - Display current date/time
uptime     - Show system uptime
uname      - Print system information (-a, -r)
hostname   - Show hostname
df         - Display disk usage
free       - Show memory usage
clear      - Clear terminal
help       - Show help message
```

## Customization

### Adding Users

**Via Admin Dashboard:**
1. Login as admin
2. Go to User Management tab
3. Click "Add User"
4. Fill in username, password, and role
5. Click "Add User"

**Programmatically:**
Edit `/lib/auth.ts` and use the `addUser` function.

### Editing Profile

**Via Admin Dashboard:**
1. Login as admin
2. Go to Profile Editor tab
3. Modify any profile fields
4. Click "Save Changes"

**Programmatically:**
Edit `/lib/auth.ts` and modify the `DEFAULT_PROFILE` object.

### Changing Profile Picture

**Via Admin Dashboard:**
1. Go to Profile Editor → Profile Picture
2. Click "Choose File"
3. Select an image (recommended: square, 256x256px)
4. Image is automatically saved

**Programmatically:**
Update the profile image URL in the profile data.

## Technology Stack

- **React** - UI framework
- **Motion (Framer Motion)** - Animations
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Lucide React** - Icons
- **Web Crypto API** - Password hashing
- **LocalStorage** - Data persistence

## Security Notes

⚠️ **Important:**
- This is a **client-side demo** for portfolio/showcase purposes
- All data stored in browser localStorage
- **Not suitable for production** with real user data
- Do not store sensitive personal information
- For production, use server-side authentication

### Production Recommendations:
- Backend authentication (JWT, OAuth)
- Database storage (PostgreSQL, MongoDB)
- bcrypt for password hashing
- HTTPS encryption
- CSRF protection
- Rate limiting

## Data Management

### Viewing Data
All data is stored in browser localStorage:
- `users` - User accounts
- `currentUser` - Current session
- `profile` - Bio page data
- `statistics` - Usage metrics

### Resetting Data

**Via Admin Dashboard:**
1. Settings tab → "Reset All Data"
2. Confirm and page will reload

**Via Browser Console:**
```javascript
localStorage.clear();
location.reload();
```

## File Structure

```
/
├── lib/
│   └── auth.ts              # Authentication utilities
├── components/
│   ├── AdminDashboard.tsx   # Main admin interface
│   ├── UserManagement.tsx   # User CRUD operations
│   ├── ProfileEditor.tsx    # Profile editing interface
│   ├── InteractiveTerminal.tsx
│   ├── LoginDialog.tsx
│   ├── FontCycler.tsx
│   └── ui/                  # Shadcn components
├── App.tsx                  # Main application
└── styles/globals.css       # Global styles
```

## Credits

- Built with ❤️ using React & Motion
- Design inspired by modern terminal interfaces
- Icons by Lucide
- UI components by Shadcn/ui

## License

This is a personal portfolio project. Feel free to use as inspiration for your own projects!
