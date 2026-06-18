import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Check, Clock, ExternalLink, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import MessageBadgeIcon from '../common/MessageBadgeIcon';

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  if (isNaN(diffMs) || diffMs < 0) return 'just now';
  
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return 'just now';
  
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: messagesUnreadData } = useQuery({
    queryKey: ['messages-unread-count'],
    queryFn: () => api.get('/messages/unread/count').then(r => r.data),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const { data: engagementsData } = useQuery({
    queryKey: ['engagements'],
    queryFn: () => api.get('/engagements').then(r => r.data),
    enabled: !!user,
  });

  const handleMessageIconClick = () => {
    const activeEng = engagementsData?.engagements?.find(e => e.status === 'active');
    if (activeEng) {
      navigate(`/engagements/${activeEng._id}`);
    } else {
      navigate('/dashboard');
    }
  };

  const markAsReadMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markAsReadMutation.mutate(notif._id);
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

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
            <MessageBadgeIcon
              count={messagesUnreadData?.unreadCount || 0}
              onClick={handleMessageIconClick}
              icon={MessageSquare}
            />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${isOpen ? 'bg-gray-100 text-gray-900' : ''}`}
                title="Notifications"
              >
                <Bell size={20} />
                {data?.unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {data.unreadCount > 9 ? '9+' : data.unreadCount}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <h3 className="font-bold text-gray-950 text-sm">Notifications</h3>
                    {data?.unreadCount > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check size={14} />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                    {data?.notifications && data.notifications.length > 0 ? (
                      data.notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-4 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-brand-50/40 hover:bg-brand-50/70' : ''}`}
                        >
                          <div className="flex-shrink-0 mt-1">
                            {!notif.read ? (
                              <span className="flex h-2 w-2 rounded-full bg-brand-500 mt-1.5" />
                            ) : (
                              <span className="flex h-2 w-2 rounded-full bg-transparent mt-1.5" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-xs text-gray-800 leading-relaxed ${!notif.read ? 'font-medium text-gray-950' : 'text-gray-600'}`}>
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Clock size={10} />
                                {formatRelativeTime(notif.createdAt)}
                              </span>
                              {notif.link && (
                                <span className="text-[10px] text-brand-600 font-medium flex items-center gap-0.5">
                                  View details <ExternalLink size={10} />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 px-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                          <Bell size={20} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">All caught up!</p>
                        <p className="text-xs text-gray-400 mt-1">You have no new notifications.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
