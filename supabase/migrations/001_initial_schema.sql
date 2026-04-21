-- カケル DBスキーマ
-- Supabase SQL Editorで実行してください

-- usersテーブル（Supabase Authと連携）
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  stripe_customer_id text,
  stripe_payment_method_id text,
  weight_kg float,
  monthly_distance_goal_km float,
  skip_count_this_month int not null default 0,
  skip_reset_at timestamptz,
  created_at timestamptz not null default now()
);

-- goalsテーブル
DO $$ BEGIN
  CREATE TYPE public.goal_type AS ENUM ('recurring', 'oneoff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.goal_type not null default 'recurring',
  days_of_week int[],
  scheduled_date date,
  distance_km float,
  duration_minutes int,
  penalty_amount int not null default 500,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- goal_instancesテーブル
DO $$ BEGIN
  CREATE TYPE public.goal_instance_status AS ENUM (
    'pending', 'achieved', 'failed', 'skipped', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists public.goal_instances (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  scheduled_date date not null,
  status public.goal_instance_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- runsテーブル
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  goal_instance_id uuid references public.goal_instances(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  distance_km float not null,
  duration_seconds int not null,
  pace_seconds_per_km int,
  calories int,
  best_pace_seconds_per_km int,
  gps_path jsonb,
  started_at timestamptz not null,
  finished_at timestamptz not null
);

-- penaltiesテーブル
DO $$ BEGIN
  CREATE TYPE public.penalty_status AS ENUM ('pending', 'charged', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists public.penalties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  goal_instance_id uuid not null references public.goal_instances(id) on delete cascade,
  amount int not null,
  stripe_payment_intent_id text,
  status public.penalty_status not null default 'pending',
  charged_at timestamptz
);

-- インデックス
create index if not exists goal_instances_user_date on public.goal_instances(user_id, scheduled_date);
create index if not exists goal_instances_status on public.goal_instances(status);
create index if not exists runs_user_id on public.runs(user_id);
create index if not exists penalties_user_id on public.penalties(user_id);

-- RLSを有効化
alter table public.users enable row level security;
alter table public.goals enable row level security;
alter table public.goal_instances enable row level security;
alter table public.runs enable row level security;
alter table public.penalties enable row level security;

-- RLSポリシー: users
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

-- RLSポリシー: goals
create policy "goals: own rows" on public.goals
  for all using (auth.uid() = user_id);

-- RLSポリシー: goal_instances
create policy "goal_instances: own rows" on public.goal_instances
  for all using (auth.uid() = user_id);

-- RLSポリシー: runs
create policy "runs: own rows" on public.runs
  for all using (auth.uid() = user_id);

-- RLSポリシー: penalties
create policy "penalties: own rows" on public.penalties
  for all using (auth.uid() = user_id);

-- ユーザー新規登録時にpublic.usersを自動作成するトリガー
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
