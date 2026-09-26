-- Installs the Local Tailor AI Sales follow-up scheduler.
-- Secrets are generated/stored inside Supabase Vault and never committed to Git.
-- The LTOS endpoint validates the bearer token against Vault through a
-- service-role-only RPC, so no Vercel CRON_SECRET is required.

do $$
declare
  existing_url uuid;
  existing_secret uuid;
begin
  select id into existing_url
  from vault.decrypted_secrets
  where name = 'ltos_followup_url'
  limit 1;

  if existing_url is null then
    perform vault.create_secret(
      'https://localtailor.id/api/cron/ai-sales-follow-up',
      'ltos_followup_url',
      'Local Tailor AI Sales follow-up endpoint'
    );
  end if;

  select id into existing_secret
  from vault.decrypted_secrets
  where name = 'ltos_followup_cron_secret'
  limit 1;

  if existing_secret is null then
    perform vault.create_secret(
      encode(gen_random_bytes(32), 'hex'),
      'ltos_followup_cron_secret',
      'Local Tailor AI Sales follow-up bearer secret'
    );
  end if;
end $$;

do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'ltos-ai-sales-follow-up'
  limit 1;

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
end $$;

select cron.schedule(
  'ltos-ai-sales-follow-up',
  '*/5 * * * *',
  $cron$
    select net.http_get(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'ltos_followup_url'),
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' ||
          (select decrypted_secret from vault.decrypted_secrets where name = 'ltos_followup_cron_secret')
      ),
      timeout_milliseconds := 10000
    );
  $cron$
);
