-- パフォーマンス改善: 複合インデックス追加
-- Supabase SQL Editor で実行してください

-- runs: user_id + 日付範囲の複合（ホーム・記録・ゴールページで使用）
-- 既存の runs_user_id（単体）は user でフィルタ後に全スキャンするため追加
create index if not exists idx_runs_user_started_at
  on public.runs (user_id, started_at desc);

-- goals: user_id + is_active の複合（ゴールページで使用）
create index if not exists idx_goals_user_active
  on public.goals (user_id, is_active);

-- penalties: user_id + 日付範囲の複合（ホームページで使用）
-- 既存の penalties_user_id（単体）は全ペナルティをスキャンするため追加
create index if not exists idx_penalties_user_charged_at
  on public.penalties (user_id, charged_at);

-- goal_instances: user_id + status の複合（ホームページの達成率計算で使用）
-- 既存の goal_instances_status（単体）は selectivity が低いため追加
create index if not exists idx_goal_instances_user_status
  on public.goal_instances (user_id, status);

-- goal_instances: goal_id + scheduled_date の複合（ゴールページの週別インスタンス取得で使用）
create index if not exists idx_goal_instances_goal_date
  on public.goal_instances (goal_id, scheduled_date);
