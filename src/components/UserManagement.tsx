import { useState, useEffect } from 'react';
import { User, Trash2, Edit, Plus, Shield, UserCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { getUsers, addUser, deleteUser, updateUserPassword, type User as UserType } from '../lib/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface UserManagementProps {
  onUserChange?: () => void;
}

export function UserManagement({ onUserChange }: UserManagementProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Add user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  
  // Edit user form
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      toast.error('Please enter username and password');
      return;
    }

    const success = await addUser(newUsername, newPassword, newRole);
    if (success) {
      toast.success(`User ${newUsername} added successfully`);
      setIsAddDialogOpen(false);
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      loadUsers();
      onUserChange?.();
    } else {
      toast.error('User already exists');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !editPassword) {
      toast.error('Please enter a new password');
      return;
    }

    const success = await updateUserPassword(selectedUser, editPassword);
    if (success) {
      toast.success(`Password updated for ${selectedUser}`);
      setIsEditDialogOpen(false);
      setEditPassword('');
      setSelectedUser(null);
    } else {
      toast.error('Failed to update password');
    }
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'vossi') {
      toast.error('Cannot delete the main admin user');
      return;
    }

    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
      const success = deleteUser(username);
      if (success) {
        toast.success(`User ${username} deleted`);
        loadUsers();
        onUserChange?.();
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  return (
    <>
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage system users and their permissions
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Username</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">Created</TableHead>
                <TableHead className="text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.username} className="border-slate-700">
                  <TableCell className="text-white font-mono flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-slate-400" />
                    {user.username}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-slate-700/50 text-slate-300 border-slate-600'
                      }
                    >
                      {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user.username);
                          setIsEditDialogOpen(true);
                        }}
                        className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      {user.username !== 'vossi' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.username)}
                          className="bg-red-900/20 border-red-500/40 text-red-300 hover:bg-red-900/30"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new user account with specified credentials
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-username" className="text-slate-200">
                Username
              </Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-slate-800 border-slate-600 text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-200">
                Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-slate-800 border-slate-600 text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role" className="text-slate-200">
                Role
              </Label>
              <Select value={newRole} onValueChange={(value: 'admin' | 'user') => setNewRole(value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white">
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User: {selectedUser}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the password for this user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-slate-200">
                New Password
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-slate-800 border-slate-600 text-slate-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditPassword('');
                setSelectedUser(null);
              }}
              className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="bg-blue-600 hover:bg-blue-700 text-white">
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
