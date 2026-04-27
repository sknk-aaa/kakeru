# カケル（Kakeru）アプリ 概要ドキュメント

> このドキュメントはAIへの共有を目的として作成されています。コードを理解したうえで開発支援を行う際に参照してください。

---

## 1. アプリ概要

**カケル**は「走らなければ課金される」ランニング習慣化アプリです。

- ユーザーが事前にランニング目標（距離・時間・曜日）を設定する
- 当日の目標を達成できなかった場合、登録済みのクレジットカードに**自動課金（罰金）**される
- GPSでランニングを計測し、目標達成を判定する

**URL**: https://www.kakeruapp.com  
**運営者**: 金子蒼天

---

## 2. 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16.2（App Router） |
| 言語 | TypeScript 5 |
| スタイリング | Tailwind CSS v4 |
| 認証・DB | Supabase（PostgreSQL + Auth） |
| 決済 | Stripe（SetupIntent / PaymentIntent） |
| メール | Resend |
| 地図 | Leaflet / react-leaflet |
| ホスティング | Vercel |
| アイコン | lucide-react |

---

## 3. ディレクトリ構造

```
kakeru/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # ルートレイアウト（SEOメタデータ、フォント）
│   │   ├── globals.css             # グローバルCSS・デザイントークン・カスタムクラス
│   │   ├── page.tsx                # ホーム画面（サーバーコンポーネント）
│   │   ├── HomeClient.tsx          # ホーム画面（クライアントコンポーネント）
│   │   ├── auth/
│   │   │   ├── page.tsx            # ログイン・新規登録
│   │   │   ├── callback/route.ts   # OAuth・メール確認コールバック
│   │   │   └── card/page.tsx       # クレジットカード登録（Stripe Elements）
│   │   ├── goals/
│   │   │   ├── page.tsx            # 目標一覧（サーバーコンポーネント）
│   │   │   ├── GoalsClient.tsx     # 目標一覧（クライアントコンポーネント）
│   │   │   ├── new/page.tsx        # 目標作成
│   │   │   └── [id]/page.tsx       # 目標編集・停止
│   │   ├── run/
│   │   │   ├── page.tsx            # ランニング計測（GPS）
│   │   │   └── result/page.tsx     # ランニング結果
│   │   ├── records/page.tsx        # 記録・統計
│   │   ├── settings/page.tsx       # 設定（地域・体重・通知・カレンダー連携）
│   │   ├── contact/page.tsx        # お問い合わせ
│   │   ├── privacy/page.tsx        # プライバシーポリシー
│   │   ├── terms/page.tsx          # 利用規約
│   │   ├── tokusho/page.tsx        # 特定商取引法に基づく表記
│   │   └── api/
│   │       ├── goals/
│   │       │   ├── [id]/route.ts           # 目標の更新（PATCH）・停止（DELETE）
│   │       │   ├── skip/route.ts           # 当日インスタンスのスキップ
│   │       │   ├── rain-skip/route.ts      # 雨天スキップ（Open-Meteo天気確認後にスキップ）
│   │       │   └── instances/[id]/cancel/route.ts  # 非当日インスタンスのキャンセル
│   │       ├── calendar/
│   │       │   ├── token/route.ts          # カレンダートークン発行・再発行
│   │       │   └── [token]/route.ts        # ICSフィード（Googleカレンダー連携用）
│   │       ├── stripe/
│   │       │   ├── setup-intent/route.ts   # SetupIntent生成
│   │       │   ├── save-payment-method/    # カード情報保存
│   │       │   ├── payment-method/route.ts # カード情報取得
│   │       │   └── webhook/route.ts        # Webhook（課金結果受信）
│   │       └── cron/
│   │           ├── penalty/route.ts        # 自動課金（毎日23:59 JST）
│   │           ├── notify/route.ts         # リマインダーメール
│   │           └── reset-skips/route.ts   # 月次スキップリセット
│   ├── components/
│   │   ├── AppShell.tsx            # レイアウトラッパー（BottomNav + HamburgerMenu）
│   │   ├── BottomNav.tsx           # 下部ナビゲーション（5タブ、中央に計測ボタン突出）
│   │   ├── RunMap.tsx              # GPS軌跡マップ（Leaflet）
│   │   ├── GpsPermissionModal.tsx  # GPS許可モーダル
│   │   └── HamburgerMenu.tsx       # ハンバーガーメニュー（設定・法的ページ・お問い合わせ）
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts           # ブラウザ用クライアント
│       │   ├── server.ts           # サーバーコンポーネント用（Cookie管理）
│       │   └── admin.ts            # サービスロールキー（RLSバイパス、Cron用）
│       ├── auth.ts                 # requireUser / getUser / getUserProfile
│       ├── haversine.ts            # GPS距離・速度・カロリー計算
│       ├── prefectures.ts          # checkRainy(lat, lng) — Open-Meteo天気判定
│       └── emails.ts               # Resendメール送信ユーティリティ
├── supabase/migrations/            # DBスキーマ・RLS・トリガー
├── vercel.json                     # Cronスケジュール定義
└── proxy.ts                        # 認証ミドルウェア（未認証→/auth、カード未登録→/auth/card）
```

