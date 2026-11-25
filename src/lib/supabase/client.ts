import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wchytlmweaozuxuxuwzc.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_NqcXMpxp69wrvde41ecVtg_UwcNo1lS';

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  !supabaseUrl.includes('placeholder') &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  !supabaseAnonKey.includes('placeholder');

/**
 * Client-side Supabase instance using @supabase/ssr createBrowserClient.
 * Automatically synchronizes authentication session to browser cookies.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

