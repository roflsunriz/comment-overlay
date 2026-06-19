User:
なんかあまりにも進捗が牛歩すぎて、校正という考えを捨てて、ニコニコ動画のコメントレーン決定アルゴリズムを推定する方が建設的な気がしてきた。先にアルゴリズムを推定してから測定するほうが良さそうだよ。

Assistant:
その判断は正しいです。
ただし、**測定を捨てる**のではなく、捨てるべきなのは **2GBの実動画校正データに対して総合スコアを直接上げる発想**です。

やるべきことは、

```text
大量データで係数校正
```

から、

```text
公式プレイヤーをブラックボックス関数として扱う
→ 小さい合成入力を投げる
→ レーン決定アルゴリズムを同定する
→ 最後に実データで検証する
```

へ切り替えることです。

公開情報としても、ニコニコのコメント表示は「コメントの表示幅と時間軸を XY 軸に見立てた平行四辺形上で幾何学的に衝突判定する」系のアルゴリズムだった、という説明が残っています。つまり本質は、画像類似度や総合スコアではなく、**時間軸上を移動する矩形の衝突判定 + レーン選択規則**です。([Kanadas][1])

## いま捨てるべきもの

捨てるべきなのはこれです。

```text
実動画の一部区間を取る
→ comment-overlay を走らせる
→ 公式traceと比べる
→ スコア50%
→ Codexに直させる
→ 0.2pt改善
```

これは、未知要素が多すぎます。

混ざっている未知要素は最低でもこれだけあります。

```text
1. 公式が実際に表示したコメント集合
2. trunk / leaf / owner / easy の混合規則
3. コメント処理順
4. vpos から表示開始時刻への変換
5. x(t) の速度式
6. source canvas の外形
7. y / lane pitch
8. 同一レーン衝突判定
9. レーン優先順位
10. overflow / fallback 規則
```

これらを全部まとめて総合スコアで最適化すると、勾配がほぼ見えません。牛歩になるのは自然です。

## 捨ててはいけないもの

一方で、測定そのものは絶対に必要です。
ただし測定対象を変えるべきです。

```text
悪い測定:
  実動画区間で総合スコアを見る

良い測定:
  2コメントだけを公式プレイヤーに表示させ、
  Δt を変えて「同じlaneに入る境界」を測る
```

つまり、**校正データを教師にするのではなく、公式プレイヤーを実験装置にする**のがよいです。

Chrome DevTools Protocol の Fetch domain は、リクエストを一時停止して `failRequest` / `fulfillRequest` / `continueRequest` で応答を制御できるので、`nvComment` 応答を合成コメントに差し替える用途に向いています。([Chrome DevTools][2])

## 推定すべきアルゴリズムの形

最初からこういう形に固定して考えた方がよいです。

```ts
type NicoLaneAlgorithm = {
  normalizeInputOrder(comments): Comment[];
  computeGeometry(comment, viewport): Geometry;
  computeDisplayStartTime(comment): number;
  computeMotion(comment, viewport): Motion;
  computeLaneGrid(viewport, comment): LaneGrid;
  canShareLane(existing, candidate): boolean;
  chooseLane(state, candidate): number;
  overflowLane(state, candidate): number;
};
```

このうち、最初に推定するべき順番はこれです。

```text
1. x(t)
2. displayStartTime
3. lane pitch / lane count
4. 同一レーン衝突判定
5. レーン選択順
6. overflow 規則
7. 入力コメント集合の統合規則
```

実動画でスコアを見るのは最後です。

## 最初の本命仮説

公開情報と現在の実装状況から、まず本命に置くべき仮説はこれです。

```text
通常 naka コメントは、
一定表示時間 T を持つ右→左の移動矩形であり、
コメント幅によって速度が変わる。

各コメントは開始時刻 t0 で右側から入る。
各 lane には過去コメントの移動矩形が予約されている。
新コメントは、同一 lane 内で既存コメントと時間空間上で衝突しない最初の lane に入る。
```

擬似コードにするとこうです。