---

## 4. データベーススキーマ

### `users`
Supabase Auth の `auth.users` と連携。新規登録時にトリガーで自動作成される。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid PK | auth.users.id と一致 |
| email | text NOT NULL | メールアドレス |
| stripe_customer_id | text | Stripe顧客ID |
| stripe_payment_method_id | text | デフォルト支払い方法ID |
| is_subscribed | boolean | PRO サブスクリプション有効フラグ |
| weight_kg | numeric | 体重（カロリー計算用） |
| monthly_distance_goal_km | numeric | 月間目標距離（任意） |
| skip_count_this_month | int | 今月のスキップ使用回数（月1回まで） |
| notify_morning | boolean | 朝リマインダーメール（8時） |
| notify_evening | boolean | 夜リマインダーメール（22時） |
| calendar_token | text | Googleカレンダー連携用トークン |
| city_name | text | 雨天スキップ用の市区町村名 |
| location_lat | float | 緯度（Open-Meteo ジオコーディングで取得） |
| location_lng | float | 経度（Open-Meteo ジオコーディングで取得） |

### `goals`
ユーザーが設定した目標の定義。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid PK | |
| user_id | uuid FK | users.id |
| type | text | `recurring`（繰り返し） / `oneoff`（1回のみ） / `challenge`（累積チャレンジ、PRO限定） |
| days_of_week | int[] | 曜日（0=日〜6=土）、recurring のみ |
| scheduled_date | date | 実施日（oneoff）または終了日（challenge） |
| challenge_start_date | date | チャレンジ開始日（challenge のみ） |
| distance_km | numeric | 目標距離（nullable） |
| duration_minutes | int | 目標時間（nullable） |
| penalty_amount | int | 罰金額（円） |
| is_active | boolean | 有効フラグ（false = 停止済み） |
| is_locked | boolean | 永久ロックフラグ（true = 変更・停止不可、PRO機能） |
| escalation_type | text | 連続失敗時の罰金増加方式: `multiplier`（倍率） / `surcharge`（加算）/ null（PRO機能） |
| escalation_value | numeric | 増加量（倍率 or 円、PRO機能） |
| consecutive_failures | int | 現在の連続失敗回数 |
| cooling_weeks | int | クーリング期間（週数）。作成後この期間は変更・停止不可（PRO機能） |

### `goal_instances`
goals から生成される日別スケジュール。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid PK | |
| goal_id | uuid FK | goals.id |
| user_id | uuid FK | users.id |
| scheduled_date | date | 実施予定日 |
| status | text | `pending` / `achieved` / `failed` / `skipped` / `cancelled` |

**生成ルール:**
- `recurring`: 目標作成時に今日から28日分を即時生成（クライアント側）
- `oneoff`: 指定日に1件生成
- `challenge`: 終了日に1件生成

