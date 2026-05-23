import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, PlusCircle, Clock, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ALL_TAGS = ['weight-loss','muscle-gain','endurance','rehab','nutrition-only','sports-performance','diabetes-friendly','strength','flexibility'];

export default function Posts() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ tags: '', budgetMin: '', budgetMax: '' });
  const [search, setSearch] = useState('');

  const isClient = user?.role === 'client';

  const { data, isLoading } = useQuery({
    queryKey: ['posts', filters, isClient],
    queryFn: () => {
      if (isClient) {
        return api.get('/posts/my').then(r => r.data);
      }
      const params = new URLSearchParams();
      if (filters.tags) params.set('tags', filters.tags);
      if (filters.budgetMin) params.set('budgetMin', filters.budgetMin);
      if (filters.budgetMax) params.set('budgetMax', filters.budgetMax);
      return api.get(`/posts?${params}`).then(r => r.data);
    },
  });

  const posts = (data?.posts || []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.role === 'client' ? 'My Requests' : 'Browse Client Requests'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{isClient ? `${posts.length} request${posts.length !== 1 ? 's' : ''}` : `${data?.total || 0} open requests`}</p>
        </div>
        {user.role === 'client' && (
          <Link to="/posts/new" className="btn-primary"><PlusCircle size={16} /> New Request</Link>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search by title…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {!isClient && (
            <>
              <select className="input w-auto" value={filters.tags} onChange={e => setFilters({ ...filters, tags: e.target.value })}>
                <option value="">All tags</option>
                {ALL_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="input w-32" type="number" placeholder="Min budget" value={filters.budgetMin} onChange={e => setFilters({ ...filters, budgetMin: e.target.value })} />
              <input className="input w-32" type="number" placeholder="Max budget" value={filters.budgetMax} onChange={e => setFilters({ ...filters, budgetMax: e.target.value })} />
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16">
          <Search size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">{isClient ? "You haven't posted any requests yet" : 'No requests found'}</h3>
          <p className="text-gray-500 text-sm mb-4">{isClient ? 'Post your fitness goal and start receiving bids from professionals.' : 'Try adjusting your filters or check back later.'}</p>
          {isClient && <Link to="/posts/new" className="btn-primary inline-flex items-center gap-2"><PlusCircle size={16} /> Post a Request</Link>}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Link key={post._id} to={`/posts/${post._id}`} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 transition-colors group">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{post.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags?.slice(0, 4).map(tag => (
                        <span key={tag} className="badge-blue text-xs">{tag}</span>
                      ))}
                      {post.needsTrainer && <span className="badge-green text-xs">Trainer needed</span>}
                      {post.needsNutritionist && <span className="badge-yellow text-xs">Nutritionist needed</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 shrink-0 text-sm text-gray-500">
                <div className="flex items-center gap-1"><DollarSign size={14} />${post.budgetMin}–${post.budgetMax}/mo</div>
                <div className="flex items-center gap-1"><Clock size={14} />{post.durationWeeks}w</div>
                <div className="font-medium text-gray-700">{post.bidCount} bid{post.bidCount !== 1 ? 's' : ''}</div>
                <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
