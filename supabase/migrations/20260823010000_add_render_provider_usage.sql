-- Sprint O.1 finalization — Cost Observability (Sprint O foundation).
--
-- render_history.estimated_cost_usd/actual_cost_usd have existed since the
-- base Sprint O migration but nothing has ever computed them (documented
-- there as "ready for a future sprint once a provider exposes real
-- per-request cost/usage data" — deliberately deferred, not a bug).
--
-- gpt-image-1 DOES expose real token usage per request
-- (OpenAI.Images.ImagesResponse.usage). Rather than hardcode a per-token
-- dollar rate here (rates change; an embedded wrong rate would silently
-- mislead financial reporting), this column stores the real usage object
-- exactly as OpenAI returns it, so a future sprint can price it accurately
-- against whatever OpenAI's rates are AT THAT TIME — see
-- src/lib/ai/services/image.ts's ProviderUsage type.

alter table public.render_history
  add column if not exists provider_usage jsonb;
