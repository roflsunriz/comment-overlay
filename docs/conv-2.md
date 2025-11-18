ログありがとう、これかなりいい感じの一歩目です。
この compact ログから「分かること」と「まだ分からないこと」を整理しつつ、次の計測ポイントを決めましょう。

---

## 1. 今回のログから読み取れること

ざっくりタイムラインだけ抜き出すと：

* `vt` = videoTime(ms), `rt` = rendererTime(ms), `ep` = epochId, `ps` = paused フラグ
* totalComments `tc` は途中から 2523 に固定

### ざっくり時系列

（数字は `vt`=videoTime）

* `vt=0` 付近

  * `hardReset-before`（ep:1）
  * 直後の frame で `ep:2` に変化（hardReset 内部で epoch を進めている）
  * `canplay`, `resetState` イベント
  * ここから `tc` が 0 → 2523 に増える（コメントロード完了）

* `vt=0 → ~0`（まだ停止中）

  * `ps: true` のまま frame が続く
  * `tc=2523` だが vt は 0 のまま（再生前）

* `vt≈14` で `ps:false` になり再生開始

  * `play` イベントが発火
  * 以降 `vt` と `rt` はほぼ一致して単調増加し続ける（~18 秒まで）

* 再生中に何度かイベント

  * `resize` イベント：`vt ≈ 2115, 5715, 9465` あたり
  * `hardReset-before/after`：

    * `vt ≈ 3028` → `ep:3`
    * `vt ≈ 5040` → `ep:4`
    * `vt ≈ 5548` → `ep:5`
    * `vt ≈ 8857` → `ep:6`
  * その間ずっと `tc=2523` のまま

**重要ポイント：**

* `vt` と `rt` がほぼ一致し、常に単調増加している
  → **timeSource 周り・pause/resume の同期は概ね正常**。
* `ps` も `true → false` の1回切り替えで筋が通っている
  → 「pause のまま進み続ける」「play のまま止まる」系のバグではなさそう。
* `hardReset` のたびに `epochId` は確実に +1 されるが、`tc` は 2523 のまま
  → hardReset で **canvas/レイアウト状態はリセットされるが、コメント集合そのものは保持**されている。

このログだけを見る限り、

* 「currentTime が 8,000 秒バグる」「pause/resume で時刻が飛ぶ」「epoch が変なタイミングで巻き戻る」

といった **時間管理系の致命的な破綻は起きていない** と言ってよさそうです。

---

## 2. 今のログで“見えていない”もの

逆にいうと、今回の compact ログには次が入っていません：

* `activeComments.size`（このフレームで描画対象と認識しているコメント数）
* そのアクティブコメントの vpos 範囲

  * `minEffectiveVpos`, `maxEffectiveVpos` みたいなやつ
* コメント1件ずつの

  * `text` / `effectiveVpos` / `lane` / `x` / `isScrolling` / `hasShown`

`ac` フィールドが常に `0` になっているので、
少なくとも **compact 側では active コメント数がまだ正しく計測できていない** ことが分かります。

そのため、いまのログからは

> 「アーティファクトが出ているフレームで、エンジンが内部的には何コメントを `active` とみなしているか？」

が分からず、

* 「canvas だけ綺麗に消しきれていない」のか
* 「activeComments/set の中身がおかしくて、ありえないコメントを描き続けている」のか

を **切り分けできない状態** です。

---

## 3. このログから消せる仮説・残る仮説

### 消してよさそうな仮説

1. **timeSource / currentTime 暴走系**

   * `vt` と `rt` が最後までほぼ一致している
   * ハードリセットの前後でも大きくジャンプしない
     → 「8,000秒に飛ぶ」「マイナスに飛ぶ」系ではない。

2. **pause フラグの取り扱いミス**

   * `ps` の遷移が「最初だけ true → 再生開始時に false」で噛み合っている
   * play/pause イベントと矛盾した動きは見えない

### まだ怪しいまま残る仮説

1. **コメント回収ロジック（active 決定）がバグっている**

   * `this.activeComments` から外す条件
   * `getCommentsInTimeWindow` / `ACTIVE_WINDOW_MS` / `EDGE_EPSILON` 周り
   * `hasShown` / `isActive` / `finalPhaseVposOverrides` の組み合わせ

2. **レーン予約・prune 周りのバグで「ゴースト予約」が残る**

   * `lanes-activation.ts`, `lanes-prune.ts`, `lanes-reservations.ts`
   * 一時停止・リサイズ・シークで予約が中途半端に残って
     已む無くアクティブ扱いになってしまうパターン

3. **drawImpl は毎フレーム clear しているが、activeComments に変なのが残っている**

   * `render.ts` を見る限り

     ```ts
     if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering() || this.isStalled) {
       context.clearRect(0, 0, effectiveWidth, effectiveHeight);
       ...
       return;
     }

     context.clearRect(0, 0, effectiveWidth, effectiveHeight);
     const activeComments = Array.from(this.activeComments);
     ...
     ```

     なので、**canvas の未クリア自体は起こりにくい**構造。
   * よって「アーティファクト」は

     * 「本来 inactive にすべきコメントが activeComments に残り続けている」
     * または「hasShown / finalPhase 系のフラグで誤って再描画され続ける」
       可能性が高い。

