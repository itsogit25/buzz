import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'body-photos';

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || null);
  } catch (error) { next(error); }
});

router.post('/picture', upload.single('profile'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'profile file is required' });

    const extension = req.file.originalname?.split('.').pop() || 'jpg';
    const path = `${req.user.id}/profile/picture-${uuidv4()}.${extension}`;

    // Delete old profile picture if it exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('profile_picture_path')
      .eq('id', req.user.id)
      .single();
    
    if (profile?.profile_picture_path) {
      await supabaseAdmin.storage.from(bucket).remove([profile.profile_picture_path]);
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ profile_picture_url: publicData.publicUrl, profile_picture_path: path })
      .eq('id', req.user.id)
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.put('/', async (req, res, next) => {
  try {
    const payload = {
      id: req.user.id,
      name: req.body.name ?? null,
      profile_picture_url: req.body.profile_picture_url ?? null,
      country: req.body.country ?? null,
      age: req.body.age ?? null,
      language: req.body.language ?? 'en',
      theme: req.body.theme ?? 'light',
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload)
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

export default router;
