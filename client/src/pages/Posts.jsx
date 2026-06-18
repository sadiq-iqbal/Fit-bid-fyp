import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, PlusCircle, Clock, DollarSign, ChevronRight, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';

const ALL_TAGS = ['weight-loss','muscle-gain','endurance','rehab','nutrition-only','sports-performance','diabetes-friendly','strength','flexibility'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } }
};

export default function Posts() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ tags: '', budgetMin: '', budgetMax: '' });
  const [search, setSearch] = useState('');
  const isClient = user?.role === 'client';

  const { data, isLoading } = useQuery({
    queryKey: ['posts', filters, isClient],
    queryFn: () => {
      if (isClient) return api.get('/posts/my').then(r => r.data);
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
    <PageTransition>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            {isClient ? 'My Requests' : 'Browse Client Requests'}
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            {isClient ? `${posts.length} request${posts.length !== 1 ? 's' : ''}` : `${data?.total || 0} open requests`}
          </p>
        </div>
        {isClient && (
          <Link to="/posts/new" className="btn-primary shadow-glow-sm">
            <PlusCircle size={16} /> New Request
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input className="input pl-9 w-full" placeholder="Search by title…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {!isClient && (
            <>
              <select className="input w-auto font-medium" value={filters.tags} onChange={e => setFilters({ ...filters, tags: e.target.value })}>
                <option value="">All tags</option>
                {ALL_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="input w-32" type="number" placeholder="Min budget" value={filters.budgetMin} onChange={e => setFilters({ ...filters, budgetMin: e.target.value })} />
              <input className="input w-32" type="number" placeholder="Max budget" value={filters.budgetMax} onChange={e => setFilters({ ...filters, budgetMax: e.target.value })} />
            </>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1 mr-8">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
                <div className="space-y-2 w-24">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-20 border-dashed border-2 border-gray-100">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={26} className="text-gray-200" />
          </div>
          <h3 className="font-bold text-gray-700 mb-1">
            {isClient ? "You haven't posted any requests yet" : 'No requests found'}
          </h3>
          <p className="text-gray-400 text-sm mb-4 font-medium">
            {isClient ? 'Post your fitness goal and start receiving bids from professionals.' : 'Try adjusting your filters or check back later.'}
          </p>
          {isClient && (
            <Link to="/posts/new" className="btn-primary shadow-glow-sm inline-flex items-center gap-2">
              <PlusCircle size={16} /> Post a Request
            </Link>
          )}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {posts.map(post => (
            <motion.div key={post._id} variants={itemVariants}>
              <Link
                to={`/posts/${post._id}`}
                className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 hover:shadow-card-hover transition-all group bg-white"
              >
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-950 group-hover:text-brand-600 transition-colors tracking-tight">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 font-medium">{post.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.tags?.slice(0, 4).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md font-semibold border border-blue-100">{tag}</span>
                        ))}
                        {post.needsTrainer && <span className="badge-green text-xs font-semibold">Trainer needed</span>}
                        {post.needsNutritionist && <span className="badge-yellow text-xs font-semibold">Nutritionist needed</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1.5 shrink-0 text-sm">
                  <div className="flex items-center gap-1 text-gray-500 font-medium"><DollarSign size={13} />${post.budgetMin}–${post.budgetMax}/mo</div>
                  <div className="flex items-center gap-1 text-gray-400 font-medium"><Clock size={13} />{post.durationWeeks}w</div>
                  <div className="font-bold text-brand-600">{post.bidCount} bid{post.bidCount !== 1 ? 's' : ''}</div>
                  <div className="text-xs text-gray-400 font-medium">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageTransition>
  );
}
