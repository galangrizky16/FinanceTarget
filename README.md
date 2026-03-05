# Finance Target

Aplikasi pencatat keuangan harian berbasis target income, dibangun dengan Next.js 14 App Router + Supabase.

---

## Fitur

- **Beranda** — ringkasan harian: income, expense, net, dan progress target hari ini
- **Catatan** — daftar semua transaksi income & expense, filter per tipe, tambah transaksi baru
- **Target** — progress periode (income net vs target), detail hari yang sudah lewat
- **Harian** — target per hari dengan carry-minus: kekurangan hari sebelumnya otomatis dibawa ke hari berikutnya
- **Akun** — profil dan logout

Semua halaman menggunakan **Server-Side Rendering (SSR)** — data di-fetch di server sebelum HTML dikirim ke browser, tidak ada loading flash.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Styling | Inline styles + CSS-in-JS (tanpa library eksternal) |
| Font | DM Sans + DM Mono (Google Fonts) |
| Language | TypeScript |

---

## Struktur Proyek

```
app/
├── (app)/                  # Route group — halaman yang butuh auth
│   ├── layout.tsx          # Shell utama: header + bottom nav
│   ├── dashboard/
│   │   ├── page.tsx        # Server Component — fetch semua data
│   │   └── DashboardClient.tsx
│   ├── records/
│   │   ├── page.tsx
│   │   └── RecordsClient.tsx
│   ├── target/
│   │   ├── page.tsx
│   │   └── TargetClient.tsx
│   ├── daily-target/
│   │   ├── page.tsx
│   │   └── DailyTargetClient.tsx
│   ├── setup-target/
│   │   └── page.tsx
│   └── account/
│       └── page.tsx
├── (auth)/                 # Route group — login & register
│   ├── login/
│   └── register/
middleware.ts               # Auth guard + target check (Edge)
lib/
├── supabase/
│   ├── client.ts           # Browser client
│   └── server.ts           # Server client (SSR)
└── finance/
    ├── dailyTarget.ts      # Kalkulasi carry-minus, status hari
    └── queries.ts          # Helper fetch income + expense
```

---

## Cara Kerja Kalkulasi Harian

Setiap hari dibandingkan **net** (income − expense) terhadap **effective target** (target dasar + carry dari hari sebelumnya):

| Status | Kondisi | Efek |
|---|---|---|
| `over` | net > effectiveTarget | carry reset ke 0 |
| `success` | net = effectiveTarget | carry reset ke 0 |
| `minus` | net < effectiveTarget | selisih dibawa ke hari berikutnya |
| `pending` | hari belum tiba | carry tidak berubah |

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/username/finance-target.git
cd finance-target
npm install
```

### 2. Environment variables

Buat file `.env.local` di root proyek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Supabase — buat tabel

```sql
-- Tabel target
create table targets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  period_type text not null,           -- 'daily' | 'weekly' | 'monthly' | 'yearly'
  target_amount numeric not null,
  start_date  date not null,
  end_date    date not null,
  created_at  timestamptz default now()
);

-- Tabel transaksi
create table transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  type       text not null,            -- 'income' | 'expense'
  amount     numeric not null,
  category   text not null,
  note       text,
  date       date not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table targets      enable row level security;
alter table transactions enable row level security;

create policy "users can manage own targets"
  on targets for all using (auth.uid() = user_id);

create policy "users can manage own transactions"
  on transactions for all using (auth.uid() = user_id);
```

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## SSR Pattern

Setiap halaman mengikuti pola yang sama:

```
page.tsx (Server Component)
  └── fetch data di server (auth, target, transaksi)
  └── kalkulasi (net, percentage, carry, dll)
  └── <ClientComponent data={...} />

XxxClient.tsx (Client Component)
  └── terima data via props
  └── hanya handle interaktivitas (filter, modal, form)
  └── tidak ada useEffect untuk fetch data
```

Middleware di edge menangani auth guard dan target check sebelum halaman sempat render.

---

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```