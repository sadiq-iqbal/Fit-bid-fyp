import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, ChevronDown, ChevronRight, Dumbbell, Trash2, X, Search } from 'lucide-react';
import ExerciseSearchModal from '../ExerciseSearchModal';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const emptyExercise = () => ({ name: '', sets: 3, reps: '10', restSeconds: 60, notes: '' });

const emptyDay = (dayOfWeek) => ({
  dayOfWeek,
  focusArea: '',
  durationMinutes: 45,
  isRestDay: false,
  exercises: [emptyExercise()],
  notes: '',
});

function WorkoutForm({ engagementId, nextWeek, initialData, onClose }) {
  const qc = useQueryClient();
  const isEditing = !!initialData;
  const [form, setForm] = useState(initialData || {
    weekNumber: nextWeek,
    title: '',
    difficultyLevel: 'beginner',
    notes: '',
    days: [emptyDay('monday')],
  });
  const [searchModalDay, setSearchModalDay] = useState(null);

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? api.put(`/workouts/${initialData._id}`, data) : api.post('/workouts', data),
    onSuccess: () => {
      toast.success(isEditing ? 'Workout plan updated!' : 'Workout plan created!');
      qc.invalidateQueries({ queryKey: ['workouts', engagementId] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to save workout plan'),
  });

  const addDay = () => {
    const usedDays = form.days.map(d => d.dayOfWeek);
    const nextDay = DAYS_OF_WEEK.find(d => !usedDays.includes(d));
    if (!nextDay) return toast.error('All days already added');
    setForm({ ...form, days: [...form.days, emptyDay(nextDay)] });
  };

  const removeDay = (idx) => {
    setForm({ ...form, days: form.days.filter((_, i) => i !== idx) });
  };

  const updateDay = (idx, field, value) => {
    const days = [...form.days];
    days[idx] = { ...days[idx], [field]: value };
    if (field === 'isRestDay' && value) {
      days[idx].exercises = [];
    } else if (field === 'isRestDay' && !value && days[idx].exercises.length === 0) {
      days[idx].exercises = [emptyExercise()];
    }
    setForm({ ...form, days });
  };

  const addExercise = (dayIdx) => {
    const days = [...form.days];
    days[dayIdx] = { ...days[dayIdx], exercises: [...days[dayIdx].exercises, emptyExercise()] };
    setForm({ ...form, days });
  };

  const removeExercise = (dayIdx, exIdx) => {
    const days = [...form.days];
    days[dayIdx] = { ...days[dayIdx], exercises: days[dayIdx].exercises.filter((_, i) => i !== exIdx) };
    setForm({ ...form, days });
  };

  const updateExercise = (dayIdx, exIdx, field, value) => {
    const days = [...form.days];
    const exercises = [...days[dayIdx].exercises];
    exercises[exIdx] = { ...exercises[exIdx], [field]: value };
    days[dayIdx] = { ...days[dayIdx], exercises };
    setForm({ ...form, days });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.days.length === 0) return toast.error('Add at least one day');
    for (const day of form.days) {
      if (!day.isRestDay && day.exercises.length === 0) {
        return toast.error(`Add at least one exercise for ${day.dayOfWeek}`);
      }
      if (!day.isRestDay) {
        for (const ex of day.exercises) {
          if (!ex.name.trim()) return toast.error('All exercises must have a name');
        }
      }
    }
    mutation.mutate({
      engagementId,
      weekNumber: Number(form.weekNumber),
      title: form.title,
      difficultyLevel: form.difficultyLevel,
      days: form.days.map((d, i) => ({
        ...d,
        exercises: d.exercises.map((ex, j) => ({ ...ex, order: j, sets: Number(ex.sets), restSeconds: Number(ex.restSeconds) })),
      })),
      notes: form.notes,
    });
  };

  const usedDays = form.days.map(d => d.dayOfWeek);

  return (
    <div className="card border-brand-200 bg-brand-50/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{isEditing ? 'Edit Workout Plan' : 'Create Workout Plan'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Top-level fields */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Week Number</label>
            <input className="input" type="number" min="1" value={form.weekNumber} onChange={e => setForm({ ...form, weekNumber: e.target.value })} required />
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder="e.g. Foundation Week" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={form.difficultyLevel} onChange={e => setForm({ ...form, difficultyLevel: e.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Days */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-gray-700">Training Days</h4>
            <button type="button" onClick={addDay} disabled={usedDays.length >= 7} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
              <Plus size={14} /> Add Day
            </button>
          </div>

          {form.days.map((day, dayIdx) => (
            <div key={dayIdx} className="border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <select className="input w-auto py-1 text-sm font-medium" value={day.dayOfWeek}
                  onChange={e => updateDay(dayIdx, 'dayOfWeek', e.target.value)}>
                  {DAYS_OF_WEEK.filter(d => d === day.dayOfWeek || !usedDays.includes(d)).map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={day.isRestDay} onChange={e => updateDay(dayIdx, 'isRestDay', e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                  Rest Day
                </label>
                {!day.isRestDay && (
                  <input className="input py-1 text-sm flex-1" placeholder="Focus area (e.g. Upper Body)"
                    value={day.focusArea} onChange={e => updateDay(dayIdx, 'focusArea', e.target.value)} />
                )}
                <button type="button" onClick={() => removeDay(dayIdx)} className="text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>

              {!day.isRestDay && (
                <div className="px-4 py-3 space-y-3">
                  {day.exercises.map((ex, exIdx) => (
                    <div key={exIdx} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                        {exIdx + 1}
                      </div>
                      {ex.gifUrl && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 grid grid-cols-5 gap-2">
                        <input className="input py-1 text-sm col-span-2" placeholder="Exercise name"
                          value={ex.name} onChange={e => updateExercise(dayIdx, exIdx, 'name', e.target.value)} required />
                        <input className="input py-1 text-sm" type="number" min="1" placeholder="Sets"
                          value={ex.sets} onChange={e => updateExercise(dayIdx, exIdx, 'sets', e.target.value)} />
                        <input className="input py-1 text-sm" placeholder="Reps (e.g. 10)"
                          value={ex.reps} onChange={e => updateExercise(dayIdx, exIdx, 'reps', e.target.value)} />
                        <input className="input py-1 text-sm" type="number" min="0" placeholder="Rest (s)"
                          value={ex.restSeconds} onChange={e => updateExercise(dayIdx, exIdx, 'restSeconds', e.target.value)} />
                      </div>
                      <button type="button" onClick={() => removeExercise(dayIdx, exIdx)}
                        className="text-red-400 hover:text-red-600 shrink-0 mt-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 mt-1">
                    <button type="button" onClick={() => addExercise(dayIdx)}
                      className="text-brand-600 hover:text-brand-700 text-xs font-medium flex items-center gap-1">
                      <Plus size={14} /> Add Manually
                    </button>
                    <span className="text-gray-300 text-xs">·</span>
                    <button type="button" onClick={() => setSearchModalDay(dayIdx)}
                      className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1">
                      <Search size={14} /> Search ExerciseDB
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes for Client (optional)</label>
          <textarea className="input resize-none" rows={2} placeholder="General guidance, reminders, tips…"
            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
          {mutation.isPending ? (isEditing ? 'Updating…' : 'Creating…') : (isEditing ? 'Update Workout Plan' : 'Create Workout Plan')}
        </button>
      </form>

      {searchModalDay !== null && (
        <ExerciseSearchModal
          dayLabel={form.days[searchModalDay]?.dayOfWeek}
          onSelect={(exercise) => {
            const days = [...form.days];
            days[searchModalDay] = {
              ...days[searchModalDay],
              exercises: [...days[searchModalDay].exercises, exercise],
            };
            setForm({ ...form, days });
          }}
          onClose={() => setSearchModalDay(null)}
        />
      )}
    </div>
  );
}

function WorkoutDayCard({ day, engagementId, user, planId }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const logWorkout = useMutation({
    mutationFn: (data) => api.post('/workouts/log', data),
    onSuccess: () => { toast.success('Workout logged!'); qc.invalidateQueries({ queryKey: ['workout-logs', engagementId] }); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <div>
          <span className="font-medium capitalize">{day.dayOfWeek}</span>
          {day.isRestDay ? <span className="ml-2 badge-gray text-xs">Rest Day</span> : <span className="ml-2 text-sm text-gray-500">{day.focusArea}</span>}
        </div>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3">
          {day.isRestDay ? (
            <p className="text-sm text-gray-500">Rest and recovery day. Light stretching is encouraged.</p>
          ) : (
            <>
              {day.exercises?.map((ex, i) => {
                const inner = (
                  <div className={`flex items-start gap-3 text-sm rounded-xl p-2 transition-colors ${ex.exerciseDbId ? 'hover:bg-brand-50 cursor-pointer group' : ''}`}>
                    <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{i + 1}</div>
                    {ex.gifUrl && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium capitalize ${ex.exerciseDbId ? 'group-hover:text-brand-600' : ''}`}>{ex.name}</div>
                      <div className="text-gray-500 text-xs">{ex.sets} sets × {ex.reps} reps · {ex.restSeconds}s rest</div>
                      {ex.target && <div className="text-xs text-brand-500 mt-0.5 capitalize">{ex.target} · {ex.bodyPart}</div>}
                      {ex.notes && <div className="text-xs text-gray-400 mt-0.5">{ex.notes}</div>}
                    </div>
                    {ex.exerciseDbId && (
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-500 shrink-0 mt-1 transition-colors" />
                    )}
                  </div>
                );
                return ex.exerciseDbId ? (
                  <Link key={i} to={`/exercise/${ex.exerciseDbId}`}>{inner}</Link>
                ) : (
                  <div key={i}>{inner}</div>
                );
              })}
              {user.role === 'client' && (
                <button
                  className="btn-secondary text-sm w-full mt-2"
                  onClick={() => logWorkout.mutate({ engagementId, workoutPlanId: planId, dayId: day._id, notes: '', rating: 4 })}
                  disabled={logWorkout.isPending}
                >
                  Mark as Complete
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkoutsTab({ engagementId, engagement, user }) {
  const qc = useQueryClient();
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['workouts', engagementId],
    queryFn: () => api.get(`/workouts/engagement/${engagementId}`).then(r => r.data),
  });

  const deletePlan = useMutation({
    mutationFn: (planId) => api.delete(`/workouts/${planId}`),
    onSuccess: () => {
      toast.success('Workout plan deleted');
      qc.invalidateQueries({ queryKey: ['workouts', engagementId] });
      setSelectedWeek(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete plan'),
  });

  const plans = data?.plans || [];
  const activePlan = selectedWeek !== null ? plans.find(p => p.weekNumber === selectedWeek) : plans[plans.length - 1];
  const nextWeek = plans.length > 0 ? Math.max(...plans.map(p => p.weekNumber)) + 1 : 1;

  const isTrainer = user._id === engagement.trainer?._id || user._id === engagement.trainer;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Workout Plans</h2>
        {isTrainer && !showCreateForm && !editingPlan && (
          <button className="btn-primary text-sm" onClick={() => setShowCreateForm(true)}>
            <Plus size={16} className="inline mr-1" /> New Plan
          </button>
        )}
      </div>

      {showCreateForm && isTrainer && (
        <div className="mb-6">
          <WorkoutForm engagementId={engagementId} nextWeek={nextWeek} onClose={() => setShowCreateForm(false)} />
        </div>
      )}

      {editingPlan && isTrainer && (
        <div className="mb-6">
          <WorkoutForm engagementId={engagementId} nextWeek={nextWeek} initialData={editingPlan} onClose={() => setEditingPlan(null)} />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Loading…</div>
      ) : plans.length === 0 && !showCreateForm ? (
        <div className="card text-center py-12">
          <Dumbbell size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No workout plan yet</h3>
          <p className="text-sm text-gray-500">{isTrainer ? 'Click "New Plan" above to create the first workout plan for this client.' : 'Your trainer hasn\'t assigned a workout plan yet. Check back soon!'}</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {plans.map(p => (
              <button key={p._id} onClick={() => setSelectedWeek(p.weekNumber)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${activePlan?.weekNumber === p.weekNumber ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-400'}`}>
                Week {p.weekNumber}
              </button>
            ))}
          </div>
          {activePlan && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Week {activePlan.weekNumber}: {activePlan.title}</h3>
                  <span className="badge-blue text-xs capitalize">{activePlan.difficultyLevel}</span>
                  <div className="text-xs text-gray-400 ml-2">
                    {activePlan.createdAt !== activePlan.updatedAt ? 
                      `Updated ${new Date(activePlan.updatedAt).toLocaleDateString()}` : 
                      `Created ${new Date(activePlan.createdAt).toLocaleDateString()}`}
                  </div>
                </div>
                {isTrainer && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingPlan(activePlan)} className="text-brand-600 hover:text-brand-800 text-sm font-medium">Edit</button>
                    <button onClick={() => {
                      if (window.confirm('Are you sure you want to delete this workout plan?')) {
                        deletePlan.mutate(activePlan._id);
                      }
                    }} className="text-red-500 hover:text-red-700 text-sm font-medium ml-2">Delete</button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {activePlan.days?.map((day, i) => (
                  <WorkoutDayCard key={i} day={day} engagementId={engagementId} user={user} planId={activePlan._id} />
                ))}
              </div>
              {activePlan.notes && <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700"><span className="font-medium">Trainer notes: </span>{activePlan.notes}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
