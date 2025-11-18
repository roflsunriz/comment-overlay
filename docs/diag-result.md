結論から言うと、**今取れているログだけでも「コメント回収ロジックが壊れている」ことはかなりハッキリ見えていて**、
もう「推測デバッグ」ではなく「ここを直せば良い」というレベルまで絞り込めています。

---

## 1. いまのログが教えてくれていること

### ① 再生中フレームの状態

`comment-overlay-debug-compact-1763429747604.json` から再生中のフレームを見ると：

* 例1: `vt` ≒ 10,540ms のフレームで

  * `activeCount`: 65
  * `acMinVpos`: 0
  * `acMaxVpos`: 10,490 
* 例2: `vt` ≒ 24,390ms のフレームで

  * `activeCount`: 29
  * `acMinVpos`: 7,250
  * `acMaxVpos`: 23,660 

つまり、

* 動画の現在時刻が 10.5 秒のときに、`vpos=0ms` のコメントがまだ active
* 動画の現在時刻が 24.4 秒のときに、`vpos=7.25s` のコメントがまだ active

になっています。

### ② sampleComments の中身

Raw JSON の `sampleComments` では、こういう状態のコメントが active に残っています：

* `vposMs: 0`
* `effectiveVpos: 0`
* `hasShown: true`  （＝もう一度表示する必要はない）
* `x`: すでに負の値（画面の左の外側まで流れきっている）

にもかかわらず、**まだ activeComments に残っている** ことが分かります。

---

### ③ ここから読み取れること

* **時間管理（`vt` と `rt` の一致）は正常** に見える
  → `videoTimeMs` と `rendererTimeMs` はほぼ同じ値で増加している 
* しかし、

  * 「スクロールし終わって画面外に消えたコメント」
  * 「`hasShown: true` で再表示不要なコメント」
* が **activeComments から回収されず、永続的に残っている**

ので、

> 「コメントの回収ロジックが壊れている」
> （`getCommentsInTimeWindow` / `ACTIVE_WINDOW_MS` / `finalPhaseVposOverrides` 周辺）

という最初の仮説そのものが、ログでほぼ裏付けられています。

---

## 2. 「hardReset 対症療法」から「根本治療」へどう進むか

いまやっていること：

* リサイズや pause→play のタイミングで `hardReset()` を叩く
* その結果、

  * `epochId` が増える
  * `activeCount` が 0 にリセットされる
* → 画面上のアーティファクトは消える

これは **「リークした activeComments を全部捨てているだけ」** なので、
根本原因（なぜリークするか）は残ったまま、という構造です。

---

## 3. どうアプローチすべきか（具体的なデバッグ戦略）

### ステップA: 「壊れているところ」を数値で定義する

コメント回収が正しく動いているなら、再生中フレームではおおよそ次のような関係が成立しているはずです：

* `vt` を「今の動画時刻」とする
* `VISIBLE_SCROLL_LIFETIME_MS` を「コメントが画面に存在し得る最大時間」とする（例: 4000〜6000ms）

このとき理想的には：

* `acMinVpos ≳ vt - VISIBLE_SCROLL_LIFETIME_MS`
* `acMaxVpos ≲ vt + FUTURE_PREFETCH_MS`（先読みしている分だけ少し未来も含んでいてOK）
* `sampleComments` 内に

  * `hasShown: true` かつ `x` が完全に画面外（負の値 or `> canvasWidth`）
    のものが **残っていない**

を満たすべきです。

**今のログはここが破綻している**ので、

* 「この不変条件を満たすように `activeComments` を pruneしていく」

という方針でコードを読んでいくのが、一番まっすぐなアプローチです。

---

### ステップB: どのケースで崩れているかを切り分ける

profiler の設計自体はすでに「観測デバッグのフロー」を持っているので、
それに完全に乗っかる形で進めるのがよさそうです。

1. **ケース1: 「普通に再生しているだけで」古いコメントが残る**

   * 今のログがほぼこれ
   * やること：

     * 再生開始 → 10秒〜30秒くらい流す
     * 何も操作せず `downloadCompact()`
     * `vt` と `acMinVpos/acMaxVpos` の差をざっと見る
   * ここで `vt - acMinVpos` が数秒以上開いていたら
     → 「表示し終わったコメントの回収漏れ」

