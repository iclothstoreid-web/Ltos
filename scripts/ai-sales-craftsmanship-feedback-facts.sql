-- Stage for owner review; apply after PR rollout. Screenshots supplied 2026-09-26
-- show a customer praising neat stitching and fit, another praising the result,
-- and a customer planning a subsequent order. No identities or raw chats stored.
begin;

insert into public.ai_sales_business_facts
  (fact_key, category, label, value, notes, source_note, is_active)
values
  ('artisan_craftsmanship', 'service', 'Pengerjaan artisan Local Tailor',
   'Thobe custom Local Tailor dikerjakan oleh artisan yang fokus pada kerapian jahitan, detail, dan penyesuaian ukuran.',
   'Owner-confirmed. Jangan mengklaim sertifikasi, penghargaan, pengakuan eksternal, atau jaminan hasil sempurna. Hubungkan dengan foto detail jahitan yang benar-benar dikirim.',
   'Owner statement 2026-09-26', true),
  ('customer_feedback_workmanship', 'service', 'Feedback customer tentang hasil',
   'Ada customer yang menyampaikan jahitan thobe rapi, hasilnya bagus, dan pas di badan; customer lain menyatakan puas dan berencana memesan kembali.',
   'Ulasan individual, bukan jaminan semua customer atau semua order. Jangan menyebut identitas atau mengutip verbatim tanpa izin. Owner juga menyampaikan ada customer yang repeat order.',
   'Owner-supplied WhatsApp feedback screenshots 2026-09-26', true)
on conflict (fact_key) do update
set category = excluded.category,
    label = excluded.label,
    value = excluded.value,
    notes = excluded.notes,
    source_note = excluded.source_note,
    is_active = excluded.is_active,
    updated_at = now();

commit;
