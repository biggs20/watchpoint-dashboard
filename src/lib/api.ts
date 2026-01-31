import { supabase } from './supabaseClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('AUTH_REQUIRED');
  }
  return session.access_token;
}

async function request<T>(method: string, path: string, data?: unknown): Promise<T> {
  const token = await getToken();
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${path}`, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, data?: unknown) => request<T>('POST', path, data),
  put: <T>(path: string, data?: unknown) => request<T>('PUT', path, data),
  del: <T>(path: string) => request<T>('DELETE', path),
};
