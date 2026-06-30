> 同dirの CLAUDE.md も併設。共通ルールは /home/aaa/project/AGENTS.md。

# kakeru（カケル）— ランニング罰金アプリ（Codex向け）

「走らなければ自動課金（罰金）される」ランニング習慣化アプリ。Web（PWA）＋ iOS ネイティブ（Capacitor ラッパー）の両対応。

- 製品/宣伝の正: `docs/KAKERU_PRODUCT.md`
- マーケ施策の蓄積: `docs/MARKETING.md`
- 実装/スタック/DBスキーマ/主要フローの正: `docs/Kakeru_App_stacks.md`
- 使い方ページ仕様: `docs/howto-page-spec.md`
- AI向けの技術厳守事項（Next.js 16・Supabase 使い分け・CSS クラス・Leaflet 等）: 同dir `CLAUDE.md`

## 事業/マーケ方針

- このアプリは公開後も、LP、SNS/動画、価格、PRO導線、信頼材料、離脱防止を継続改善して売上を作る前提で扱う。
- コア訴求は「罰金」そのものではなく、「意志に頼らず、仕組みで走る」。インパクトは使うが、不安だけを煽らず、安心材料を必ずセットで伝える。
- 課金・罰金を扱うため、信頼と透明性が最優先。目標設定前に罰金は発生しない、カード情報はStripe管理、スキップ/雨天スキップがある、軽い目標から始められる、という安全説明を落とさない。
- マーケ施策、LP改善、SNS/動画台本、価格/PRO機能AB案は `docs/MARKETING.md` に蓄積する。

## スタック（要点）

- Next.js 16.2（App Router）/ TypeScript / Tailwind CSS v4 / Supabase（Auth+Postgres+RLS）/ Vercel（Cron, region `hnd1`）。
- ミドルウェアは `src/proxy.ts`（Next.js 16 で `middleware.ts`→`proxy.ts`）。未認証→`/auth`、公開パスは proxy 内の `PUBLIC_PATH_PREFIXES` で管理。
- 地図は Leaflet。グラフは recharts。アイコンは lucide-react。

## 課金は2系統（重要・docに未反映）

PRO 判定は常に `users.is_subscribed`（boolean）。書き込み元が2つある:

- **Web/PWA**: Stripe サブスクリプション。`src/app/api/stripe/*`（checkout / portal / webhook ほか）。Webhook が `checkout.session.completed` / `customer.subscription.*` で `is_subscribed` を更新。
- **iOS アプリ**: RevenueCat IAP（`@revenuecat/purchases-capacitor`）。`src/lib/iap.ts`（`isCapacitorIOS()` で iOS ネイティブ時のみ動作）→ 購入後 `POST /api/iap/sync` が RevenueCat の entitlement `KAKERU Pro` を確認して `is_subscribed` を更新。
- 別に「罰金」課金は Stripe PaymentIntent（off_session、`/api/cron/penalty`）。サブスクとは別系統。

## iOS ネイティブ対応（Capacitor・docに未反映）

- `@capacitor/core` で Web を iOS アプリ化。`capacitor.config.*` / `ios/` はこのリポには未コミット（別管理 or 未生成）。
- ログインは Web=Supabase OAuth/メール、iOS=`@capacitor-community/apple-sign-in` でネイティブ Apple Sign In。
- IAP・Apple Sign In は iOS ネイティブ時のみ有効。Web 側を壊さないこと。

## 通知（メール＋Web Push・docはメールのみ記載）

- メール: Resend（`src/lib/emails.ts`）。
- Web Push: VAPID + Service Worker `public/sw.js`。購読 `POST /api/push/subscribe`、配信は `/api/cron/notify`、テスト `POST /api/push/test`。
- 管理: `src/app/admin/`（UTM/referrer による流入元分析。`src/lib/admin-helpers.ts`、`ADMIN_EMAILS` で権限判定、migration `005_admin_extensions.sql`）。

## DBマイグレーション

`supabase/migrations/` に 001〜005 まで適用済み（initial / performance_indexes / push_notifications / push_subscriptions_rls / admin_extensions）。スキーマ変更時は新規連番ファイルを追加。

## 確認（このアプリ固有）

- TypeScript/TSX を変更したら `npm run build` で確認。CSSのみの軽微修正はビルド省略可。
- dev は `npm run dev`（`next dev --webpack`）。

## 現状・要確認

- 実装はほぼ完成・本番稼働（https://www.kakeruapp.com 、Vercel）。旧メモリの「環境変数未設定／Supabase 手動作業未実施」は解消済み（陳腐化情報）。
- `.env.local` に `REVENUECAT_SECRET_API_KEY` が見当たらない。`/api/iap/sync` が必要とするため、本番（Vercel）に設定されているか要確認。
- `docs/Kakeru_App_stacks.md` は Stripe/メールのみ前提で書かれており、RevenueCat IAP・Capacitor iOS・Web Push・管理画面が未反映。スタック変更を加えたら同docも更新する。
