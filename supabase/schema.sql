-- ============================================================================
--  Vowly — admin backend schema
--  Run this whole file once in Supabase → SQL Editor (paste → Run).
--  Safe to re-run: everything is guarded with "if not exists" / "drop ...".
--
--  Roles: 'pending' (just signed up, no access) → 'admin' (full console) →
--  'superuser' (also approves/denies/promotes others). The email below is
--  auto-promoted to superuser the moment it signs up. Keep it in sync with
--  SUPERUSER_EMAIL in src/admin/data/authService.ts.
-- ============================================================================

-- 1. Role type -------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('pending', 'admin', 'superuser');
exception when duplicate_object then null; end $$;

-- 2. Profiles (one row per auth user) --------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       public.user_role not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Role helpers (SECURITY DEFINER so they don't trip profiles' own RLS) ------
create or replace function public.my_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'superuser')
  );
$$;

create or replace function public.is_superuser()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'superuser'
  );
$$;

-- Profiles policies: read your own (superuser reads all); only superuser edits
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_superuser());

drop policy if exists profiles_update_super on public.profiles;
create policy profiles_update_super on public.profiles
  for update using (public.is_superuser());

drop policy if exists profiles_delete_super on public.profiles;
create policy profiles_delete_super on public.profiles
  for delete using (public.is_superuser() and id <> auth.uid());

-- 3. Auto-create a profile on signup; auto-promote the superuser email ------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when lower(new.email) = 'buildwithankitusingai@gmail.com'
         then 'superuser'::public.user_role
         else 'pending'::public.user_role end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Guests ----------------------------------------------------------------
create table if not exists public.guests (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  family              text,
  side                text check (side in ('bride', 'groom')),
  phone               text,
  email               text,
  max_guests          int  not null default 1,
  invited_function_ids text[] not null default '{}',
  notes               text,
  created_at          timestamptz not null default now()
);
alter table public.guests enable row level security;
drop policy if exists guests_admin_all on public.guests;
create policy guests_admin_all on public.guests
  for all using (public.is_admin()) with check (public.is_admin());

-- 5. RSVPs -----------------------------------------------------------------
create table if not exists public.rsvps (
  id           uuid primary key default gen_random_uuid(),
  guest_id     uuid references public.guests(id) on delete set null,
  name         text not null,
  phone        text,
  party_size   int  not null default 1,
  guests       text[] not null default '{}',
  functions    text[] not null default '{}',
  status       text not null default 'pending' check (status in ('pending','confirmed','declined')),
  message      text,
  submitted_at timestamptz not null default now()
);
alter table public.rsvps enable row level security;

-- Guests submit RSVPs anonymously (the public invite has no login):
drop policy if exists rsvps_insert_anon on public.rsvps;
create policy rsvps_insert_anon on public.rsvps for insert with check (true);

-- Admins/superusers manage all RSVPs:
drop policy if exists rsvps_admin_select on public.rsvps;
create policy rsvps_admin_select on public.rsvps for select using (public.is_admin());
drop policy if exists rsvps_admin_update on public.rsvps;
create policy rsvps_admin_update on public.rsvps for update using (public.is_admin());
drop policy if exists rsvps_admin_delete on public.rsvps;
create policy rsvps_admin_delete on public.rsvps for delete using (public.is_admin());
