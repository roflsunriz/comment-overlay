# レーン校正戦略の検討ログ

> 初期の校正方針を検討した会話履歴です。現行仕様や未完了タスクを示す文書ではありません。

User:
comment-overlay.zipはニコニコ動画のコメント弾幕システムの再現を目指したプロジェクトです。コメントアートの再現はある程度うまくいきました。しかし、コメントレーンの位置取りの再現がうまくいきません。実際にCodex(GPT-5.5)でCDP/RDP併用で校正データを取りながら校正させていましたが、スコアが50%しかなく一回のイテレーションでも0.2ポイント程度しか改善できず目標の90%超まで遠いです。より速くより大きく素早く目標値に到達するにはどうしたらいいのですか？frames.jsonとtrace.jsonは.calibrationのサンプルです。キャリブレーションデータは2GBあるのでここにアップロードできません。

Assistant:
結論として、**今のまま「総合スコアを見ながら Codex に定数調整させる」方式は、90%到達にはかなり遠回り**です。
やるべきことは、総合スコアを直接最適化するのではなく、次の4層に分離して、上流から順に上限を潰すことです。

1. **教師データ抽出の上限**
2. **公式プレイヤーが実際に描画したコメント集合の一致**
3. **同一コメント対応付け**
4. **レーン選択ルール本体**

特に今回のリポジトリとサンプルを見る限り、ボトルネックは「レーン式の係数が少し違う」だけではありません。`.calibration` サンプルでは `naka` コメントが `lane 0,1,2,3,4,0,1,5,6,7...` のように入り、`y` は 665px 高の canvas で `0, 56.7, 113.4, 170.1...` と増えています。つまり候補側はかなり明確な lane pitch と top-first 風のレーン使用になっています。`frames.json` でも canvas は `1182x665`、通常コメントは `lane` と `y`、`visibleDurationMs: 6700`、`reservationWidth`、`preCollisionDurationMs` などを持っています。 また、密な場面では `lane 5/6/7` まで使っており、単純に「上から数レーンだけ」の問題ではありません。

## まず捨てるべきアプローチ

今すぐやめた方がよいのは、次の形のループです。

```text
Codex が renderer の定数を少し変更
→ CDP/RDP で教師取得
→ 総合スコアだけ見る
→ 0.2pt 上がった/下がった
→ 次の定数変更
```

これは遅いだけでなく、**間違った目的関数を最適化している可能性が高い**です。

たとえば、教師側と候補側でそもそも描画対象コメント集合が違う、コメントID対応が不安定、発火タイミングがズレている、評価器のマッチングが誤っている、という要因が混ざると、レーン式をどれだけ調整してもスコアは頭打ちになります。総合スコア50%台から1回0.2ptしか伸びないのは、ほぼこの症状です。

## 最速で90%に近づくための方針

やるべきことは、**スコアを1個にまとめる前に「上限」を測る**ことです。

### 1. teacher-vs-teacher で評価器の上限を測る

まず公式プレイヤーから同じ区間を2回キャプチャして、教師Aと教師Bを比較してください。

目的は、renderer を一切触らずに、

```text
教師抽出 + OCR/DOM/CDP/RDP + マッチング + scorer
```

だけで何点出るかを見ることです。

ここで95%を超えないなら、renderer のレーン再現を改善しても90%には届きません。先に評価器・教師抽出・フレーム同期の問題です。

目標値:

```text
teacher-vs-teacher: 95%以上
同一コメント対応率: 97%以上
lane一致率: 95%以上
y誤差: 1 lane 未満ではなく、できれば数px以内
```

### 2. comment-set oracle を作る

次に、公式プレイヤーが実際に受信・描画したコメント集合と、候補側に流しているコメント集合を一致させます。

ここが最重要です。リポジトリを見ると、`no` / `fork` / `threadId` / `source` のような生コメントID系メタデータが renderer 側や trace 側で落ちやすい構造になっています。これでは「同じ本文・同じvpos」のコメントが複数ある場面で、レーン評価が曖昧になります。

やるべき変更は、コメント入力から trace 出力まで、最低限これを保持することです。

