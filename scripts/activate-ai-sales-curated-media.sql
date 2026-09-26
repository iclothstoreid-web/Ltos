-- Apply only after the contextual one-image runtime is live in production.
-- Review the returned rows and counts; this script is safe to re-run.
begin;

do $$
begin
  if (select count(*) from public.ai_sales_media_assets where source_folder = 'Kirim pertama') <> 7 then
    raise exception 'Starter folder count changed; review manifest before activation';
  end if;
end $$;

update public.ai_sales_media_assets
set is_active = true,
    is_starter = true,
    starter_rank = case asset_key
      when 'model_detail.collar_zigzag_white.001' then 1
      when 'model_detail.awal_2.001' then 2
      when 'model_detail.awal.001' then 3
      when 'model_detail.navy_c5.006' then 4
      when 'model_detail.brown_c4.003' then 5
      when 'model_detail.hijau_c2.003' then 6
      when 'model_detail.hijau_c3.004' then 7
    end,
    caption = case asset_key
      when 'model_detail.collar_zigzag_white.001' then 'Ini salah satu detail jahitan thobe custom kami, Kang. Kerah dan aksennya nanti tetap bisa disesuaikan dengan selera Kang.'
      when 'model_detail.awal_2.001' then 'Saya kirim satu contoh detail thobe custom kami, Kang, supaya potongan dan jahitannya terlihat dari dekat.'
      when 'model_detail.awal.001' then 'Ini contoh detail potongan dan jahitan kami dari dekat, Kang. Model akhirnya nanti kita sesuaikan dengan pilihan Kang.'
      else 'Ini salah satu contoh detail jahitan thobe custom kami, Kang. Warna dan model akhirnya mengikuti pilihan Kang.'
    end,
    color_name = case asset_key
      when 'model_detail.collar_zigzag_white.001' then 'white'
      when 'model_detail.navy_c5.006' then 'navy'
      when 'model_detail.brown_c4.003' then 'coklat'
      else color_name
    end,
    updated_at = now()
where source_folder = 'Kirim pertama';

update public.ai_sales_media_assets
set is_active = true,
    is_starter = false,
    caption = case asset_key
      when 'fabric.basic_twill_stretch.001' then 'Ini contoh thobe jadi dengan Basic Twill Stretch, Kang. Model dan ukuran pesanan Kang tetap dibuat custom.'
      else caption
    end,
    updated_at = now()
where asset_key in (
  'fabric.basic_twill_stretch.001',
  'fabric.premium_wool_blend_cashmere_italy.001',
  'color_reference.charcoal.001',
  'color_reference.coklat.001',
  'color_reference.green.001',
  'color_reference.hitam.001',
  'color_reference.maroon.001',
  'color_reference.navy.001',
  'model.emirates_dubai.001',
  'model.emirates_dubai.002',
  'model.emirates_dubai.003',
  'model.qatary.001',
  'model.saudi_coklat_bata.001',
  'model.saudi_white.001',
  'model.saudi.001',
  'model.saudi.002',
  'collar.haybah.001'
);

do $$
begin
  if (select count(*) from public.ai_sales_media_assets where is_active) <> 24 or
     (select count(*) from public.ai_sales_media_assets where is_active and is_starter) <> 7 then
    raise exception 'Activation counts differ from 24 active / 7 starters; rolled back';
  end if;
end $$;

commit;