```ts
function chooseLane(comment: Comment, state: LaneState): number {
  const candidate = makeReservation(comment);

  for (const lane of lanePriorityOrder(state, comment)) {
    if (state.reservations[lane].every((r) => !conflicts(r, candidate))) {
      return lane;
    }
  }

  return chooseOverflowLane(state, comment);
}
```

そして衝突判定はこうです。

```ts
function conflicts(a: Reservation, b: Reservation): boolean {
  const t0 = Math.max(a.startTime, b.startTime);
  const t1 = Math.min(a.endTime, b.endTime);

  if (t0 >= t1) return false;

  const times = [
    t0,
    t1,
    (t0 + t1) / 2,
    solveEdgeTouchTime(a, b),
    solveEdgeTouchTime(b, a),
  ].filter(isInside(t0, t1));

  return times.some((t) => intervalsOverlap(a.xRangeAt(t), b.xRangeAt(t), marginPx));
}
```

この形なら、公式アルゴリズムが完全一致でなくても、実験で各パラメータを切れます。

## いまの `comment-overlay` に対する見立て

アップロードされた `frames.json` では、候補側はかなり決まった幾何で動いています。たとえば canvas は `1182x665`、通常 `naka` では `y=0,56.7,113.4...` のようなレーンピッチ、`visibleDurationMs: 6700`、`preCollisionDurationMs`、`speedPixelsPerMs`、`reservationWidth` を持っています。

また、密な区間では `lane 0,1,2...` と連続的に埋めるだけでなく、`lane 5/6/7` まで使う状態もサンプルに出ています。 

この zip の実装を見る限り、`src/renderer/activation.ts` の `findAvailableLane()` は大枠として、

```text
lane候補を列挙
→ 各laneで予約衝突を見る
→ 最初のavailable laneを採用
→ なければ最後のlaneへfallback
```

です。つまり、今の改善余地は「lane番号をどう並べるか」よりも、むしろ次の3つにあります。

```text
1. 公式と同じコメント順で処理しているか
2. 公式と同じ startTime / x(t) / width を使っているか
3. 公式と同じ衝突境界で lane reuse を許しているか
```

ここを推定実験で潰すべきです。

## 最初に作るべきプローブ

2GB校正データではなく、**合成コメント数2〜10個のプローブ**を作ります。

### Probe 1: 2コメント同幅境界

目的は、同じ lane を再利用する最小 Δt を測ることです。

```json
[
  {
    "id": "A",
    "body": "AAAAAAAAAA",
    "vposMs": 10000,
    "commands": ["184"]
  },
  {
    "id": "B",
    "body": "BBBBBBBBBB",
    "vposMs": 10000 + "Δt",
    "commands": ["184"]
  }
]
```

`Δt` を二分探索します。

```text
Δt = 0ms    → B は lane 1
Δt = 800ms  → B は lane 1
Δt = 1300ms → B は lane 0
```

この境界から、

```text
startTime
表示時間 T
右端/左端の buffer
追い越し判定
```

が推定できます。

### Probe 2: 幅違い追い越し

```text
A: width=短い
B: width=長い
B を後から投入
```

と、

```text
A: width=長い
B: width=短い
B を後から投入
```

を両方やります。

これで、

```text
新コメントが速い場合に追い越し衝突を見るか
新コメントが遅い場合に入口衝突だけを見るか
```

が分かります。

### Probe 3: 同一 vpos 順序

同じ `vposMs` に色や本文だけ違うコメントを並べます。

```json
[
  { "no": 1, "body": "A", "vposMs": 10000, "commands": ["red"] },
  { "no": 2, "body": "B", "vposMs": 10000, "commands": ["green"] },
  { "no": 3, "body": "C", "vposMs": 10000, "commands": ["blue"] }
]
```

配列順、`no`順、投稿日時順、thread順を入れ替えて、公式の lane がどう変わるかを見る。

これはかなり重要です。レーン決定は処理順が1つ違うだけで全部ズレます。

### Probe 4: レーン優先順位

わざとこういう状態を作ります。

```text
lane 0: 使える
lane 1: blocked
lane 2: 使える
lane 3: 使える
```

