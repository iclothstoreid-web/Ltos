# LTOS v1.0 — Local Tailor Operating System

> **"Jangan menambah modul baru sebelum satu order nyata berhasil mengalir end-to-end melalui LTOS."**

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Deploy:** Vercel

## Supabase
- Project: `ltos-v1`
- Project ID: `vdgkbzpdgmlzyxaiznka`
- Region: `ap-southeast-1`
- URL: `https://vdgkbzpdgmlzyxaiznka.supabase.co`

## Setup Lokal

```bash
# 1. Install dependencies
npm install

# 2. Env sudah ada di .env.local

# 3. Run dev server
npm run dev

# Buka http://localhost:3000
```

## Deploy ke Vercel

```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "LTOS v1.0 — initial build"
git remote add origin https://github.com/iclothstoreid-web/ltos.git
git branch -M main
git push -u origin main

# 2. Connect repo di vercel.com
# 3. Add environment variables:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
# 4. Deploy
```

## Setup Users di Supabase

1. Buka Supabase Dashboard → Authentication → Users
2. Add user: `reni@localtailor.id` (Admin)
3. Add user: `teja@localtailor.id` (Artisan)
4. Add user: `owner@localtailor.id` (Owner)
5. Setelah user dibuat, insert ke profiles table:

```sql
INSERT INTO profiles (id, name, role) VALUES
  ('<reni-uuid>', 'Reni', 'admin'),
  ('<teja-uuid>', 'Teja', 'artisan'),
  ('<owner-uuid>', 'Owner', 'owner');
```

## App Structure

```
/ → redirect ke login atau command-center

/login                              Login
/command-center                     Priority inbox (Admin/Owner)
/workspace/measurement/[orderId]    Measurement workspace
/workspace/qc/[orderId]             QC workspace
/portal/[orderId]                   Customer QR portal (no login)
```

## Core Loop

```
COMMAND CENTER
  ↓ (select task)
WORKSPACE
  ↓ (make decision)
BUSINESS EVENT (logged)
  ↓
WORKFLOW TRANSITION
  ↓
NEXT TASK GENERATED
  ↓
COMMAND CENTER (refreshed)
```

## V1.0 Success Metric

✅ Satu order nyata mengalir dari Lead sampai Delivery tanpa keluar dari LTOS
✅ Reni bisa kerja tanpa Excel
✅ Teja tidak perlu tanya "habis ini apa?"
✅ Owner bisa lihat bottleneck dari Command Center
