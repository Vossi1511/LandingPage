import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as auth from "./auth.tsx";
import * as profile from "./profile.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Robust CORS: handle preflight and always set headers on responses
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Ensure OPTIONS requests are handled quickly (preflight)
app.options("/*", (c) => {
  return c.text("", 204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "600",
  });
});

// Initialize database on startup
(async () => {
  try {
    console.log('Initializing server...');
    await auth.initializeUsers();
    await profile.initializeProfile();
    console.log('Server initialized successfully');
  } catch (e) {
    console.error('Initialization error:', e);
  }
})();

// Helper to normalize profile shape so frontend won't crash
function normalizeProfileShape(raw: any) {
  if (!raw || typeof raw !== 'object') {
    return {
      name: '',
      bio: '',
      hobbies: [],
      social: {},
      // add other expected fields with safe defaults as needed
    };
  }
  return {
    name: typeof raw.name === 'string' ? raw.name : '',
    bio: typeof raw.bio === 'string' ? raw.bio : '',
    hobbies: Array.isArray(raw.hobbies) ? raw.hobbies : [],
    social: raw.social && typeof raw.social === 'object' ? raw.social : {},
    // preserve other fields if present
    ...raw,
  };
}

// Health check endpoint
app.get("/make-server-58d40dac/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AUTH ENDPOINTS (unchanged logic)
app.post("/make-server-58d40dac/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return c.json({ error: 'Invalid input format' }, 400);
    }

    if (username.length > 50 || password.length > 100) {
      return c.json({ error: 'Input too long' }, 400);
    }

    const result = await auth.login(username, password);
    
    if (result.success) {
      return c.json({
        success: true,
        token: result.token,
        username,
        role: result.role,
      });
    } else {
      return c.json({ error: result.error || 'Invalid credentials' }, 401);
    }
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed - server error' }, 500);
  }
});

app.post("/make-server-58d40dac/auth/logout", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    await auth.logout(token);
    
    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
});

app.get("/make-server-58d40dac/auth/validate", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ valid: false }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const session = await auth.validateSession(token);
    
    if (session.valid) {
      return c.json({
        valid: true,
        username: session.username,
        role: session.role,
      });
    } else {
      return c.json({ valid: false }, 401);
    }
  } catch (error) {
    console.error('Session validation error:', error);
    return c.json({ valid: false }, 500);
  }
});

// USER MANAGEMENT (admin only) — unchanged
app.get("/make-server-58d40dac/users", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const adminCheck = await auth.requireAdmin(token);
    
    if (!adminCheck.authorized) {
      return c.json({ error: adminCheck.error || 'Unauthorized' }, 403);
    }

    const users = await auth.getAllUsers();
    return c.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

app.post("/make-server-58d40dac/users", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const adminCheck = await auth.requireAdmin(token);
    
    if (!adminCheck.authorized) {
      return c.json({ error: adminCheck.error || 'Unauthorized' }, 403);
    }

    const { username, password, role } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    const result = await auth.createUser(username, password, role || 'user');
    
    if (result.success) {
      return c.json({ success: true, message: 'User created successfully' });
    } else {
      return c.json({ error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

app.put("/make-server-58d40dac/users/:username/password", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const adminCheck = await auth.requireAdmin(token);
    
    if (!adminCheck.authorized) {
      return c.json({ error: adminCheck.error || 'Unauthorized' }, 403);
    }

    const username = c.req.param('username');
    const { newPassword } = await c.req.json();
    
    if (!newPassword) {
      return c.json({ error: 'New password is required' }, 400);
    }

    const result = await auth.updateUserPassword(username, newPassword);
    
    if (result.success) {
      return c.json({ success: true, message: 'Password updated successfully' });
    } else {
      return c.json({ error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error updating password:', error);
    return c.json({ error: 'Failed to update password' }, 500);
  }
});

app.delete("/make-server-58d40dac/users/:username", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const adminCheck = await auth.requireAdmin(token);
    
    if (!adminCheck.authorized) {
      return c.json({ error: adminCheck.error || 'Unauthorized' }, 403);
    }

    const username = c.req.param('username');
    const result = await auth.deleteUser(username);
    
    if (result.success) {
      return c.json({ success: true, message: 'User deleted successfully' });
    } else {
      return c.json({ error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// PROFILE ENDPOINTS (public)
app.get("/make-server-58d40dac/profile", async (c) => {
  try {
    const rawProfile = await profile.getProfile();
    
    // Increment view count (fire-and-forget)
    try {
      profile.incrementProfileViews().catch((e) => console.warn('incrementProfileViews failed', e));
    } catch (e) {
      console.warn('incrementProfileViews thrown', e);
    }

    const normalized = normalizeProfileShape(rawProfile);
    return c.json(normalized);
  } catch (error) {
    console.error('Error fetching profile:', error);
    // Return a normalized empty profile to avoid frontend crashes
    return c.json(normalizeProfileShape(null), 500);
  }
});

app.put("/make-server-58d40dac/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const adminCheck = await auth.requireAdmin(token);
    
    if (!adminCheck.authorized) {
      return c.json({ error: adminCheck.error || 'Unauthorized' }, 403);
    }

    const updates = await c.req.json();
    const result = await profile.updateProfile(updates);
    
    if (result.success) {
      const updatedProfile = await profile.getProfile();
      return c.json({ success: true, profile: normalizeProfileShape(updatedProfile) });
    } else {
      return c.json({ error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// STATISTICS (admin only)
app.get("/make-server-58d40dac/statistics", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const adminCheck = await auth.requireAdmin(token);
    
    if (!adminCheck.authorized) {
      return c.json({ error: adminCheck.error || 'Unauthorized' }, 403);
    }

    const stats = await profile.getStatistics();
    const users = await auth.getAllUsers();
    
    return c.json({
      ...stats,
      totalUsers: users.length,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

Deno.serve(app.fetch);