この状態で新コメントが `0` に入るなら top-first。
`2` や `3` に入るなら、単純な top-first ではありません。

次にこうします。

```text
lane 0: 直前に空いた
lane 2: 長く空いている
lane 5: 完全に空いている
```

ここでどこを選ぶかを見ると、

```text
低いlane優先
空き時間優先
最近使ったlane回避
縦方向分散
```

のどれかが見えてきます。

### Probe 5: overflow

全 lane をわざと塞ぎます。

```text
全lane blocked
新コメント投入
```

このとき公式が、

```text
最後のlane
最も早く空くlane
最も上のlane
最も重なりが少ないlane
描画しない
```

のどれを選ぶかを測ります。

ここは実動画では非常にノイズが大きいですが、合成プローブなら一発で分かります。

## モデル探索はこうする

Codex に直接「推定して」と投げるのではなく、候補アルゴリズムを列挙して、プローブで反証します。

```ts
type LanePolicyName =
  | "top-first-hard-collision"
  | "top-first-soft-margin"
  | "earliest-available-then-top"
  | "top-first-with-reuse-bonus"
  | "least-overlap-overflow"
  | "cyclic-start-lane"
  | "batch-stable-same-vpos";
```

各 policy は同じ入力に対して lane sequence を返します。

```ts
type ProbeResult = {
  probeId: string;
  params: Record<string, number | string>;
  officialLaneSeq: number[];
  candidateLaneSeq: Record<LanePolicyName, number[]>;
};
```

採点は単純でよいです。

```ts
score(policy) =
  exactLaneAccuracy
  + boundaryAccuracy
  + overflowAccuracy
```

重要なのは、**実動画スコアではなく、プローブ正答率で選ぶ**ことです。

## 2GBデータは最後の検証用に回す

2GBデータを使うタイミングは、アルゴリズム候補がかなり絞れてからです。

```text
Step 1:
  合成プローブで x(t), lane reuse, overflow を推定

Step 2:
  推定アルゴリズムで synthetic probes 95%以上

Step 3:
  実動画の通常 naka 区間だけに適用

Step 4:
  入力コメント集合差を oracle で差し引く

Step 5:
  コメントアート区間へ戻す
```

この順番にすれば、2GB校正は「学習データ」ではなく「回帰テスト」になります。

## 実装タスクに分けるならこう

まず renderer 本体をいじらず、スクリプト側に新しい実験器を足すのがよいです。

```text
scripts/nico-blackbox-probe.mjs
  - 合成コメントセットを生成
  - CDP Fetch で nvComment 応答を差し替え
  - 公式プレイヤーを再生
  - drawImage/sourceCanvas から lane sequence を抽出
  - probe-result.jsonl に保存
```

次に policy runner。

```text
scripts/nico-lane-policy-runner.mjs
  - 同じ合成コメントセットを comment-overlay の複数policyで実行
  - officialLaneSeq と比較
  - policyごとの失敗ケースを出力
```

最後に fitting。

```text
scripts/nico-lane-policy-fit.mjs
  - marginPx
  - visibleDurationMs
  - startLeadMs
  - lanePitch
  - overflowPolicy
  - priorityPolicy
  を grid search / binary search
```

出力はこうです。

```json
{
  "bestPolicy": "top-first-soft-margin",
  "params": {
    "visibleDurationMs": 6000,
    "startLeadMs": 0,
    "entryMarginPx": 16,
    "collisionMarginPx": 8,
    "lanePitchRatio": 2.1,
    "overflow": "least-overlap"
  },
  "probeAccuracy": {
    "twoCommentBoundary": 0.98,
    "overtake": 0.96,
    "sameVposOrder": 1.0,
    "overflow": 0.92
  }
}
```

## Codex に投げるならこの単位

次に Codex に投げるタスクは、renderer改善ではなくこれです。

