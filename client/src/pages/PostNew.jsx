import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

const ALL_TAGS = ['weight-loss','muscle-gain','endurance','rehab','nutrition-only','sports-performance','diabetes-friendly','strength','flexibility','general-health'];

export default function PostNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', tags: [], needsTrainer: true, needsNutritionist: false,
    budgetMin: '', budgetMax: '', durationWeeks: '', visibility: 'public', deadline: '',
    trainingLocation: 'any', equipmentAvailable: '',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post('/posts', data),
    onSuccess: ({ data }) => {
      toast.success('Request posted!');
      navigate(`/posts/${data.post._id}`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to post request'),
  });

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.needsTrainer && !form.needsNutritionist) { toast.error('Select at least one professional type'); return; }
    mutate({ ...form, budgetMin: Number(form.budgetMin), budgetMax: Number(form.budgetMax), durationWeeks: Number(form.durationWeeks) });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Post a New Request</h1>
      <p className="text-gray-500 mb-6 text-sm">Describe your goal clearly — the more detail you give, the better proposals you'll receive.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold">About your goal</h2>
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder="e.g. Need help losing 10kg before my wedding in 4 months" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-28 resize-y" placeholder="Tell professionals about your current situation, what you've tried, any medical conditions, and what success looks like for you…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="label">Tags (select all that apply)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ALL_TAGS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.tags.includes(tag) ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-700 hover:border-brand-400'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold">Who do you need?</h2>
          <div className="flex gap-4">
            {[['needsTrainer', 'Trainer'], ['needsNutritionist', 'Nutritionist']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                <span className="font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold">Training Preferences</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Training Location</label>
              <select className="input" value={form.trainingLocation} onChange={e => setForm({ ...form, trainingLocation: e.target.value })}>
                <option value="any">Any (Online/Flexible)</option>
                <option value="home">Home</option>
                <option value="gym">Gym</option>
              </select>
            </div>
            <div>
              <label className="label">Available Equipment (if home/any)</label>
              <input className="input" placeholder="e.g. Dumbbells, resistance bands, none..." value={form.equipmentAvailable} onChange={e => setForm({ ...form, equipmentAvailable: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold">Budget & Timeline</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min budget ($/month)</label>
              <input className="input" type="number" min="0" placeholder="100" value={form.budgetMin} onChange={e => setForm({ ...form, budgetMin: e.target.value })} required />
            </div>
            <div>
              <label className="label">Max budget ($/month)</label>
              <input className="input" type="number" min="0" placeholder="300" value={form.budgetMax} onChange={e => setForm({ ...form, budgetMax: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Engagement duration (weeks)</label>
              <input className="input" type="number" min="1" placeholder="8" value={form.durationWeeks} onChange={e => setForm({ ...form, durationWeeks: e.target.value })} required />
            </div>
            <div>
              <label className="label">Deadline (optional)</label>
              <input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Visibility</label>
            <select className="input" value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}>
              <option value="public">Public — any verified professional can bid</option>
              <option value="invite-only">Invite only — I'll invite professionals directly</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={isPending}>
          {isPending ? 'Publishing…' : 'Publish Request'}
        </button>
      </form>
    </div>
  );
}
