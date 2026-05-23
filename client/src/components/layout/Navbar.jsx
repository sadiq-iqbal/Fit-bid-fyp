import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
        <span className="text-2xl font-extrabold text-brand-600">Fit</span>
        <span className="text-2xl font-extrabold text-gray-900">Bid</span>
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              {data?.unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {data.unreadCount > 9 ? '9+' : data.unreadCount}
                </span>
              )}
            </button>
            <Link to="/profile/edit" className="flex items-center gap-2 text-sm text-gray-700 hover:text-brand-600 transition-colors">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:block font-medium">{user.name}</span>
            </Link>
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Log out">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-sm py-1.5">Log in</Link>
            <Link to="/register" className="btn-primary text-sm py-1.5">Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
}
