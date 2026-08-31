create extension if not exists pgcrypto;

create table public.portfolio_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  card_name text not null,
  set_name text not null,
  image_url text not null,
  variant text not null,
  variant_label text not null,
  quantity integer not null check (quantity between 1 and 10000),
  purchase_price_cents integer not null check (purchase_price_cents >= 0),
  market_price_cents integer not null default 0 check (market_price_cents >= 0),
  price_source text,
  price_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, card_id, variant, purchase_price_cents)
);

alter table public.portfolio_entries enable row level security;
create policy "Users read their portfolio" on public.portfolio_entries for select using (auth.uid()=user_id);
create policy "Users add to their portfolio" on public.portfolio_entries for insert with check (auth.uid()=user_id);
create policy "Users update their portfolio" on public.portfolio_entries for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Users remove from their portfolio" on public.portfolio_entries for delete using (auth.uid()=user_id);
create index portfolio_entries_user_id_idx on public.portfolio_entries(user_id);
create index portfolio_entries_card_id_idx on public.portfolio_entries(card_id);

create table public.price_snapshots (
  id bigint generated always as identity primary key,
  card_id text not null,
  variant text not null,
  market_price_cents integer not null check (market_price_cents >= 0),
  source text not null default 'TCGplayer',
  source_updated_at timestamptz,
  captured_at timestamptz not null default now(),
  unique(card_id, variant, captured_at)
);
alter table public.price_snapshots enable row level security;
create policy "Prices are public" on public.price_snapshots for select using (true);
create index price_snapshots_lookup_idx on public.price_snapshots(card_id,variant,captured_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;
create trigger portfolio_updated_at before update on public.portfolio_entries for each row execute function public.set_updated_at();
