import { createClient } from '@supabase/supabase-js';

/* .trim(): GitHub Secrets 복붙 시 trailing newline 제거 */
export const supabase = createClient(
  (import.meta.env.VITE_SUPABASE_URL ?? '').trim(),
  (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()
);
