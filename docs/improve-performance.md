了解。手元の `comment-overlay.zip`（`src/core/comment-renderer.ts` ほか）をざっと読んだ前提で、実装に即したパフォーマンス改善案を「難度 / 効果度 / リグレ可能性」を [大/中/小] で評価して列挙します。最後に“最小差分パッチ”を3点だけ添付します（すぐ効くやつ）。

---

## すぐ効く（コアループ最適化）

* **時間インデックス導入（毎フレームの全探索をやめる）**
  現状 `updateComments()` が `this.comments` を毎フレーム全走査しています。`vposMs` 昇順で既に保持しているので、`currentTime` を中心に `ACTIVE_WINDOW_MS` の範囲だけを **二分探索で下限/上限を求めて** その区間だけ評価すれば OK。コメント数が多いほど効きます。
  難度: **中** / 効果: **大** / リグレ: **中**（境界条件・シーク時の窓取りミスに注意）

* **NG判定の事前計算 & 正規表現の事前コンパイル**
  `isNGComment()` が毎回 `new RegExp(pattern)` しており高コスト。設定変更時だけ RegExp 配列を更新し、`addComment()` 時に `comment.ng = true/false` を焼き込む。設定が変わったら “要再評価” フラグで差分更新。
  難度: **中** / 効果: **大** / リグレ: **小**（設定変更タイミングの再評価を忘れない）

* **文字幅計測（`ctx.measureText`）のキャッシュ**
  `Comment.prepare()` 内で毎回長文計測しています。`fontKey(= fontFamily + fontSize + style)` と `text` をキーに `Map` キャッシュ。`syncWithSettings()` で font が変わったらキャッシュキーも変わるので整合します。
  難度: **小** / 効果: **中〜大** / リグレ: **小**

---

## 描画パスの削減・安定化

* **アクティブ配列の維持**
  `draw()` 内で `this.comments.filter(c => c.isActive)` は都度 O(N)。`activeComments` を Set/配列で保持し、状態遷移時に追加/削除する方式へ。
  難度: **中** / 効果: **中** / リグレ: **中**

* **状態変更のバッチング**
  `syncWithSettings()` が評価ループ中に頻発しうる設計。`settingsVersion` を持ち、変更検知時のみ全コメントへ一括同期。それ以外のフレームでは呼ばない。
  難度: **小** / 効果: **中** / リグレ: **小**

* **`clearRect` の範囲最小化**
  毎フレーム全クリア→全再描画は安定だが重い。`isPlaying` かつスクロールのみ動くなら左右の**ダーティ領域**だけクリア（ただし実装コストは上がる）。まずは現状維持で OK、余力あれば。
  難度: **大** / 効果: **中** / リグレ: **大**

---

## レーン & 衝突解決のコスト削減

* **レーン予約のスパース化**
  `reservedLanes` の各配列を “時刻昇順” で維持し、期限切れを二分探索でまとめて破棄（いまは逐次）。
  難度: **中** / 効果: **中** / リグレ: **小**

* **スクロールと静止で別キュー**
  いま同一ループで両方を扱っているため分岐が多い。`naka`（スクロール）と `ue/shita`（静止）で別のアクティベーション・キューを持ち、各々のロジックを簡素化するとヒットテストが軽くなる。
  難度: **中** / 効果: **中** / リグレ: **中**

---

## メモリ割り当ての削減

* **小オブジェクトのプール**
  `LaneReservation` や一時オブジェクトの再利用（オブジェクトプール）で GC 圧を下げる。
  難度: **中** / 効果: **小〜中** / リグレ: **中**

* **`Array.prototype.sort` の回数削減**
  `addComment()` で毎回 `sort`。バルク追加 API（例：`addCommentsSorted()`）を用意し、まとまった投入時は一度だけ sort か、既ソートなら二分挿入。
  難度: **小** / 効果: **中** / リグレ: **小**

---

## スケジューリングと同期

* **`requestVideoFrameCallback` の徹底活用 + フォールバック調整**
  既に `syncMode: "video-frame"|"raf"` を持っているが、映像が停止/不可視のときは描画停止、早送り/シーク中は**フレーム間引き**（更新はしても描画は N フレームに1回）。
  難度: **小** / 効果: **中** / リグレ: **小**