2. **ケース2: pause→play / resize の瞬間から崩れる**

   * 手順：

     1. 再生しながらコメントがしっかり流れている状態まで進める
     2. 一時停止 (`pause` が event に記録される)
     3. ウィンドウリサイズ / フルスクリーン切替などアーティファクトが出やすい操作を行う
     4. 再生再開 (`play`) → アーティファクトが見えたら `downloadCompact()` / 必要なら `downloadRaw()`

   * 期待するログ：

     * `pause` イベント前後で `vt` と `rt` が破綻していないか
     * `resize` イベント前後で `displayWidth/Height` と `canvasWidth/Height` が変な組み合わせになっていないか
     * それでも **`acMinVpos` が古いままなら、根本はやっぱり回収ロジック**

3. **ケース3: `vt`, `acMinVpos`, `acMaxVpos` は正常なのにアーティファクトだけ残る**

   * この場合はじめて「canvas の clearRect / スケール管理が怪しい」という話になります。
   * でも、今のログを見ている限り、主犯はそれより前段の「activeComments の掃除」側です。

---

### ステップC: コードを読むときのフォーカスポイント

ソースを読むときに、いきなり全体を眺めるのではなく、**「この数字を変えている関数だけ」を潰していく**とかなりラクになります。

探すべきもの（名前は仮ですが、構造として）：

1. **activeComments に追加するところ**

   * 例: `getCommentsInTimeWindow(...)` の戻り値を `activeComments` に add している場所
   * チェックするポイント：

     * 「すでに active なコメントを二重に追加していないか」
     * 「hasShown=true のコメントを再度 active にしていないか」

2. **activeComments から削除するところ**

   * 例: `pruneLaneReservations` / `cleanupActiveComments` など
   * 不変条件として、

     * `if (now > effectiveVpos + VISIBLE_SCROLL_LIFETIME_MS) { active から除外 }`
     * `if (hasShown && 完全に画面外) { active から除外 }`
   * が入っているか、またはその equivalent があるかを確認

3. **時間窓を決めているところ**

   * 例: `ACTIVE_WINDOW_MS`, `WINDOW_PAST_MS`, `WINDOW_FUTURE_MS` などの定数と、それを使っているロジック
   * ここで「過去側の窓」を広げすぎていると、

     * どれだけスクロールしても `acMinVpos` が 0 のまま
     * 結果として「常に vpos=0 のコメントが active」
   * という今のログの症状そのものにつながります。

---

## 4. 「モデルにどう投げると的確な修正が返ってくるか」

「説明しても推測されるだけ問題」への対策としては、
**ログと一緒に “壊れている不変条件” を文章で添えて渡す** のが一番効きます。

次に投げるときは、こんな感じのセットを渡すとよさそうです：

1. 症状の要約

   * 例：

     * 「動画 25 秒時点で、`vpos=0` のコメントがまだ activeComments に残っている」
     * 「`hasShown: true` かつ `x` が負の値のコメントが active に残っている」

2. Compact JSON の抜粋

   * `vt`, `acMinVpos`, `acMaxVpos`, `activeCount` が異常なフレームを数個

3. Raw JSON の `sampleComments` 抜粋

   * 問題のコメントが `hasShown: true` / `x` マイナス なのに active なことが分かる部分

4. エンジン側のコードのうち、**activeComments を追加・削除している関数だけ** を抜粋

こうすると、モデル側は：

* 「コメントが回収されていないという **証拠**」
* 「そのコメントを生み出している **コード断片**」

を両方同時に見られるので、「推測」ではなく
**「この `if` 条件が甘いから、`hasShown && x<0` でも残っている」といった、かなりピンポイントな diff** まで出しやすくなります。

---

## 5. ざっくり TODO まとめ

* [ ] すでに取れているログから、
  - 「vt − acMinVpos が大きく離れているフレーム」
  - 「`sampleComments` に hasShown: true + x<0 が含まれるフレーム」
  を 2〜3 個ピックアップしておく
* [ ] エンジン側で `activeComments` を
  - 追加する関数
  - 削除 / prune する関数
  - 時間窓を決める関数
  の3つだけを特定して、そこだけコード断片を切り出す
* [ ] そのセット（症状 + Compact抜粋 + Raw抜粋 + 関数断片）をモデルに投げて
  「どの条件で prune すべきか」「どこにその条件を入れるか」の diff をもらう
* [ ] patch 適用後、同じ再現手順で
  - acMinVpos と vt の関係
  - sampleComments の hasShown/x
  を再計測して、不変条件が満たされているか確認

---

もし「activeComments を追加・削除しているところのコード抜粋」を貼ってもらえれば、
このログを見ながら「この if にこの条件を足す」レベルまで一気に落とし込むところまでやります。
