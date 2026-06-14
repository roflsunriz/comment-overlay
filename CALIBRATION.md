# comment-overlay 校正メモ

`comment-overlay` のニコニコ動画寄せを進めるための、実測・比較・再校正の手順をまとめたメモです。通常の利用方法は [README.md](./README.md) と [DOCUMENTATION.md](./DOCUMENTATION.md) を参照してください。

## 使うスクリプト

- `bun run nico:trace -- ...`: ログイン済み Chrome を CDP 経由で計測し、ニコニコ実プレイヤーの Canvas 描画呼び出しを JSONL として保存します。
- `bun run nico:overlay-trace -- ...`: 生コメント JSON を `comment-overlay` で描画し、校正用トレースを採取します。
- `bun run nico:report -- ...`: 実プレイヤー採取ログと `comment-overlay` 側ログの差分レポートを生成します。
- `bun run nico:strict-score -- ...`: 実プレイヤーと `comment-overlay` の `drawImage` 外側レイヤー位置を数値比較します。
- `bun run nico:internal-score -- ...`: 実プレイヤーと `comment-overlay` のソースキャンバス内部 `fillText` 配置を数値比較します。
- `bun run nico:lane-reverse -- ...`: 実プレイヤーの `drawImage` 軌跡からレーン選択の傾向を逆算します。

## 実プレイヤー計測

Chrome は `--remote-debugging-port=9222` 付きで起動してください。採取結果は `.calibration/nico/<videoId>/<case>/` に保存されます。`trace.jsonl` の各 Canvas レコードには、可能な場合 `videoCurrentTimeMs` と `videoRect` も含まれるため、`drawImage` の `x(t)` を実再生時刻に対して比較できます。

Firefox DevTools RDP を使う場合は、RDP 待ち受け状態の Firefox に `127.0.0.1:6000` 経由で接続します。

`.calibration/` は校正用の一時成果物ディレクトリで、git 管理対象外です。実プレイヤーのトレース、スクリーンショット、HTML レポート、取得済みコメント JSON はローカルで再採取・再生成してください。

## `comment-overlay` 側の内部トレース

ブラウザー上で次のように設定すると、描画プリミティブ単位のログを受け取れます。

```ts
globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = true;
globalThis.__COMMENT_OVERLAY_TRACE__ = (record) => {
  console.log(record);
};
```

このフックは校正・比較用の内部機能であり、安定公開 API ではありません。

ライブラリ内部には `captureRendererCalibrationFrame(renderer, frameTimeMs, { collectTrace: true })` も用意しています。これは指定時刻の1フレームを描画し、その間に `comment-overlay` が発行した描画プリミティブとアクティブコメント状態を返す校正用デバッグ関数です。

## 比較レポート

実プレイヤーのトレースと `comment-overlay` 側トレースを比較するには、次を実行します。

```bash
bun run nico:overlay-trace -- --comments .calibration/sm6240144-comments.json --out .calibration/nico/sm6240144/overlay-cat-mario-100s-30s --width 1182 --height 665 --start-ms 100000 --duration-ms 30000 --fps 15
bun run nico:report -- --real .calibration/nico/VIDEO_ID/baseline/trace.jsonl --overlay overlay-trace.jsonl --out .calibration/nico/VIDEO_ID/baseline/report.html
```

レポートは `fillText` / `strokeText` の本文一致、座標差分、フォント差分に加えて、`drawImage` の source canvas 寸法 bucket と軌跡フィットも比較します。コメントアートの調整では、`246x794`、`366x806`、`1662x806` のようなテクスチャ bucket が実プレイヤーと `comment-overlay` の双方に出ているか、さらに `x(t)` の速度・開始位置・終了位置が揃っているかを優先して確認してください。PNG 同士の簡易差分も同じ HTML で確認したい場合は、`--real-image` と `--overlay-image` に比較対象の PNG を指定してください。

通常コメントについては `ordinary comment calibration` ではなく、実プレイヤーと `comment-overlay` の `drawImage` 予約幅、`x(t)`、lane `y` を同じルールで数値比較します。

## 校正メモ

- `v3.1.6`: `full` 横流れの `ender full` ロゴ幅スナップと表示開始 lead を調整し、GRADIUS / XEVIOUS の右端切れを抑制。
- `v3.1.7`: 内部 calibration trace に `sourceWidth` / `sourceHeight` を追加し、通常コメントのテクスチャ寸法を追跡可能に変更。
- `v3.1.8`: Firefox DevTools RDP による採取を追加し、固定 `ue` の `1252x52` レイヤーと `0.8` 描画スケールに合わせて調整。
- `v3.1.9`: 明朝系の横長固定 `ue` コメントで最終 `10px` テクスチャ描画段階を追加し、縦潰れを軽減。
- `v3.1.10`: 同一時刻の `full` / `mincho` / 複数行コメント群で、行数の少ない同期レイヤーが上側に圧縮される問題を修正。
- `v3.1.11`: `full` / `mincho` / 複数行コメント群のテクスチャ高さ、Y パディング、`full` vpos lead を再校正。
- `v3.1.12`: 高さ別の内部テクスチャ生成を再校正し、ゾーマ系の大規模コメントアートで外枠だけ合う問題を抑制。
- `v3.1.19`: `full` / `mincho` 同期レイヤーで、非空行1本のコメントを一律に狭いテクスチャへ落としていた判定を修正。
- `v3.1.20`: `naka` の使用可能レーン数を1段ぶん保守的にし、最下段へ逃がしすぎる問題を抑制。
- `v3.1.21`: 空きレーンが無い場合の fallback を先頭 lane ではなく末尾 lane へ逃がすよう変更。
- `v3.1.22`: 内部デバッグ snapshot に `preCollisionDurationMs` / `virtualStartX` / `exitThreshold` / `bufferWidth` / `reservationWidth` を追加。
- `v3.1.23`: 通常スクロールコメントの `reservationWidth` を描画テクスチャ幅寄りへ補正。

