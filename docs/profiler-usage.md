# COOverlayProfiler 使用ガイド

## 概要
`COOverlayProfiler` は、comment-overlay エンジンのコメントアーティファクト問題を解決するための観測デバッグツールです。
renderer と video の状態をフレームごと・イベントごとに記録し、JSON として出力できます。

## 目的
- **推測デバッグから観測デバッグへ移行**
- アーティファクト発生時の正確な状態を記録
- ログデータに基づいた的確なバグ解決

## セットアップ

### 1. ビルド＆起動
```powershell
# プロジェクトルートで
npm run build

# overlay-tests ディレクトリに移動してサーバー起動
cd overlay-tests
npx http-server -p 8080 -c-1
```

### 2. ブラウザでアクセス
```
http://localhost:8080
```

## 使い方

### UIから操作
デバッグプロファイラーのパネルに以下のボタンがあります：

- **統計表示** - 現在記録されているサンプル数を確認
- **Compact JSON** - コンパクトなJSON形式でダウンロード（分析用）
- **Raw JSON** - 詳細な生データをダウンロード（調査用）
- **クリア** - 記録されたサンプルを全削除

### コンソールから操作
開発者コンソールで以下のAPIが利用可能です：

```javascript
// 統計情報を表示
COOverlayProfiler.getStats()
// => { total: 1234, frames: 1150, events: 84, firstTs: 123.45, lastTs: 56789.01 }

// Compact JSON をダウンロード
COOverlayProfiler.downloadCompact()

// Raw JSON をダウンロード（全フィールド含む）
COOverlayProfiler.downloadRaw()

// 生データを取得（プログラムで処理する場合）
const rawData = COOverlayProfiler.getRaw()

// サンプルをクリア
COOverlayProfiler.clear()
```

## 記録される情報

### フレームサンプル（kind: "frame"）
毎フレーム（最初60フレーム + その後10フレームごと）に記録：

#### 基本情報
- `ts` - タイムスタンプ（performance.now()）
- `videoTimeMs` - video.currentTime（ミリ秒）
- `rendererTimeMs` - renderer内部の時刻
- `epochId` - エポックID（内部キャッシュ管理用）
- `totalComments` - 登録されているコメント総数
- `displayWidth/displayHeight` - 表示サイズ
- `canvasWidth/canvasHeight` - Canvas実サイズ
- `playbackRate` - 再生速度
- `isPaused` - 一時停止状態

#### activeComments 情報（🆕改善版）
- `activeCount` - `renderer.activeComments.size` の実値
- `acMinVpos` - アクティブコメントの最小 vpos（ms）
- `acMaxVpos` - アクティブコメントの最大 vpos（ms）
- `acMinLane` - アクティブコメントの最小レーン番号
- `acMaxLane` - アクティブコメントの最大レーン番号
- `acHasScrolling` - スクロール系コメントが含まれているか

#### 詳細情報（Raw JSONのみ、hardReset前後など）
- `sampleComments` - アクティブコメントの先頭5件のサンプル
  - `idx` - インデックス
  - `text` - コメント本文（30文字まで）
  - `vposMs` - 元の vpos
  - `effectiveVpos` - 有効 vpos（計算後）
  - `lane` - レーン番号
  - `x` - X座標
  - `isScrolling` - スクロール系か
  - `hasShown` - 表示済みフラグ

### イベントサンプル（kind: "event"）
以下のイベント発生時に記録：

- `play` - 再生開始
- `pause` - 一時停止
- `seeked` - シーク完了
- `ratechange` - 再生速度変更
- `waiting` - ストール開始
- `canplay` - ストール解除
- `resize` - ウィンドウリサイズ
- `hardReset-before` - hardReset呼び出し前
- `hardReset-after` - hardReset呼び出し後
- `resetState` - resetState呼び出し

## デバッグワークフロー

### ステップ1：再現手順の固定
1. アーティファクトが発生する操作を特定（例：リサイズ、pause-resume）
2. その操作を繰り返し実行できるようにする

### ステップ2：状態の記録
1. ブラウザで overlay-tests を開く
2. プロファイラーをクリア（初期状態から記録）
3. アーティファクトが発生する操作を実行
4. Compact JSON をダウンロード

