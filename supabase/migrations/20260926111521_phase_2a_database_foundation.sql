-- Phase 2A: schema only. Never seed the prototype catalog or rotations here.
create table public.fruits (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (btrim(name) <> ''),
  rarity text not null check (rarity in ('Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical')),
  type text not null check (type in ('Natural', 'Elemental', 'Beast')),
  money_price bigint not null check (money_price between 0 and 9007199254740991),
  robux_price integer check (robux_price >= 0),
  image text not null check (btrim(image) <> ''),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stock_rotations (
  id uuid primary key default gen_random_uuid(),
  dealer text not null check (dealer in ('normal', 'mirage')),
  slot_key text not null check (btrim(slot_key) <> ''),
  rotation_start timestamptz not null,
  rotation_end timestamptz not null,
  fetched_at timestamptz not null default now(),
  source text not null check (btrim(source) <> ''),
  source_updated_at timestamptz,
  status text not null check (status in ('live', 'stale', 'unavailable')),
  content_hash text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  constraint stock_rotations_dealer_slot_key unique (dealer, slot_key),
  constraint stock_rotations_valid_window check (rotation_end > rotation_start)
);

create table public.stock_items (
  rotation_id uuid not null references public.stock_rotations(id) on delete cascade,
  fruit_id uuid not null references public.fruits(id) on delete restrict,
  position integer not null default 0 check (position >= 0),
  primary key (rotation_id, fruit_id)
);

create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  attempted_at timestamptz not null default now(),
  completed_at timestamptz,
  source text,
  success boolean not null default false,
  duration_ms integer check (duration_ms >= 0),
  error text,
  metadata jsonb,
  constraint sync_runs_valid_completion check (completed_at is null or completed_at >= attempted_at)
);

create index stock_rotations_dealer_latest_idx on public.stock_rotations (dealer, rotation_start desc, fetched_at desc, id desc);
create index stock_rotations_history_idx on public.stock_rotations (rotation_start desc, fetched_at desc, id desc);
create index stock_rotations_end_idx on public.stock_rotations (rotation_end);
create index stock_rotations_fetched_idx on public.stock_rotations (fetched_at desc);
-- The primary key already covers rotation_id. Index the other FK for catalog joins.
create index stock_items_fruit_rotation_idx on public.stock_items (fruit_id, rotation_id);
create index sync_runs_attempted_idx on public.sync_runs (attempted_at desc);

create function public.set_fruit_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

create trigger fruits_set_updated_at before update on public.fruits
for each row execute function public.set_fruit_updated_at();

alter table public.fruits enable row level security;
alter table public.stock_rotations enable row level security;
alter table public.stock_items enable row level security;
alter table public.sync_runs enable row level security;

-- Default deny: there are intentionally NO browser read or write policies.
revoke all privileges on table public.fruits, public.stock_rotations, public.stock_items, public.sync_runs
  from public, anon, authenticated, service_role;
grant usage on schema public to service_role;
-- Phase 2A is read-only. A future reviewed migration must grant synchronization writes.
grant select on table public.fruits, public.stock_rotations, public.stock_items, public.sync_runs to service_role;

revoke all privileges on function public.set_fruit_updated_at() from public, anon, authenticated;
grant execute on function public.set_fruit_updated_at() to service_role;

-- Keep future postgres-owned public objects opt-in as well.
alter default privileges for role postgres in schema public revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from public, anon, authenticated;

comment on table public.fruits is 'Canonical, verified catalog metadata. No prototype seed data.';
comment on table public.stock_rotations is 'Stored dealer snapshots; times are absolute source rotation boundaries.';
comment on table public.stock_items is 'Ordered fruit references for a stored rotation.';
comment on table public.sync_runs is 'Private operational log. No anon/authenticated privileges or policies.';
