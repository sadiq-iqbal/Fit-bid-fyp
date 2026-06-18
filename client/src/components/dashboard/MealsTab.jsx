import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Utensils, Plus, X, Trash2, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_COLORS = {
  breakfast: { border: 'border-l-4 border-l-amber-500 border-gray-200/80', bg: 'bg-amber-50/10 hover:bg-amber-50/20', badge: 'bg-amber-100 text-amber-800' },
  lunch: { border: 'border-l-4 border-l-green-500 border-gray-200/80', bg: 'bg-green-50/10 hover:bg-green-50/20', badge: 'bg-green-100 text-green-800' },
  dinner: { border: 'border-l-4 border-l-blue-500 border-gray-200/80', bg: 'bg-blue-50/10 hover:bg-blue-50/20', badge: 'bg-blue-100 text-blue-800' },
  snack: { border: 'border-l-4 border-l-purple-500 border-gray-200/80', bg: 'bg-purple-50/10 hover:bg-purple-50/20', badge: 'bg-purple-100 text-purple-800' }
};

const emptyItem = () => ({ name: '', portionSize: '', calories: '', notes: '' });

const emptyMeal = (dayOfWeek, mealType) => ({
  dayOfWeek,
  mealType,
  items: [emptyItem()],
  totalCalories: 0,
  notes: '',
});

