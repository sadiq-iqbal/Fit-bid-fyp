import { format, differenceInDays } from 'date-fns';
import { Scale, Target, Calendar, Activity, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BMI_COLORS = { 
  underweight: 'text-blue-600 bg-blue-50', 
  normal: 'text-green-600 bg-green-50', 
  overweight: 'text-yellow-600 bg-yellow-50', 
  obese: 'text-red-600 bg-red-50' 
};

export default function OverviewTab({ data }) {
  const { engagement, latestWorkoutPlan, latestMealPlan, recentProgress, pendingCheckIn } = data;

  const daysLeft = engagement.endDate ? differenceInDays(new Date(engagement.endDate), new Date()) : null;
  const totalDays = engagement.durationWeeks * 7;
  const daysElapsed = daysLeft !== null ? Math.max(0, totalDays - daysLeft) : 0;
  const progressPercent = daysLeft !== null ? Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100)) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Engagement timeline */}
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-[0.02] pointer-events-none" />
        <h2 className="font-bold text-gray-950 tracking-tight text-lg mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-brand-600" />
          Engagement Timeline
        </h2>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Started</div>
            <div className="font-bold text-gray-900">{format(new Date(engagement.startDate || engagement.createdAt), 'MMM d, yyyy')}</div>
          </div>
          <div>
            <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Ends</div>
            <div className="font-bold text-gray-900">{engagement.endDate ? format(new Date(engagement.endDate), 'MMM d, yyyy') : '—'}</div>
          </div>
          <div>
            <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Days remaining</div>
            <div className={`font-black text-xl ${daysLeft !== null && daysLeft <= 7 ? 'text-red-600' : 'text-brand-600'}`}>
              {daysLeft !== null ? `${daysLeft}d` : '—'}
            </div>
          </div>
        </div>
        
        {daysLeft !== null && (
          <div className="mt-5">
            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5">
              <span>{Math.round(progressPercent)}% Completed</span>
              <span>{daysLeft} days left</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-interactive flex items-center gap-4 p-5">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="text-green-600" size={22} />
          </div>
          <div>
            <div className="text-lg font-black text-gray-950">
              {latestWorkoutPlan ? `Week ${latestWorkoutPlan.weekNumber}` : 'None'}
            </div>
            <div className="text-xs text-gray-500 font-semibold">Current Workout Week</div>
          </div>
        </div>

        <div className="card-interactive flex items-center gap-4 p-5">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
            <Target className="text-orange-600" size={22} />
          </div>
          <div>
            <div className="text-lg font-black text-gray-950">
              {latestMealPlan ? `${latestMealPlan.dailyCalories} kcal` : 'None'}
            </div>
            <div className="text-xs text-gray-500 font-semibold">Daily Calorie Target</div>
          </div>
        </div>

        <div className="card-interactive flex items-center gap-4 p-5">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
            <Scale className="text-purple-600" size={22} />
          </div>
          <div>
            <div className="text-lg font-black text-gray-950">
              {recentProgress ? `${recentProgress.weightKg} kg` : '—'}
            </div>
            <div className="text-xs text-gray-500 font-semibold">Latest Logged Weight</div>
          </div>
        </div>
      </div>

      {pendingCheckIn && (
        <div className="border border-amber-200 bg-amber-50/60 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-sm mb-1">Week {pendingCheckIn.weekNumber} check-in is ready</h4>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Your professional team has assigned a new weekly check-in. Navigate to the <strong>Check-ins</strong> tab above to fill it out.
            </p>
          </div>
        </div>
      )}

      {/* Team */}
      <div className="card">
        <h2 className="font-bold text-gray-950 tracking-tight text-lg mb-4 flex items-center gap-2">
          <Users size={18} className="text-brand-600" />
          Your Certified Professionals
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[engagement.trainer, engagement.nutritionist].filter(Boolean).map(member => (
            <div key={member._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
              <div className="w-12 h-12 rounded-full ring-2 ring-brand-100 bg-brand-100 flex items-center justify-center text-brand-700 font-bold shrink-0 overflow-hidden shadow-sm">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">{member.name}</div>
                <div className="text-xs font-semibold text-gray-400 capitalize mt-0.5 tracking-wide">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
