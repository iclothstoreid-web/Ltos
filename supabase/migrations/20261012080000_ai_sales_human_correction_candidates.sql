alter table public.ai_sales_message_reviews
  drop constraint if exists ai_sales_message_reviews_verdict_check;

alter table public.ai_sales_message_reviews
  add constraint ai_sales_message_reviews_verdict_check
  check (verdict = any (array['candidate'::text, 'good'::text, 'needs_fix'::text]));

comment on column public.ai_sales_message_reviews.verdict is
  'candidate = auto-captured human takeover reply awaiting owner review; good/needs_fix = owner-reviewed training feedback.';
