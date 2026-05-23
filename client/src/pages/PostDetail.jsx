import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Star, Clock, DollarSign, CheckCircle, User, MapPin, Dumbbell, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function BidForm({ postId, budgetMax, onSuccess }) {
  const [form, setForm] = useState({ proposal: '', price: '', estimatedWeeks: '', introOffer: '' });
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post('/bids', { ...data, post: postId }),
    onSuccess: () => { toast.success('Bid submitted!'); onSuccess?.(); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to submit bid'),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate({ ...form, price: Number(form.price), estimatedWeeks: Number(form.estimatedWeeks) }); }} className="space-y-4">
      <div>
        <label className="label">Your proposal</label>
        <textarea className="input min-h-32 resize-y" placeholder="Describe your approach, methodology, and why you're the best fit…" value={form.proposal} onChange={e => setForm({ ...form, proposal: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Your price ($/month, max ${budgetMax})</label>
          <input className="input" type="number" min="1" max={budgetMax} placeholder={budgetMax} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
        </div>
        <div>
          <label className="label">Estimated weeks to results</label>
          <input className="input" type="number" min="1" placeholder="8" value={form.estimatedWeeks} onChange={e => setForm({ ...form, estimatedWeeks: e.target.value })} required />
        </div>
      </div>
      <div>
        <label className="label">Intro offer (optional)</label>
        <input className="input" placeholder="e.g. First week free, free initial assessment…" value={form.introOffer} onChange={e => setForm({ ...form, introOffer: e.target.value })} />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={isPending}>{isPending ? 'Submitting…' : 'Submit Bid'}</button>
    </form>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showBidForm, setShowBidForm] = useState(false);

  const { data: postData } = useQuery({ queryKey: ['post', id], queryFn: () => api.get(`/posts/${id}`).then(r => r.data) });
  const { data: bidsData } = useQuery({
    queryKey: ['post-bids', id],
    queryFn: () => api.get(`/posts/${id}/bids`).then(r => r.data),
    enabled: user?.role === 'client' || user?.role === 'admin',
  });

  const acceptBid = useMutation({
    mutationFn: (bidId) => api.put(`/bids/${bidId}/accept`),
    onSuccess: ({ data }) => {
      toast.success('Bid accepted! Engagement created.');
      qc.invalidateQueries({ queryKey: ['post', id] });
      qc.invalidateQueries({ queryKey: ['engagements'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const post = postData?.post;
  const bids = bidsData?.bids || [];
  const isOwner = post?.client?._id === user?._id || post?.client === user?._id;
  
  const trainerHired = bids.some(b => b.status === 'accepted' && b.professional?.role === 'trainer');
  const nutritionistHired = bids.some(b => b.status === 'accepted' && b.professional?.role === 'nutritionist');
  
  const canBid = (post?.status === 'open' || post?.status === 'in_progress') && (
    (user?.role === 'trainer' && post?.needsTrainer && !trainerHired) ||
    (user?.role === 'nutritionist' && post?.needsNutritionist && !nutritionistHired)
  );

  if (!post) return <div className="text-center py-16 text-gray-400">Loading…</div>;

  // Clients can only view their own posts
  if (user?.role === 'client' && !isOwner) {
    return (
      <div className="max-w-md mx-auto mt-16 card text-center py-14">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 text-sm mb-6">You can only view your own requests.</p>
        <Link to="/posts" className="btn-primary">Back to My Requests</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
          <span className={`badge shrink-0 ${post.status === 'open' ? 'badge-green' : post.status === 'in_progress' ? 'badge-yellow' : 'badge-gray'}`}>{post.status}</span>
        </div>
        <p className="text-gray-600 whitespace-pre-wrap mb-4">{post.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map(t => <span key={t} className="badge-blue">{t}</span>)}
          {post.needsTrainer && !trainerHired && <span className="badge-green">Trainer needed</span>}
          {post.needsNutritionist && !nutritionistHired && <span className="badge-yellow">Nutritionist needed</span>}
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1"><DollarSign size={14} />${post.budgetMin}–${post.budgetMax}/month</div>
          <div className="flex items-center gap-1"><Clock size={14} />{post.durationWeeks} weeks</div>
          {post.trainingLocation && <div className="flex items-center gap-1 capitalize"><MapPin size={14} />{post.trainingLocation === 'any' ? 'Flexible Location' : post.trainingLocation}</div>}
          <div>{post.bidCount} bid{post.bidCount !== 1 ? 's' : ''} received</div>
          <div>Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
        </div>
        {post.equipmentAvailable && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
            <div className="font-semibold text-gray-700 flex items-center gap-1 mb-1"><Dumbbell size={14} /> Available Equipment</div>
            <p className="text-gray-600">{post.equipmentAvailable}</p>
          </div>
        )}
      </div>

      {canBid && !showBidForm && (
        <div className="card mb-6 border-brand-200 bg-brand-50">
          <h2 className="font-semibold mb-1">Interested in this client?</h2>
          <p className="text-sm text-gray-600 mb-3">Submit a proposal and compete for this engagement.</p>
          <button className="btn-primary" onClick={() => setShowBidForm(true)}>Submit a Bid</button>
        </div>
      )}

      {canBid && showBidForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Your Bid</h2>
          <BidForm postId={id} budgetMax={post.budgetMax} onSuccess={() => setShowBidForm(false)} />
        </div>
      )}

      {isOwner && bids.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Bids Received ({bids.length})</h2>
          <div className="space-y-4">
            {bids.map(bid => (
              <div key={bid._id} className={`card ${bid.status === 'accepted' ? 'border-green-300 bg-green-50' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Link to={`/profile/${bid.professional?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                      {bid.professional?.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{bid.professional?.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded ${bid.professional?.role === 'trainer' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{bid.professional?.role}</span>
                        {bid.professional?.isVerified && <span className="text-xs text-brand-600 font-medium">· ✓ Verified</span>}
                      </div>
                    </div>
                  </Link>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-gray-900">${bid.price}/mo</div>
                    <div className="text-xs text-gray-500">{bid.estimatedWeeks} weeks</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{bid.proposal}</p>
                {bid.introOffer && <div className="text-xs text-brand-600 font-medium mb-3">🎁 {bid.introOffer}</div>}
                {bid.status === 'accepted' ? (
                  <span className="badge-green">Accepted</span>
                ) : bid.status === 'rejected' ? (
                  <span className="badge-red">Rejected</span>
                ) : (
                  <div className="flex gap-2">
                    <button className="btn-primary text-sm py-1.5" onClick={() => acceptBid.mutate(bid._id)} disabled={acceptBid.isPending}>Accept Bid</button>
                    <Link to={`/profile/${bid.professional?._id}`} className="btn-secondary text-sm py-1.5">View Profile</Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isOwner && bids.length === 0 && (
        <div className="card text-center py-10 text-gray-400">
          <User size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No bids yet</p>
          <p className="text-sm mt-1">Professionals will start submitting bids soon. Check back later!</p>
        </div>
      )}
    </div>
  );
}
