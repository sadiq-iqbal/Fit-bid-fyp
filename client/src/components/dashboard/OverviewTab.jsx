import { format, differenceInDays } from 'date-fns';
import { Scale, Target, Calendar, Activity } from 'lucide-react';

const BMI_COLORS = { underweight: 'text-blue-600 bg-blue-50', normal: 'text-green-600 bg-green-50', overweight: 'text-yellow-600 bg-yellow-50', obese: 'text-red-600 bg-red-50' };

export default function OverviewTab({ data }) {
  const { engagement, latestWorkoutPlan, latestMealPlan, recentProgress, pendingCheckIn } = data;

  const daysLeft = engagement.endDate ? differenceInDays(new Date(engagement.endDate), new Date()) : null;

  return (
    <div className="space-y-6">
      {/* Engagement timeline */}
      <div className="card">
        <h2 className="font-semibold mb-4">Engagement Timeline</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Started</div>
            <div className="font-medium">{format(new Date(engagement.startDate || engagement.createdAt), 'MMM d, yyyy')}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Ends</div>
            <div className="font-medium">{engagement.endDate ? format(new Date(engagement.endDate), 'MMM d, yyyy') : '—'}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Days remaining</div>
            <div className={`font-bold text-lg ${daysLeft !== null && daysLeft <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
              {daysLeft !== null ? `${daysLeft}d` : '—'}
            </div>
          </div>
        </div>
        {daysLeft !== null && (
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, ((engagement.durationWeeks * 7 - daysLeft) / (engagement.durationWeeks * 7)) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Activity className="text-green-600" size={18} /></div>
          <div>
            <div className="font-semibold text-gray-900">{latestWorkoutPlan ? `Week ${latestWorkoutPlan.weekNumber}` : 'No plan yet'}</div>
            <div className="text-xs text-gray-500">Current workout week</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Target className="text-orange-600" size={18} /></div>
          <div>
            <div className="font-semibold text-gray-900">{latestMealPlan ? `${latestMealPlan.dailyCalories} kcal` : 'No plan yet'}</div>
            <div className="text-xs text-gray-500">Daily calorie target</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Scale className="text-purple-600" size={18} /></div>
          <div>
            <div className="font-semibold text-gray-900">{recentProgress ? `${recentProgress.weightKg} kg` : '—'}</div>
            <div className="text-xs text-gray-500">Latest logged weight</div>
          </div>
        </div>
      </div>

      {pendingCheckIn && (
        <div className="card border-yellow-300 bg-yellow-50">
          <div className="font-semibold text-yellow-800 mb-1">📋 Week {pendingCheckIn.weekNumber} check-in is ready</div>
          <p className="text-sm text-yellow-700">Your professionals have assigned a weekly check-in. Head to the Check-ins tab to fill it out.</p>
        </div>
      )}

      {/* Team */}
      <div className="card">
        <h2 className="font-semibold mb-3">Your Team</h2>
        <div className="space-y-3">
          {[engagement.trainer, engagement.nutritionist].filter(Boolean).map(member => (
            <div key={member._id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold shrink-0">
                {member.avatar ? <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" /> : member.name?.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-sm">{member.name}</div>
                <div className="text-xs text-gray-500 capitalize">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
