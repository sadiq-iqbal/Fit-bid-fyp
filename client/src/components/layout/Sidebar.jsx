import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Users, Settings, ShieldCheck, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = {
  client: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/posts/new', icon: PlusCircle, label: 'Post a Request' },
    { to: '/posts', icon: FileText, label: 'My Posts' },
    { to: '/directory', icon: Users, label: 'Find Professionals' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  trainer: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/posts', icon: FileText, label: 'Browse Requests' },
    { to: '/directory', icon: Users, label: 'Directory' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  nutritionist: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/posts', icon: FileText, label: 'Browse Requests' },
    { to: '/directory', icon: Users, label: 'Directory' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
    { to: '/directory', icon: Users, label: 'Directory' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const items = navItems[user?.role] || [];

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col py-6 px-3 hidden md:flex">
      <div className="flex items-center gap-2 px-3 mb-8">
        <Dumbbell size={22} className="text-brand-600" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider capitalize">{user?.role}</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-2 text-xs text-gray-400">FitBid v1.0</div>
    </aside>
  );
}
