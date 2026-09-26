-- Run after setting the SAME random CRON_SECRET in Vercel Production and
-- Supabase Vault as ltos_followup_cron_secret. Store the public endpoint URL
-- in Vault as ltos_followup_url. Neither value belongs in Git.
-- Example Vault setup in Supabase Dashboard SQL editor (use your own secret):
-- select vault.create_secret('https://localtailor.id/api/cron/ai-sales-follow-up', 'ltos_followup_url');
-- select vault.create_secret('<same value as Vercel CRON_SECRET>', 'ltos_followup_cron_secret');

do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'ltos_followup_url') or
     not exists (select 1 from vault.decrypted_secrets where name = 'ltos_followup_cron_secret') then
    raise exception 'Configure follow-up URL and cron secret in Vault first';
  end if;
end $$;

select cron.schedule(
  'ltos-ai-sales-follow-up',
  '*/15 * * * *',
  $$
    select net.http_get(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'ltos_followup_url'),
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'ltos_followup_cron_secret')
      ),
      timeout_milliseconds := 10000
    );
  $$
);
