import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Star, MapPin, Briefcase, CheckCircle } from 'lucide-react';

export default function Directory() {
  const [filters, setFilters] = useState({ role: '', specialty: '', minRating: '', availability: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['directory', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      return api.get(`/directory?${params}`).then(r => r.data);
    },
  });

  const professionals = data?.professionals || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Find Professionals</h1>
        <p className="text-gray-500 text-sm mt-1">Browse verified trainers and nutritionists</p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <select className="input w-auto" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All roles</option>
            <option value="trainer">Trainers</option>
            <option value="nutritionist">Nutritionists</option>
          </select>
          <select className="input w-auto" value={filters.minRating} onChange={e => setFilters({ ...filters, minRating: e.target.value })}>
            <option value="">Any rating</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
          <select className="input w-auto" value={filters.availability} onChange={e => setFilters({ ...filters, availability: e.target.value })}>
            <option value="">Any availability</option>
            <option value="open">Open to bids</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : professionals.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No professionals found. Try adjusting your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map(({ user: prof, ...profile }) => (
            <Link key={prof?._id} to={`/profile/${prof?._id}`} className="card hover:border-brand-300 transition-colors flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg shrink-0">
                  {prof?.avatar ? <img src={prof.avatar} alt={prof.name} className="w-12 h-12 rounded-full object-cover" /> : prof?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{prof?.name}</div>
                  <div className="text-xs text-gray-500 capitalize flex items-center gap-1">
                    {prof?.role}
                    {prof?.isVerified && <CheckCircle size={12} className="text-green-500" />}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{profile.bio || 'No bio provided.'}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-medium text-gray-800">{profile.avgRating?.toFixed(1) || '—'}</span>
                  <span className="text-xs">({profile.totalReviews})</span>
                </div>
                <div className="flex items-center gap-1"><Briefcase size={13} />{profile.totalEngagements} engagements</div>
                <span className={`badge text-xs ${profile.availabilityStatus === 'open' ? 'badge-green' : 'badge-gray'}`}>
                  {profile.availabilityStatus === 'open' ? 'Open' : 'Booked'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
