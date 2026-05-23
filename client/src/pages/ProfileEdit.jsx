import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfileEdit() {
  const { user, setUser } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({});

  const { data } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/profiles/me').then(r => r.data),
  });

  useEffect(() => {
    if (data?.profile) setForm({ name: user?.name || '', ...data.profile });
  }, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: (d) => api.put('/profiles/me', d),
    onSuccess: ({ data: res }) => {
      toast.success('Profile updated!');
      setUser(u => ({ ...u, name: form.name }));
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const isClient = user?.role === 'client';
  const isProfessional = ['trainer', 'nutritionist'].includes(user?.role);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={(e) => { e.preventDefault(); mutate(form); }} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold">Basic Info</h2>
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input min-h-24 resize-y" value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell others about yourself…" />
          </div>
        </div>

        {isClient && (
          <div className="card space-y-4">
            <h2 className="font-semibold">Health Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Age</label><input className="input" type="number" value={form.age || ''} onChange={e => setForm({ ...form, age: e.target.value })} /></div>
              <div>
                <label className="label">Gender</label>
                <select className="input" value={form.gender || ''} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div><label className="label">Height (cm)</label><input className="input" type="number" value={form.heightCm || ''} onChange={e => setForm({ ...form, heightCm: e.target.value })} /></div>
              <div><label className="label">Weight (kg)</label><input className="input" type="number" value={form.weightKg || ''} onChange={e => setForm({ ...form, weightKg: e.target.value })} /></div>
            </div>
            <div>
              <label className="label">Activity Level</label>
              <select className="input" value={form.activityLevel || ''} onChange={e => setForm({ ...form, activityLevel: e.target.value })}>
                <option value="">Select</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightly-active">Lightly active</option>
                <option value="moderately-active">Moderately active</option>
                <option value="very-active">Very active</option>
              </select>
            </div>
          </div>
        )}

        {isProfessional && (
          <div className="card space-y-4">
            <h2 className="font-semibold">Professional Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Years of Experience</label><input className="input" type="number" value={form.yearsExperience || ''} onChange={e => setForm({ ...form, yearsExperience: e.target.value })} /></div>
              <div><label className="label">Hourly Rate ($)</label><input className="input" type="number" value={form.hourlyRate || ''} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} /></div>
              <div><label className="label">Location</label><input className="input" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
              <div>
                <label className="label">Availability</label>
                <select className="input" value={form.availabilityStatus || 'open'} onChange={e => setForm({ ...form, availabilityStatus: e.target.value })}>
                  <option value="open">Open to bids</option>
                  <option value="booked">Fully booked</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary w-full py-2.5" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
