/* ============================================================
   大梅沙垃圾图鉴 · Supabase Client

   配置步骤：
   1. 前往 https://supabase.com 创建免费项目
   2. 进入 Project Settings → API
   3. 将 Project URL 填入 SUPABASE_URL
   4. 将 anon/public key 填入 SUPABASE_ANON_KEY
   5. 在 Table Editor 创建 trash_items 表（见 README）
   6. 在 Storage 创建 trash-photos bucket（设为 public）
   ============================================================ */

const SUPABASE_URL      = 'YOUR_SUPABASE_URL';      // ← 替换这里
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ← 替换这里

/* Initialize client only if credentials look real */
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