```text
目的:
  ニコニコ公式プレイヤーをブラックボックスとして、
  合成コメント入力に対する lane sequence を取得する probe runner を作る。

要件:
  - renderer本体は変更しない
  - scripts/nico-blackbox-probe.mjs を追加
  - CDP Fetch で nvComment 応答を差し替える
  - probe JSON を入力に取る
  - 出力は probe-result.jsonl
  - 各コメントの text, color, fontSize, sourceWidth, sourceHeight, estimatedLaneY を保存
  - 2コメント境界探索用に --sweep dt=0:3000:20 を持つ
```

次のタスク。

```text
目的:
  comment-overlay 側で lane policy を差し替え可能にする。

要件:
  - 既存挙動を default policy として保持
  - src/renderer/lane-policy.ts を追加
  - top-first-hard-collision
  - top-first-soft-margin
  - earliest-available
  の3種類を実装
  - scripts/nico-lane-policy-runner.mjs から policy を指定できる
  - renderer本体の通常APIは壊さない
```

さらに次。

```text
目的:
  probe-result.jsonl から collision margin と duration を推定する。

要件:
  - 2コメントプローブの lane0/lane1 境界を読む
  - widthA, widthB, dtBoundary から候補パラメータをfit
  - best 10 candidates を JSON で出す
```

これなら、Codex の1イテレーションで「0.2pt改善」ではなく、**1つの未知規則を消せます**。

## 参考実装は見る価値があるが、正解扱いしない

`xpadev-net/niconicomments` は、公式プレイヤー互換を掲げる TypeScript 系のコメント描画ライブラリです。参考実装として比較する価値はあります。([GitHub][3])

ただし、作者自身の記事では、公式との違いとして、公式は当たり判定処理を随時行うのに対し、NiconiComments 側はコメントデータを最初にまとめて読み込んで処理する、と説明されています。つまり、参考にはなるが、現在の公式プレイヤーのブラックボックス観測の代替にはしない方がよいです。([Zenn][4])

## たぶん最短の勝ち筋

いまの方針をこう変えるのが一番速いです。

```text
1. 実動画スコア最適化を止める
2. 合成nvComment注入を作る
3. 2コメント境界を測る
4. 同一vpos順序を測る
5. overflowを測る
6. lane policyを複数実装してprobe正答率で選ぶ
7. その後に実動画で検証する
```

目標もこう変えるべきです。

```text
旧目標:
  実動画スコア 90%

新目標:
  synthetic probe 正答率 98%
  ↓
  ordinary naka 実動画 90%
  ↓
  コメントアート込み総合 90%
```

かなり強く言うと、**今の段階で90%を目指して総合校正するのは順番が逆**です。
先に「公式プレイヤーはこの入力ならこの lane を選ぶ」という小さな事実を100個集めて、アルゴリズム候補を反証で削る方が建設的です。

## 2026-06-20 CDPブラックボックス観測で確定した通常 naka レーン規則

`public.nvcomment.nicovideo.jp/v1/threads` のページロード時 `POST` を CDP Fetch で差し替え、公式プレイヤーの canvas 描画をhookして確認した。
「コメントの次回取得」「NicoCache_nl」「CommentFilter2」系APIは使っていない。ページロード時コメント応答だけに介入した。

追加した観測器:

```text
scripts/nico-blackbox-probe-cdp.mjs
scripts/nico-blackbox-lane-extract.mjs
```

重要な抽出上の注意:

```text
lane y は drawImage の destY ではなく transform[5] を使う。
destY=-27 はsource texture内のpaddingで、公式レーン座標ではない。
```

### 処理順

同一 `vposMs` のコメントは `no` 昇順で処理される。
応答配列順ではない。

観測:

```text
A..H を同一 vpos / no昇順:
  A,B,C,D,E,F,G,H -> lane 0,1,2,3,4,5,6,7

応答配列だけ H..A に反転、no は A が最小:
  A,B,C,D,E,F,G,H -> lane 0,1,2,3,4,5,6,7

no だけ H が最小 / A が最大:
  H,G,F,E,D,C,B,A -> lane 0,1,2,3,4,5,6,7
```

### レーン優先順位

通常状態では top-first。
候補コメントは lane 0 から順に走査され、衝突しない最初の lane に入る。

