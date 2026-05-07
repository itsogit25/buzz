import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();

async function dailySummary(userId, date) {
  const [intakesRes, workoutsRes, weightRes, photosRes] = await Promise.all([
    supabaseAdmin.from('food_intakes').select('*').eq('user_id', userId).eq('date', date),
    supabaseAdmin.from('workout_entries').select('calories_burned, workout_sessions!inner(date)').eq('user_id', userId).eq('workout_sessions.date', date),
    supabaseAdmin.from('body_weight_logs').select('*').eq('user_id', userId).eq('date', date).maybeSingle(),
    supabaseAdmin.from('body_photos').select('*').eq('user_id', userId).eq('date', date),
  ]);

  if (intakesRes.error) throw intakesRes.error;
  if (workoutsRes.error) throw workoutsRes.error;
  if (weightRes.error) throw weightRes.error;
  if (photosRes.error) throw photosRes.error;

  const nutrition = intakesRes.data.reduce((acc, row) => {
    acc.protein += Number(row.calculated_protein || 0);
    acc.fat += Number(row.calculated_fat || 0);
    acc.carbs += Number(row.calculated_carbs || 0);
    acc.sodium += Number(row.calculated_sodium || 0);
    acc.calories += Number(row.calculated_calories || 0);
    acc.water += Number(row.calculated_water || 0);
    return acc;
  }, { protein: 0, fat: 0, carbs: 0, sodium: 0, calories: 0, water: 0 });

  const caloriesBurned = workoutsRes.data.reduce((sum, row) => sum + Number(row.calories_burned || 0), 0);

  return {
    date,
    nutrition,
    calories_burned: caloriesBurned,
    net_calories: nutrition.calories - caloriesBurned,
    body_weight: weightRes.data?.body_weight ?? null,
    photos: photosRes.data,
  };
}

router.get('/daily', async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const summary = await dailySummary(req.user.id, date);
    res.json(summary);
  } catch (error) { next(error); }
});

router.put('/weight', async (req, res, next) => {
  try {
    const payload = { user_id: req.user.id, date: req.body.date, body_weight: Number(req.body.body_weight) };
    const { data, error } = await supabaseAdmin.from('body_weight_logs').upsert(payload, { onConflict: 'user_id,date' }).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.get('/graphs', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 30);
    const { data: weights, error: weightError } = await supabaseAdmin.from('body_weight_logs').select('*').eq('user_id', req.user.id).order('date', { ascending: false }).limit(limit);
    if (weightError) throw weightError;

    const { data: intakes, error: intakeError } = await supabaseAdmin.from('food_intakes').select('date, calculated_calories').eq('user_id', req.user.id);
    if (intakeError) throw intakeError;

    const { data: entries, error: entryError } = await supabaseAdmin.from('workout_entries').select('calories_burned, workout_sessions!inner(date)').eq('user_id', req.user.id);
    if (entryError) throw entryError;

    const caloriesByDate = {};
    intakes.forEach((row) => { caloriesByDate[row.date] = (caloriesByDate[row.date] || 0) + Number(row.calculated_calories || 0); });

    const burnedByDate = {};
    entries.forEach((row) => {
      const date = row.workout_sessions?.date;
      if (date) burnedByDate[date] = (burnedByDate[date] || 0) + Number(row.calories_burned || 0);
    });

    res.json({
      weights: weights.reverse(),
      calorie_intake: Object.entries(caloriesByDate).map(([date, calories]) => ({ date, calories })).sort((a, b) => a.date.localeCompare(b.date)),
      calorie_expense: Object.entries(burnedByDate).map(([date, calories]) => ({ date, calories })).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (error) { next(error); }
});

export default router;
