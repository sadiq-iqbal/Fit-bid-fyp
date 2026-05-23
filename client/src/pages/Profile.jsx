import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Star, Briefcase, CheckCircle, MapPin, Clock } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => api.get(`/profiles/${id}`).then(r => r.data),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/reviews/professional/${id}`).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-16 text-gray-400">Loading…</div>;

  const { user, profile } = data || {};
  const reviews = reviewsData?.reviews || [];

  return (
    <div className="max-w-3xl">
      <div className="card mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-3xl font-bold text-brand-600 shrink-0">
            {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" /> : user?.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              {user?.isVerified && <span className="badge-green flex items-center gap-1"><CheckCircle size={12} /> Verified</span>}
              {profile?.availabilityStatus === 'open' ? (
                <span className="badge-green text-xs">Open to bids</span>
              ) : (
                <span className="badge-gray text-xs">Fully booked</span>
              )}
            </div>
            <div className="text-gray-500 capitalize mt-1">{user?.role}</div>
            {profile?.location && <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin size={14} />{profile.location}</div>}
          </div>
        </div>

        {profile?.bio && <p className="text-gray-600 mt-4 text-sm leading-relaxed">{profile.bio}</p>}

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-xl font-bold text-gray-900">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              {profile?.avgRating?.toFixed(1) || '—'}
            </div>
            <div className="text-xs text-gray-500">{profile?.totalReviews || 0} reviews</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{profile?.totalEngagements || 0}</div>
            <div className="text-xs text-gray-500">Engagements</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{profile?.yearsExperience || 0}y</div>
            <div className="text-xs text-gray-500">Experience</div>
          </div>
        </div>
      </div>

      {profile?.certifications?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-3">Certifications</h2>
          <div className="space-y-2">
            {profile.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle size={16} className="text-green-500 shrink-0" />
                <span className="font-medium">{cert.name}</span>
                <span className="text-gray-500">— {cert.issuedBy}{cert.year ? ` (${cert.year})` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile?.specialty?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-3">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {profile.specialty.map(s => <span key={s} className="badge-blue">{s}</span>)}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">{r.reviewer?.name}</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
                {r.professionalReply && (
                  <div className="mt-2 pl-3 border-l-2 border-brand-200 text-xs text-gray-500 italic">
                    Reply: {r.professionalReply}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
