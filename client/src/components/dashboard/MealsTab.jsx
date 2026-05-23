import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Utensils, Plus, X, Trash2 } from 'lucide-react';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

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
    <div className="card border-brand-200 bg-brand-50/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Create Meal Plan</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Week & Macros */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <div>
            <label className="label">Week #</label>
            <input className="input" type="number" min="1" value={form.weekNumber} onChange={e => setForm({ ...form, weekNumber: e.target.value })} required />
          </div>
          <div>
            <label className="label">Calories</label>
            <input className="input" type="number" placeholder="2000" value={form.dailyCalories} onChange={e => setForm({ ...form, dailyCalories: e.target.value })} />
          </div>
          <div>
            <label className="label">Protein (g)</label>
            <input className="input" type="number" placeholder="150" value={form.proteinG} onChange={e => setForm({ ...form, proteinG: e.target.value })} />
          </div>
          <div>
            <label className="label">Carbs (g)</label>
            <input className="input" type="number" placeholder="200" value={form.carbsG} onChange={e => setForm({ ...form, carbsG: e.target.value })} />
          </div>
          <div>
            <label className="label">Fats (g)</label>
            <input className="input" type="number" placeholder="65" value={form.fatsG} onChange={e => setForm({ ...form, fatsG: e.target.value })} />
          </div>
          <div>
            <label className="label">Fiber (g)</label>
            <input className="input" type="number" placeholder="30" value={form.fiberG} onChange={e => setForm({ ...form, fiberG: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Allergy Flags (comma-separated)</label>
          <input className="input" placeholder="e.g. gluten, dairy, nuts" value={form.allergyFlags} onChange={e => setForm({ ...form, allergyFlags: e.target.value })} />
        </div>

        {/* Meals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-gray-700">Meals</h4>
            <button type="button" onClick={addMeal} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
              <Plus size={14} /> Add Meal
            </button>
          </div>

          {form.meals.map((meal, mealIdx) => (
            <div key={mealIdx} className="border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <select className="input w-auto py-1 text-sm" value={meal.dayOfWeek}
                  onChange={e => updateMeal(mealIdx, 'dayOfWeek', e.target.value)}>
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
                <select className="input w-auto py-1 text-sm capitalize" value={meal.mealType}
                  onChange={e => updateMeal(mealIdx, 'mealType', e.target.value)}>
                  {MEAL_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
                <input className="input py-1 text-sm flex-1" placeholder="Meal notes (optional)"
                  value={meal.notes} onChange={e => updateMeal(mealIdx, 'notes', e.target.value)} />
                <button type="button" onClick={() => removeMeal(mealIdx)} className="text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="px-4 py-3 space-y-2">
                {meal.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center gap-2">
                    <input className="input py-1 text-sm flex-[2]" placeholder="Food item name"
                      value={item.name} onChange={e => updateItem(mealIdx, itemIdx, 'name', e.target.value)} required />
                    <input className="input py-1 text-sm flex-1" placeholder="Portion (e.g. 200g)"
                      value={item.portionSize} onChange={e => updateItem(mealIdx, itemIdx, 'portionSize', e.target.value)} />
                    <input className="input py-1 text-sm w-20" type="number" placeholder="kcal"
                      value={item.calories} onChange={e => updateItem(mealIdx, itemIdx, 'calories', e.target.value)} />
                    <button type="button" onClick={() => removeItem(mealIdx, itemIdx)}
                      className="text-red-400 hover:text-red-600 shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addItem(mealIdx)}
                  className="text-brand-600 hover:text-brand-700 text-xs font-medium flex items-center gap-1">
                  <Plus size={14} /> Add Item
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes for Client (optional)</label>
          <textarea className="input resize-none" rows={2} placeholder="Dietary guidance, hydration tips, supplements…"
            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={createPlan.isPending}>
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Meal Plans</h2>
        {isNutritionist && !showCreateForm && (
          <button className="btn-primary text-sm" onClick={() => setShowCreateForm(true)}>
            <Plus size={16} className="inline mr-1" /> New Plan
          </button>
        )}
      </div>

      {showCreateForm && isNutritionist && (
        <div className="mb-6">
          <CreateMealPlanForm engagementId={engagementId} nextWeek={nextWeek} onClose={() => setShowCreateForm(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Loading…</div>
      ) : plans.length === 0 && !showCreateForm ? (
        <div className="card text-center py-12">
          <Utensils size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No meal plan yet</h3>
          <p className="text-sm text-gray-500">{isNutritionist ? 'Click "New Plan" above to create the first meal plan for this client.' : "Your nutritionist hasn't assigned a meal plan yet."}</p>
        </div>
      ) : (
        <>
          {/* Week selector */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {plans.map(p => (
              <button key={p._id} onClick={() => setSelectedWeek(p.weekNumber)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${activePlan?.weekNumber === p.weekNumber ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-400'}`}>
                Week {p.weekNumber}
              </button>
            ))}
          </div>

          {activePlan && (
            <>
              {/* Macro summary */}
              <div className="card mb-4">
                <h3 className="font-semibold mb-3">Daily Targets — Week {activePlan.weekNumber}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-sm">
                  {[
                    { label: 'Calories', value: `${activePlan.dailyCalories} kcal` },
                    { label: 'Protein', value: `${activePlan.proteinG}g` },
                    { label: 'Carbs', value: `${activePlan.carbsG}g` },
                    { label: 'Fats', value: `${activePlan.fatsG}g` },
                    { label: 'Fiber', value: `${activePlan.fiberG}g` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-2">
                      <div className="font-bold text-gray-900">{value || '—'}</div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>
                {activePlan.allergyFlags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activePlan.allergyFlags.map(f => <span key={f} className="badge-red text-xs">{f}</span>)}
                  </div>
                )}
              </div>

              {/* Day selector */}
              <div className="flex gap-1 mb-4 overflow-x-auto">
                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                  <button key={day} onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0 ${selectedDay === day ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                    {day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                ))}
              </div>

              {/* Meals for selected day */}
              <div className="space-y-3">
                {MEAL_TYPES.map(mealType => {
                  const meal = dayMeals.find(m => m.mealType === mealType);
                  return (
                    <div key={mealType} className="card">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{mealType}</h4>
                        {meal && <span className="text-sm text-gray-500 font-medium">{meal.totalCalories} kcal</span>}
                      </div>
                      {meal ? (
                        <>
                          {meal.items?.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm text-gray-600 py-1 border-b border-gray-50 last:border-0">
                              <span>{item.name}</span>
                              <span className="text-gray-400">{item.portionSize} · {item.calories} kcal</span>
                            </div>
                          ))}
                          {meal.notes && <div className="text-xs text-gray-400 mt-2 italic">{meal.notes}</div>}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Not specified</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {activePlan.notes && <div className="mt-4 p-3 bg-orange-50 rounded-lg text-sm text-orange-700"><span className="font-medium">Nutritionist notes: </span>{activePlan.notes}</div>}
            </>
          )}
        </>
      )}
    </div>
  );
}
