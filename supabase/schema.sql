-- 汇报排练 · Supabase 数据库 schema
-- 在 Supabase SQL Editor 里执行本文件即可

-- 用户档案表
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free',
  daily_count int not null default 0,
  usage_date date not null default current_date,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

-- 新用户注册时自动创建 profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 练习历史表（登录用户云端同步）
create table if not exists public.practices (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  scenario text,
  framework text,
  score int,
  chars int,
  cpm int,
  created_at timestamptz not null default now()
);

create index if not exists practices_user_idx on public.practices(user_id, created_at desc);

-- 开启 RLS（保护用户数据）
alter table public.profiles enable row level security;
alter table public.practices enable row level security;

drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "practices_self" on public.practices;
create policy "practices_self" on public.practices
  for all using (auth.uid() = user_id);