---

## 4. 次にやるべき計測（activeComments を見る）

今の compact だけだと、どうしても「コメント集合が壊れているのか／いないのか」が分からないので、
**次のログでは最低限これを足したい**です：

### 4.1 compact に追加したいフィールド案

frame ログ（`k: "frame"`）に：

* `ac`: `renderer.activeComments.size`
  → いま常に `0` なので、ここを本物にしたい
* `acMinVpos`, `acMaxVpos`:

  * `Array.from(renderer.activeComments)` の `getEffectiveCommentVpos(c)` の min/max
* 余裕があれば

  * `acMinLane`, `acMaxLane`
  * `acHasScrolling`: スクロール系コメントが混ざっているか bool

`hardReset-before` の直前数フレームで、

* vt が何秒で、
* そのタイミングで activeComments が何件いて、
* その vpos 範囲がどこか（例: `vt=8000ms なのに acMinVpos=1000ms` とか）

が分かれば、「コメント回収が壊れてる」かどうかを一気に絞れます。

### 4.2 raw 側にはサンプルコメントを数件だけ入れる

raw JSON（自分用の方）には、`hardReset-before` の前後だけでいいので、

* `activeComments` から 2〜3件

  * `id`（インデックスでも可）
  * `text`（10〜20文字くらいに truncate）
  * `effectiveVpos`
  * `lane`
  * `x`
  * `isScrolling`
  * `hasShown`

あたりを入れておくと、

* 「既に画面の外に出ているはずの vpos のものが、いまだに lane を持って描画されている」
* みたいな **具体的な壊れ方のパターン** まで見えます。

compact にはそこまでは要らなくて、

* `ac`, `acMinVpos`, `acMaxVpos` だけでもかなり強いです。

---

## 5. どう組み込むかのイメージ（方針レベル）

実装イメージだけ書きます（diff はまだ出さないでおきます。ac の wiring が終わったら、それを見てから最小パッチを作った方が安全そうなので）

### overlay-tests/app.js（または専用 profiler ファイル）

* `renderer` 作成直後に、毎フレーム呼ばれる箇所にフックを挟む

  ```js
  const origDraw = renderer.draw.bind(renderer);
  renderer.draw = () => {
    const activeComments = renderer.activeComments
      ? Array.from(renderer.activeComments)
      : [];
    const vposes = activeComments.map((c) =>
      renderer.getEffectiveCommentVpos(c)
    );
    const ac = activeComments.length;

    pushOverlaySample({
      kind: "frame",
      videoTimeMs: video.currentTime * 1000,
      rendererTimeMs: renderer.currentTime,
      epochId: renderer.epochId,
      totalComments: renderer.comments.length,
      activeCount: ac,
      acMinVpos: vposes.length ? Math.min(...vposes) : null,
      acMaxVpos: vposes.length ? Math.max(...vposes) : null,
      // 既存の dw/dh などもそのまま
    });

    return origDraw();
  };
  ```

* `hardReset-before` を押すタイミングは、今と同じで OK
  → 視覚的に「おかしい」と気付いたときに押してもらい、その瞬間の state をロガーが記録。

---

## 6. このログに対する現時点の結論

* **良いニュース**

  * 時刻管理・pause/play の整合性はかなり健全に見える。
  * `hardReset` の epoch リセットも、ログ上は素直に動いている。
* **まだ残っている問題の心臓部**

  * 「コメント回収（activeComments 決定）周り」が壊れているかどうかは
    今のログでは判断できない。
  * `ac` が常に 0 なので、**内部でコメントをどう扱っているかが丸見えになっていない**。

---

## 7. 次の一手（TODO）

あなた側での次アクションを整理すると：

1. `ac` を本当に `renderer.activeComments.size` にするよう compact ログを拡張する
2. 可能なら `acMinVpos`, `acMaxVpos` も compact に入れる
3. 「アーティファクトが出たタイミング」で `hardReset-before` を押す運用はそのまま続ける
4. その状態で、**アーティファクトが再現したセッションの compact ログ** をもう1本出す

そこまで来れば、

* 「hardReset 直前の frame で、`vt` に対して `acMin/MaxVpos` がどうズレているか」
* 「activeComments が増えっぱなしなのか、妙な残り方をしているのか」

が定量的に見えるので、
今度は「推測」ではなく、

> `getCommentsInTimeWindow` or `pruneLaneReservations` のこの if 文がおかしい

みたいな **具体ファイル／具体条件レベル** まで踏み込んだパッチを出せます。

---

というわけで、このログ自体は「時間管理は問題なさそう」という枝刈りにはかなり効いています。
次は activeComments 周りを覗きに行きましょう。
