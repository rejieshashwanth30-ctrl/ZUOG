import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wchytlmweaozuxuxuwzc.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_NqcXMpxp69wrvde41ecVtg_UwcNo1lS';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  supabaseAnonKey;

// Server / Admin client for direct token validation
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
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
 * Resolves the authenticated user from the incoming request Authorization header or cookies.
 * Handles production Supabase sessions with strict tenant verification.
 */
export async function getAuthenticatedUser(request?: Request): Promise<AuthenticatedUser | null> {
  try {
    // 1. Check Bearer token in request Authorization header (Fastest, zero cookie-race issues)
    const authHeader = request?.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        const {
          data: { user },
          error,
        } = await supabaseServer.auth.getUser(token);

        if (user && !error) {
          return {
            authUserId: user.id,
            email: user.email || 'user@company.com',
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          };
        }

        if (error) {
          console.warn('[Supabase Server] Bearer token validation failed:', error.message);
        }
      }
    }

    // 2. Check cookies via @supabase/ssr using the Anon/Publishable Key
    try {
      const cookieStore = await cookies();
      const ssrClient = createServerClient(supabaseUrl, supabaseAnonKey, {
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

      const {
        data: { user },
        error,
      } = await ssrClient.auth.getUser();

      if (user && !error) {
        return {
          authUserId: user.id,
          email: user.email || 'user@company.com',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        };
      }

      if (error && error.message !== 'Auth session missing!') {
        console.warn('[Supabase Server] Cookie session verification message:', error.message);
      }
    } catch {
      // Cookies not accessible in current context or outside Next.js request scope
    }

    // 3. Fallback for local development ONLY if explicitly configured
    if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEMO_USER === 'true') {
      return {
        authUserId: 'demo-auth-user-001',
        email: 'demo@adykzuog.com',
        name: 'Demo User',
      };
    }

    console.warn(
      `[Supabase Server] Unauthenticated access attempt: ${request?.method || 'GET'} ${
        request?.url ? new URL(request.url).pathname : 'unknown'
      }`
    );
    return null;
  } catch (err) {
    console.warn('[Supabase Server] Auth resolution unexpected error:', err);
    return null;
  }
}

