# markdown-to-zundamon

Markdownからずんだもん解説動画を生成するプロジェクト。Remotionベース。

## 前提条件

- [mise](https://mise.jdx.dev/)（Node.js・pnpm の管理）
- Docker（VOICEVOX 起動用）

## セットアップ

```bash
mise install
pnpm install
docker compose up -d   # VOICEVOX を localhost:50021 で起動
```

## ビルド・実行手順

```bash
# 1. 前処理: Markdown解析 + VOICEVOX音声生成 → public/projects/<project>/manifest.json
pnpm exec ts-node scripts/preprocess.ts manuscripts/my-video.md

# 2. プレビュー
pnpm exec ts-node scripts/studio.ts my-video

# 3. レンダリング → out/<project>.mp4
pnpm exec ts-node scripts/render.ts my-video
```

## アーキテクチャ

2フェーズ構成:
1. **前処理** (`scripts/preprocess.ts`): Markdown → VOICEVOX音声生成 → JSONマニフェスト
2. **動画生成** (`src/`): マニフェストを読み込み、Remotionで音声・字幕・スライド・キャラ画像を合成

- blockquote → スライド表示
- それ以外のテキスト → ずんだもんが喋る（VOICEVOX）
- `[pause: 500ms]` → ポーズ
- `[キャラ名]` タグ → 話者切り替え
- `<ruby>word<rt>よみ</rt></ruby>` → 字幕と読みを分離
- frontmatter `readingsDictionary` → アルファベット単語の読み一括指定

## ファイル構成

- `scripts/preprocess.ts` - 前処理スクリプト
- `scripts/studio.ts` - Remotion Studio 起動ヘルパースクリプト
- `scripts/render.ts` - レンダリングヘルパースクリプト
- `src/index.ts` - Remotion registerRoot
- `src/Root.tsx` - Composition登録（calculateMetadata で動的マニフェスト読み込み）
- `src/Composition.tsx` - メイン合成コンポーネント
- `src/components/` - UI コンポーネント群
- `src/types.ts` - 型定義（Zodスキーマ）
- `docker-compose.yml` - VOICEVOX 起動設定
- `characters/<name>/` - キャラクター画像（ソース）
- `public/projects/<project>/manifest.json` - 前処理出力（生成物）
- `public/projects/<project>/audio/` - 生成された音声ファイル（生成物）
- `public/projects/<project>/images/` - スライド用画像（生成物）
- `public/characters/<name>/` - コピーされたキャラ画像（生成物）
- `out/<project>.mp4` - レンダリング出力（生成物）

## コーディング規約

- TypeScript strict
- Remotion のコンポーネント規約に従う
- パッケージマネージャーは pnpm を使用
