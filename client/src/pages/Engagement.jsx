import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Dumbbell, Utensils, TrendingUp, MessageSquare, ClipboardList } from 'lucide-react';

import OverviewTab from '../components/dashboard/OverviewTab';
import WorkoutsTab from '../components/dashboard/WorkoutsTab';
import MealsTab from '../components/dashboard/MealsTab';
import ProgressTab from '../components/dashboard/ProgressTab';
import MessagesTab from '../components/dashboard/MessagesTab';
import CheckInsTab from '../components/dashboard/CheckInsTab';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'workouts', label: 'Workouts', icon: Dumbbell },
  { key: 'meals', label: 'Meal Plan', icon: Utensils },
  { key: 'progress', label: 'Progress', icon: TrendingUp },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'checkins', label: 'Check-ins', icon: ClipboardList },
];

export default function Engagement() {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading } = useQuery({
    queryKey: ['engagement', id],
    queryFn: () => api.get(`/engagements/${id}`).then(r => r.data),
  });

  if (isLoading) return <div className="text-center py-16 text-gray-400">Loading engagement…</div>;
  if (!data?.engagement) return <div className="text-center py-16 text-gray-400">Engagement not found.</div>;

  const { engagement } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{engagement.post?.title || 'Engagement Dashboard'}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
          <span>Client: <span className="font-medium text-gray-800">{engagement.client?.name}</span></span>
          {engagement.trainer && <><span>·</span><span>Trainer: <span className="font-medium text-gray-800">{engagement.trainer.name}</span></span></>}
          {engagement.nutritionist && <><span>·</span><span>Nutritionist: <span className="font-medium text-gray-800">{engagement.nutritionist.name}</span></span></>}
          <span className={`badge ${engagement.status === 'active' ? 'badge-green' : engagement.status === 'disputed' ? 'badge-red' : 'badge-gray'}`}>{engagement.status}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? 'text-brand-600 border-brand-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon size={16} /> {label}
            {key === 'messages' && data?.unreadMessagesCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab data={data} />}
      {activeTab === 'workouts' && <WorkoutsTab engagementId={id} engagement={engagement} user={user} />}
      {activeTab === 'meals' && <MealsTab engagementId={id} engagement={engagement} user={user} />}
      {activeTab === 'progress' && <ProgressTab engagementId={id} engagement={engagement} user={user} />}
      {activeTab === 'messages' && <MessagesTab engagementId={id} user={user} />}
      {activeTab === 'checkins' && <CheckInsTab engagementId={id} engagement={engagement} user={user} />}
    </div>
  );
}