同一時刻8本では、公式レーン座標は以下の等間隔だった。

```text
lane0 y =   1.5608425
lane1 y =  69.7254410
lane2 y = 137.8900452
lane3 y = 206.0546417
lane4 y = 274.2192383
lane5 y = 342.3838501
lane6 y = 410.5484619
lane7 y = 478.7130432

pitch ≒ 68.1646 px
```

### 通常 naka の同一lane衝突判定

通常 `naka` の同一lane再利用判定は、2コメント `a` と `b` について次の形で一致する。

```text
same lane is allowed iff:
  b.vposMs - a.vposMs >= max(inkWidth(a) / speed(a), inkWidth(b) / speed(b))
```

ここで使われる幅は source canvas 全幅ではない。
公式は `fillText` を `x=14.9`、内部scale `2` で描いており、左右padding合計は約 `59.6px` になる。

```text
inkWidth ≒ sourceCanvasWidth - 59.6
```

同幅コメントの観測:

```text
sourceCanvasWidth = 718
inkWidth ≒ 658.4
speed ≒ 415-418 px/video-sec

dt=1560ms -> 別lane
dt=1580ms -> 同lane

658.4 / 416 ≒ 1583ms
```

幅違いコメントの観測:

```text
short sourceCanvasWidth = 718
short inkWidth ≒ 658.4

long sourceCanvasWidth = 1828
long inkWidth ≒ 1768.4
long speed ≒ 690-709 px/video-sec

A short / B long:
  dt=2500ms -> 別lane
  dt=2600ms -> 同lane

A long / B short:
  dt=2500ms -> 別lane
  dt=2600ms -> 同lane

1768.4 / 695 ≒ 2544ms
```

したがって、入口だけを見る判定ではない。
後続コメントが速い場合の将来追い越しもこの `max(width/speed)` 条件で除外している。

### 擬似コード

```ts
function chooseLane(comment: NicoComment, state: LaneState): number {
  const candidate = makeMovingReservation(comment);

  for (let lane = 0; lane < state.regularLaneCount; lane += 1) {
    if (state.lanes[lane].every((existing) => canShareNakaLane(existing, candidate))) {
      return lane;
    }
  }

  return chooseOverflowY(comment, state);
}

function canShareNakaLane(a: MovingReservation, b: MovingReservation): boolean {
  const dtMs = b.vposMs - a.vposMs;
  const requiredMs = Math.max(
    (a.inkWidthPx / a.speedPxPerSec) * 1000,
    (b.inkWidthPx / b.speedPxPerSec) * 1000,
  );
  return dtMs >= requiredMs;
}
```

### overflow

同時16本投入では、A-K までは通常ピッチで積まれた。
K の y は `683.2068` なので、通常レーン数は少なくとも11本。

K以降は通常ピッチの単純な次レーンではなく、ロードごとに異なる y へ配置された。

```text
1回目 L-P:
  622.439, 296.690, 321.374, 205.253, 257.463

repeat L-P:
  531.182, 114.343,  11.450, 473.397, 147.685
```

したがって overflow は通常レーン決定とは別系統で、少なくとも同一入力でもページロード間で完全決定的ではない。
通常naka再現の主経路では、まず overflow 前の top-first hard collision を正確に合わせる。

[1]: https://www.kanadas.com/weblog/2007/10/post_195.html "ニコニコ動画のコメント表示 ― 必然性のないつくりこみ ?! (カナダからのブログ)"
[2]: https://chromedevtools.github.io/devtools-protocol/tot/Fetch/?utm_source=chatgpt.com "Fetch domain - Chrome DevTools Protocol"
[3]: https://github.com/xpadev-net/niconicomments "GitHub - xpadev-net/niconicomments: ニコニコ動画の公式プレイヤー互換の高パフォーマンスなコメント描画ライブラリ / High peformance High compatibility comment drawing library · GitHub"
[4]: https://zenn.dev/xpadev/articles/f1ad30840f9830 "ニコニコ互換コメント描画ライブラリを作ってみた"
