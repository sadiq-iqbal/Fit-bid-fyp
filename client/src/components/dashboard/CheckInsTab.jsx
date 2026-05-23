import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ClipboardList } from 'lucide-react';

export default function CheckInsTab({ engagementId, engagement, user }) {
  const qc = useQueryClient();
  const [feedback, setFeedback] = useState({});
  const [form, setForm] = useState({ wentWell: '', wasHard: '', painOrDiscomfort: '', questions: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['checkins', engagementId],
    queryFn: () => api.get(`/checkins/${engagementId}`).then(r => r.data),
  });

  const submitCheckin = useMutation({
    mutationFn: ({ id }) => api.put(`/checkins/${id}/submit`, { responses: form }),
    onSuccess: () => { toast.success('Check-in submitted!'); qc.invalidateQueries({ queryKey: ['checkins', engagementId] }); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const submitFeedback = useMutation({
    mutationFn: ({ id, note }) => api.put(`/checkins/${id}/feedback`, { feedback: note }),
    onSuccess: () => { toast.success('Feedback saved!'); qc.invalidateQueries({ queryKey: ['checkins', engagementId] }); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const createCheckin = useMutation({
    mutationFn: (weekNumber) => api.post('/checkins', { engagementId, weekNumber }),
    onSuccess: () => { toast.success('Check-in created for client!'); qc.invalidateQueries({ queryKey: ['checkins', engagementId] }); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const checkins = data?.checkins || [];
  const isClient = user._id === (engagement.client?._id || engagement.client);
  const isProfessional = ['trainer', 'nutritionist'].includes(user.role);
  const nextWeek = checkins.length > 0 ? Math.max(...checkins.map(c => c.weekNumber)) + 1 : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Weekly Check-ins</h2>
        {isProfessional && (
          <button className="btn-secondary text-sm" onClick={() => createCheckin.mutate(nextWeek)} disabled={createCheckin.isPending}>
            + Create Week {nextWeek} Check-in
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading…</div>
      ) : checkins.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No check-ins yet</h3>
          <p className="text-sm text-gray-500">{isProfessional ? "Create the first check-in for your client." : "Your professionals will assign weekly check-ins soon."}</p>
        </div>
      ) : (
        checkins.map(checkin => (
          <div key={checkin._id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Week {checkin.weekNumber} Check-in</h3>
              <span className={`badge text-xs ${checkin.status === 'reviewed' ? 'badge-green' : checkin.status === 'submitted' ? 'badge-yellow' : 'badge-gray'}`}>{checkin.status}</span>
            </div>

            {/* Client submits responses */}
            {isClient && checkin.status === 'pending' && (
              <form onSubmit={(e) => { e.preventDefault(); submitCheckin.mutate({ id: checkin._id }); }} className="space-y-3">
                {[
                  ['wentWell', 'What went well this week?'],
                  ['wasHard', 'What was challenging?'],
                  ['painOrDiscomfort', 'Any pain or discomfort?'],
                  ['questions', 'Questions for your team?'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <textarea className="input resize-none" rows={2} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}
                <button type="submit" className="btn-primary w-full" disabled={submitCheckin.isPending}>Submit Check-in</button>
              </form>
            )}

            {/* Show submitted responses */}
            {checkin.responses && checkin.status !== 'pending' && (
              <div className="space-y-2 mb-4">
                {Object.entries(checkin.responses).filter(([, v]) => v).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 capitalize mb-0.5">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-sm text-gray-800">{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Professional feedback */}
            {checkin.trainerFeedback && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <div className="text-xs font-medium text-green-700 mb-1">Trainer Feedback</div>
                <p className="text-sm text-green-800">{checkin.trainerFeedback}</p>
              </div>
            )}
            {checkin.nutritionistFeedback && (
              <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                <div className="text-xs font-medium text-orange-700 mb-1">Nutritionist Feedback</div>
                <p className="text-sm text-orange-800">{checkin.nutritionistFeedback}</p>
              </div>
            )}

            {/* Professional submits feedback */}
            {isProfessional && checkin.status === 'submitted' && (
              <div className="mt-3">
                <label className="label">Your Feedback</label>
                <textarea className="input resize-none" rows={3} value={feedback[checkin._id] || ''} onChange={e => setFeedback({ ...feedback, [checkin._id]: e.target.value })} placeholder="Write your feedback for the client…" />
                <button className="btn-primary text-sm mt-2" onClick={() => submitFeedback.mutate({ id: checkin._id, note: feedback[checkin._id] })} disabled={submitFeedback.isPending || !feedback[checkin._id]}>
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
