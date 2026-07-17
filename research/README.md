# ニコニココメントシステム互換性研究

このディレクトリは、ニコニコ動画のコメント表示を一般規則として再現するための研究文書、研究用コード、ローカル実験結果の入口です。研究の原案は [strategy.md](./strategy.md)、現在の実装計画と判定基準は [studies/offline-replay-foundation.md](./studies/offline-replay-foundation.md)、最初の実測結果は [studies/2026-07-17-baseline-results.md](./studies/2026-07-17-baseline-results.md)、合成コメントによるレーン観測は [studies/2026-07-17-synthetic-comment-lane-results.md](./studies/2026-07-17-synthetic-comment-lane-results.md)、複数行と可変高スロットの観測は [studies/2026-07-17-multiline-slot-results.md](./studies/2026-07-17-multiline-slot-results.md)、表示高を使い切った後のランダム配置は [studies/2026-07-17-overflow-results.md](./studies/2026-07-17-overflow-results.md)、固定コメントとコメントアートの境界調査は [studies/2026-07-17-fixed-comment-coverage-results.md](./studies/2026-07-17-fixed-comment-coverage-results.md)、スクロールコメントの速度・寿命・レーン境界は [studies/2026-07-17-scrolling-comment-coverage-results.md](./studies/2026-07-17-scrolling-comment-coverage-results.md)、動画終端の共通時刻規則は [studies/2026-07-17-final-phase-results.md](./studies/2026-07-17-final-phase-results.md) を参照してください。

## ディレクトリ構成

- `tools/`: キャプチャ、隔離再生、検証などの研究ツール。Git管理対象。
- `studies/`: 仮説、実験計画、結果、未解決事項。Git管理対象。
- `captures/`: 公式ページから取得したレスポンス本文とマニフェスト。Git管理外。
- `runs/`: オフライン再生の監査結果とスクリーンショット。Git管理外。
- `scenarios/`: 公式コメント応答へ注入する合成コメント入力。Git管理対象。

匿名Chromeプロファイルは永続的な研究成果物ではないため、OSの一時ディレクトリ内 `comment-overlay-research/` に作成し、終了時に削除します。研究ツール、入力、監査結果、研究文書はすべて `research/` に置きます。

公式配信物を含む `captures/` は、互換性研究のためにローカルだけで使用し、コミット、配布、npmパッケージへの同梱を行いません。キャプチャは必ずツールが生成する匿名の一時プロファイルで行い、普段使用しているブラウザプロファイルへ接続しません。

## 現在利用できる手順

### 1. 匿名セッションを1回だけ記録する

これは外部通信を行う唯一の段階です。動画本体のレスポンスは保存せず、リクエスト本文、Cookie、認証ヘッダー、`Set-Cookie` も保存しません。

```powershell
bun run research:nico:capture -- --url https://www.nicovideo.jp/watch/sm6240144 --out research/captures/sm6240144-baseline
```

`manifest.json`、重複排除された `bodies/`、確認用 `preview.png` が出力されます。同じ出力先を上書きする場合だけ `--overwrite` を明示します。

workerなど遅延ロードされる公式静的資産がオフライン監査で不足した場合は、対象URLを確認したうえで1件ずつ追補できます。API、動画、広告配信を誤って取得しないよう、`nicovideo.jp` / `nimg.jp` の静的拡張子だけを許可します。

```powershell
bun run research:nico:supplement -- --archive research/captures/sm6240144-baseline/manifest.json --url https://www.nicovideo.jp/path/to/worker.js
```

### 2. 外部通信を遮断して再生する

```powershell
bun run research:nico:replay -- --archive research/captures/sm6240144-baseline/manifest.json
```

再生時は全ページリクエストをCDPで捕捉し、記録にないリクエストを `BlockedByClient` で失敗させます。ただし、ブラウザーが自動生成するCORSプリフライトだけは、要求されたorigin・method・headerに対するローカル204応答を合成し、その事実を `synthesized` として監査します。さらにChromeプロセスへ到達不能なローカルプロキシ、DNS名前解決失敗、QUIC無効化、WebRTCの非プロキシUDP無効化を重ねます。`research/runs/` の `audit.json` には提供したレスポンス、合成したプリフライト、遮断したリクエスト、WebSocket試行、例外、コンソール出力を記録します。

システム側のNicoCacheなどが視聴ページへ挿入した `https://www.nicovideo.jp/local/` 配下の資産は、公式プレイヤーの挙動を変えるため隔離再生時に無効化し、`disabledLocalInjections` として通常の未記録要求とは分けて監査します。新規キャプチャで検出した件数はmanifestの `localInjectionExchangeCount` に記録します。

既定では未記録リクエストが1件でもあれば終了コード2です。探索中に監査結果だけ得る場合は `--allow-misses` を指定できますが、再現成功とは判定しません。

### 3. 研究基盤を検証する

```powershell
bun run research:test
```

### 4. 合成コメントを注入してCanvasを観測する

```powershell
bun run research:nico:replay -- --archive research/captures/sm6240144-baseline/manifest.json --scenario research/scenarios/same-vpos-four.json --seek-ms 10000 --out research/runs/same-vpos-four --allow-misses
```

`canvas-trace.jsonl` には、公式コードによるテキスト描画、source canvas、外側Canvasへの変換行列、観測時のvideo状態を記録します。文字幅はCanvasの論理 `measureText` 値と、source contextの変換行列を適用した実描画幅を分けて記録します。合成本文が描画へ到達した件数は `audit.json` の `scenario.textHits` で確認できます。

