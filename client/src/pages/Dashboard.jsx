import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Dumbbell, Utensils, TrendingUp, Clock, CheckCircle, AlertCircle, PlusCircle, ChevronRight, Gavel } from 'lucide-react';

function ClientDashboard({ user }) {
  const { data: posts } = useQuery({ queryKey: ['my-posts'], queryFn: () => api.get('/posts/my').then(r => r.data) });
  const { data: engs } = useQuery({ queryKey: ['engagements'], queryFn: () => api.get('/engagements').then(r => r.data) });

  const activeEngagements = engs?.engagements?.filter(e => e.status === 'active') || [];
  const openPosts = posts?.posts?.filter(p => p.status === 'open' || p.status === 'in_progress') || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your fitness journey.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="text-green-600" size={22} /></div>
          <div><div className="text-2xl font-bold">{activeEngagements.length}</div><div className="text-sm text-gray-500">Active engagements</div></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><Clock className="text-blue-600" size={22} /></div>
          <div><div className="text-2xl font-bold">{openPosts.length}</div><div className="text-sm text-gray-500">Open requests</div></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><TrendingUp className="text-purple-600" size={22} /></div>
          <div><div className="text-2xl font-bold">{posts?.posts?.filter(p => p.status === 'completed').length || 0}</div><div className="text-sm text-gray-500">Completed</div></div>
        </div>
      </div>

      {activeEngagements.length === 0 && openPosts.length === 0 ? (
        <div className="card text-center py-16">
          <Dumbbell size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Ready to start your journey?</h2>
          <p className="text-gray-500 mb-6">Post your fitness goal and receive bids from certified professionals.</p>
          <Link to="/posts/new" className="btn-primary">Post your first request</Link>
        </div>
      ) : (
        <div>
          {activeEngagements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Engagements</h2>
              <div className="space-y-3">
                {activeEngagements.map(eng => (
                  <Link key={eng._id} to={`/engagements/${eng._id}`} className="card flex items-center justify-between hover:border-brand-300 transition-colors group">
                    <div>
                      <div className="font-semibold text-gray-900">{eng.post?.title || 'Engagement'}</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {eng.trainer && `Trainer: ${eng.trainer.name}`}
                        {eng.trainer && eng.nutritionist && ' · '}
                        {eng.nutritionist && `Nutritionist: ${eng.nutritionist.name}`}
                      </div>
                    </div>
                    <span className="badge-green">Active</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {openPosts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Open Requests</h2>
              <div className="space-y-3">
                {openPosts.map(post => (
                  <div key={post._id} className="card flex items-center justify-between hover:border-brand-300 transition-colors gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate">{post.title}</div>
                      <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <Gavel size={13} className="text-gray-400 shrink-0" />
                        {post.bidCount} bid{post.bidCount !== 1 ? 's' : ''} received
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="badge-yellow">Open</span>
                      <Link
                        to={`/posts/${post._id}`}
                        className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow-sm hover:from-brand-600 hover:to-brand-700 hover:shadow-md active:scale-95 transition-all duration-150"
                      >
                        Show Bids
                        <ChevronRight size={15} />
                        {post.bidCount > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold shadow-md ring-2 ring-white">
                            {post.bidCount > 99 ? '99+' : post.bidCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfessionalDashboard({ user }) {
  const { data: bids } = useQuery({ queryKey: ['my-bids'], queryFn: () => api.get('/bids/my').then(r => r.data) });
  const { data: engs } = useQuery({ queryKey: ['engagements'], queryFn: () => api.get('/engagements').then(r => r.data) });

  const [activeTab, setActiveTab] = useState('active');

  const activeEngagements = engs?.engagements?.filter(e => e.status === 'active') || [];
  const pendingBids = bids?.bids?.filter(b => b.status === 'pending') || [];
  const acceptedBids = bids?.bids?.filter(b => b.status === 'accepted') || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">
          {user.isVerified ? 'Your account is verified ✓' : <span className="text-yellow-600">Your account is pending verification.</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="text-green-600" size={22} /></div>
          <div><div className="text-2xl font-bold">{activeEngagements.length}</div><div className="text-sm text-gray-500">Active clients</div></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center"><Clock className="text-yellow-600" size={22} /></div>
          <div><div className="text-2xl font-bold">{pendingBids.length}</div><div className="text-sm text-gray-500">Pending bids</div></div>
        </div>
      </div>
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'active' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Active Clients ({activeEngagements.length})
        </button>
        <button 
          onClick={() => setActiveTab('pending')} 
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Pending Bids ({pendingBids.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        pendingBids.length > 0 ? (
          <div className="mb-6">
            <div className="space-y-3">
              {pendingBids.map(bid => (
                <Link key={bid._id} to={`/posts/${bid.post._id}`} className="card flex items-center justify-between hover:border-brand-300 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">{bid.post.title}</div>
                    <div className="text-sm text-gray-500">{bid.price}$ – {bid.proposal.slice(0, 50)}...</div>
                  </div>
                  <span className="badge-yellow">Pending</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-10 text-gray-500 text-sm">No pending bids.</div>
        )
      )}

      {activeTab === 'active' && (
        activeEngagements.length > 0 ? (
          <div className="mb-6">
            <div className="space-y-3">
              {activeEngagements.map(eng => (
                <Link key={eng._id} to={`/engagements/${eng._id}`} className="card flex items-center justify-between hover:border-brand-300 transition-colors">
                  <div>
                    <div className="font-semibold">{eng.client?.name}</div>
                    <div className="text-sm text-gray-500">{eng.post?.title}</div>
                  </div>
                  <span className="badge-green">Active</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <Dumbbell size={40} className="text-gray-300 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-700 mb-2">No active clients yet</h2>
            <p className="text-gray-500 text-sm mb-4">Browse client requests and start submitting bids.</p>
            <Link to="/posts" className="btn-primary">Browse requests</Link>
          </div>
        )
      )}
    </div>
  );
}

function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => api.get('/admin/dashboard').then(r => r.data) });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: data?.totalUsers },
          { label: 'Engagements', value: data?.totalEngagements },
          { label: 'Open Posts', value: data?.totalPosts },
          { label: 'Pending Verifications', value: data?.pendingVerifications, alert: true },
        ].map(({ label, value, alert }) => (
          <div key={label} className={`card ${alert && value > 0 ? 'border-yellow-300' : ''}`}>
            <div className="text-2xl font-bold text-gray-900">{value ?? '…'}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link to="/admin" className="btn-primary">Go to Admin Panel</Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'client') return <ClientDashboard user={user} />;
  return <ProfessionalDashboard user={user} />;
}
