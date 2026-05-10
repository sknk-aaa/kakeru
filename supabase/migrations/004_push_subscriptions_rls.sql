-- push_subscriptions: 自分の行のみ操作可能にする
alter table push_subscriptions enable row level security;

create policy "push_subscriptions: own rows" on push_subscriptions
  for all using (auth.uid() = user_id);
