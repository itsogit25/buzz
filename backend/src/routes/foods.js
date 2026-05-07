import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('foods')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      user_id: req.user.id,
      name: req.body.name,
      protein_per_100g: Number(req.body.protein_per_100g || 0),
      fat_per_100g: Number(req.body.fat_per_100g || 0),
      carbs_per_100g: Number(req.body.carbs_per_100g || 0),
      sodium_per_100g: Number(req.body.sodium_per_100g || 0),
      calories_per_100g: Number(req.body.calories_per_100g || 0),
      water_per_100g: Number(req.body.water_per_100g || 0),
    };
    const { data, error } = await supabaseAdmin.from('foods').insert(payload).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      protein_per_100g: Number(req.body.protein_per_100g || 0),
      fat_per_100g: Number(req.body.fat_per_100g || 0),
      carbs_per_100g: Number(req.body.carbs_per_100g || 0),
      sodium_per_100g: Number(req.body.sodium_per_100g || 0),
      calories_per_100g: Number(req.body.calories_per_100g || 0),
      water_per_100g: Number(req.body.water_per_100g || 0),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabaseAdmin
      .from('foods').update(payload).eq('id', req.params.id).eq('user_id', req.user.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('foods').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
