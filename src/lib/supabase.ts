import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hruizfateygzldvniuyq.supabase.co';
const supabaseKey = 'sb_publishable_-DhsFClaS6Y1uIveQ7A41Q_Y_3khyUC';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const isSupabaseConfigured = true;