```ts
type CalibrationCommentMeta = {
  no?: number;
  fork?: string;
  source?: "trunk" | "leaf" | "owner" | string;
  threadId?: string;
  date?: number;
  userIdHash?: string;
};
```

そして `Comment`、`laneDecision`、`drawImage`、`frames.json` に必ず出す。

現在のように `text + vposMs` で実質的に同一性を見ていると、ニコニコの弾幕ではすぐ破綻します。とくに「おっくせんまん！おっくせんまん！」のような同一本文大量投稿では、本文・vpos・commands だけでは教師との対応付けが危険です。

### 3. forced-lane oracle を入れる

評価器に oracle mode を追加してください。

```text
--oracle-lane teacher
--oracle-y teacher
--oracle-x candidate
--oracle-comment-set teacher
```

目的は、どの要素を教師に差し替えると何点まで上がるかを見ることです。

例:

```text
通常candidate:              50%
teacher comment setのみ:    72%
teacher laneのみ:           86%
teacher lane + teacher y:   91%
teacher lane + candidate y: 87%
teacher xのみ:              52%
```

このように分解できれば、「次に直すべき対象」が明確になります。

もし `teacher comment setのみ` で大きく上がるなら、レーン式ではなく入力集合問題です。
もし `teacher laneのみ` で90%近くまで上がるなら、レーン選択ルールが主因です。
もし `teacher lane` でも上がらないなら、スコアラー・コメント対応・描画抽出・座標変換の問題です。

## CDP/RDP は「実測」ではなく「合成プローブ」に使う

CDP/RDPを毎回2GB校正データに対して回すのは非効率です。代わりに、公式プレイヤーへ**合成コメント集合**を注入して、最小ケースを作るべきです。

Chrome DevTools Protocol の Fetch domain は、ブラウザのネットワーク層をクライアント側コードで置き換えたり、`Fetch.fulfillRequest` で応答を差し替えたりできる仕組みです。([chromedevtools.github.io][1]) これを使って `nvComment` のレスポンスを合成コメントに差し替えれば、公式プレイヤーに対して次のような最小プローブを作れます。

```text
probe A:
  1本目: width=200, vpos=10000
  2本目: width=200, vpos=10000 + Δt
  Δt を 0..3000ms で二分探索
  2本目が lane0 に入る境界を測る

probe B:
  1本目: width=600 big
  2本目: width=200 normal
  追い越し判定境界を見る

probe C:
  同一vpos, no順を入れ替える
  投稿順/配列順/no順/公式内部順のどれが優先かを見る

probe D:
  trunk/leaf/owner 混在
  fork/source の優先・除外・重ね順を見る
```

この方法なら、2GBの実動画データをブラックボックスで殴るより、**1つの未知ルールを1つの実験で潰せます**。

## 90%到達に必要な実装ロードマップ

優先順位はこれです。

### Phase 1: trace の同一性を修正する

最初にやるべき変更は renderer ではなく trace schema です。

```diff
 type RawCommentEntry = {
   text?: string;
   body?: string;
   vposMs?: number;
   commands?: string[];
+  no?: number;
+  fork?: string;
+  source?: string;
+  threadId?: string;
+  date?: number;
+  userIdHash?: string;
 };
```

```diff
 type Comment = {
   text: string;
   vposMs: number;
   commands: string[];
+  meta?: CalibrationCommentMeta;
 };
```

```diff
 type LaneDecisionTrace = {
   text: string;
   vposMs: number;
   lane: number;
   layout: CommentLayout;
   creationIndex: number;
+  no?: number;
+  fork?: string;
+  source?: string;
+  threadId?: string;
 };
```

そして calibration mode では重複除去も変えます。

```diff
- const key = `${text}\0${vposMs}`;
+ const key =
+   meta?.no != null
+     ? `no:${meta.source ?? ""}:${meta.fork ?? ""}:${meta.no}`
+     : `fallback:${text}\0${vposMs}\0${commands.join(" ")}`;
```

本番では従来動作でも構いませんが、校正モードでは絶対に `no` を保持した方がよいです。

### Phase 2: scorer を分解する

今の「総合50%」を次のように分けます。

