import { createClient } from '@supabase/supabase-js';

// Ortam değişkenlerinden Supabase URL ve Anon Key'i çekiyoruz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Tekil (Singleton) Supabase istemcimizi oluşturup dışa aktarıyoruz
export const supabase = createClient(supabaseUrl, supabaseAnonKey);