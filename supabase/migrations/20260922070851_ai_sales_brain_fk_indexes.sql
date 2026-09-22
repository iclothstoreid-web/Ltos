create index if not exists ai_sales_business_facts_updated_by_idx
  on public.ai_sales_business_facts(updated_by);

create index if not exists ai_sales_brain_entries_created_by_idx
  on public.ai_sales_brain_entries(created_by);

create index if not exists ai_sales_training_examples_created_by_idx
  on public.ai_sales_training_examples(created_by);

create index if not exists ai_sales_message_reviews_reviewed_by_idx
  on public.ai_sales_message_reviews(reviewed_by);
