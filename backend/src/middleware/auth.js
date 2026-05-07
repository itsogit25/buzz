import { supabaseAuth } from '../lib/supabase.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }

    const { data, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !data?.user) {
      // Return 401 for invalid/expired tokens so client knows to re-authenticate
      console.error('[Auth Error]', error?.message || 'Token validation failed');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
