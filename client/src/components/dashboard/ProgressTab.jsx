import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Scale, Heart, Smile, Sparkles, BedDouble, Calendar, ChevronRight } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 border border-gray-200/60 rounded-2xl shadow-card-elevated text-xs font-bold">
        <p className="text-gray-950 mb-2 font-black tracking-tight">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.color }} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-gray-500 font-semibold">{p.name}:</span>
              <span className="font-black text-gray-900">{p.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function LogProgressForm({ engagementId, onSuccess }) {
  const [form, setForm] = useState({ weightKg: '', energyLevel: 3, sleepQuality: 3, mood: 3, notes: '' });
  const { mutate, isPending } = useMutation({
    mutationFn: (d) => api.post('/progress', { ...d, engagementId }),
    onSuccess: () => { toast.success('Progress logged!'); onSuccess?.(); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate({ ...form, weightKg: Number(form.weightKg) }); }} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Weight (kg)</label>
          <input className="input bg-white" type="number" step="0.1" placeholder="e.g. 75.5" value={form.weightKg} onChange={e => setForm({ ...form, weightKg: e.target.value })} required />
        </div>
        <div>
          <label className="label flex items-center justify-between">
            <span>Energy Level</span>
            <span className="text-xs font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{form.energyLevel}/5</span>
          </label>
          <input className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-600 mt-3" type="range" min="1" max="5" value={form.energyLevel} onChange={e => setForm({ ...form, energyLevel: Number(e.target.value) })} />
        </div>
        <div>
          <label className="label flex items-center justify-between">
            <span>Sleep Quality</span>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{form.sleepQuality}/5</span>
          </label>
          <input className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-3" type="range" min="1" max="5" value={form.sleepQuality} onChange={e => setForm({ ...form, sleepQuality: Number(e.target.value) })} />
        </div>
        <div>
          <label className="label flex items-center justify-between">
            <span>Mood / General Wellbeing</span>
            <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{form.mood}/5</span>
          </label>
          <input className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-3" type="range" min="1" max="5" value={form.mood} onChange={e => setForm({ ...form, mood: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="label">Notes / Journal Entry</label>
        <textarea className="input bg-white resize-none" rows={3} placeholder="How was your training, meals, and general feeling today?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
      </div>
      <button type="submit" className="btn-primary w-full py-3 text-base shadow-glow-sm" disabled={isPending}>{isPending ? 'Logging…' : 'Log Progress'}</button>
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
          <button className={`btn-primary py-2 px-4 text-sm shadow-glow-sm flex items-center gap-1.5 transition-all ${showForm ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-none border border-gray-200' : ''}`} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Log Progress'}
          </button>
        </div>
      )}

      {showForm && isClient && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 className="font-black text-gray-950 text-lg tracking-tight mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-brand-600" />
            Log Today's Progress
          </h3>
          <LogProgressForm engagementId={engagementId} onSuccess={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['progress', engagementId] }); }} />
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin mb-3" />
          <p className="text-gray-400 font-medium text-sm">Loading logs...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2 border-brand-100 max-w-lg mx-auto">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={24} className="text-brand-500" />
          </div>
          <h3 className="font-bold text-gray-950 text-base mb-1">No progress logged yet</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
            {isClient 
              ? 'Start logging your daily weight and wellbeing metrics to see progress charts.' 
              : 'The client hasn\'t logged any progress yet. Check back later!'}
          </p>
        </div>
      ) : (
        <>
          {chartData.some(d => d.weight) && (
            <div className="card">
              <h3 className="font-bold text-gray-950 tracking-tight text-base mb-5 flex items-center gap-2">
                <Scale size={18} className="text-brand-600" />
                Weight Progress (kg)
              </h3>
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
                    <Line type="monotone" dataKey="weight" stroke="#059669" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3, strokeWidth: 1, fill: '#fff' }} name="Weight" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-bold text-gray-950 tracking-tight text-base mb-5 flex items-center gap-2">
              <Heart size={18} className="text-red-500 animate-pulse" />
              Wellbeing & Energy Scores
            </h3>
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ left: -15, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
                  <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 5 }} dot={{ r: 2 }} name="Energy" />
                  <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 5 }} dot={{ r: 2 }} name="Sleep" />
                  <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 5 }} dot={{ r: 2 }} name="Mood" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-950 tracking-tight text-sm uppercase tracking-wider text-[10px] text-gray-400 pl-1">Recent Entries History</h3>
            {[...entries].reverse().slice(0, 10).map(entry => (
              <div key={entry._id} className="card border-gray-200/80 hover:border-gray-300 transition-all p-5">
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-2 font-extrabold text-gray-900">
                    <Calendar size={15} className="text-gray-400" />
                    <span>{format(new Date(entry.loggedAt), 'EEEE, MMM d, yyyy')}</span>
                  </div>
                  {entry.weightKg && (
                    <span className="font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-xl text-sm border border-brand-100">
                      {entry.weightKg} kg
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2.5 max-w-sm mb-3">
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-amber-900">
                    <span className="flex items-center gap-1"><Sparkles size={12} className="text-amber-500" /> Energy</span>
                    <span className="font-black">{entry.energyLevel}/5</span>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-blue-900">
                    <span className="flex items-center gap-1"><BedDouble size={12} className="text-blue-500" /> Sleep</span>
                    <span className="font-black">{entry.sleepQuality}/5</span>
                  </div>
                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-purple-900">
                    <span className="flex items-center gap-1"><Smile size={12} className="text-purple-500" /> Mood</span>
                    <span className="font-black">{entry.mood}/5</span>
                  </div>
                </div>

                {entry.notes && (
                  <p className="text-xs text-gray-600 mt-2 bg-gray-50/60 p-3 rounded-xl border border-gray-100 leading-relaxed font-medium">
                    {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
