import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function LogProgressForm({ engagementId, onSuccess }) {
  const [form, setForm] = useState({ weightKg: '', energyLevel: 3, sleepQuality: 3, mood: 3, notes: '' });
  const { mutate, isPending } = useMutation({
    mutationFn: (d) => api.post('/progress', { ...d, engagementId }),
    onSuccess: () => { toast.success('Progress logged!'); onSuccess?.(); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate({ ...form, weightKg: Number(form.weightKg) }); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Weight (kg)</label><input className="input" type="number" step="0.1" value={form.weightKg} onChange={e => setForm({ ...form, weightKg: e.target.value })} /></div>
        <div>
          <label className="label">Energy Level (1–5)</label>
          <input className="input" type="range" min="1" max="5" value={form.energyLevel} onChange={e => setForm({ ...form, energyLevel: Number(e.target.value) })} />
          <div className="text-center text-sm font-medium text-brand-600">{form.energyLevel}/5</div>
        </div>
        <div>
          <label className="label">Sleep Quality (1–5)</label>
          <input className="input" type="range" min="1" max="5" value={form.sleepQuality} onChange={e => setForm({ ...form, sleepQuality: Number(e.target.value) })} />
          <div className="text-center text-sm font-medium text-brand-600">{form.sleepQuality}/5</div>
        </div>
        <div>
          <label className="label">Mood (1–5)</label>
          <input className="input" type="range" min="1" max="5" value={form.mood} onChange={e => setForm({ ...form, mood: Number(e.target.value) })} />
          <div className="text-center text-sm font-medium text-brand-600">{form.mood}/5</div>
        </div>
      </div>
      <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      <button type="submit" className="btn-primary w-full" disabled={isPending}>{isPending ? 'Logging…' : 'Log Progress'}</button>
    </form>
  );
}

export default function ProgressTab({ engagementId, engagement, user }) {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['progress', engagementId],
    queryFn: () => api.get(`/progress/${engagementId}`).then(r => r.data),
  });

  const entries = data?.entries || [];
  const chartData = entries.map(e => ({
    date: format(new Date(e.loggedAt), 'MMM d'),
    weight: e.weightKg,
    energy: e.energyLevel,
    sleep: e.sleepQuality,
    mood: e.mood,
  }));

  const isClient = user._id === (engagement.client?._id || engagement.client);

  return (
    <div className="space-y-6">
      {isClient && (
        <div className="flex justify-end">
          <button className="btn-primary text-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Log Progress'}
          </button>
        </div>
      )}

      {showForm && isClient && (
        <div className="card">
          <h3 className="font-semibold mb-4">Log Today's Progress</h3>
          <LogProgressForm engagementId={engagementId} onSuccess={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['progress', engagementId] }); }} />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No progress entries yet. Start logging to see charts here!</div>
      ) : (
        <>
          {chartData.some(d => d.weight) && (
            <div className="card">
              <h3 className="font-semibold mb-4">Weight Over Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold mb-4">Wellbeing Scores</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
                <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} name="Sleep" />
                <Line type="monotone" dataKey="mood" stroke="#a855f7" strokeWidth={2} name="Mood" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {[...entries].reverse().slice(0, 10).map(entry => (
              <div key={entry._id} className="card">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{format(new Date(entry.loggedAt), 'EEEE, MMM d')}</span>
                  {entry.weightKg && <span className="font-bold text-brand-600">{entry.weightKg} kg</span>}
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Energy: {entry.energyLevel}/5</span>
                  <span>Sleep: {entry.sleepQuality}/5</span>
                  <span>Mood: {entry.mood}/5</span>
                </div>
                {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