### `runs`
個別のランニング記録。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid PK | |
| goal_instance_id | uuid FK nullable | 紐付く目標インスタンス |
| user_id | uuid FK | users.id |
| distance_km | numeric | 走行距離 |
| duration_seconds | int | 経過時間（秒） |
| pace_seconds_per_km | int | ペース |
| calories | int | 消費カロリー |
| gps_path | jsonb | GPS座標の配列 |
| started_at / finished_at | timestamptz | 開始・終了日時 |

### `penalties`
罰金記録。Stripe課金と紐付く。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid PK | |
| user_id | uuid FK | users.id |
| goal_instance_id | uuid FK | goal_instances.id |
| amount | int | 罰金額（円）※escalation適用後の実際の課金額 |
| stripe_payment_intent_id | text | Stripe PaymentIntent ID |
| status | text | `pending` / `charged` / `failed` |

### RLSポリシー
全テーブルで `auth.uid() = user_id`（または `auth.uid() = id`）のポリシーを適用。自分のデータのみアクセス可能。

---

## 5. PRO サブスクリプション機能

`users.is_subscribed = true` のとき解放される機能:

| 機能 | 説明 |
|------|------|
| チャレンジ目標 | 期間内の累積距離・時間を目標とする goal type |
| 罰金エスカレーション | 連続失敗時に罰金を自動増加（倍率 or 加算） |
| クーリング期間 | 目標作成後 X 週間は変更・停止不可（自己規制） |
| 取り消し不可能ゴール | `is_locked=true` で永久に変更・停止不可 |

PRO 判定は `users.is_subscribed` のみで行う（Stripe カラムは参照しない）。

---

## 6. 主要フロー

### 6-1. ユーザー登録フロー
```
/auth → Google OAuth or メール/パスワード
  → /auth/callback（OAuthコード交換・メール確認トークン処理）
  → proxy.ts がカード未登録を検知 → /auth/card へリダイレクト
  → Stripe SetupIntent でカード登録
  → users テーブルに stripe_customer_id / stripe_payment_method_id を保存
  → ホーム画面へ遷移
```

### 6-2. 目標設定フロー
```
/goals/new
  ① 種別選択: recurring / oneoff / challenge（PRO限定）
  ② 内容入力: 距離・時間・罰金額・曜日 or 日付
  ③ PRO オプション: エスカレーション・クーリング期間・is_locked（各種別ごとに適用可否が異なる）
  ④ 重複チェック: 同日に既存目標があれば警告モーダル
  ⑤ 確認画面 → 保存
     → goals テーブルに挿入
     → goal_instances をクライアント側で生成・挿入（28日分 or 1件）
```

### 6-3. ランニング計測フロー
```
/run
  ① 今日の pending goal_instances を取得
  ② 複数ある場合 → goalSelect フェーズ（どの目標で走るか選択）
  ③ GPS許可モーダル → Geolocation.watchPosition()（5秒間隔）
     → 速度 >30km/h の座標は除外（車・電車対策）
     → Haversine公式で距離計算
  ④ 計測中: 距離 / 経過時間 / ペース / カロリー をリアルタイム表示
  ⑤ ゴールボタン → runs テーブルに保存 → goal_instance.status を achieved に更新
```

### 6-4. 自動課金フロー（毎日 23:59 JST）
```
GET /api/cron/penalty（Vercel Cron, Bearer認証）
  → 今日の pending な goal_instances を failed に更新
  → escalation_type がある場合: consecutive_failures をインクリメントし罰金額を計算
  → stripe.paymentIntents.create({ confirm: true, off_session: true })
  → Stripe Webhook が結果を受信:
    → payment_intent.succeeded → penalty.status: charged + 完了メール
    → payment_intent.payment_failed → penalty.status: failed + 失敗メール
```

