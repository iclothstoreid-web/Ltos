# AI Sales WhatsApp Media — Folder & Ingestion Contract

This is the canonical mapping for images that the Local Tailor AI Sales agent may send to WhatsApp customers.

## Local folder structure

Use these exact top-level folders before upload:

- `01_Model/`
  - `Saudi/`
  - `Qatary/`
  - `Emirates Dubai/`
- `02_Model Detail/`
- `03_Fabrics/`
  - `Basic Twill Stretch/`
  - `Premium Wool Blend Cashmere Italy/`
- `04_Referensi Warna/`
- `05_Collar/`
- `06_Pocket/`
- `07_Cuff Link/`
- `08_Placket/`
- `09_Cutting/`
  - `Slim Fit/`
  - `Semi Slim Fit/`
  - `Regular Fit/`
- `10_Handmade Zig-Zag/`
- `11_Kabak/`

Do not mix unrelated assets in one folder.

## LTOS category mapping

| Local folder | ai_sales_media_assets.category | Use |
| --- | --- | --- |
| 01_Model | model | Main model visuals; Saudi / Qatary / Emirates Dubai |
| 02_Model Detail | model_detail | Close-ups and design detail |
| 03_Fabrics | fabric | Fabric visual and premium-material proof |
| 04_Referensi Warna | color_reference | Color references |
| 05_Collar | collar | Collar choices |
| 06_Pocket | pocket | Pocket choices |
| 07_Cuff Link | cufflink | Cuff / cuff-link related visuals |
| 08_Placket | placket | Placket choices |
| 09_Cutting | cutting | Slim / Semi Slim / Regular |
| 10_Handmade Zig-Zag | zigzag | Handmade zig-zag finishing |
| 11_Kabak | kabak | Kabak-specific visuals |

## Starter pack

The first broad lead reply may automatically send at most 3 images after the text reply:

1. one `model` asset,
2. one `fabric` asset — default recommendation should visually support Premium Wool Blend Cashmere Italy,
3. one `color_reference` asset.

Only selected assets must be marked `is_starter=true`.
Use `starter_rank` 1, 2, 3.

Do not mark every image as a starter.

## On-demand behavior

The AI may send up to 3 relevant images when the customer mentions or asks about:
- model / Saudi / Qatary / Emirates Dubai,
- fabric / bahan / wool / cashmere / twill,
- color,
- collar,
- pocket,
- cuff / cuff link,
- placket,
- cutting / slim / semi slim / regular,
- handmade zig-zag,
- kabak.

A specific request should prefer the most relevant image rather than a large catalog dump.

## Required metadata per image

Every uploaded image must create one row in `public.ai_sales_media_assets`:

- `asset_key`: unique stable id, e.g. `model.saudi.clean.white.01`
- `category`
- `title`
- `image_url`: public URL from Supabase bucket `ai-sales-media`
- `caption`: short WhatsApp-ready caption
- `tags`
- `trigger_terms`
- optional `model_family`
- optional `fabric_name`
- optional `color_name`
- optional `part_name`
- `priority`
- `is_starter`
- optional `starter_rank`
- `source_folder`

## Caption rules

Captions must sound like a human sales consultant, not a product database.

Premium fabric example:
`Ini Premium Wool Blend Cashmere Italy, Kang. Feel-nya lebih ringan, adem, jatuhnya elegan dan nyaman dipakai lama karena tidak gampang kusut.`

Model example:
`Ini salah satu arah Saudi yang clean, Kang. Nanti kerah, plaket, saku, manset dan cutting-nya tetap bisa kita custom satu-satu.`

Do not claim a property that has not been approved as a business fact.

## Upload destination

Supabase Storage bucket:
`ai-sales-media`

Recommended object path:
`<category>/<subgroup>/<filename>`

Examples:
- `model/saudi/saudi-clean-01.webp`
- `fabric/premium-wool-blend-cashmere-italy/texture-01.webp`
- `collar/hilal/hilal-01.webp`

## Sales principle

Images are proof and decision aids, not decoration.

The sequence is:
`value-rich reply -> relevant visual proof -> one easy next decision`

Never flood the customer with all available images.
