# Agent Room — setup (mobile se)

1. Supabase: naya project -> SQL Editor -> `supabase/schema.sql` paste karke Run.
2. GitHub pe naya repo banao, ye saari files upload karo.
3. Vercel -> Add New Project -> repo import karo.
4. Vercel -> Settings -> Environment Variables me `.env.example` ki saari values bharo
   (SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENROUTER_API_KEY, WP_URL, WP_USER, WP_APP_PASSWORD, ADMIN_KEY, CRON_SECRET; leads ke liye GOOGLE_PLACES_KEY).
5. Deploy -> site kholo -> ADMIN_KEY daalo -> "Run now".

WordPress: Users -> Profile -> Application Passwords se password banao.
Pehle "draft" mode me check karo, phir Settings se auto-publish ON karo.
Vercel free plan me cron din me 1 baar chalta hai (3:30 UTC). Zyada baar ke liye "Run now" ya Pro plan.
