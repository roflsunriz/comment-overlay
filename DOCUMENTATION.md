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
| `shadowIntensity` | `'none' \| 'light' \| 'medium' \| 'strong'` | コメントの影の強さ |

`ngWords` は入力をトリムしたうえで部分一致・大文字小文字を区別せずに評価されます。`scrollDirection` を `'ltr'` にするとコメントが左側から右方向へ流れ、デフォルトの `'rtl'` では従来通り右側から左方向へ流れます。

`shadowIntensity` はコメントの影の強さを指定します。`'none'` は影を付けず、`'light'` は軽い影を付け、`'medium'` は中程度の影を付け、`'strong'` は強い影を付けます。デフォルトは `'medium'` です。

### パフォーマンス最適化

軽量シャドウ処理で視認性を確保します。`shadowIntensity` で影の強さを指定してください。`strokeText`や`fillText`の複雑なアウトライン生成はパフォーマンス最適化の為とコメントコマンド`big`時にアウトラインが乱れるため廃止しました。

配列を共有しないためにも `cloneDefaultSettings()` の戻り値を編集するか、自前でディープコピーしてください。

### CommentRendererConfig オプション

`CommentRenderer` のコンストラクタの第2引数には `CommentRendererConfig` を渡せます。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `loggerNamespace` | `string` | ロガーの名前空間 |
| `timeSource` | `TimeSource` | カスタム時間ソース（テスト用など） |
| `animationFrameProvider` | `AnimationFrameProvider` | カスタムアニメーションフレームプロバイダー |
| `createCanvasElement` | `() => HTMLCanvasElement` | カスタムキャンバス要素ファクトリー |
| `debug` | `DebugLoggingOptions` | デバッグログの設定 |
| `eventHooks` | `CommentRendererEventHooks` | イベントコールバック（後述） |

## コメント表示/非表示の切り替え (v3.0.0+)

コメントの表示/非表示を動的に切り替えるには `setCommentVisibility()` メソッドを使用します。

```ts
// コメントを非表示にする（即座にキャンバスがクリアされる）
renderer.setCommentVisibility(false);

// コメントを再表示する（描画が再開される）
renderer.setCommentVisibility(true);
```

このメソッドは以下の処理を行います：

- `visible=false`: `isCommentVisible` 設定を更新し、キャンバスをクリアしてコメントを即座に消去
- `visible=true`: `isCommentVisible` 設定を更新し、描画を再開

**注意:** `renderer.settings.isCommentVisible = false` のように直接設定を変更すると、キャンバスがクリアされずコメントがフリーズした状態になります。必ず `setCommentVisibility()` メソッドを使用してください。

## イベントフック (v2.5.0+)

`CommentRendererConfig` の `eventHooks` プロパティで、以下のイベントにコールバックを登録できます。

```ts
import {
  CommentRenderer,
  cloneDefaultSettings,
  type CommentRendererEventHooks,
  type EpochChangeInfo,
  type RendererStateSnapshot,
} from "comment-overlay";

const eventHooks: CommentRendererEventHooks = {
  onEpochChange: (info: EpochChangeInfo) => {
    console.log(`エポック変更: ${info.previousEpochId} → ${info.newEpochId} (${info.reason})`);
  },
  onStateSnapshot: (snapshot: RendererStateSnapshot) => {
    console.log("状態スナップショット:", snapshot);
  },
};

const renderer = new CommentRenderer(cloneDefaultSettings(), {
  eventHooks,
});
```

### エポック変更のタイミング

エポックIDは以下のタイミングで自動的にインクリメントされます。

- **`source-change`**: 動画ソース（`src` 属性や `<source>` 要素）が変更されたとき
- **`metadata-loaded`**: 動画のメタデータ（`loadedmetadata` イベント）がロードされたとき

エポック変更時には `onEpochChange` コールバックが呼ばれ、全ての既存コメントの `epochId` が新しい値に更新されます。

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

