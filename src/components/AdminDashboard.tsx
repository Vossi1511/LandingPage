import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Users,
  BarChart3,
  UserCircle,
  LogOut,
  Shield,
  Eye,
  UserPlus,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getCurrentUser, logout, isAdmin, getStatistics } from '../lib/auth';
import { UserManagement } from './UserManagement';
import { ProfileEditor } from './ProfileEditor';
import { toast } from 'sonner@2.0.3';

interface AdminDashboardProps {
  onClose: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [stats, setStats] = useState(getStatistics());

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (!user || !isAdmin(user)) {
      toast.error('Access denied. Admin privileges required.');
      onClose();
    }
  }, [onClose]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    onClose();
  };

  const refreshStats = () => {
    setStats(getStatistics());
  };

  if (!currentUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 overflow-auto"
    >
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-400" />
                Admin Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                Logged in as <span className="text-blue-400 font-mono">{currentUser}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                Close Dashboard
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-white">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Total Logins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-white">{stats.totalLogins}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Profile Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-white">{stats.profileViews}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Last Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-white">
                  {stats.lastLogin
                    ? new Date(stats.lastLogin).toLocaleString()
                    : 'Never'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-slate-900/50 border border-slate-700">
              <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-slate-700">
                <UserCircle className="w-4 h-4 mr-2" />
                Profile Editor
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <UserManagement onUserChange={refreshStats} />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <ProfileEditor />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Settings</CardTitle>
                  <CardDescription className="text-slate-400">
                    Configure your bio page settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-slate-300">
                    <p className="mb-2">Current Features:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                      <li>Secure password hashing with SHA-256</li>
                      <li>LocalStorage-based user management</li>
                      <li>Admin role-based access control</li>
                      <li>Real-time statistics tracking</li>
                      <li>Profile customization</li>
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
                    onClick={() => {
                      localStorage.clear();
                      toast.success('All data cleared. Page will reload.');
                      setTimeout(() => window.location.reload(), 1000);
                    }}
                  >
                    Reset All Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
