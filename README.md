# comment-overlay

[![npm version](https://img.shields.io/npm/v/comment-overlay)](https://www.npmjs.com/package/comment-overlay)
[![npm downloads](https://img.shields.io/npm/dm/comment-overlay)](https://www.npmjs.com/package/comment-overlay)
[![license](https://img.shields.io/github/license/roflsunriz/comment-overlay)](./LICENSE)

再利用可能なコメントオーバーレイ描画エンジンです。ニコニコ動画のような横流れコメントを、HTML5 動画など任意の再生コンテンツ上に重ねて表示できます。npm レジストリで公開されており、`bun add comment-overlay` で導入できます。

![cover](./images/cover.png)

## ニコニコ動画コメントシステムとの高い互換性

`comment-overlay` の現行レンダラーは、見本となるコメントアートへ座標を合わせた実装ではありません。保存した公式プレイヤーを外部通信なしで隔離再生し、本文、コマンド、サイズ、行数、時刻差、処理順、表示領域、seek、動画終端などを1軸ずつ変えた合成コメントを投入して、Canvasの描画結果から一般規則を導出しています。

調査は、固定コメント21 profile・321ケース、スクロールコメント12 profile・431ケース、動画終端3系列・72ケース、合計824ケースまで実施しました。連続量は境界の直前・一致・直後、離散入力は同値類、複合条件は直交ケースで反証し、規則導出に使わなかった実コメントアートをホールドアウトにしています。その結果、次の挙動を作品固有条件やコメントアート専用分岐なしで説明し、`src/` へ反映しました。

- 公式の内部`1364×768`座標を表示領域へ比例変換する文字寸法とレーン間隔
- 実測文字幅、行数、`full`、`ender`から決まる固定コメントの縮小と可変高予約
- 表示高を使い切った場合のランダム退避と、表示高以上の多層コメントを同じ端へ重ねる境界
- 横流れコメントが描画領域と文字幅を4秒で横断する速度、開始・退出位置、同一レーン再利用
- 動画終端3秒前へ表示基準時刻を丸めた後、固定・横流れの通常規則をそのまま適用する終端処理

画素単位一致は目標にしていません。公式プレイヤー自身も読み込み順や再生位置によってレーン選択が揺れるため、同値な配置クラスと一般規則の一致を互換性の基準にしています。実験設計、観測結果、未採用仮説、再実行手順は [`research/`](./research/README.md) に、旧校正の経緯は [`history/`](./history/README.md) に保存しています。

## NPM パッケージ

- [comment-overlay](https://www.npmjs.com/package/comment-overlay)

## 開発に必要な環境

- Bun 1.3.8 以降

## 開発環境のセットアップ

```bash
bun install
```

## スクリプト

- `bun run dev`: Vite 開発サーバーを起動します。
- `bun run build`: 出力をクリーンアップして型定義を生成した後、ライブラリをビルドします。
- `bun run lint`: `src` ディレクトリの TypeScript ファイルを ESLint で検査します。
- `bun run type-check`: `tsconfig.build.json` を用いた型チェックを実行します。
- `bun run serve`: `overlay-tests` ディレクトリを静的サーバーで起動し、ビルド成果物を使って動作確認できます。
- `bun run nico:trace -- ...`: CDP 接続した Chrome 上のニコニコ動画プレイヤーから Canvas 描画ログとスクリーンショットを採取します。
- `bun run nico:overlay-trace -- ...`: 生コメントJSONを `comment-overlay` で描画し、校正トレースを採取します。
- `bun run nico:report -- ...`: 実プレイヤー採取ログと `comment-overlay` 側ログの差分レポートを生成します。
- `bun run nico:strict-score -- ...`: 実プレイヤーと `comment-overlay` の `drawImage` 外側レイヤー位置を数値比較します。
- `bun run nico:internal-score -- ...`: 実プレイヤーと `comment-overlay` のソースキャンバス内部 `fillText` 配置を数値比較します。
- `bun run research:nico:capture -- ...`: 匿名のニコニコ動画セッションを、Git管理外の研究用アーカイブへ記録します。
- `bun run research:nico:replay -- ...`: 記録済みセッションを、外部通信を遮断したChromeで再生して通信監査結果を生成します。
- `bun run research:nico:supplement -- ...`: 監査で不足が判明した公式静的資産1件を、ホストと拡張子を制限して追補します。
- `bun run research:test`: `research/tools` 配下の研究基盤をテストします。

ニコニコ互換性研究の方針、隔離要件、具体的な使用手順は [`research/README.md`](./research/README.md) に集約しています。

開発にあたり、変更後は `bun run lint`、`bun run type-check`、`bun run build` を順番に実行して品質を確認してください。

## パブリッシュ手順（メンテナー向け）

このプロジェクトはGitHub Actionsを使用してnpmに自動パブリッシュします。npmは2025年12月9日にクラシックトークンを無効化したため、新しいグラニュラートークンを使用します。

### 初回セットアップ

1. npmで新しいグラニュラートークンを作成
   - https://www.npmjs.com/settings/[your-username]/tokens にアクセス
   - "Generate New Token" → "Granular Access Token"を選択
   - Permissions: "Read and write"を付与
   - Packages: "All packages"または`comment-overlay`を選択
   - "Automation"オプションを有効化（2FAバイパス用）

2. GitHubリポジトリのSecretsに追加
   - Settings → Secrets and variables → Actions → New repository secret
   - Name: `NPM_TOKEN`
   - Value: 作成したnpmトークンを貼り付け

### パッケージのパブリッシュ

1. `package.json`のバージョンを更新（例: 2.9.0 → 2.10.0）
2. `src/config/default-settings.ts`のバージョンも更新
3. 変更をコミット＆プッシュ
4. タグを作成してプッシュ:
   ```bash
   git tag v2.10.0
   git push origin v2.10.0
   ```
5. GitHub Actionsが自動的に実行され、npmにパブリッシュされます

または、GitHubの"Actions"タブから"Publish to npm"ワークフローを手動実行することもできます。

## 非推奨バージョン

次のバージョンはバグを含むため非推奨となっています:v1.2.0, v1.2.1, v1.2.2, v2.5.0

## 使い方

ライブラリは `CommentRenderer` を中心に構成されています。以下は動画要素にコメントを重ねる最小限の例です。

```ts
import { CommentRenderer, cloneDefaultSettings, type RendererSettings } from "comment-overlay";

const video = document.querySelector("video");
const container = document.querySelector(".overlay-container");

if (!(video instanceof HTMLVideoElement) || !(container instanceof HTMLElement)) {
  throw new Error("動画要素または描画コンテナが見つかりません。");
}

const settings: RendererSettings = cloneDefaultSettings();
const renderer = new CommentRenderer(settings, {
  loggerNamespace: "MyOverlay",
});

renderer.initialize({ video, container });
renderer.addComment("このコメントは明朝体で赤色で下部に大きく表示されます", 5000, [
  "shita",
  "red",
  "big",
  "mincho",
]);

// 動画のライフサイクルに合わせてリソースを解放します。
video.addEventListener("ended", () => {
  renderer.destroy();
});
```

フルスクリーン表示でもコメントを重ねる場合は、`video.requestFullscreen()` ではなく、`renderer.initialize({ video, container })` に渡したオーバーレイコンテナへ `container.requestFullscreen()` を呼び出してください。レンダラーはフルスクリーン変更時にキャンバスをコンテナへ追従させ、動画より前面に配置します。

第2引数 `vposMs` はコメントを表示するミリ秒単位の再生位置です。

校正用途では `renderer.addComment(text, vposMs, commands, meta)` の第4引数に `no`、`fork`、`source`、`threadId`、`date`、`userIdHash` を渡せます。これらは描画挙動には影響せず、重複判定と校正 trace / frame snapshot のコメント同一性復元に使用されます。

対応コメントコマンドは以下の通りです。

- 位置指定: `shita`, `ue`, `naka`
- サイズ指定: `small`, `medium`, `big`
- フォント指定: `defont`(システムフォント), `gothic`(ゴシック体), `mincho`(明朝体)
- 色指定: `white`, `red`, `pink`, `orange`, `yellow`, `green`, `cyan`, `blue`, `purple`, `black`, `white2`, `red2`, `pink2`, `orange2`, `yellow2`, `green2`, `cyan2`, `blue2`, `purple2`, `black2`
- 透明度指定: `_live`(半透明), `invisible`(非表示)
- 幅指定: `full`（固定コメントの幅上限を表示幅まで広げる。横流れコメントの幾何・速度には影響しない）
- 色指定: `#FF0000`, `#00FF00`, `#0000FF`などの16進数カラーコード
- 字間指定: `ls:10` や `letterspacing:10` (px単位)
- 行高指定: `lh:1.5` や `lineheight:150%` (倍率またはパーセント)
- コメントコマンドが未指定のときは`naka` `medium` `defont` `white` 相当の表示になります。

`small` / `medium` / `big` のフォント比率、`gothic` のフォント候補、多行コメントの内部テクスチャ寸法は、ニコニコ動画実プレイヤーの Canvas 描画ログに基づいて調整しています。公式の内部 `1364×768` Canvasを表示領域へ比例縮小する寸法則に合わせ、行数起因の自動縮小（`big=3`、`medium=5`、`small=7`、ただし`ender`を除く）を適用します。横流れコメントは最大行の実測文字幅を縮小せず、内部1024幅相当の描画領域を文字全体が4秒で横切る速度で移動し、同一レーンは`文字幅÷速度`後に再利用します。通常固定コメントは実測文字幅を表示幅の75%、`full`は表示幅までへフィットし、その結果の文字サイズ・行高から可変高区間を予約します。固定コメントは3秒間、上固定なら上から、下固定なら下から空き区間へ整列します。単体が表示高未満で空きだけが不足する場合はランダムYへ退避し、単体が表示高以上の場合は同じ端へ重ねます。この境界により、複数レイヤーで構成された矩形・白抜き・歌詞を同じ座標に保ちます。動画終端3000ms以内のコメントは、固定・横流れとも表示基準時刻を終端3000ms前へ丸め、その後は通常と同じ保持・移動規則を使います。`ca` コマンドは専用描画経路を持たず、通常コメントと同じレンダリングパイプラインで処理されます。

### RendererSettings のポイント

- `ngWords`: 入力テキストをトリムしたうえで部分一致 (大文字小文字を区別せず) による NG 判定を行います。
- `ngRegexps`: コメント本文に対して評価される正規表現文字列の配列です。空配列を渡すと無効になります。
- `scrollDirection`: `'rtl'` (右→左) または `'ltr'` (左→右) を指定して、横流れコメントの方向を切り替えられます。
- `scrollVisibleDurationMs`: 既定の`null`では公式の4秒横断式を使います。数値を指定すると描画領域と文字全体を横切る時間を上書きします。

### コメントテキストの処理に関する注意

コメントデータを処理する際、**`.trim()` を使用しないでください**。`.trim()` は全角スペース（`\u3000`）や非破壊スペース（`\u00A0`）を削除するため、AAコメント（アスキーアート）のインデント構造が崩れる原因となります。

```ts
// ❌ 悪い例
const text = commentData.body.trim();
renderer.addComment(text, vposMs, commands);

// ✅ 良い例
const text = commentData.body;
if (text.length > 0) {
  renderer.addComment(text, vposMs, commands);
}
```

### コメント表示/非表示の切り替え (v3.0.0+)

コメントの表示/非表示を動的に切り替えるには `setCommentVisibility()` メソッドを使用します。

```ts
// コメントを非表示にする（即座にキャンバスがクリアされる）
renderer.setCommentVisibility(false);

// コメントを再表示する（描画が再開される）
renderer.setCommentVisibility(true);
```

**注意:** `renderer.settings.isCommentVisible = false` のように直接設定を変更すると、キャンバスがクリアされずコメントがフリーズした状態になります。必ず `setCommentVisibility()` メソッドを使用してください。

### イベントフック (v2.4.2+)

ライブラリは、エポック変更や内部状態の変化をイベントフック経由で通知できます。

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
  loggerNamespace: "MyOverlay",
  eventHooks,
  debug: {
    enabled: true, // デバッグログを有効化
  },
});
```

**エポック変更のタイミング:**

- `source-change`: 動画ソースが変更されたとき
- `metadata-loaded`: 動画のメタデータがロードされたとき

デバッグログを有効にすると、内部状態の変化がコンソールに出力されます。

### サンプルを試す

1. ライブラリをビルドします: `bun run build`
2. サンプルサーバーを起動します: `bun run serve`
3. ブラウザーで表示される URL を開き、`overlay-tests` 内のテスト UI でコメント描画を確認できます。

サンプル UI は `overlay-tests` ディレクトリにあり、`scripts/sync-overlay-tests.mjs` によってビルド成果物と同期されます。`overlay-tests/fixtures/` へ `<case-id>-comments.json` を追加すると、CASEプルダウンへ自動的に追加されます。トップレベルの `"label"` は任意で、省略時はcase IDを表示します。同名の `<case-id>.mp4` があれば背景動画として使用し、動画がなければコメント末尾から再生時間を生成した無音タイムラインで、再生・停止・シークを含めてコメントだけを確認できます。動画fixtureはgit管理対象外です。

`bun run serve` はcase一覧の生成とoverlay test用TypeScriptのビルドを行ってからサーバーを起動します。UI ではNGワード、NG正規表現、スクロール方向などをリアルタイムで変更できます。

## コントリビューション

バグ報告や機能提案は GitHub Issue テンプレートを利用してください。Pull Request を送る際は、テンプレートのチェックリストに従ってローカルでの検証を済ませてから提出してください。

## ライセンス

このプロジェクトは [MIT License](./LICENSE) の下で提供されています。
