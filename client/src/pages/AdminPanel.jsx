import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Users, FileText, CreditCard } from 'lucide-react';

function VerificationsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: () => api.get('/admin/verifications').then(r => r.data),
  });

  const decide = useMutation({
    mutationFn: ({ id, status, note }) => api.put(`/admin/verifications/${id}`, { status, note }),
    onSuccess: () => { toast.success('Decision saved'); qc.invalidateQueries({ queryKey: ['admin-verifications'] }); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  if (isLoading) return <div className="text-center py-8 text-gray-400">Loading…</div>;
  const profiles = data?.profiles || [];

  return (
    <div>
      <h2 className="font-semibold mb-4">Pending Verifications ({profiles.length})</h2>
      {profiles.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">All caught up! No pending verifications.</div>
      ) : (
        <div className="space-y-4">
          {profiles.map(profile => (
            <div key={profile._id} className="card">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 shrink-0">
                  {profile.user?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{profile.user?.name}</div>
                  <div className="text-sm text-gray-500">{profile.user?.email} · <span className="capitalize">{profile.user?.role}</span></div>
                  <div className="text-xs text-gray-400 mt-0.5">Registered {new Date(profile.user?.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              {profile.certifications?.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">Certifications submitted:</div>
                  {profile.certifications.map((c, i) => (
                    <div key={i} className="text-sm text-gray-700">{c.name} — {c.issuedBy}</div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button className="btn-primary text-sm py-1.5 flex items-center gap-1" onClick={() => decide.mutate({ id: profile._id, status: 'approved' })} disabled={decide.isPending}>
                  <CheckCircle size={14} /> Approve
                </button>
                <button className="btn-danger text-sm py-1.5 flex items-center gap-1" onClick={() => decide.mutate({ id: profile._id, status: 'rejected', note: 'Credentials could not be verified.' })} disabled={decide.isPending}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const [role, setRole] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', role],
    queryFn: () => api.get(`/admin/users${role ? `?role=${role}` : ''}`).then(r => r.data),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-semibold">Users ({data?.total || 0})</h2>
        <select className="input w-auto text-sm py-1" value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="client">Clients</option>
          <option value="trainer">Trainers</option>
          <option value="nutritionist">Nutritionists</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {isLoading ? <div className="text-gray-400">Loading…</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2 pr-4">Verified</th>
              <th className="pb-2">Joined</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data?.users?.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium">{u.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{u.email}</td>
                  <td className="py-2 pr-4 capitalize">{u.role}</td>
                  <td className="py-2 pr-4">{u.isVerified ? <span className="badge-green">Yes</span> : <span className="badge-gray">No</span>}</td>
                  <td className="py-2 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { key: 'verifications', label: 'Verifications', icon: CheckCircle },
  { key: 'users', label: 'Users', icon: Users },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('verifications');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key ? 'text-brand-600 border-brand-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {tab === 'verifications' && <VerificationsTab />}
      {tab === 'users' && <UsersTab />}
    </div>
  );
}