* **不可視タブでの停止**
  `document.visibilityState` 監視で不可視時は `stopAnimation()`。
  難度: **小** / 効果: **小〜中** / リグレ: **小**

---

## 文字描画の高コスト対策

* **アウトライン描画の回数削減**
  `renderStyle: "classic"|"outline-only"` があるので、アウトラインはパス再利用 or 影描画を避け Path2D キャッシュ（fontKey + text）。
  難度: **中** / 効果: **中** / リグレ: **中**

* **オフスクリーンでのテキスチャ化**
  頻出コメント（AA/職人系）を `OffscreenCanvas` でビットマップ化し、`drawImage`。
  難度: **大** / 効果: **中〜大** / リグレ: **中**

---

## 並列化

* **レイアウト計算の Worker 化**
  `prepare()`（幅計測除く）・レーン解決の一部を Worker にオフロードしてメインスレッドは描画専念（`OffscreenCanvas` 併用も選択肢）。
  難度: **大** / 効果: **中〜大** / リグレ: **中〜大**

---

## プロファイリングと守り

* **計測ポイントの常設**
  1フレームの `update` / `draw` / `measureText` 回数 / `NG判定` 回数 / `activate` 回数を `debug.ts` にカウンタ実装（既存の `debugLog` と親和）。
  難度: **小** / 効果: **中** / リグレ: **小**

---

# 最小差分パッチ（3点）

> 前提：大きなリファクタを避け、現行の構造を崩さずに“まず効く”ものだけ。

### 1) NG正規表現の事前コンパイル & 事前評価フラグ

```diff
*** a/src/core/comment-renderer.ts
--- b/src/core/comment-renderer.ts
@@
 export class CommentRenderer {
+  private ngRegexpsCompiled: RegExp[] = [];
+  private settingsVersion = 0;
+  private lastAppliedSettingsVersion = -1;
@@
   set settings(value: RendererSettings) {
-    this._settings = normalizeSettings(value);
+    this._settings = normalizeSettings(value);
+    // 設定更新を検知
+    this.settingsVersion++;
+    // 正規表現は事前にコンパイル
+    this.ngRegexpsCompiled = Array.isArray(this._settings.ngRegexps)
+      ? this._settings.ngRegexps.flatMap((p) => {
+          try {
+            return typeof p === "string" && p.length > 0 ? [new RegExp(p)] : [];
+          } catch {
+            return [];
+          }
+        })
+      : [];
   }
@@
-  isNGComment(text: string): boolean {
+  private isNGCommentRuntime(text: string): boolean {
@@
-          try {
-            return new RegExp(pattern).test(text);
-          } catch (regexError) {
-            this.log.error("CommentRenderer.isNGComment.regex", regexError as Error, {
-              pattern,
-              text,
-            });
-            return false;
-          }
+          return this.ngRegexpsCompiled.some((re) => re.test(text));
@@
   }
@@
   addComment(text: string, vposMs: number, commands: string[] = []): Comment | null {
@@
-    if (this.isNGComment(text)) {
+    if (this.isNGCommentRuntime(text)) {
       debugLog("comment-skip-ng", { preview, vposMs });
       return null;
     }
@@
     const comment = new Comment(
       text,
       normalizedVposMs,
       commands,
       this._settings,
       this.commentDependencies,
     );
+    // 設定変更に追従できるよう各コメントへ設定適用のバージョン印を持たせる
+    (comment as any).__settingsVersion = this.settingsVersion;
@@
   private updateComments(frameTimeMs?: number): void {
@@
+    // 設定が更新された場合のみ一括同期（毎フレームの sync を避ける）
+    if (this.lastAppliedSettingsVersion !== this.settingsVersion) {
+      this.comments.forEach((c) => {
+        c.syncWithSettings(this._settings);
+        (c as any).__settingsVersion = this.settingsVersion;
+      });
+      this.lastAppliedSettingsVersion = this.settingsVersion;
+    }
```

### 2) `measureText` キャッシュ（同一 fontKey + text で再利用）

