---
fps: 30
width: 1920
height: 1080
slideTransitionMs: 600
speechGapMs: 200
characters:
  - name: ずんだもん
    speakerId: 3
    position: right
    flip: false
    color: "#4a8a2a"
    overflowY: 0.6
    overflowX: 0.1
    height: 800
  - name: 四国めたん
    speakerId: 2
    position: left
    flip: true
    color: "#b4456e"
    overflowY: 0.6
    overflowX: 0.1
    height: 800
readingsDictionary:
    npm: エヌピーエム                                                                
    MP4: エムピーフォー
    Node.js: ノードジェーエス
    Markdown: マークダウン
---

# イントロ

> # markdown-to-zundamon

[ずんだもん] こんにちは！ ずんだもんなのだ。
[四国めたん] 四国めたんよ。よろしくね。

> - 動画づくりって大変
> - 文章なら書けるけど…

[ずんだもん] 世はまさに動画時代！
[四国めたん] 文章なら書けるってキミも、動画を作るのは一苦労よね？

## ツールの紹介

> ## markdown-to-zundamon とは
>
> Markdownを書くだけで、ずんだもんが解説してくれる動画を自動生成！

[ずんだもん] そこで markdown-to-zundamon なのだ！
[pause: 500ms]
[四国めたん] これさえあれば、Markdownファイルからずんだもん動画を生成できるのよ！

## デモ

> ```markdown
> > - 動画づくりって大変
> > - 文章なら書けるけど…
>
> [ずんだもん] 世はまさに動画時代！
> [四国めたん] 文章なら書けるってキミも、動画を作るのは一苦労よね？
> ```

[ずんだもん]
こんな感じでMarkdownで原稿を書けば、
それを画面に表示しながらぼくらが喋るのだ！

[四国めたん]
引用が画面表示されるスライドになって、
地の文が私たちのセリフなのね。

> ![](https://upload.wikimedia.org/wikipedia/commons/9/9c/Aldrin_Apollo_11.jpg)

[ずんだもん] 画像も表示できるよ！

> ```javascript
> console.log("コードも表示できるのだ！");
> ```

[四国めたん] コードもこの通り！

## リスト

> 1. まず原稿をMarkdownで書く
> 2. 前処理スクリプトを実行する
> 3. Remotionでレンダリングする

[ずんだもん] 番号付きリスト（ol）も表示できるのだ！
[四国めたん] 手順の説明なんかに便利ね。

## テーブル

> | キャラクター | 話者ID | 特徴 |
> |------------|--------|------|
> | ずんだもん  | 3      | 元気いっぱい |
> | 四国めたん  | 2      | クールでお姉さん系 |

[ずんだもん] テーブルも表示できるのだ！
[四国めたん] データの比較に使えるわね。
