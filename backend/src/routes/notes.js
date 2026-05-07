import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('personal_notes').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('personal_notes').insert({ user_id: req.user.id, title: req.body.title, note: req.body.note }).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('personal_notes').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
