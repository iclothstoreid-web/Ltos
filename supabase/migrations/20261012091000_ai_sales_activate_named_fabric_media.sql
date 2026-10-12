begin;

update public.ai_sales_media_assets
set is_active = true,
    is_starter = false,
    caption = '',
    priority = greatest(priority, 55),
    updated_at = now()
where is_active = false
  and category = 'fabric'
  and image_url ~* '^https://'
  and (
    fabric_name is not null
    or color_name is not null
  );

commit;
