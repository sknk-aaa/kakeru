@AGENTS.md

## Rules

## Next.js 16 固有の注意
- Supabase を使うページには必ず `export const dynamic = "force-dynamic"` を先頭に追加する
- `import dynamic from "next/dynamic"` は `export const dynamic` と名前衝突するので `import dynamicImport from "next/dynamic"` にリネームする

## Supabase
- Database 型ジェネリクスは使わない（PostgREST v12 の型定義問題）
- join 結果の型キャストは `as unknown as YourType` を使う

## Mapbox
- トークンは `NEXT_PUBLIC_MAPBOX_TOKEN`（`.env.local` 設定済み）

## デザイン定数
- アクセントカラー: `#FF6B00`（オレンジ）
- 成功: `#22C55E` / 失敗: `#EF4444`
- ページ背景: `#F2F2F7`（AppShell が自動で適用）

## Leaflet
- `src/components/RunMap.tsx` で `cancelled` フラグを使って React Strict Mode の二重初期化を防いでいる — このロジックは消さない
- `import "leaflet/dist/leaflet.css"` のインポートが必須（消すとタイルが壊れる）
