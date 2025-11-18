# COOverlayProfiler v2 改善サマリー

## 改善の背景
`conv-2.md` の分析により、初期版のプロファイラーでは以下の問題が判明：

1. **`ac` (activeCount) が常に `0`**
   - `renderer.activeComments.size` の実値が取れていない
   - コメント回収バグの切り分けができない

2. **アクティブコメントの vpos 範囲が不明**
   - 「古いコメントが残留しているか」を判定できない
   - 「`vt=10,000ms` なのに `vpos=1,000ms` のコメントが active」といった異常を検出できない

3. **詳細なコメント情報が不足**
   - hardReset 前後でどんなコメントが残っているか不明
   - `hasShown` / `lane` / `x` などの状態が見えない

## 🆕 追加フィールド

### Compact JSON（分析用）
```javascript
{
  // 既存フィールド
  "ac": 15,              // activeCount（実値に修正）
  
  // 新規追加
  "acMinVpos": 4500,     // アクティブコメントの最小vpos
  "acMaxVpos": 6500,     // アクティブコメントの最大vpos
  "acMinLane": 0,        // 最小レーン番号
  "acMaxLane": 7,        // 最大レーン番号
  "acHasScroll": true    // スクロール系コメント含む
}
```

### Raw JSON（詳細調査用）
hardReset前後のイベントには `sampleComments` が追加される：

```javascript
{
  "sampleComments": [
    {
      "idx": 0,
      "text": "これはテストコメントです...",  // 30文字まで
      "vposMs": 5000,
      "effectiveVpos": 5100,
      "lane": 3,
      "x": 960,
      "isScrolling": true,
      "hasShown": false
    },
    // ... 最大5件
  ]
}
```

## 実装の詳細

### 1. `captureRendererState()` の拡張
- `renderer.activeComments` から Set を配列化
- `getEffectiveCommentVpos()` で各コメントの vpos を計算
- min/max/lane 範囲を集計
- オプションで詳細情報（sampleComments）を含める

### 2. hardReset フックの改善
```javascript
renderer.hardReset = () => {
  // 🆕 詳細情報を含めて記録
  pushOverlaySample({
    kind: "event",
    event: "hardReset-before",
    ...captureRendererState({ includeCommentDetails: true }),
  });
  
  const result = originalHardReset();
  
  setTimeout(() => {
    pushOverlaySample({
      kind: "event",
      event: "hardReset-after",
      ...captureRendererState({ includeCommentDetails: true }),
    });
  }, 16);
  
  return result;
};
```

## 分析の流れ（改善版）

### Before（v1）
```
症状: アーティファクトが出た
↓
ログ確認: ac=0, vt と rt は正常
↓
結論: 「時間管理は正常っぽい」止まり
```

### After（v2）
```
症状: アーティファクトが出た
↓
ログ確認: 
  vt=10,000ms
  ac=50
  acMinVpos=1,000ms  ← ★異常！
  acMaxVpos=3,000ms  ← ★異常！
↓
結論: 
  「古いコメント（vpos 1,000〜3,000）が
   activeComments に残り続けている」
  → comments.ts の回収ロジックを疑う
↓
Raw JSON で sampleComments を確認:
  { text: "test", effectiveVpos: 1500, hasShown: true }
  → 「hasShown=true なのに active」が確認できた
↓
具体的なパッチ:
  getCommentsInTimeWindow の条件分岐を修正
```

## 検出できるバグパターン

### パターン1: コメント回収漏れ
```json
{
  "vt": 10000,
  "ac": 30,
  "acMinVpos": 1000,  // vt より 9秒古い！
  "acMaxVpos": 3000   // vt より 7秒古い！
}
```
→ `ACTIVE_WINDOW_MS` の計算ミス or 回収条件の不備

### パターン2: 異常なレーン占有
```json
{
  "vt": 5000,
  "ac": 3,              // 少ないのに
  "acMinLane": 0,
  "acMaxLane": 15       // レーンを広範囲に占有
}
```
→ `pruneLaneReservations` が機能していない

### パターン3: スクロール完了済みコメントの残留
```json
{
  "vt": 20000,
  "ac": 5,
  "acHasScroll": true,
  "sampleComments": [
    {
      "effectiveVpos": 15000,
      "hasShown": true,    // 表示完了済み
      "x": -500            // 画面外
    }
  ]
}
```
→ `finalPhaseVposOverrides` の判定ミス

## 使い方の変更

### コンソール出力
初期化時に表示されるメッセージが拡張されました：

```
[COOverlayProfiler] 初期化完了。使い方:
  COOverlayProfiler.getStats() - 統計情報を表示
  COOverlayProfiler.downloadCompact() - コンパクトJSON（分析用、ac/acMinVpos含む）
  COOverlayProfiler.downloadRaw() - 詳細JSON（調査用、sampleComments含む）
  COOverlayProfiler.clear() - サンプルをクリア

📊 新規追加フィールド:
  ac: activeComments.size（実値）
  acMinVpos/acMaxVpos: アクティブコメントのvpos範囲
  acMinLane/acMaxLane: レーン範囲
  acHasScroll: スクロール系コメントの有無
```

### ダウンロードの推奨順序
1. **Compact JSON を最初にダウンロード** → 全体像を把握
2. **異常パターンを発見** → `ac` と `acMinVpos/acMaxVpos` の乖離を確認
3. **Raw JSON で詳細調査** → `sampleComments` で具体的なコメントを確認

## 期待される効果

### Before（v1）
- 時間管理の健全性は確認できた
- ただし「コメント回収が壊れているか」は不明
- 推測ベースの修正提案しかできない

### After（v2）
- ✅ **activeComments の実態を定量観測可能**
- ✅ **vpos 範囲のズレを数値で検出可能**
- ✅ **具体的なコメントの状態（hasShown/lane/x）を確認可能**
- ✅ **「推測」ではなく「証拠に基づく修正」が可能**

## 次のステップ

1. ✅ プロファイラー v2 実装完了
2. ⏭️ **アーティファクト再現 → Compact JSON 取得**
3. ⏭️ **`ac` / `acMinVpos` / `acMaxVpos` を確認**
4. ⏭️ **異常があれば Raw JSON で `sampleComments` を確認**
5. ⏭️ **JSON をモデルに提示 → 具体的なコードパス特定**
6. ⏭️ **最小差分パッチで修正**

## まとめ

v2 の最大の改善点は、**「コメント回収ロジックの観測可能性」を獲得したこと**です。

これにより、
- 「なんとなくおかしい」→「vt=10,000 なのに acMinVpos=1,000 で 9秒のズレ」
- 「推測で修正」→「ログから `getCommentsInTimeWindow` の条件分岐を特定」

という、エンジニアリング的に正しいデバッグフローが確立されました。

