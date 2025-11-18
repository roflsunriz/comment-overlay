# コメント回収ロジック修正計画

## 診断結果の要約
- `vt=10,540ms` で `acMinVpos=0` → 10秒以上古いコメントが残留
- `hasShown: true` かつ `x < 0` → 画面外のコメントが回収されていない

## 発見した問題

### 問題1: activeComments のクリーンアップ欠如
**場所**: `src/renderer/activation.ts` `updateCommentsImpl`

**現状**:
```typescript
const activeWindowComments = this.getCommentsInTimeWindow(this.currentTime, ACTIVE_WINDOW_MS);
for (const comment of activeWindowComments) {
  // 時間窓内のコメントのみ処理
}
```

**問題**:
- 時間窓内のコメントしか評価しない
- すでに activeComments にいるが時間窓外のコメントは放置される
- → 古いコメント（vpos=0など）が永久に残る

**修正方針**:
- `activeWindowComments` ループの **前** に
- activeComments 全体をスキャンして時間窓外のコメントを削除

### 問題2: スクロール完了チェックが条件付き
**場所**: `src/renderer/activation.ts` line 160-173

**現状**:
```typescript
if (this.isPlaying) {  // ← 問題！
  for (const comment of this.comments) {
    if (comment.isActive && comment.isScrolling && 
        comment.x <= comment.exitThreshold) {
      this.activeComments.delete(comment);
    }
  }
}
```

**問題**:
- `isPlaying` が true のときだけ実行
- 一時停止中、リサイズ中はスクロール完了しても回収されない
- → `x < 0` のコメントが残り続ける

**修正方針**:
- `isPlaying` チェックを削除（常に実行）
- または、activeComments 全体をスキャンするロジックに統合

## 修正パッチ

### 修正1: activeComments のクリーンアップを追加

`src/renderer/activation.ts` の `updateCommentsImpl` に追加：

```typescript
// activeWindowComments ループの前に追加
// ==== activeComments の定期クリーンアップ ====
for (const comment of Array.from(this.activeComments)) {
  const effectiveVpos = this.getEffectiveCommentVpos(comment);
  const isPastWindow = effectiveVpos < this.currentTime - ACTIVE_WINDOW_MS;
  const isFutureWindow = effectiveVpos > this.currentTime + ACTIVE_WINDOW_MS;
  
  // 時間窓外のコメントを削除
  if (isPastWindow || isFutureWindow) {
    comment.isActive = false;
    this.activeComments.delete(comment);
    comment.clearActivation();
    if (comment.lane >= 0) {
      if (comment.layout === "ue") {
        this.releaseStaticLane("ue", comment.lane);
      } else if (comment.layout === "shita") {
        this.releaseStaticLane("shita", comment.lane);
      }
    }
    continue;
  }
  
  // スクロール完了したコメントを削除（isPlaying 条件を削除）
  if (comment.isScrolling && comment.hasShown) {
    const isOffScreen = 
      (comment.scrollDirection === "rtl" && comment.x <= comment.exitThreshold) ||
      (comment.scrollDirection === "ltr" && comment.x >= comment.exitThreshold);
    
    if (isOffScreen) {
      comment.isActive = false;
      this.activeComments.delete(comment);
      comment.clearActivation();
    }
  }
}
```

### 修正2: 既存のスクロール完了チェックを削除 or 統合

`activation.ts` line 160-173 の `if (this.isPlaying)` ブロックは
上記のクリーンアップで代替されるため削除可能。

または、そのまま残して二重チェックとして機能させても問題ない
（冗長だが安全性は高まる）。

## 検証方法

### Before（修正前）
```json
{
  "vt": 10540,
  "ac": 65,
  "acMinVpos": 0,      // ← 異常
  "acMaxVpos": 10490
}
```

### After（修正後期待値）
```json
{
  "vt": 10540,
  "ac": 15,            // ← 減少
  "acMinVpos": 6540,   // ← vt - 4000 程度（正常範囲）
  "acMaxVpos": 14540   // ← vt + 4000 程度（正常範囲）
}
```

### 確認項目
1. **acMinVpos が正常範囲内**
   - `acMinVpos >= vt - ACTIVE_WINDOW_MS` (約8000ms)
   
2. **acMaxVpos が正常範囲内**
   - `acMaxVpos <= vt + ACTIVE_WINDOW_MS` (約8000ms)
   
3. **sampleComments に異常なし**
   - `hasShown: true` かつ `x < 0` のコメントが存在しない

## 実装順序

1. ✅ 問題特定完了
2. ⏭️ `activation.ts` にクリーンアップロジックを追加
3. ⏭️ ビルド & 型チェック
4. ⏭️ overlay-tests で動作確認
5. ⏭️ Compact JSON で acMinVpos/acMaxVpos を確認
6. ⏭️ Raw JSON で sampleComments を確認

## リスク評価

### リスク: Low
- 追加するのは削除ロジックのみ
- 既存の追加ロジックには触れない
- 最悪の場合、コメントが早く消えすぎる（目視で気づける）

### ロールバック手順
```powershell
git checkout HEAD -- src/renderer/activation.ts
npm run build
```