function CreateMealPlanForm({ engagementId, nextWeek, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    weekNumber: nextWeek,
    dailyCalories: '',
    proteinG: '',
    carbsG: '',
    fatsG: '',
    fiberG: '',
    allergyFlags: '',
    notes: '',
    meals: [emptyMeal('monday', 'breakfast')],
  });

  const createPlan = useMutation({
    mutationFn: (data) => api.post('/meals', data),
    onSuccess: () => {
      toast.success('Meal plan created!');
      qc.invalidateQueries({ queryKey: ['meals', engagementId] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create meal plan'),
  });

  const addMeal = () => {
    setForm({ ...form, meals: [...form.meals, emptyMeal('monday', 'breakfast')] });
  };

  const removeMeal = (idx) => {
    setForm({ ...form, meals: form.meals.filter((_, i) => i !== idx) });
  };

  const updateMeal = (idx, field, value) => {
    const meals = [...form.meals];
    meals[idx] = { ...meals[idx], [field]: value };
    setForm({ ...form, meals });
  };

  const addItem = (mealIdx) => {
    const meals = [...form.meals];
    meals[mealIdx] = { ...meals[mealIdx], items: [...meals[mealIdx].items, emptyItem()] };
    setForm({ ...form, meals });
  };

  const removeItem = (mealIdx, itemIdx) => {
    const meals = [...form.meals];
    meals[mealIdx] = { ...meals[mealIdx], items: meals[mealIdx].items.filter((_, i) => i !== itemIdx) };
    setForm({ ...form, meals });
  };

  const updateItem = (mealIdx, itemIdx, field, value) => {
    const meals = [...form.meals];
    const items = [...meals[mealIdx].items];
    items[itemIdx] = { ...items[itemIdx], [field]: value };
    meals[mealIdx] = { ...meals[mealIdx], items };
    setForm({ ...form, meals });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.meals.length === 0) return toast.error('Add at least one meal');
    for (const meal of form.meals) {
      if (meal.items.length === 0) return toast.error('Each meal needs at least one item');
      for (const item of meal.items) {
        if (!item.name.trim()) return toast.error('All food items must have a name');
      }
    }
    createPlan.mutate({
      engagementId,
      weekNumber: Number(form.weekNumber),
      dailyCalories: Number(form.dailyCalories) || undefined,
      proteinG: Number(form.proteinG) || undefined,
      carbsG: Number(form.carbsG) || undefined,
      fatsG: Number(form.fatsG) || undefined,
      fiberG: Number(form.fiberG) || undefined,
      allergyFlags: form.allergyFlags ? form.allergyFlags.split(',').map(s => s.trim()).filter(Boolean) : [],
      meals: form.meals.map(m => ({
        ...m,
        totalCalories: m.items.reduce((sum, it) => sum + (Number(it.calories) || 0), 0),
        items: m.items.map(it => ({ ...it, calories: Number(it.calories) || 0 })),
      })),
      notes: form.notes,
    });
  };

  return (
    <div className="card relative overflow-hidden border-brand-200/80 bg-brand-50/20 p-6 md:p-8">
      <div className="absolute inset-0 bg-mesh opacity-5 pointer-events-none" />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="font-black text-gray-950 text-xl tracking-tight">Create Meal Plan</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Week & Macros */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div>
            <label className="label">Week #</label>
            <input className="input bg-white" type="number" min="1" value={form.weekNumber} onChange={e => setForm({ ...form, weekNumber: e.target.value })} required />
          </div>
          <div>
            <label className="label">Calories</label>
            <input className="input bg-white" type="number" placeholder="2000" value={form.dailyCalories} onChange={e => setForm({ ...form, dailyCalories: e.target.value })} />
          </div>
          <div>
            <label className="label">Protein (g)</label>
            <input className="input bg-white" type="number" placeholder="150" value={form.proteinG} onChange={e => setForm({ ...form, proteinG: e.target.value })} />
          </div>
          <div>
            <label className="label">Carbs (g)</label>
            <input className="input bg-white" type="number" placeholder="200" value={form.carbsG} onChange={e => setForm({ ...form, carbsG: e.target.value })} />
          </div>
          <div>
            <label className="label">Fats (g)</label>
            <input className="input bg-white" type="number" placeholder="65" value={form.fatsG} onChange={e => setForm({ ...form, fatsG: e.target.value })} />
          </div>
          <div>
            <label className="label">Fiber (g)</label>
            <input className="input bg-white" type="number" placeholder="30" value={form.fiberG} onChange={e => setForm({ ...form, fiberG: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Allergy Flags (comma-separated)</label>
          <input className="input bg-white" placeholder="e.g. gluten, dairy, nuts" value={form.allergyFlags} onChange={e => setForm({ ...form, allergyFlags: e.target.value })} />
        </div>

        {/* Meals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200/50 pb-2">
            <h4 className="font-bold text-sm text-gray-800 tracking-tight">Meals List</h4>
            <button type="button" onClick={addMeal} className="btn-secondary py-1 px-3 text-xs flex items-center gap-1">
              <Plus size={14} /> Add Meal
            </button>
          </div>

          <div className="space-y-3">
            {form.meals.map((meal, mealIdx) => (
              <div key={mealIdx} className="border border-surface-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                  <select className="input bg-white w-auto py-1 text-sm font-bold text-gray-900 border-gray-200" value={meal.dayOfWeek}
                    onChange={e => updateMeal(mealIdx, 'dayOfWeek', e.target.value)}>
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>

                  <select className="input bg-white w-auto py-1 text-sm font-bold text-gray-900 border-gray-200 capitalize" value={meal.mealType}
                    onChange={e => updateMeal(mealIdx, 'mealType', e.target.value)}>
                    {MEAL_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>

                  <input className="input bg-white py-1 text-sm flex-1 min-w-[150px]" placeholder="Meal notes (optional)"
                    value={meal.notes} onChange={e => updateMeal(mealIdx, 'notes', e.target.value)} />

                  <button type="button" onClick={() => removeMeal(mealIdx)} className="w-8 h-8 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 flex items-center justify-center shrink-0 transition-colors ml-auto">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {meal.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b sm:border-b-0 border-gray-100 pb-3 sm:pb-0">
                      <input className="input bg-white py-1.5 text-sm flex-[2]" placeholder="Food item name"
                        value={item.name} onChange={e => updateItem(mealIdx, itemIdx, 'name', e.target.value)} required />
                      <input className="input bg-white py-1.5 text-sm flex-1" placeholder="Portion (e.g. 200g)"
                        value={item.portionSize} onChange={e => updateItem(mealIdx, itemIdx, 'portionSize', e.target.value)} />
                      <input className="input bg-white py-1.5 text-sm w-24" type="number" placeholder="Calories"
                        value={item.calories} onChange={e => updateItem(mealIdx, itemIdx, 'calories', e.target.value)} />
                      <button type="button" onClick={() => removeItem(mealIdx, itemIdx)}
                        className="w-8 h-8 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 flex items-center justify-center shrink-0 self-end sm:self-auto">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addItem(mealIdx)}
                    className="text-brand-600 hover:text-brand-700 text-xs font-bold flex items-center gap-1 transition-colors mt-2">
                    <Plus size={14} /> Add Food Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes for Client (optional)</label>
          <textarea className="input bg-white resize-none" rows={3} placeholder="Dietary guidance, hydration tips, supplements…"
            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button type="submit" className="btn-primary w-full py-3 text-base shadow-glow-sm" disabled={createPlan.isPending}>
          {createPlan.isPending ? 'Creating…' : 'Create Meal Plan'}
        </button>
      </form>
    </div>
  );
}

export default function MealsTab({ engagementId, engagement, user }) {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['meals', engagementId],
    queryFn: () => api.get(`/meals/engagement/${engagementId}`).then(r => r.data),
  });

  const plans = data?.plans || [];
  const activePlan = selectedWeek !== null ? plans.find(p => p.weekNumber === selectedWeek) : plans[plans.length - 1];
  const dayMeals = activePlan?.meals?.filter(m => m.dayOfWeek === selectedDay) || [];
  const nextWeek = plans.length > 0 ? Math.max(...plans.map(p => p.weekNumber)) + 1 : 1;

  const isNutritionist = user._id === engagement.nutritionist?._id || user._id === engagement.nutritionist;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-950 tracking-tight flex items-center gap-2">
          <Utensils size={20} className="text-brand-600" />
          Meal Plans
        </h2>
        {isNutritionist && !showCreateForm && (
          <button className="btn-primary py-2 px-4 text-sm shadow-glow-sm flex items-center gap-1.5" onClick={() => setShowCreateForm(true)}>
            <Plus size={16} /> New Plan
          </button>
        )}
      </div>

      {showCreateForm && isNutritionist && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <CreateMealPlanForm engagementId={engagementId} nextWeek={nextWeek} onClose={() => setShowCreateForm(false)} />
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin mb-3" />
          <p className="text-gray-400 font-medium text-sm">Loading plans...</p>
        </div>
      ) : plans.length === 0 && !showCreateForm ? (
        <div className="card text-center py-16 border-dashed border-2 border-brand-100 max-w-lg mx-auto">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Utensils size={24} className="text-brand-500" />
          </div>
          <h3 className="font-bold text-gray-950 text-base mb-1">No meal plan assigned</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
            {isNutritionist 
              ? 'Create a custom meal plan by clicking "New Plan" at the top right.' 
              : "Your nutritionist hasn't assigned a meal plan yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <>
          {/* Week selector */}
          <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar scroll-smooth">
            {plans.map(p => (
              <button key={p._id} onClick={() => setSelectedWeek(p.weekNumber)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all shrink-0 ${
                  activePlan?.weekNumber === p.weekNumber 
                    ? 'bg-brand-600 text-white border-brand-600 shadow-glow-sm scale-105' 
                    : 'border-gray-200 text-gray-500 bg-white hover:border-brand-400 hover:text-brand-600'
                }`}>
                Week {p.weekNumber}
              </button>
            ))}
          </div>

          {activePlan && (
            <div className="space-y-6">
              {/* Daily Targets Card */}
              <div className="card relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-[0.02] pointer-events-none" />
                <h3 className="font-bold text-gray-950 text-sm tracking-tight mb-4 uppercase tracking-wider text-[10px] text-gray-400">Daily Targets • Week {activePlan.weekNumber}</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Calories', value: activePlan.dailyCalories ? `${activePlan.dailyCalories} kcal` : null, color: 'text-brand-600 bg-brand-50/60' },
                    { label: 'Protein', value: activePlan.proteinG ? `${activePlan.proteinG}g` : null, color: 'text-blue-600 bg-blue-50/60' },
                    { label: 'Carbs', value: activePlan.carbsG ? `${activePlan.carbsG}g` : null, color: 'text-emerald-600 bg-emerald-50/60' },
                    { label: 'Fats', value: activePlan.fatsG ? `${activePlan.fatsG}g` : null, color: 'text-orange-600 bg-orange-50/60' },
                    { label: 'Fiber', value: activePlan.fiberG ? `${activePlan.fiberG}g` : null, color: 'text-indigo-600 bg-indigo-50/60' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-gray-50/40">
                      <span className="text-sm font-black text-gray-900">{value || '—'}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</span>
                    </div>
                  ))}
                </div>

                {activePlan.allergyFlags?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100/80 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-red-500 mr-1 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      Allergy Warnings:
                    </span>
                    {activePlan.allergyFlags.map(f => (
                      <span key={f} className="badge bg-red-50 text-red-700 border border-red-100 rounded-full py-0.5 px-2.5 font-bold text-[11px] capitalize">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Day selector */}
              <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar scroll-smooth">
                {DAYS_OF_WEEK.map(day => (
                  <button key={day} onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      selectedDay === day 
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                        : 'border-gray-200 text-gray-500 bg-white hover:border-brand-400 hover:text-brand-600'
                    }`}>
                    {day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                ))}
              </div>

              {/* Meals for selected day */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MEAL_TYPES.map(mealType => {
                  const meal = dayMeals.find(m => m.mealType === mealType);
                  const colors = MEAL_COLORS[mealType];

                  return (
                    <div key={mealType} className={`border rounded-2xl overflow-hidden shadow-sm transition-all p-5 flex flex-col justify-between ${colors.border} ${colors.bg}`}>
                      <div>
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100/50">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black capitalize tracking-wide ${colors.badge}`}>
                            {mealType}
                          </span>
                          {meal && <span className="text-xs text-gray-500 font-extrabold">{meal.totalCalories} kcal</span>}
                        </div>
                        {meal ? (
                          <div className="space-y-2.5">
                            {meal.items?.map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-dashed border-gray-100 last:border-0 pb-1">
                                <span className="font-semibold text-gray-800">{item.name}</span>
                                <span className="text-xs text-gray-400 font-bold">{item.portionSize} • {item.calories} kcal</span>
                              </div>
                            ))}
                            {meal.notes && (
                              <div className="text-[11px] text-gray-500 mt-2 bg-gray-50/50 px-2 py-1.5 rounded-xl border border-gray-100/60 font-medium">
                                <span className="font-bold text-gray-600">Note: </span>{meal.notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2 font-medium">No meal plan specified for this slot.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {activePlan.notes && (
                <div className="border border-brand-100 bg-brand-50/40 rounded-2xl p-5 flex items-start gap-4 mt-6">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center shrink-0 text-brand-600">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-900 text-sm mb-1">Nutritionist's Notes</h4>
                    <p className="text-xs text-brand-700 font-medium leading-relaxed">
                      {activePlan.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
