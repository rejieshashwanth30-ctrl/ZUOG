import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wchytlmweaozuxuxuwzc.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_NqcXMpxp69wrvde41ecVtg_UwcNo1lS';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  );
