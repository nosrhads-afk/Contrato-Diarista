import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://creyfrztmetnnqhxaalw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZXlmcnp0bWV0bm5xaHhhYWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1ODczODksImV4cCI6MjEwNTE2MzM4OX0.fwOkqyaDV4HhjqRVfnpl9VDagjB6YGJNbgcgKEOujrE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Anon Key não configuradas adequadamente nas variáveis de ambiente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