## デバッグ機能 (v2.5.0+)

`comment-overlay` は開発・デバッグ時に有用な機能を提供します。

### デバッグログの有効化

`CommentRendererConfig` の `debug` オプションでデバッグログを有効化できます。

```ts
import { CommentRenderer, cloneDefaultSettings } from "comment-overlay";

const renderer = new CommentRenderer(cloneDefaultSettings(), {
  debug: {
    enabled: true,
    maxLogsPerCategory: 10, // カテゴリごとの最大ログ数（デフォルト: 5）
  },
});
```

デバッグログが有効な場合、以下の情報がコンソールに出力されます。

- コメントの追加・スキップ・評価
- エポック変更
- 内部状態のスナップショット

### デバッグユーティリティ関数

ライブラリは以下のデバッグ用ユーティリティ関数をエクスポートしています。

```ts
import {
  dumpRendererState,
  logEpochChange,
  formatCommentPreview,
  isDebugLoggingEnabled,
  resetDebugCounters,
} from "comment-overlay";

// レンダラー状態のダンプ
dumpRendererState("after-seek", {
  currentTime: 5000,
  duration: 60000,
  isPlaying: true,
  epochId: 1,
  totalComments: 100,
  activeComments: 5,
  reservedLanes: 3,
  finalPhaseActive: false,
  playbackHasBegun: true,
  isStalled: false,
});

// エポック変更のログ
logEpochChange(0, 1, "source-change");

// コメントテキストのプレビュー生成
const preview = formatCommentPreview("とても長いコメントテキスト...", 20);
// => "とても長いコメントテキスト…"

// デバッグログが有効か確認
if (isDebugLoggingEnabled()) {
  console.log("デバッグモードが有効です");
}

// デバッグカウンターのリセット
resetDebugCounters();
```

### 状態スナップショットの取得

イベントフックの `onStateSnapshot` を使用することで、レンダラーの内部状態を定期的に監視できます。

```ts
const renderer = new CommentRenderer(settings, {
  eventHooks: {
    onStateSnapshot: (snapshot) => {
      // 状態の変化を記録
      console.table({
        "現在時刻": `${snapshot.currentTime.toFixed(2)}ms`,
        "総コメント数": snapshot.totalComments,
        "アクティブコメント数": snapshot.activeComments,
        "エポックID": snapshot.epochId,
      });
    },
  },
});
```

## バージョン

パッケージには `COMMENT_OVERLAY_VERSION` 定数が含まれており、現在のライブラリバージョン (例: `v2.5.0`) を取得できます。

```ts
import { COMMENT_OVERLAY_VERSION } from "comment-overlay";

console.log(`comment-overlay version: ${COMMENT_OVERLAY_VERSION}`);
```

## 既知の制限事項と注意事項

### コメントテキストのトリミングについて（重要）

**注意:**
- コメントを追加する際に、テキストに対して `.trim()` を使用すると、行頭・行末の全角スペース（`\u3000`）や非破壊スペース（`\u00A0`）が削除されます
- これにより、AAコメント（アスキーアート）のインデント構造が崩れる原因となります

**推奨される実装:**
```ts
// ❌ 悪い例: trim()を使用するとスペースが削除される
const text = commentData.body.trim();
renderer.addComment(text, vposMs, commands);

// ✅ 良い例: trim()を使わず、空文字列チェックのみ行う
const text = commentData.body;
if (text.length > 0) {
  renderer.addComment(text, vposMs, commands);
}
```

`comment-overlay` エンジン自体は全角スペースを含むすべての文字を正しく描画します。コメントデータを処理する際は、意図しないトリミング処理を避けてください。

## リソース

- [README](./README.md): プロジェクト概要と開発手順
- [CONTRIBUTING](./CONTRIBUTING.md): コントリビューションガイド

問題や質問があれば Issue を提出してください。
