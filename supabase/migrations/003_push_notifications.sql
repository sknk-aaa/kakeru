-- push_subscriptions: Web Push サブスクリプション管理
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX ON push_subscriptions(endpoint);
CREATE INDEX ON push_subscriptions(user_id);

-- ユーザーごとのプッシュ通知設定
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS push_notify_morning boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS push_notify_evening boolean NOT NULL DEFAULT false;
