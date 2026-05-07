import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();

function calculate(food, grams) {
  const factor = Number(grams) / 100;
  return {
    protein: food.protein_per_100g * factor,
    fat: food.fat_per_100g * factor,
    carbs: food.carbs_per_100g * factor,
    sodium: food.sodium_per_100g * factor,
    calories: food.calories_per_100g * factor,
    water: food.water_per_100g * factor,
  };
}

router.get('/', async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('food_intakes').select('*, foods(name)').eq('user_id', req.user.id).order('date', { ascending: false });
    if (req.query.date) query = query.eq('date', req.query.date);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const grams = Number(req.body.consumed_grams || 0);
    const { data: food, error: foodError } = await supabaseAdmin
      .from('foods').select('*').eq('id', req.body.food_id).eq('user_id', req.user.id).single();
    if (foodError) throw foodError;
    const totals = calculate(food, grams);
    const payload = {
      user_id: req.user.id,
      food_id: food.id,
      date: req.body.date,
      consumed_grams: grams,
      calculated_protein: totals.protein,
      calculated_fat: totals.fat,
      calculated_carbs: totals.carbs,
      calculated_sodium: totals.sodium,
      calculated_calories: totals.calories,
      calculated_water: totals.water,
    };
    const { data, error } = await supabaseAdmin.from('food_intakes').insert(payload).select('*, foods(name)').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('food_intakes').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
