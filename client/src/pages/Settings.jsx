import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const { mutate, isPending } = useMutation({
    mutationFn: (d) => api.put('/auth/password', d),
    onSuccess: () => { toast.success('Password updated!'); setPasswords({ currentPassword: '', newPassword: '', confirm: '' }); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    mutate({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="card mb-6">
        <h2 className="font-semibold mb-1">Account</h2>
        <p className="text-sm text-gray-500 mb-4">Manage your account details.</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{user?.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium capitalize">{user?.role}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Verified</span><span>{user?.isVerified ? <span className="badge-green">Yes</span> : <span className="badge-yellow">Pending</span>}</span></div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} required minLength={6} />
          </div>
          <button type="submit" className="btn-primary py-2.5" disabled={isPending}>
            {isPending ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
