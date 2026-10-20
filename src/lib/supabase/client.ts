import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gybbjalhfvwditihhlcf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_A-oRevkWcO_CNbqVI50X4g_h9DN9jVb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
