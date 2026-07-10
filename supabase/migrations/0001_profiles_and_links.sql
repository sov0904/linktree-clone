-- Fase 1: tablas profiles/links + RLS + auto-creación de perfil al registrarse
-- Ejecutar una sola vez en el SQL Editor de Supabase (Dashboard > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- Tabla profiles
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  bg_color text not null default '#ffffff',
  button_color text not null default '#000000',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- ─────────────────────────────────────────────
-- Tabla links
-- ─────────────────────────────────────────────
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists links_profile_id_idx on public.links(profile_id);

alter table public.links enable row level security;

create policy "links_select_public_active_or_own"
  on public.links for select
  using (is_active = true or profile_id = auth.uid());

create policy "links_insert_own"
  on public.links for insert
  with check (profile_id = auth.uid());

create policy "links_update_own"
  on public.links for update
  using (profile_id = auth.uid());

create policy "links_delete_own"
  on public.links for delete
  using (profile_id = auth.uid());

-- ─────────────────────────────────────────────
-- Trigger: crear fila en profiles automáticamente al registrarse
-- El username y display_name viajan en options.data del signUp() del cliente.
-- SECURITY DEFINER: corre con permisos elevados, así que no depende de que
-- exista sesión activa todavía (evita el problema de RLS + email sin confirmar).
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
