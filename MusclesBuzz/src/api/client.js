import { API_BASE_URL } from '@env';
import { supabase } from './supabase';

async function getValidToken() {
  // Refresh the session to ensure we have a valid token
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    throw new Error('Session expired. Please log in again.');
  }
  return data.session.access_token;
}

export async function api(path, options = {}) {
  let accessToken;
  try {
    accessToken = await getValidToken();
  } catch (error) {
    // If token refresh fails, sign out and throw
    await supabase.auth.signOut();
    throw error;
  }

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (res.status === 204) return null;
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(json?.error || 'API request failed');
  return json;
}
