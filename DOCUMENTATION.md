# comment-overlay ドキュメント

`comment-overlay` は HTML5 動画やキャンバス要素上にコメントを重ねて表示するための描画エンジンです。ニコニコ動画のような横スクロールコメントから固定コメントまで、配信・再生アプリケーションに組み込めます。

## インストール

```bash
npm install comment-overlay
```

TypeScript プロジェクトでは `tsconfig.json` の `moduleResolution` が `node16` もしくは `bundler` であることを推奨します。`types` フィールドにより、型定義は自動的に解決されます。

## クイックスタート

```ts
import {
  CommentRenderer,
  cloneDefaultSettings,
  type RendererSettings,
  type CommentRendererInitializeOptions,
} from "comment-overlay";

const video = document.querySelector("video");
const overlay = document.querySelector(".overlay");

if (!(video instanceof HTMLVideoElement) || !(overlay instanceof HTMLElement)) {
  throw new Error("動画要素またはオーバーレイ要素が見つかりません。");
}

const settings: RendererSettings = cloneDefaultSettings();
const renderer = new CommentRenderer(settings, {
  loggerNamespace: "ExampleOverlay",
});

const options: CommentRendererInitializeOptions = {
  video,
  container: overlay,
};

renderer.initialize(options);
renderer.addComment("Hello Overlay!", 1500, ["naka", "yellow"]);
```

コメントは `renderer.addComment(text, vposMs, commands)` で追加します。`vposMs` はミリ秒単位のタイムスタンプです。動画再生時に自動で同期され、コメントが表示されます。

## 設定

`cloneDefaultSettings()` で得られる `RendererSettings` を編集して表示を制御します。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `commentColor` | `string` | デフォルトの文字色 (HEX 形式) |
| `commentOpacity` | `number` | コメントの不透明度 (0-1) |
| `isCommentVisible` | `boolean` | コメント描画全体の ON/OFF |
| `useContainerResizeObserver` | `boolean` | コンテナサイズの自動追跡を行うかどうか |
| `ngWords` | `string[]` | 部分一致 (大文字小文字を区別しない) で判定する NG ワード |
| `ngRegexps` | `string[]` | 正規表現 NG パターン |
| `scrollDirection` | `'rtl' \| 'ltr'` | 横流れコメントのスクロール方向 |
| `renderStyle` | `'outline-only' \| 'classic'` | コメントの描画スタイル。`'classic'` は影付き |
| `syncMode` | `'raf' \| 'video-frame'` | 描画の同期モード。`video-frame` は `requestVideoFrameCallback` を利用 |
| `scrollVisibleDurationMs` | `number \| null` | スクロールコメントの表示時間 (ms)。`null` で自動調整 |
| `useFixedLaneCount` | `boolean` | レーン数を固定するかどうか |
| `fixedLaneCount` | `number` | 固定する場合のレーン数 |
| `useDprScaling` | `boolean` | `devicePixelRatio` に応じた高解像度描画を行うか |
| `strokeTextThreshold` | `number` | `strokeText` 使用の閾値（px）。この値未満のフォントサイズでは `shadowBlur` で代替（デフォルト: 30） |

`ngWords` は入力をトリムしたうえで部分一致・大文字小文字を区別せずに評価されます。`scrollDirection` を `'ltr'` にするとコメントが左側から右方向へ流れ、デフォルトの `'rtl'` では従来通り右側から左方向へ流れます。

### パフォーマンス最適化

`strokeTextThreshold` は描画パフォーマンスに影響します。小さなコメントでは高負荷な `strokeText` の代わりに軽量な `shadowBlur` を使用することで、描画コストを大幅に削減できます。デフォルト値（30px）では約89%のコメントで `strokeText` がスキップされ、描画性能が向上します。

配列を共有しないためにも `cloneDefaultSettings()` の戻り値を編集するか、自前でディープコピーしてください。

## コメントコマンド

コメントの第三引数 `commands` には文字列配列を渡し、以下を組み合わせて表示を調整します。

- 位置: `naka`, `ue`, `shita`
- サイズ: `small`, `medium`, `big`
- フォント: `defont`, `gothic`, `mincho`
- 色 (名前指定): `white`, `red`, `pink`, ほか 16 色
- 色 (カラーコード): `#RRGGBB` / `#RRGGBBAA`
- 演出: `_live` (半透明), `invisible` (非表示)
- 字間: `ls:10` / `letterspacing:10` (px単位)
- 行高: `lh:1.5` / `lineheight:150%` (倍率またはパーセント)

## ライフサイクル

- `initialize(options)`  
  `CommentRendererInitializeOptions` を渡し、ビデオ要素と描画コンテナを紐付けます。`options.animationFrameProvider` を指定すればカスタムループにも対応できます。
- `destroy()`  
  内部タイマーや `ResizeObserver` を破棄し、DOM との紐付けを解除します。SPA などでは画面遷移時に呼び出してください。

## ロガー

`createLogger(namespace, options)` を利用すると名前空間付きのロガーを作成できます。`CommentRenderer` のコンストラクタに `loggerNamespace` を渡すと自動で利用されます。

```ts
import { createLogger, type LogLevel } from "comment-overlay";

const logger = createLogger("MyOverlay", { level: "debug" satisfies LogLevel });
logger.info("Renderer started");
```

## バージョン

パッケージには `COMMENT_OVERLAY_VERSION` 定数が含まれており、現在のライブラリバージョン (例: `v1.1.0`) を取得できます。

```ts
import { COMMENT_OVERLAY_VERSION } from "comment-overlay";

console.log(`comment-overlay version: ${COMMENT_OVERLAY_VERSION}`);
```

## 既知の制限事項

### AA（アスキーアート）の行頭全角スペース表示問題

**症状:**
- 多行AAコメントで、一部の行（特に最初の行）の行頭全角スペースが無視され、左詰めで表示される現象が発生します
- OffscreenCanvasでのテクスチャキャッシュ使用時に発生します

**技術的詳細:**
- ブラウザのCanvas API (`fillText`/`strokeText`) が、OffscreenCanvas上で行頭の全角スペース（`\u3000`）や非破壊スペース（`\u00A0`）を無視する動作が確認されています
- 行頭スペースを検出してその幅を測定し、描画X座標を調整する対策コードは実装済みですが、OffscreenCanvas側で反映されません
- オフセット計算のロジック自体は正しく動作していることを確認済みです

**影響範囲:**
- AAコメント（やる夫、モナーなど）のインデント構造が崩れる場合があります
- 通常のコメント（単一行、行頭スペースなし）には影響ありません

**回避策:**
- 現時点では根本的な解決策はありません
- 将来的にブラウザAPIの動作が改善されるか、別のレンダリング手法（WebGL等）で対応を検討しています

## リソース

- [README](./README.md): プロジェクト概要と開発手順
- [CONTRIBUTING](./CONTRIBUTING.md): コントリビューションガイド

問題や質問があれば Issue を提出してください。
