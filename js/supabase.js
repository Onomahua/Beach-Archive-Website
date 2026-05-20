const SUPABASE_URL      = 'https://lvjbxhjmsfvljldbigzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2amJ4aGptc2Z2bGpsZGJpZ3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjc4NDEsImV4cCI6MjA5NDg0Mzg0MX0.Lirto0HikhKa_pnQkcvJp0rMjAxccWNuY5X4Dk3sKaE';

if (
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
  typeof supabase !== 'undefined'
) {
  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.info('[大梅沙图鉴] Supabase connected ✓');
} else {
  window.supabaseClient = null;
  console.info('[大梅沙图鉴] Supabase not configured — running in offline mode');
}
