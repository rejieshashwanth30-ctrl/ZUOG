import { supabase } from '@/lib/supabase/client';

/**
 * Production Centralized Authenticated Fetch Client
 *
 * Ensures all requests to /api/* carry both:
 * 1. An Authorization: Bearer <access_token> header (deterministic, immediate)
 * 2. credentials: 'include' for @supabase/ssr cookie transmission
 *
 * Prevents mobile browser cookie delays, cross-origin/SameSite cookie drops,
 * and timing race conditions immediately after signup and login.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});

  if (typeof window !== 'undefined') {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
      }
    } catch (err) {
      console.warn('[apiFetch] Could not retrieve client auth session:', err);
    }
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials || 'include',
  });
}
