import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('workout_sessions')
      .select('*, workout_entries(*, exercises(name), workout_sets(*))')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });
    if (req.query.date) query = query.eq('date', req.query.date);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const date = req.body.date;
    const entries = Array.isArray(req.body.entries) ? req.body.entries : [];

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('workout_sessions')
      .insert({ user_id: req.user.id, date })
      .select('*')
      .single();
    if (sessionError) throw sessionError;

    for (const entry of entries) {
      const { data: workoutEntry, error: entryError } = await supabaseAdmin
        .from('workout_entries')
        .insert({
          user_id: req.user.id,
          session_id: session.id,
          exercise_id: entry.exercise_id,
          body_part_tag: entry.body_part_tag,
          calories_burned: Number(entry.calories_burned || 0),
          duration_minutes: entry.duration_minutes ? Number(entry.duration_minutes) : null,
          speed: entry.speed ? Number(entry.speed) : null,
          steps: entry.steps ? Number(entry.steps) : null,
        })
        .select('*')
        .single();
      if (entryError) throw entryError;

      const sets = Array.isArray(entry.sets) ? entry.sets : [];
      if (sets.length > 0) {
        const setRows = sets.map((set, index) => ({
          workout_entry_id: workoutEntry.id,
          set_number: index + 1,
          reps: set.reps ? Number(set.reps) : null,
          weight: set.weight ? Number(set.weight) : null,
        }));
        const { error: setError } = await supabaseAdmin.from('workout_sets').insert(setRows);
        if (setError) throw setError;
      }
    }

    res.status(201).json(session);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('workout_sessions').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