### 6-5. スキップ・雨天スキップ
```
通常スキップ（POST /api/goals/skip）:
  → 月1回まで、当日の pending インスタンスのみ
  → status を skipped に更新、skip_count_this_month をインクリメント

雨天スキップ（POST /api/goals/rain-skip）:
  → users.location_lat / location_lng を参照して Open-Meteo で天気確認
  → 雨の場合のみ status を skipped に更新（スキップ回数を消費しない）
  → location_lat/lng が未設定なら 400 エラー
```

### 6-6. Googleカレンダー連携
```
POST /api/calendar/token → users.calendar_token を生成・返却（再発行も可）
GET  /api/calendar/{token}/goals.ics → oneoff 目標の pending インスタンスを ICS 形式で返却
  → RFC 5545 準拠（DTSTAMP 含む）
  → Googleカレンダーの「URLで追加」に URL を登録することで自動反映
  → Googleカレンダーの更新頻度は最長24時間おき（サーバー側で制御不可）
```

### 6-7. インスタンスキャンセル
```
POST /api/goals/instances/{instanceId}/cancel:
  → 当日（scheduled_date = today）のインスタンスはキャンセル不可
  → 未来日のpendingインスタンスのみキャンセル可能
  → status を cancelled に更新
```

---

## 7. 認証・ミドルウェア

`proxy.ts`（Next.js ミドルウェア）が全リクエストを処理：

- **未認証ユーザー** → `/auth` にリダイレクト
- **認証済み・カード未登録** → `/auth/card` にリダイレクト
- **除外パス**: `/auth/*`, `/api/*`, `/privacy`, `/terms`, `/tokusho`, `/contact`

---

## 8. Stripe連携の詳細

| 処理 | API |
|------|-----|
| 初回カード登録 | SetupIntent（`usage: "off_session"`） |
| カード情報収集 | Stripe Card Element（legacy） |
| 課金実行 | PaymentIntent（`confirm: true, off_session: true`） |
| Webhook検証 | `stripe.webhooks.constructEvent()` |
| Webhookエンドポイント | `/api/stripe/webhook` |

**重要**: `stripe.elements()` の呼び出しは `clientSecret` なしで行う（Card Element の正しい使い方）。

---

## 9. 環境変数一覧

| 変数名 | 用途 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー（Cron用） |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook署名検証キー |
| `RESEND_API_KEY` | Resend メール送信キー |
| `CRON_SECRET` | Cron エンドポイント認証トークン |
| `TZ` | タイムゾーン（`Asia/Tokyo`） |

---

## 10. Supabase 固有の注意事項

- Database 型ジェネリクスは使わない（PostgREST v12 の型定義問題）
- join 結果の型キャストは `as unknown as YourType` を使う（単純 select は `data as Type` で十分）
- `upsert` 時は `email` を必ず含める（`users.email` は NOT NULL）
- JST 日付計算は `new Date(Date.now() + 9 * 60 * 60 * 1000)` で行う（サーバーはUTC動作）

---

## 11. Cronスケジュール（vercel.json）

| エンドポイント | スケジュール（UTC） | JST換算 |
|--------------|------------------|---------|
| `/api/cron/penalty` | `59 14 * * *` | 毎日 23:59 |
| `/api/cron/notify` | `0 23 * * *` | 毎日 8:00 |
| `/api/cron/notify` | `0 11 * * *` | 毎日 20:00 |
| `/api/cron/notify` | `0 14 * * *` | 毎日 23:00 |
| `/api/cron/reset-skips` | `0 15 1 * *` | 毎月1日 0:00 |

全Cronエンドポイントは `Authorization: Bearer {CRON_SECRET}` で認証。

---

## 12. 設計判断の原則

- **最重要KPI**: ユーザーが「走る or 罰金を払う」の二択になる状態を維持すること
- 不正（車移動など）で距離を稼げないこと
- 誤検知で罰金が発生しないこと
- 習慣化に直接関係しない機能（SNS・ランキング・高精度フィットネス分析）は優先度を下げる
- 「継続率が上がるか？」を判断の起点にする

*最終更新: 2026年4月*
