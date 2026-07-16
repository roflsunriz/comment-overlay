# ニコニココメントシステム互換性研究

このディレクトリは、ニコニコ動画のコメント表示を一般規則として再現するための研究文書、研究用コード、ローカル実験結果の入口です。研究の原案は [strategy.md](./strategy.md)、現在の実装計画と判定基準は [studies/offline-replay-foundation.md](./studies/offline-replay-foundation.md)、最初の実測結果は [studies/2026-07-17-baseline-results.md](./studies/2026-07-17-baseline-results.md) を参照してください。

## ディレクトリ構成

- `tools/`: キャプチャ、隔離再生、検証などの研究ツール。Git管理対象。
- `studies/`: 仮説、実験計画、結果、未解決事項。Git管理対象。
- `captures/`: 公式ページから取得したレスポンス本文とマニフェスト。Git管理外。
- `runs/`: オフライン再生の監査結果とスクリーンショット。Git管理外。
- `.tmp/`: 匿名Chromeプロファイルなどの一時ファイル。Git管理外。

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

既定では未記録リクエストが1件でもあれば終了コード2です。探索中に監査結果だけ得る場合は `--allow-misses` を指定できますが、再現成功とは判定しません。

### 3. 研究基盤を検証する

```powershell
bun run research:test
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
2. `nvComment` の記録済み応答を合成コメント応答へ置き換えるローカルコメントサーバー層を作る。
3. Canvas API、DOM、動画時刻を計測する観測フックを再生開始前に注入する。
4. 本文、コマンド、時刻差、処理順、幅、高さ、行数を直交表で生成し、同一アーカイブへ反復投入する。
5. 観測結果から仮説を立て、未使用ケースをホールドアウトとして反証する。
6. 成立した一般規則だけを `src/` に実装し、既存fixtureと横断プローブで退行を確認する。
