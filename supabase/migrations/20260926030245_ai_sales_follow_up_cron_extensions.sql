-- Supabase Cron triggers the authenticated LTOS endpoint without relying on
-- Vercel Hobby cron frequency. The actual schedule is installed separately,
-- after Vercel/Vault share a secret, while runtime stays disabled by default.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
