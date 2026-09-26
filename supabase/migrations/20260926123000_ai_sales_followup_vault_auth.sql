-- Allow the LTOS cron endpoint to validate a bearer token against a secret
-- stored only in Supabase Vault. No secret value is committed to Git.
create or replace function public.ai_sales_verify_followup_cron_secret(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = public, vault
as $$
  select
    p_secret is not null
    and length(p_secret) >= 32
    and exists (
      select 1
      from vault.decrypted_secrets
      where name = 'ltos_followup_cron_secret'
        and decrypted_secret = p_secret
    );
$$;

revoke all on function public.ai_sales_verify_followup_cron_secret(text)
  from public, anon, authenticated;
grant execute on function public.ai_sales_verify_followup_cron_secret(text)
  to service_role;