```json
{
  "inputSet": {
    "teacherCount": 60,
    "candidateCount": 58,
    "matchedByNo": 55,
    "matchedByHeuristic": 3,
    "unmatchedTeacher": 2,
    "unmatchedCandidate": 0
  },
  "timing": {
    "medianActivationDeltaMs": 83,
    "p90ActivationDeltaMs": 250
  },
  "geometry": {
    "sourceWidthMaePx": 8.2,
    "fontSizeAccuracy": 0.98
  },
  "lane": {
    "exact": 0.62,
    "within1": 0.81,
    "meanSignedDiff": -1.08,
    "meanAbsDiff": 1.95
  },
  "x": {
    "maePx": 24.1
  },
  "score": {
    "overall": 0.50,
    "oracleCommentSet": 0.72,
    "oracleLane": 0.86
  }
}
```

Codex に見せるのはこの JSON だけで十分です。2GBを読ませるより、失敗ケース上位20件とこの分解指標の方が改善が速くなります。

### Phase 3: lane case dataset を作る

2GBのキャリブレーションデータは、そのままLLMに渡すのではなく、**1コメント1行の学習データ**に変換します。

例:

```json
{
  "videoId": "sm6240144",
  "probe": "lane-565s-ordinary",
  "commentNo": 80317,
  "textHash": "sha1:...",
  "vposMs": 569860,
  "layout": "naka",
  "fontSize": 39,
  "width": 570.0703125,
  "height": 39,
  "teacherLane": 0,
  "candidateLane": 1,
  "candidateAvailableLanes": [1, 5, 6, 7, 8, 9],
  "teacherLaneWasCandidateAvailable": false,
  "blockers": [
    {
      "lane": 0,
      "blockerNo": 80291,
      "gapAtStartPx": -12.3,
      "gapAtMidPx": 48.1,
      "gapAtEndPx": 102.7
    }
  ],
  "activeCount": 12,
  "sameVposBatchIndex": 2,
  "source": "trunk",
  "fork": "main"
}
```

これを `lane-cases.ndjson` や SQLite にして、**Python / Node でローカルに高速評価**します。CDP/RDPは教師取得だけ、探索はオフラインです。

### Phase 4: ルール探索は ML ではなく「解釈可能なランカー」から始める

いきなりニューラルネットにしない方がよいです。renderer に戻せる必要があるため、まずは次のような候補ルールを総当たり・木探索で比較します。

```text
A. top-first + 現行衝突判定
B. top-first + lane再利用猶予
C. top-first + 追い越し境界を width比で補正
D. nextAvailableTime順
E. nextAvailableTime順だが上位lane優先biasあり
F. same-vpos batch は別順序
G. big/small で予約高さ・予約幅を変える
H. fork/source ごとに描画・予約キューを分ける
```

出力は TypeScript に戻せる形にします。

```ts
scoreLane(lane, state, comment) =
  1000 * hasHardCollision
  + 40 * lane
  + 0.8 * nextAvailableDelayMs
  - 120 * recentlyFreedBonus
  + 20 * overtakeRisk
```

そして最終的に「最小スコアの lane」を選ぶ。
公式が厳密にそうしているとは限りませんが、解釈可能な中間モデルとして非常に有効です。

## Codex に投げる粒度

Codex に「90%まで改善して」と投げるのは大きすぎます。こう分けてください。

### 良いタスク例

```text
目的:
  calibration trace に raw comment identity を保持したい。

制約:
  本番描画挙動は変えない。
  calibration mode の JSON schema だけ拡張する。
  no/fork/source/threadId/date/userIdHash を RawCommentEntry -> Comment -> laneDecision -> frames.json に通す。
  既存テストを壊さない。

完了条件:
  trace.jsonl の laneDecision に no/source/fork が出る。
  frames.json の activeComments に no/source/fork が出る。
  同一 text/vpos のコメント2件が区別できる。
```

次のタスク:

```text
目的:
  scorer に oracle mode を追加する。

追加CLI:
  --oracle-comment-set teacher
  --oracle-lane teacher
  --oracle-y teacher
  --ignore-unmatched

出力:
  score-components.json に normal/oracle 各スコアを出す。

完了条件:
  既存probeで normal と oracleLane の差分が見える。
```

