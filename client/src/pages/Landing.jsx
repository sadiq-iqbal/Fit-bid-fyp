import { Link } from 'react-router-dom';
import { Dumbbell, ChefHat, Trophy, Star, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Trophy, title: 'Competitive Bidding', desc: 'Certified trainers and nutritionists compete for your business — so they bring their A-game.' },
  { icon: Dumbbell, title: 'Coordinated Plans', desc: 'Your trainer and nutritionist work together on a shared dashboard. No conflicting advice.' },
  { icon: ChefHat, title: 'End-to-End Platform', desc: 'Plans, logs, progress charts, check-ins, payments — everything in one place.' },
];

const howItWorks = [
  { step: '01', title: 'Post your goal', desc: 'Describe your fitness or nutrition problem, set your budget, and publish your request.' },
  { step: '02', title: 'Review bids', desc: 'Receive proposals from verified trainers and nutritionists. Compare price, ratings, and approach.' },
  { step: '03', title: 'Start your journey', desc: 'Accept the best bids. A shared dashboard opens and your professionals get to work.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-extrabold text-brand-600">Fit</span>
          <span className="text-2xl font-extrabold text-gray-900">Bid</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/directory" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Find Professionals</Link>
          <Link to="/login" className="btn-secondary text-sm py-1.5">Log in</Link>
          <Link to="/register" className="btn-primary text-sm py-1.5">Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="badge-green mb-6 text-sm">Now in beta — free to join</div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Your trainer and nutritionist,<br />
          <span className="text-brand-600">competing for you.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Post your fitness goal. Get bids from certified professionals. Pick the best. Track everything in one shared dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Post your first request <ArrowRight size={18} />
          </Link>
          <Link to="/directory" className="btn-secondary text-base px-8 py-3">
            Browse professionals
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why FitBid is different</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorks.map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-start">
              <span className="text-5xl font-black text-brand-100 mb-3">{step}</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your fitness?</h2>
          <p className="text-brand-100 mb-8">Join thousands of clients getting results with coordinated fitness and nutrition guidance.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-600 rounded-lg font-bold hover:bg-brand-50 transition-colors text-base">
            Get started free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} FitBid. All rights reserved.
      </footer>
    </div>
  );
}
