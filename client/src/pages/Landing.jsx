import { Link } from 'react-router-dom';
import { Dumbbell, ChefHat, Trophy, Star, ArrowRight, CheckCircle, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Trophy, title: 'Competitive Bidding', desc: 'Certified trainers and nutritionists compete for your business — ensuring you get the absolute best proposals and rates.' },
  { icon: Dumbbell, title: 'Coordinated Plans', desc: 'Your trainer and nutritionist align on a unified dashboard, eliminating conflicting fitness and diet advice.' },
  { icon: ChefHat, title: 'All-in-One Platform', desc: 'Workout schedules, meal logging, progress analytics, weekly check-ins, and payments — integrated seamlessly.' },
];

const howItWorks = [
  { step: '01', title: 'Post your goal', desc: 'Describe your fitness or nutrition target, set your budget, and launch your request in minutes.' },
  { step: '02', title: 'Compare proposals', desc: 'Receive custom bids from verified trainers and nutritionists. Review qualifications, reviews, and approach.' },
  { step: '03', title: 'Start training', desc: 'Accept your favorite bid. A shared workspace is created, and your wellness team gets to work.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 25 }
  }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-50 font-sans selection:bg-brand-100 selection:text-brand-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-surface-200/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-brand-650 tracking-tight">Fit</span>
            <span className="text-2xl font-extrabold text-gray-950 tracking-tight">Bid</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/directory" className="hidden sm:inline-block text-sm text-gray-650 hover:text-gray-900 font-semibold transition-colors">Find Professionals</Link>
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">Log in</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2 shadow-glow-sm">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-mesh-animated noise-overlay border-b border-surface-200/40 py-24 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 badge-brand mb-6 px-4 py-1.5 text-xs font-bold shadow-sm"
          >
            <Sparkles size={12} className="text-brand-600 animate-pulse" />
            Coordinated fitness and diet guidance
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight"
          >
            Your trainer & nutritionist, <br className="hidden md:inline" />
            <span className="text-gradient-hero animate-gradient font-black">competing for you.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Tell us your fitness goal. Certified experts submit competitive proposals. Choose the best, and track your progress in a single unified dashboard.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-glow-md">
              Post your request <ArrowRight size={18} />
            </Link>
            <Link to="/directory" className="btn-secondary text-base px-8 py-3.5">
              Browse professionals
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">The FitBid Advantage</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto font-medium">How we optimize your physical training and custom nutrition programs.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div 
              key={title} 
              variants={itemVariants}
              className="card-interactive flex flex-col items-center text-center p-8 bg-white"
            >
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner-glow">
                <Icon size={26} className="text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works Section */}
      <section className="bg-white border-y border-surface-200/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">Simple 3-Step Process</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto font-medium">Everything you need to reach your peak performance.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-12"
          >
            {howItWorks.map(({ step, title, desc }) => (
              <motion.div 
                key={step} 
                variants={itemVariants}
                className="flex flex-col items-start relative p-4"
              >
                <span className="text-6xl font-black text-brand-100/70 select-none mb-4 leading-none">{step}</span>
                <h3 className="text-xl font-bold text-gray-950 mb-3">{title}</h3>
                <p className="text-gray-550 text-sm leading-relaxed font-medium">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-brand-600 to-emerald-800 text-white rounded-3xl p-10 sm:p-16 shadow-glow-lg text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              Ready to transform your fitness?
            </h2>
            <p className="text-brand-100 text-lg mb-10 font-medium">
              Join thousands of clients logging workouts, planning healthy diets, and succeeding with coordinates guidance.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-brand-700 rounded-xl font-bold hover:bg-brand-50 hover:scale-105 active:scale-95 transition-all shadow-lg text-base">
              Get started free <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200/50 py-10 bg-white text-center text-sm text-gray-400 font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 font-bold text-gray-900">
            <span className="text-brand-650">Fit</span><span>Bid</span>
          </div>
          <div>© {new Date().getFullYear()} FitBid. All rights reserved.</div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link to="/directory" className="hover:text-gray-900 transition-colors">Directory</Link>
            <span>·</span>
            <Link to="/login" className="hover:text-gray-900 transition-colors">Client Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
