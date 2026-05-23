import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search, Clock, DollarSign, Dumbbell, Utensils, MapPin,
  User, MessageCircle, Flame, Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ALL_TAGS = ['weight-loss','muscle-gain','endurance','rehab','nutrition-only','sports-performance','diabetes-friendly','strength','flexibility','general-health'];

function PostCard({ post, currentUserId }) {
  const client = post.client;
  const isOwn = client?._id === currentUserId;

  return (
    <div className="card hover:border-brand-200 transition-all duration-200 hover:shadow-md">
      {/* Author row */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/profile/${client?._id}`}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold shrink-0 ring-2 ring-white shadow-sm group-hover:ring-brand-300 transition-all">
            {client?.avatar
              ? <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
              : <span>{client?.name?.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">
              {isOwn ? 'You' : (client?.name || 'Anonymous')}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={11} />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            post.status === 'open' ? 'bg-green-100 text-green-700' :
            post.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {post.status === 'in_progress' ? 'In Progress' : post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Post content */}
      <h3 className="font-bold text-gray-900 text-base mb-1.5 leading-snug">{post.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{post.description}</p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 4).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md font-medium">{tag}</span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3 mt-1">
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          <span>${post.budgetMin}–${post.budgetMax}/mo</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{post.durationWeeks}w duration</span>
        </div>
        {post.trainingLocation && post.trainingLocation !== 'any' && (
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span className="capitalize">{post.trainingLocation}</span>
          </div>
        )}
        {post.needsTrainer && (
          <div className="flex items-center gap-1 text-green-600">
            <Dumbbell size={12} />
            <span>Needs trainer</span>
          </div>
        )}
        {post.needsNutritionist && (
          <div className="flex items-center gap-1 text-yellow-600">
            <Utensils size={12} />
            <span>Needs nutritionist</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 text-gray-400">
          <Flame size={12} />
          <span>{post.bidCount} bid{post.bidCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Action row */}
      {!isOwn && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <Link
            to={`/profile/${client?._id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all duration-150"
          >
            <User size={15} />
            View Profile
          </Link>
          <Link
            to={`/profile/${client?._id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow-sm hover:from-brand-600 hover:to-brand-700 hover:shadow-md active:scale-95 transition-all duration-150"
          >
            <MessageCircle size={15} />
            Contact
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['feed', selectedTag],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedTag) params.set('tags', selectedTag);
      params.set('limit', '50');
      return api.get(`/posts?${params}`).then(r => r.data);
    },
  });

  const posts = (data?.posts || []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
        <p className="text-gray-500 text-sm mt-1">Explore fitness goals from the community. View profiles and reach out.</p>
      </div>

      {/* Search & filter bar */}
      <div className="mb-5 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 w-full"
              placeholder="Search goals, titles, keywords…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters || selectedTag ? 'border-brand-400 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            <Filter size={15} />
            Filter
            {selectedTag && <span className="w-2 h-2 rounded-full bg-brand-500" />}
          </button>
        </div>

        {showFilters && (
          <div className="card py-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filter by tag</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${!selectedTag ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-600 hover:border-brand-400'}`}
              >
                All
              </button>
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${selectedTag === tag ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-600 hover:border-brand-400'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded mb-1" />
              <div className="h-3 w-5/6 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16">
          <Dumbbell size={44} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-1">Nothing here yet</h3>
          <p className="text-gray-400 text-sm">No fitness goals match your search. Try a different keyword or tag.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-gray-400 font-medium px-1">{posts.length} post{posts.length !== 1 ? 's' : ''} in the community</div>
          {posts.map(post => (
            <PostCard key={post._id} post={post} currentUserId={user?._id} />
          ))}
        </div>
      )}
    </div>
  );
}