```diff
*** a/src/core/comment.ts
--- b/src/core/comment.ts
@@
 export class Comment {
@@
   private width = 0;
+  private _measureCacheKey: string | null = null;
+  private static _textWidthCache = new Map<string, number>();
@@
   prepare(
     ctx: CanvasRenderingContext2D,
     visibleWidth: number,
     options: CommentPrepareOptions,
   ): void {
@@
-      this.width = ctx.measureText(lines[0] ?? this.text).width;
+      const fontKey = ctx.font + "|" + (this.letterSpacing ?? 0);
+      const key = fontKey + "§" + (lines[0] ?? this.text);
+      if (this._measureCacheKey !== key) {
+        let w = Comment._textWidthCache.get(key);
+        if (w == null) {
+          w = ctx.measureText(lines[0] ?? this.text).width;
+          Comment._textWidthCache.set(key, w);
+        }
+        this.width = w;
+        this._measureCacheKey = key;
+      }
@@
-      const maxReservationWidth = ctx.measureText("??".repeat(150)).width;
+      // これもキャッシュ
+      const maxKey = fontKey + "§" + "??".repeat(150);
+      let maxReservationWidth = Comment._textWidthCache.get(maxKey) ?? 0;
+      if (maxReservationWidth === 0) {
+        maxReservationWidth = ctx.measureText("??".repeat(150)).width;
+        Comment._textWidthCache.set(maxKey, maxReservationWidth);
+      }
```

### 3) `updateComments` の二分探索ウィンドウ（全走査排除）

```diff
*** a/src/core/comment-renderer.ts
--- b/src/core/comment-renderer.ts
@@
   private updateComments(frameTimeMs?: number): void {
@@
-    for (const comment of this.comments) {
+    // vposMs 昇順前提：アクティブ窓のみ走査
+    const start = this.currentTime - ACTIVE_WINDOW_MS;
+    const end   = this.currentTime + ACTIVE_WINDOW_MS;
+    const arr = this.comments;
+    // 下限
+    let lo = 0, hi = arr.length;
+    while (lo < hi) {
+      const mid = (lo + hi) >>> 1;
+      if (arr[mid].vposMs >= start) hi = mid; else lo = mid + 1;
+    }
+    const from = lo;
+    // 上限（最初に end より大きい位置）
+    lo = from; hi = arr.length;
+    while (lo < hi) {
+      const mid = (lo + hi) >>> 1;
+      if (arr[mid].vposMs > end) hi = mid; else lo = mid + 1;
+    }
+    const to = lo;
+    for (let i = from; i < to; i++) {
+      const comment = arr[i];
@@
-    }
+    }
   }
```

---

## 小さく始める TODO（適用順）

1. ②`measureText`キャッシュ → ①NG事前コンパイル → ③時間窓の二分探索（この順が安全で効果大）
2. `settingsVersion` の導入に合わせて、毎フレームの `syncWithSettings` 呼び出しを撤去
3. `activeComments` の Set 化（`isActive` 遷移箇所で add/remove）
4. バルク追加 API（`addCommentsSorted()`）を追加し、テストデータ投入で `sort` を1回に

---

## 想定効果（目安）

* コメント 5万件 / 60fps / 1080p 環境

  * **全走査→窓走査**：`O(5万)` → `O(窓幅内の数千)` に。シーンによっては **10〜30倍** 短縮。
  * **measureText キャッシュ**：同一フォント・同一文言の繰り返し（AA/職人系）で計測回数を桁落ち。**CPU 使用率 数％→1％未満** も狙える。
  * **NG 判定の事前化**：正規表現コンパイルのフレーム負荷ゼロ化。

---

## リグレ注意点（テスト観点）

* シーク直後の“取りこぼし”

  * 二分探索の窓が狭いと取りこぼす。`ACTIVE_WINDOW_MS` は現状値を維持し、**シーク方向誤判定**（`SEEK_DIRECTION_EPSILON_MS`）周りの条件はそのまま再利用。
* 設定変更直後の反映遅延

  * `settingsVersion` で一括再同期するため、**1フレーム遅延**は仕様に。目視不可レベル。
* `measureText` キャッシュの無効化

  * `font`・`letterSpacing` をキーに入れているので UI 変更で確実に更新。ブラウザ差（DPR変更など）でも `ctx.font` が変わるため安全。

---

必要なら、これをベースに **プロファイル用の軽量カウンタ**（1フレーム内の `prepare/draw/measure` 回数や `activate` 件数）も差分で出します。テストが落ちる／実測が伸びない箇所があれば、次の一手（アクティブ配列の Set 化・レーン予約の二分探索化・OffscreenCanvas）に進めましょう。
