import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roles = [
  { value: 'client', label: 'Client', desc: 'I want to post my fitness goals and hire professionals' },
  { value: 'trainer', label: 'Trainer', desc: 'I am a certified fitness professional looking to bid on clients' },
  { value: 'nutritionist', label: 'Nutritionist', desc: 'I am a certified nutrition professional looking to bid on clients' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) { toast.error('Please select a role'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to FitBid!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-3xl font-extrabold text-brand-600">Fit</span>
            <span className="text-3xl font-extrabold text-gray-900">Bid</span>
          </div>
          <p className="text-gray-500 text-sm">Create your free account</p>
        </div>

        <div className="card">
          {step === 1 ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">I am a…</h2>
              <div className="space-y-3 mb-6">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      form.role === r.value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{r.label}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
              <button
                className="btn-primary w-full py-2.5"
                disabled={!form.role}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-brand-600 hover:underline mb-2 block">
                ← Back
              </button>
              <div>
                <label className="label">Full name</label>
                <input type="text" className="input" placeholder="Jane Smith" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email address</label>
                <input type="email" className="input" placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Min. 6 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              </div>
              <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
