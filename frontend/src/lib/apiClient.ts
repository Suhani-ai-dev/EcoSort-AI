import axios from 'axios';
import { supabase } from './supabaseClient';

// Get or generate a persistent user ID for local & guest sessions
export function getPersistentUserId(): string {
  let uid = localStorage.getItem('ecosort_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('ecosort_user_id', uid);
  }
  return uid;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 30000,
});

// Attach session token or persistent guest ID
apiClient.interceptors.request.use(async (config) => {
  const persistentId = getPersistentUserId();
  config.headers['X-User-Id'] = persistentId;

  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      config.headers.Authorization = `Bearer ${data.session.access_token}`;
    }
  } catch {
    // Graceful fallback to guest header without auth blocking
  }

  return config;
});

export default apiClient;
