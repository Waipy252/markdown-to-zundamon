# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

Markdownからずんだもん解説動画を生成するプロジェクト。Remotion + VOICEVOX ベース。

## 前提条件

- [mise](https://mise.jdx.dev/)（Node.js・pnpm の管理）
- Docker（VOICEVOX 起動用、localhost:50021）

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

# 2. プレビュー（Remotion Studio）
pnpm exec ts-node scripts/studio.ts my-video

# 3. レンダリング → out/<project>.mp4
pnpm exec ts-node scripts/render.ts my-video

# 型チェック
pnpm run typecheck
```

## アーキテクチャ

2フェーズ構成。マニフェスト（JSON）が前処理と動画生成の契約となる。

1. **前処理** (`scripts/preprocess.ts`): Markdown → VOICEVOX音声生成 → `public/projects/<project>/manifest.json`
2. **動画生成** (`src/`): マニフェストを読み込み、Remotionで音声・字幕・スライド・キャラ画像を合成

### Markdown記法

- blockquote (`>`) → スライド表示
- それ以外のテキスト → VOICEVOX で音声合成
- `[キャラ名]` → 話者切り替え
- `[キャラ名#スタイル]` → スタイル切り替え（以降の行に継続）
- `[pause: 500ms]` / `[pause: 1s]` → ポーズ
- `[bgm: public/music/ファイル名]` / `[bgm: off]` → BGM制御
- `[jingle: public/music/ファイル名 image=public/images/画像 1000ms]` → 場面転換ジングル
- `[se: public/soundeffect/ファイル名]` → 効果音（直後のセリフと同時再生）
- `<ruby>word<rt>よみ</rt></ruby>` → 字幕と読みを分離
- frontmatter `readingsDictionary` → 単語の読み一括指定

**パス規則**: `[bgm:]`, `[jingle:]`, `[se:]` のファイルパスはすべて `public/` プレフィックス付きで指定する。frontmatter の `jingle.audioPath` / `jingle.imagePath` のみ `public/` なしの相対パス。

### 動画生成コンポーネント (`src/`)

- `Composition.tsx` — メイン合成。タイムライン管理、全レイヤー描画
- `Root.tsx` — Composition登録（calculateMetadata で動的マニフェスト読み込み）
- `types.ts` — Zodスキーマによる型定義（マニフェスト・セグメント・設定）
- `components/CharacterDisplay.tsx` — キャラスプライト表示・口パクアニメーション
- `components/SlideContent.tsx` — Markdownスライド描画（react-markdown + Prism）
- `components/Subtitle.tsx` — BudouXによる日本語分節・縁取り字幕
- `components/ChapterTitle.tsx` — 章タイトル表示

## ファイル構成

- `scripts/preprocess.ts` — 前処理スクリプト（Markdown解析・VOICEVOX連携・アセット処理）
- `scripts/studio.ts` — Remotion Studio 起動ヘルパー
- `scripts/render.ts` — レンダリングヘルパー
- `characters/<name>/` — キャラクター画像ソース（default.png, default_active*.png, スタイル名.png）
- `public/music/` — BGM・ジングル音声
- `public/soundeffect/` — 効果音
- `public/images/` — ジングル背景画像
- `public/projects/<project>/` — 前処理出力（manifest.json, audio/, images/）
- `台本/` — 生成した台本ファイル
- `research/` — 調査ファイル

## コーディング規約

- TypeScript strict
- Remotion のコンポーネント規約に従う
- パッケージマネージャーは pnpm を使用
- VOICEVOX音声はテキスト+speakerIdのSHA256ハッシュでキャッシュ済みならスキップ