表示寸法への比例性を検証するときだけ、`--window-width` と `--window-height` を同時に指定して再生ウィンドウを上書きできます。監査にはCanvasとvideoの内部寸法、client寸法、bounding rect、`devicePixelRatio` を記録します。

記録したCanvas traceからレーン座標と処理順を集計できます。

```powershell
bun run research:nico:analyze -- --trace research/runs/same-vpos-four/canvas-trace.jsonl --scenario research/scenarios/same-vpos-four.json
```

同幅2コメントの指定時刻差を独立再生で測る場合は、1回のコマンドにつき1値を指定します。管理実行環境では同一プロセスからChromeを連続起動するとWindows Jobの制約を受けるため、値の反復はコマンド実行側で行います。

```powershell
bun run research:nico:lane-probe -- --archive research/captures/sm6240144-baseline/manifest.json --dt-ms 1288 --out research/runs/lane-probe-1288
```

`--first-body` / `--second-body` で幅、`--line-count` で自動生成本文の行数、`--body-prefix` で行の長さ、`--position` / `--size` / `--color` / `--source` / `--premium` でコマンドとメタデータを1軸ずつ変更できます。混在条件は `--first-size` / `--second-size` と `--first-line-count` / `--second-line-count` で2コメントを独立指定します。

固定・スクロールコメントの一般規則を直交表で測る場合は、`--profile` に次のいずれかを指定します。1ケースだけ再実行する場合は `--case` も指定できます。

- 基本軸: `temporal`、`geometry`、`features`、`viewport`、`boundary`、`repeat`、`order`
- 予約と状態遷移: `interaction`、`search`、`duration-features`、`seek`、`distribution`
- 横幅: `width`、`width-boundary`、`width-multiline`、`width-multiline-boundary`、`width-features`、`width-extreme-features`、`glyph-width`
- メタデータ非依存性: `identity`、`fork`
- スクロールの寸法と属性: `scroll-features`、`scroll-width`、`scroll-sync`、`scroll-metadata`、`scroll-viewport`、`scroll-glyph`
- スクロールの状態遷移: `scroll-seek`、`scroll-lifecycle`、`scroll-lifecycle-boundary`、`scroll-lifecycle-edge`、`scroll-cleanup-boundary`
- スクロールの予約境界: `scroll-reuse-boundary`
- 動画終端: `final-phase-equivalence`（通常時刻と終了6秒前以降の平行移動対照）

`width-extreme-features` は、最小フォント到達後のscaleと `full` / `ender` の交差を追試するための入力です。全profileを連続実行する場合は `all` を指定できます。

```powershell
bun run research:nico:fixed-matrix -- --profile boundary --out research/runs/fixed-comment-matrix-boundary
```

動画終端profileを72ケースすべて独立実行し、通常時刻との対照差を抽出する場合は次のように実行します。差異そのものが終端規則の観測対象なので、解析は差異件数を記録して正常終了します。終端差がないことを検証したい別用途では `--require-equivalence` を追加できます。

```powershell
bun run research:nico:final-phase -- --out research/runs/comment-matrix-final-phase-equivalence
bun run research:nico:final-phase-analyze -- --input research/runs/comment-matrix-final-phase-equivalence/matrix-results.json --out research/runs/comment-matrix-final-phase-equivalence/equivalence-analysis.json
```

## 安全性と再現性の境界

- オンラインキャプチャを何千回も繰り返さない。公式サイトへの接続は、バンドルまたはAPI契約が更新された時の単発スナップショット取得に限定する。
- 静的資産の追補はオフライン監査で実際に不足が確認できたファイルだけに限定し、推測でURLを列挙しない。
- 大量プローブは必ずオフライン再生上で実行する。
- リプレイ時に未記録のURLをネットワークへフォールバックしない。
- 取得レスポンスはSHA-256で検証し、改変や欠損があるアーカイブを再生しない。
- `audit.json` の `blockedCount` が0であることは必要条件だが、プレイヤーが正しく動作した十分条件ではない。DOM、Canvas描画、コメントAPI呼び出しも別途判定する。
- 現段階では動画メディア本文とWebSocketフレームを再生しない。コメント表示に必要と判明した場合は、外部接続を追加するのではなくローカル代替実装を追加する。

## 次の実装段階

1. ベースラインを匿名キャプチャし、オフライン再生の不足レスポンスを監査する。
2. `nvComment` の記録済み応答を合成コメント応答へ置き換えるローカルコメントサーバー層を作る。（完了）
3. Canvas API、DOM、動画時刻を計測する観測フックを再生開始前に注入する。（完了）
4. 本文、コマンド、時刻差、処理順、幅、高さ、行数を直交表で生成し、同一アーカイブへ反復投入する。（完了）
5. 観測結果から仮説を立て、未使用ケースをホールドアウトとして反証する。（完了）
6. 成立した一般規則だけを `src/` に実装し、既存fixtureと横断プローブで退行を確認する。（完了）
7. スクロールの属性、幅、文字種、開始・終了、レーン再利用、seekの同値類と境界を反証する。（完了）
8. 動画終端の固定・スクロール・混在系列と時刻境界を反証し、共通の時刻丸め規則へ還元する。（完了）
