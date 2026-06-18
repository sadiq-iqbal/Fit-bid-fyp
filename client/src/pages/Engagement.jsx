import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Dumbbell, Utensils, TrendingUp, MessageSquare, ClipboardList, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';

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

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading engagement dashboard...</p>
        </div>
      </PageTransition>
    );
  }

  if (!data?.engagement) {
    return (
      <PageTransition>
        <div className="card text-center py-16 max-w-md mx-auto">
          <p className="text-gray-500 font-semibold text-lg">Dashboard not found</p>
          <p className="text-sm text-gray-400 mt-2 mb-6">The requested engagement could not be found or you don't have access.</p>
          <Link to="/dashboard" className="btn-primary inline-flex">Go to Dashboard</Link>
        </div>
      </PageTransition>
    );
  }

  const { engagement } = data;

  return (
    <PageTransition>
      {/* Back button & Title Header Card */}
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors mb-3 group">
          <ChevronLeft size={16} className="transform group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="card-glass p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-5 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className={`badge mb-3 inline-block uppercase tracking-wider text-[10px] font-black ${
                engagement.status === 'active' ? 'badge-green' : engagement.status === 'disputed' ? 'badge-red' : 'badge-gray'
              }`}>
                {engagement.status}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight mt-1">
                {engagement.post?.title || 'Engagement Dashboard'}
              </h1>
              
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-gray-500 mt-2 font-medium">
                <span>Client: <span className="font-bold text-gray-800">{engagement.client?.name}</span></span>
                {engagement.trainer && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>Trainer: <span className="font-bold text-gray-800">{engagement.trainer.name}</span></span>
                  </>
                )}
                {engagement.nutritionist && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>Nutritionist: <span className="font-bold text-gray-800">{engagement.nutritionist.name}</span></span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative border-b border-gray-200/80 mb-6 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors -mb-px z-10 ${
              activeTab === key
                ? 'text-brand-600 font-extrabold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Icon size={16} /> 
            <span>{label}</span>
            {key === 'messages' && data?.unreadMessagesCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
            {activeTab === key && (
              <motion.div
                layoutId="active-engagement-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'workouts' && <WorkoutsTab engagementId={id} engagement={engagement} user={user} />}
        {activeTab === 'meals' && <MealsTab engagementId={id} engagement={engagement} user={user} />}
        {activeTab === 'progress' && <ProgressTab engagementId={id} engagement={engagement} user={user} />}
        {activeTab === 'messages' && <MessagesTab engagementId={id} user={user} />}
        {activeTab === 'checkins' && <CheckInsTab engagementId={id} engagement={engagement} user={user} />}
      </div>
    </PageTransition>
  );
}
