import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'body-photos';

router.get('/', async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('body_photos').select('*').eq('user_id', req.user.id).order('date', { ascending: false });
    if (req.query.date) query = query.eq('date', req.query.date);
    if (req.query.tag) query = query.eq('tag', req.query.tag);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.post('/', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'photo file is required' });
    const tag = req.body.tag;
    const date = req.body.date;
    if (!tag || !date) return res.status(400).json({ error: 'date and tag are required' });

    const extension = req.file.originalname?.split('.').pop() || 'jpg';
    const path = `${req.user.id}/${date}/${tag}-${uuidv4()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    const { data, error } = await supabaseAdmin
      .from('body_photos')
      .insert({ user_id: req.user.id, date, tag, image_path: path, image_url: publicData.publicUrl })
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { next(error); }
});

export default router;
