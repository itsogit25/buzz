import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('exercises').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
    if (req.query.tag) query = query.eq('body_part_tag', req.query.tag);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      user_id: req.user.id,
      name: req.body.name,
      image_url: req.body.image_url ?? null,
      notes: req.body.notes ?? null,
      body_part_tag: req.body.body_part_tag,
      manual_pr_weight: Number(req.body.manual_pr_weight || 0),
      manual_pr_reps: Number(req.body.manual_pr_reps || 0),
    };
    const { data, error } = await supabaseAdmin.from('exercises').insert(payload).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      image_url: req.body.image_url ?? null,
      notes: req.body.notes ?? null,
      body_part_tag: req.body.body_part_tag,
      manual_pr_weight: Number(req.body.manual_pr_weight || 0),
      manual_pr_reps: Number(req.body.manual_pr_reps || 0),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabaseAdmin
      .from('exercises').update(payload).eq('id', req.params.id).eq('user_id', req.user.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('exercises').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
