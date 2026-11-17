# OrganicBazar – Next.js + Supabase store

1. (Already ran the first schema? Also run `supabase/migration_bangla.sql` to add Bangla product fields.)
2. Create a free project at supabase.com → SQL Editor → paste & run `supabase/schema.sql`.
2. Authentication → Users → Add user (owner email + password). Then run in SQL Editor:
   `insert into admins (user_id, email) select id, email from auth.users where email = 'owner@example.com';`
   Repeat for each assistant.
3. `cp .env.example .env.local` and fill in Project URL + anon key (Project Settings → API).
4. `npm install && npm run dev` → http://localhost:3000 (admin at /admin/login).
5. Deploy: push to GitHub → import on vercel.com → add the same 3 env vars → Deploy.


Language: Bangla is the default (toggle in header/admin). To default to English, set DEFAULT_LANG = 'en' in lib/i18n.js.
