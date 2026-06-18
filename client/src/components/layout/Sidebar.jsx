import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Users, Settings, ShieldCheck, Dumbbell, Rss } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const navItems = {
  client: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/posts/new', icon: PlusCircle, label: 'Post a Request' },
    { to: '/posts', icon: FileText, label: 'My Posts' },
    { to: '/feed', icon: Rss, label: 'Community Feed' },
    { to: '/directory', icon: Users, label: 'Find Professionals' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  trainer: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/posts', icon: FileText, label: 'Browse Requests' },
    { to: '/feed', icon: Rss, label: 'Community Feed' },
    { to: '/directory', icon: Users, label: 'Directory' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  nutritionist: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/posts', icon: FileText, label: 'Browse Requests' },
    { to: '/feed', icon: Rss, label: 'Community Feed' },
    { to: '/directory', icon: Users, label: 'Directory' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
    { to: '/feed', icon: Rss, label: 'Community Feed' },
    { to: '/directory', icon: Users, label: 'Directory' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const items = navItems[user?.role] || [];

  return (
    <aside className="w-60 shrink-0 bg-white/95 backdrop-blur-md border-r border-surface-200/50 flex flex-col py-6 px-4 hidden md:flex sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
          <Dumbbell size={18} className="text-brand-650" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">FitBid Portal</span>
          <span className="text-xs font-semibold text-brand-650 capitalize mt-0.5">{user?.role}</span>
        </div>
      </div>
      <nav className="flex flex-col gap-1.5 flex-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive ? 'text-brand-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-indicator"
                    className="absolute inset-0 bg-brand-50/80 border-l-[3px] border-brand-500 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-brand-600' : 'text-gray-400'} />
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-2 text-[10px] text-gray-450 font-medium">FitBid Premium v1.0</div>
    </aside>
  );
}