さらに次:

```text
目的:
  lane-cases.ndjson を生成する。

入力:
  teacher frames
  candidate frames
  trace.jsonl
  score match result

出力:
  1 matched comment = 1 JSON line
  teacherLane, candidateLane, candidateAvailableLanes, blockers, geometry を含む。

完了条件:
  失敗上位20件を `lane-error-buckets.json` に集計できる。
```

このようにすると、Codex は1回のイテレーションで0.2ptではなく、**上限を10〜30pt単位で切り分けられる**ようになります。

## 直近でやるべきチェックリスト

最初の1〜2日でやる価値が高い順です。

| 優先 | 作業                                        | 期待効果            |
| -: | ----------------------------------------- | --------------- |
|  1 | teacher-vs-teacher scorer を作る             | 90%到達可能か判定      |
|  2 | raw `no/fork/source/threadId` を trace に通す | 対応付けの曖昧さを除去     |
|  3 | oracle scorer を作る                         | 本当に lane が主因か判定 |
|  4 | official-received comment set を候補に流す      | 入力集合ズレを切り分け     |
|  5 | synthetic nvComment probe をCDP Fetchで注入   | 公式レーン境界を高速測定    |
|  6 | lane-cases.ndjson を生成                     | オフライン高速探索へ移行    |
|  7 | Codex には error bucket 単位で修正させる            | 無駄な定数探索を減らす     |

## 目標メトリクスを変える

90%を目指す前に、次のゲートを置くのがよいです。

```text
Gate 1:
  teacher-vs-teacher >= 95%

Gate 2:
  matched comment rate >= 97%

Gate 3:
  oracleCommentSet score - normal score <= 5pt

Gate 4:
  oracleLane score >= 90%

Gate 5:
  normal lane exact >= 85%
  normal lane within1 >= 95%

Gate 6:
  overall >= 90%
```

今すぐ全体90%を追うのではなく、**どの oracle で90%を超えるか**をまず見てください。そこが突破口です。

## 今回のサンプルからの具体的な読み

`frames.json` のサンプルは、候補側の幾何はかなり一貫しています。

通常サイズでは:

```text
fontSize: 27
height: 27
lane pitch: 56.7
visibleDurationMs: 6700
```

big では:

```text
fontSize: 39
height: 39
reservationWidth: 約969px
preCollisionDurationMs: 約2121ms
```

通常長文では:

```text
width: 約394.7px
reservationWidth: 約670.9px
preCollisionDurationMs: 約1983ms
```

短いコメントでは:

```text
width: 約197.3px
reservationWidth: 約335.5px
preCollisionDurationMs: 約1863ms
```

このように、速度・予約幅・レーンピッチはそれなりに整っています。
なので、次に疑うべきは以下です。

```text
1. 公式と候補のコメント集合が違う
2. コメント順序が違う
3. 同一本文コメントの対応付けが壊れている
4. fork/source/thread の混在が再現されていない
5. same-vpos / 近接vpos の安定ソート順が違う
6. 公式の lane 再利用条件が現行の衝突判定と違う
```

## 進め方の要点

最速ルートはこれです。

```text
renderer改善
  ↓
ではなく

評価器の上限測定
  ↓
入力集合一致
  ↓
コメントID対応付け
  ↓
oracleで主因特定
  ↓
合成プローブで公式ルール測定
  ↓
オフラインでルール探索
  ↓
TypeScriptに反映
```

これに変えると、1回0.2ptの漸進から、**「入力集合を直したら+20pt」「同一コメント対応を直したら+10pt」「レーン境界を直したら+8pt」**のような改善に変えられる可能性が高いです。
今の状態で90%を狙うなら、まず `no/fork/source/threadId` を trace に通し、`teacher-vs-teacher` と `oracle-lane` を作るのが最初の一手です。

[1]: https://chromedevtools.github.io/devtools-protocol/tot/Fetch/?utm_source=chatgpt.com "Fetch domain - Chrome DevTools Protocol"
