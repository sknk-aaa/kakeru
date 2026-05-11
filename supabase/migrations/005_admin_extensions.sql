-- 集計用 is_subscribed（本番DBには既存なので idempotent）
alter table users
  add column if not exists is_subscribed boolean not null default false;

-- UTM 5列 + landing_path + 捕捉時刻
alter table users
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists referrer text,
  add column if not exists landing_path text,
  add column if not exists utm_captured_at timestamptz;
