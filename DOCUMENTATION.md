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
renderer.addComment("Hello Overlay!", 150, ["naka", "yellow"]);
```

コメントは `renderer.addComment(text, vpos, commands)` で追加します。`vpos` は 1/100 秒単位のタイムスタンプです。動画再生時に自動で同期され、コメントが表示されます。

## 設定

`cloneDefaultSettings()` で得られる `RendererSettings` を編集して表示を制御します。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `commentColor` | `string` | デフォルトの文字色 (HEX 形式) |
| `commentOpacity` | `number` | コメントの不透明度 (0-1) |
| `isCommentVisible` | `boolean` | コメント描画全体の ON/OFF |
| `useContainerResizeObserver` | `boolean` | コンテナサイズの自動追跡を行うかどうか |
| `ngWords` | `string[]` | 完全一致 NG ワード |
| `ngRegexps` | `string[]` | 正規表現 NG ワード |

配列を共有しないためにも `cloneDefaultSettings()` の戻り値を編集するか、自前でディープコピーしてください。

## コメントコマンド

コメントの第三引数 `commands` には文字列配列を渡し、以下を組み合わせて表示を調整します。

- 位置: `naka`, `ue`, `shita`
- サイズ: `small`, `medium`, `big`
- フォント: `defont`, `gothic`, `mincho`
- 色 (名前指定): `white`, `red`, `pink`, ほか 16 色
- 色 (カラーコード): `#RRGGBB` / `#RRGGBBAA`
- 演出: `_live` (半透明), `invisible` (非表示)

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

パッケージには `COMMENT_OVERLAY_VERSION` 定数が含まれており、現在のライブラリバージョン (例: `v1.0.1`) を取得できます。

```ts
import { COMMENT_OVERLAY_VERSION } from "comment-overlay";

console.log(`comment-overlay version: ${COMMENT_OVERLAY_VERSION}`);
```

## リソース

- [README](./README.md): プロジェクト概要と開発手順
- [CONTRIBUTING](./CONTRIBUTING.md): コントリビューションガイド

問題や質問があれば Issue を提出してください。
