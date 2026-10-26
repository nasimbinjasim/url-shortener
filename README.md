# URL Shortener for url.iamnasim.com

Simple, fast URL shortener built with **Next.js 14** + **Supabase** + **Vercel**.

## Features

- Shorten any URL instantly
- Clean short links: `url.iamnasim.com/xxxxxx`
- Shows last 10 shortened links on homepage
- Minimal, cream + black design

## Setup

### 1. Supabase

Run this SQL in your Supabase project:

```sql
create table public.urls (
  id uuid default gen_random_uuid() primary key,
  short_code text unique not null,
  original_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index urls_short_code_idx on public.urls (short_code);

alter table public.urls enable row level security;

create policy "Allow public read" on public.urls for select using (true);
create policy "Allow public insert" on public.urls for insert with check (true);
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BASE_URL=https://url.iamnasim.com
```

### 3. Run locally

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

1. Import this repository in Vercel
2. Add the three environment variables above
3. Add custom domain `url.iamnasim.com`
4. Deploy

That's it.
