# kakeru — ランニング罰金アプリ

アプリの目的・DB スキーマ・主要フロー・ディレクトリ構造は同ディレクトリの `KAKERU_APP_OVERVIEW.md` を参照すること。

---

## Next.js 16 固有の注意

- Supabase を使うページには `export const dynamic = "force-dynamic"` を追加する。
  - Server Component: ファイル先頭（import より前）
  - Client Component: `"use client"` の直後、import より前
- `import dynamic from "next/dynamic"` は `export const dynamic` と名前衝突するので `import dynamicImport from "next/dynamic"` にリネームする
- `params` / `searchParams` は `Promise<T>` として `await` が必要

---

## Supabase クライアントの使い分け

| 使用場所 | import |
|---------|--------|
| Server Component / Route Handler | `import { createClient } from "@/lib/supabase/server"` |
| Client Component（useEffect 内など） | `import { createClient } from "@/lib/supabase/client"` |
| Cron・管理処理（RLS をバイパスしたい場合のみ） | `import { createAdminClient } from "@/lib/supabase/admin"` |

誤用するとRLSバイパス（admin の乱用）またはSSR動作不全（client をserver で使用）になるため厳守する。

---

## Supabase 型

- Database 型ジェネリクスは使わない（PostgREST v12 の型定義問題）
- テーブルを join（例: `.select("*, goals(*)")`）した結果のみ `as unknown as YourType` でキャスト
- 単一テーブルの select は型アノテーションで対応: `const g = data as Goal`

---

## 認証

- Server Component での認証ガードは `requireUser()`（`src/lib/auth.ts`）を使う。未ログイン時は `/auth` へリダイレクトが内包されている
- Route Handler は `supabase.auth.getUser()` で直接確認する（`requireUser` は Server Component 専用）

---

## PRO 判定

- `users.is_subscribed`（boolean）が `true` のとき PRO ユーザー
- Server Component: `supabase.from("users").select("is_subscribed").eq("id", user.id).single()`
- Client Component: `useEffect` 内で同様にフェッチ
- Stripe のカラム（`stripe_customer_id` 等）を直接 PRO 判定に使わない

---

## グローバル CSS クラス（`globals.css` 定義済み）

新規 UI を実装するときはまずこれらを優先し、不足する場合のみインラインスタイルで補う。

| クラス | 用途 |
|--------|------|
| `btn-primary` | オレンジ塗りつぶしボタン（min-height: 52px） |
| `btn-secondary` | 白背景・ボーダーボタン |
| `card` | 白背景・角丸・ボーダーのカードコンテナ |
| `input` | テキスト入力フィールド（height: 52px） |
| `metric-value` | 数値表示用フォント（Barlow Condensed、tabular-nums） |
| `screen` | fixed + overflow-y: auto のフルスクリーンコンテナ |

Tailwind v4 カラーエイリアス（`globals.css` の `@theme` で定義）:

| エイリアス | 値 |
|-----------|-----|
| `text-accent` / `bg-accent` | `#FF6B00` |
| `text-success` | `#22C55E` |
| `text-danger` | `#EF4444` |
| `text-text-main` | `#111111` |
| `text-text-sub` | `#888888` |
| `border-border` | `#E5E5E5` |

---

## デザイン定数

- アクセントカラー: `#FF6B00`（オレンジ）
- 成功: `#22C55E` / 失敗: `#EF4444`
- ページ背景: `#F2F2F7`（AppShell が自動で適用）

---

## Leaflet

- `src/components/RunMap.tsx` で `cancelled` フラグを使って React Strict Mode の二重初期化を防いでいる — このロジックは消さない
- `import "leaflet/dist/leaflet.css"` のインポートが必須（消すとタイルが壊れる）
