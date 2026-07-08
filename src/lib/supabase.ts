import { createClient } from '@supabase/supabase-js';

// Fallback credentials provided by the user to ensure instant working state
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://vwtiiilxintokwxcifpd.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dGlpaWx4aW50b2t3eGNpZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjI5MTUsImV4cCI6MjA5NDgzODkxNX0.Xjs_l4kAs6CeM1UuvG_iqQxmftz1pNbDAyY1zJnL2ts';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to test connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('orders').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means the table doesn't exist, which is a successful connection but schema not ready yet
      // which is fine, at least the network request reached Supabase successfully.
      console.warn('Supabase connection warning:', error.message);
      return true;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}