### ステップ3：ログ分析
ダウンロードしたJSONを確認：

#### Compact JSON フォーマット
```json
[
  {
    "k": "frame",        // kind
    "t": 12345,          // timestamp
    "vt": 5000,          // videoTimeMs
    "rt": 5010,          // rendererTimeMs
    "ac": 15,            // activeCount（🆕実値）
    "tc": 1234,          // totalComments
    "ep": 1,             // epochId
    "ev": null,          // event (イベントサンプルのみ)
    "dw": 960,           // displayWidth
    "dh": 540,           // displayHeight
    "cw": 1920,          // canvasWidth
    "ch": 1080,          // canvasHeight
    "pr": 1,             // playbackRate
    "ps": false,         // isPaused
    "acMinVpos": 4500,   // 🆕 activeComments の最小vpos
    "acMaxVpos": 6500,   // 🆕 activeComments の最大vpos
    "acMinLane": 0,      // 🆕 最小レーン
    "acMaxLane": 7,      // 🆕 最大レーン
    "acHasScroll": true  // 🆕 スクロール系含む
  }
]
```

#### 分析観点

**🆕 ケースA: activeComments の回収バグ（最重要）**
- `vt` = 10,000ms なのに `acMinVpos` = 1,000ms, `acMaxVpos` = 3,000ms
  → **古いコメントが activeComments から回収されていない**
  → `comments.ts` の `getCommentsInTimeWindow` / `ACTIVE_WINDOW_MS` を疑う
- `ac` が増え続けている（減らない）
  → `pruneLaneReservations` や `cleanup` が機能していない

**🆕 ケースB: vpos範囲の異常な広がり**
- `ac` = 5 件なのに `acMinVpos` = 0, `acMaxVpos` = 60,000
  → スクロール完了済みの古いコメントが残留
  → `hasShown` / `finalPhaseVposOverrides` の判定ミス

**ケースC: Canvas がおかしい（可能性低）**
- `vt`, `rt`, `ac`, `acMinVpos/acMaxVpos` 全て正常
- でもアーティファクトが残る
→ `drawImpl` 内の clearRect / canvas サイズ管理を疑う

**ケースD: 時間がズレている（可能性低）**
- `pause` → `play` で `vt` と `rt` が大きく乖離
→ `timing.ts` の offset 計算を疑う

**ケースE: hardReset 前後の差分（原因特定用）**
- `hardReset-before`:
  - `ac` = 50, `acMinVpos` = 1000, `acMaxVpos` = 3000, `vt` = 10000
  - → **明らかに古いコメントが残っている**
- `hardReset-after`:
  - `ac` = 0, `epochId` が +1
  - → hardReset で一時的に解消
- **Raw JSON の `sampleComments`** を確認:
  - `hasShown: true` なのに `activeComments` に残っているコメントがあるか
  - `effectiveVpos` と `vposMs` の差異

### ステップ4：モデルに投げる
1. 症状の口頭説明
2. Compact JSON（または該当部分）
3. 必要に応じて Raw JSON の一部

これにより、モデルは「推測」ではなく「ログに基づく分析」を行えます。

## トラブルシューティング

### プロファイラーが動作しない
- `window.COOverlayProfiler` がコンソールで `undefined` の場合
  → `app.js` のロードに失敗している可能性。ブラウザのコンソールエラーを確認

### サンプル数が増えない
- `getStats()` で `frames: 0` の場合
  → renderer.draw が呼ばれていない可能性。動画が再生されているか確認

### ダウンロードしたJSONが空
- `clear()` を実行した直後か、ページをリロードした場合
  → サンプルはメモリ上にのみ保持されるため、リロード前にダウンロード必須

## 注意事項
- プロファイラーはメモリ上にサンプルを蓄積するため、長時間記録すると大量のメモリを消費します
- 本番環境には含まれません（`overlay-tests` 専用）
- ページリロードでサンプルは消えるため、定期的にダウンロード推奨

## 次のステップ
1. 「resize で必ずアーティファクトが出るケース」の Compact JSON を取得
2. 「pause-resume で出るケース」の Compact JSON を取得
3. これらをモデルに提示して、具体的なコードパスを特定
4. 最小差分パッチを適用してバグ修正

