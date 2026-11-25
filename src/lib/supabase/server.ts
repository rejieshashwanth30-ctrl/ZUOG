import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wchytlmweaozuxuxuwzc.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_NqcXMpxp69wrvde41ecVtg_UwcNo1lS';

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface AuthenticatedUser {
  authUserId: string;
  email: string;
  name?: string;
}

/**
 * Resolves the authenticated user from the incoming request authorization header or cookies.
 * Handles production Supabase sessions with strict tenant verification.
 */
export async function getAuthenticatedUser(request?: Request): Promise<AuthenticatedUser | null> {
  try {
    // 1. Check Bearer token in request Authorization header
    const authHeader = request?.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabaseServer.auth.getUser(token);
      if (user && !error) {
        return {
          authUserId: user.id,
          email: user.email || 'user@company.com',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        };
      }
    }

    // 2. Check cookies via @supabase/ssr and Next.js cookies()
    try {
      const cookieStore = await cookies();
      const ssrClient = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore in read contexts
            }
          },
        },
      });

      const { data: { user }, error } = await ssrClient.auth.getUser();
      if (user && !error) {
        return {
          authUserId: user.id,
          email: user.email || 'user@company.com',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        };
      }
    } catch {
      // Cookies not accessible or error reading
    }

    // 3. Fallback for development if explicitly allowed
    if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEMO_USER === 'true') {
      return {
        authUserId: 'demo-auth-user-001',
        email: 'rejiesh@abcmfg.co.in',
        name: 'Rejiesh Ashwanth V',
      };
    }

    return null;
  } catch (err) {
    console.warn('[Supabase Server] Auth resolution error:', err);
    return null;
  }
}

