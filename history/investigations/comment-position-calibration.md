# コメント位置取りキャリブレーション

> 過去の個別調査メモです。後続の隔離実験と採用結果は [`research/studies`](../../research/studies/) を参照してください。

目的:
- 通常 `naka` コメント、固定 `ue` / `shita` コメント、コメントアートが同じレンダリング経路のまま、ニコニコ実プレイヤーの `fontSize` / テクスチャサイズ / `x(t)` / `y` / lane 選択に近づくようにする。

現状:
- `scripts/nico-trace.mjs` と `scripts/nico-overlay-trace.mjs` で、実プレイヤーと `comment-overlay` の `drawImage` / `fillText` / `strokeText` を比較できる。
- `scripts/nico-report.mjs` の `ordinary comment calibration` セクションで、通常コメントを大きなコメントアート用テクスチャから分けて集計できる。
- sm6240144 の猫マリオCAではかなり一致した。
- スクロール lane height は実測に寄せるため `NICO_SCROLL_LANE_HEIGHT_RATIO` を導入済み。

次に見ること:
- 普通コメントをコメントアートの副産物として扱わない。まず通常 `naka` のフォントサイズ、描画テクスチャ幅/高さ、lane `y`、`x(t)` の速度を単独の評価軸にする。
- `ue` / `shita` の普通コメントも、上固定CAとは別に、同一vposの積み、中央寄せ、文字サイズ、テクスチャパディングを評価する。
- `nico-report` では、overlay側の `comment.layout === "naka"` かつ単一行の小型 `drawImage` を通常スクロールコメント、`ue` / `shita` の単一行小型 `drawImage` を通常固定コメントとして見る。
- 通常コメントの位置は、テクスチャ左上ではなく `drawImage.x/y + paddingX/Y` の本文基準 `content x/y` で見る。通常 `naka` の最上段はテクスチャYが負値でも本文上端が0付近なら意図通り。
- ニコニコ実プレイヤー側は `drawImage` とコメントオブジェクトが安定して紐付かないため、まず `sourceWidth <= 900` かつ `sourceHeight <= 220` の小型かつ移動している `drawImage` を通常コメント候補として扱う。速度0の固定小型レイヤーは、動画/プレイヤー側の固定描画が混ざるため通常コメント教師から除外する。
- 既存traceで通常コメント候補が空になる場合は、コメント本文描画を含むオフスクリーンCanvas生成時点を取り逃がしている。`--reload true` 付きでフック注入後に読み込み直すか、プレイヤー内部の受信済みコメント状態を別途取り出して照合する。
- Chrome CDP でプレイヤーDOMが取れない場合は、`scripts/nico-rdp-trace.mjs` で Firefox DevTools RDP (`127.0.0.1:6000`) から採取する。RDPでは `evaluateJSAsync` と Canvas API フックを使い、プリロール中はtraceを無効化して採取開始直前に有効化する。
- 通常コメントの lane `y` 差分を複数時刻で集計する。
- レーン選択リバースエンジニアリング用に `scripts/nico-lane-reverse.mjs` を追加した。実プレイヤーの `drawImage` は viewport 全体のCanvasに描かれるため、`transform` 適用後に `videoRect.left/top` を引いて動画内座標へ正規化する必要がある。
- 03:35-03:55 を `lane-ordinary-215s-20s` として CDP 採取した初回結果では、通常 `naka` 候補の moving trajectory が84件復元できた。実プレイヤー側の主な動画内 `drawImage.y` は約 `2.9 / 71.1 / 139-146 / 207 / 260 / 322` で、上から空きレーンを優先し、混雑時に下へ拡張している可能性が高い。
- 同区間の `comment-overlay` trace (`overlay-lane-ordinary-215s-20s-v319`) では、主な `drawImage.y` が約 `-27 / 41 / 109 / 177` に集中した。ピッチ自体は近いが、テクスチャ上端基準で約30px上寄りになっているため、比較時は `drawImage.y` だけでなく `drawImage.y + paddingY` の本文基準も併記して見る。
- `nico-lane-reverse.mjs` の `--basis content` で本文基準にすると、CO側は `0 / 68 / 136 / 204...` の安定した68pxピッチになる。03:35-03:55 の実プレイヤーも `--lane-pitch 68` 固定では lane 0-5 に整理され、本文基準の縦ピッチは大きく外れていない。
- 09:25-09:37 を `lane-ordinary-565s-12s-retry` として追加採取した初回結果では、実プレイヤー側が moving trajectory 124件に見えた。しかしこれは `video.currentTime` がキャッシュされ、同一 `sourceCanvasId` の複数 `drawImage` が別軌跡へ分裂していたため。`scripts/nico-lane-reverse.mjs` は、軌跡リンクには CDP `timestampMs` を使い、比較単位は `sourceCanvasId` に畳み込むようにした。
- `overlay-tests/fixtures/sm6240144-comments.json` は `comments` / `mainThread.comments` ともに1408件の生コメントを含み、overlay-testsはroot `comments` を読んでいる。したがって現時点では「CO側コメントが欠けている」より、レーン選択・衝突予約・描画基準の差として扱う。
- `lane-ordinary-565s-12s-retry` を `sourceCanvasId` 単位で再解析すると、実プレイヤー側の画面内通常 `naka` 候補は12本、主な本文Yは `2.9 / 71.1 / 115.2 / 183.4 / 237.9 / 251.5 / 319.7 / 387.9 / 402.8 / 503.4`。同時間帯のCO v3.1.19は20本で、lane 8 (`contentY 545.4`) まで使っていた。
- v3.1.20 で `naka` の使用可能レーン数を1段ぶん保守的にし、動画高665px時に最下段lane 8へ逃がさないようにした。v3.1.21 では、空きレーンが無い場合のfallbackを先頭laneではなく末尾laneへ逃がすようにした。
- v3.1.21 の `overlay-lane-ordinary-565s-12s-v321` では、CO側のlane 8は消え、飽和時の一部がlane 6へ逃げるようになった。まだ実プレイヤーの `lane 4/5/6` 連続配置までは一致していないため、次は `preCollisionDurationMs` / `reservationWidth` / `bufferWidth` / `x(t)` をコメント単位で比較し、COがlane 0/1を早く再利用しすぎているかを確認する。
- v3.1.22 で内部デバッグsnapshotへ `preCollisionDurationMs` / `virtualStartX` / `exitThreshold` / `bufferWidth` / `reservationWidth` を追加し、CO側の衝突予約をフレーム単位で確認できるようにした。調査の結果、`reservationWidth` は計算されていたが、`LaneReservation.width` には未使用で、実際の衝突判定は `comment.width` を使っていた。
- v3.1.22 で `LaneReservation.width` に `reservationWidth` を使い、`reservationWidth` 内にbuffer分が含まれるため `LaneReservation.buffer` は0として扱うようにした。ただし05:29区間のレーン分布は大きくは変わらず、`reservationWidth` 自体がニコニコ実プレイヤーより短い可能性が残った。
- v3.1.23 で通常スクロールコメントの `reservationWidth` を、描画テクスチャ幅に近い `comment.width * 2 + paddingX * 2` ベースへ広げた。ただし実プレイヤーで多い `850x120` テクスチャに合わせ、動画幅1182px時に約850pxとなる比率で上限を置く。これはコメントアート専用分岐ではなく、通常 `naka` のテクスチャ生成規則に基づく一般的な予約幅補正。
- v3.1.23 の `overlay-lane-ordinary-565s-12s-v323` では、lane 0 の件数が v3.1.21/22 の8件から6件へ減り、lane 3/4/6側へ逃げるコメントが増えた。実プレイヤー `lane-ordinary-565s-12s-retry` の `0,1,3,0,7,0,6,2,3,4,5,6` という下方向利用により近づいた。
- v3.1.24 調査で `laneDecision` 内部traceを追加した。`trace.jsonl` に `op: "laneDecision"` として、候補lane列、available lane列、選択lane、fallback有無、予約開始/終了、予約幅を出力する。描画プリミティブ解析とは独立して読めるため、レーン選択だけを機械比較できる。
- 不採用実験: `preCollisionDurationMs` を `reservationWidth` ベースへ広げると、05:29区間で lane 7 が増えすぎた。不採用実験: `getLanePriorityOrder()` を単純なlane番号順にすると、同じく lane 7 が4件へ増え、ニコニコ実測の `lane7:1` から離れた。不採用実験: 全lane衝突時fallbackを先頭候補へ変えると、lane 0 が10件へ増えて上に潰れた。
- v3.1.25 でスクロールコメントのテクスチャ描画Yを、`comment.y - paddingY` ではなく `comment.y` 基準にした。これにより05:29区間の広い `850x120` 相当テクスチャは、CO側の最上段 `drawImage.y` が `-27` から `0` になり、実プレイヤー実測の `y≈2.9` に近づいた。固定 `ue` / `shita` は従来通り `paddingY` を引く。
- v3.1.25 のY配置変更は、コメントアート専用ではなく全スクロール `naka` のテクスチャ配置規則。03:35区間では広い `drawImage` のY範囲が `0..409`、`laneDecision` fallbackは0件で、少なくとも通常混雑区間のレーン選択悪化は見えていない。
- 残課題: 05:29区間ではCOが同時刻付近の広いコメントを lane 6 に重ねるケースが残る。ニコニコ実測は同種の広い `850x120` レイヤーを lane 0 と lane 6 へ分散しているため、次は `laneDecision` と実測 `sourceCanvasId` 軌跡を時刻順に対応させ、同時刻コメントの処理順・予約競合・fallback発火条件を詰める。
- v3.1.28 で `overlay-tests` と `scripts/nico-overlay-trace.mjs` のコメント入力を、`source: "trunk"` が存在するfixtureでは trunk 優先にした。`sm6240144-comments.json` は `trunk` 1000件と `leaf` 408件を同一 `comments` 配列に含んでおり、従来は両方を描画していたため05:29区間の `おっくせんまん` が公式実測より過密になっていた。
- 同fixtureの05:29区間では、`trunk` の広い `naka` コメント時刻が実測の `850x120` レイヤー開始時刻に近い。一方 `leaf` だけにすると広いコメントが570秒台から始まり、実測の566秒台開始と合わない。したがって現時点の校正入力は trunk を公式表示スレッド候補として扱う。
- v3.1.28 の `overlay-lane-ordinary-565s-12s-v328-trunk-default` では、fixtureをそのまま渡してもtrunk優先により `records: 1394` となり、旧来のtrunk+leaf混在 `records: 2183` より教師条件に近い。レーン分布は `lane0:6 lane1:3 lane2:2 lane4:1 lane7:1` で、まだ実測の中段/下段分散とは完全一致していないが、過密入力による飽和fallbackは大きく減った。
- v3.1.29-v3.1.31 で `getLaneNextAvailableTime()` を `endTime` だけでなく `totalEndTime` 側へ寄せる実験をした。`NICO_LANE_REUSE_TOTAL_END_WEIGHT = 0.55` 以上で、05:29クラスタの候補は上段へ戻りすぎず、`sourceWidth >= 380` の暫定スコアは v3.1.28 の75.2%から80.7%へ改善した。0.25は77.9%で不採用。
- v3.1.33 で単一行スクロールコメントのテクスチャ外形を、`big` / `small` の表示サイズではなく基準フォントサイズ (`fontSize / sizeScale`) 由来に寄せた。これにより `big naka` の `おっくせんまん` が `1230x173` からニコニコ実測に近い `852x120` へ変わった。
- v3.1.33 の05:29クラスタ限定スコアは75.6%。v3.1.30の69.2%から改善したが、`big` コメントが正しく比較対象へ入るようになったことで、旧スコアで隠れていた過剰表示/レーン差分が見えるようになった。現状の主な差分は、COがクラスタ冒頭を `0,1,2,3,4,5,6,7` のように連続的に埋めるのに対し、実測は `0,1,3,0,7,0,6,2,3,4,5,6` と上段再利用と下段分散が混ざる点。
- v3.1.34 で非 `full` のスクロール移動計算と予約計算を、`sizeScale` 後の見た目幅ではなく `width / sizeScale` の基準幅へ分離した。描画テクスチャ自体はv3.1.33の外形を維持しつつ、`bufferWidth`、開始/終了X、速度計算、`reservationBase`、予約用テクスチャ幅は基準幅で見る。これはコメントアート専用ではなく、`big naka` を含む通常スクロールコメント全般の移動基準補正。
- v3.1.34 の05:29クラスタ限定スコアは、`NICO_LANE_REUSE_TOTAL_END_WEIGHT = 0.75` では75.9%。速度サブスコアは0.816から0.843へ改善したが、レーン順はまだ `0,1,2,3,4,5,6,7,0,1,7,2,3` に寄る。再利用待ちweightを再探索したところ、0.25と0.1はいずれも68.4%へ悪化し、0が77.6%で最良だった。現時点ではweight=0を採用し、`endTime + RESERVATION_TIME_MARGIN_MS` 基準で早めにレーン再利用させる。
- v3.1.34 weight=0 の05:29クラスタ限定スコア内訳は、count 0.923、laneHist 0.833、sequence 0.683、y 0.665、speed 0.843、総合77.6%。未達の主因は、実測が `0,1,3,0,7,0,6,2,3,4,5,6` なのに対し、COが `0,1,2,3,4,5,6,0,1,7,7,2,0` になり、中段のスキップと下段分散のタイミングがまだ合わない点。
- 2026-06-16 にCDPを再起動した状態で `lane-ordinary-565s-12s-current-cdp-2` を採取したところ、`start-ms=565000` でも実際の最初のmeta sampleが約567.057秒になり、先頭コメントが落ちていた。`lane-ordinary-563s-14s-current-cdp` として `start-ms=563000` / duration 14s で取り直すと、meta sampleは約562.956秒から始まり、05:29クラスタ教師として使える。
- 新しい教師では、big `naka` の実プレイヤーsource canvasは `1224x174`、fontは `600 39px`、mediumは `850x120` / `600 27px`。v3.1.34のbig `852x120` は現在の実測に対して小さすぎたため、v3.1.35で単一行スクロールのテクスチャ外形を `fontSize` / `width` そのものから作る一般規則へ戻した。CO側bigは `1230x173` になり、実測に近い。
- `scripts/nico-lane-score.mjs` は、`sourceSize` を `*x120` 固定で拾う古い仮定をやめ、`min/maxSourceHeight` で高さ範囲を指定できるようにした。またY比較は `medianY` ではなく、`nico-lane-reverse` の `basis=content` と一致する `laneBasisY` を使う。テクスチャ外形は時系列ペアではなく `sourceSize` ヒストグラムで採点する。
- v3.1.35 で非 `full` スクロールの移動計算も見た目幅 (`comment.width`) ベースへ戻した。新教師 `lane-ordinary-563s-14s-current-cdp` 基準では、v3.1.35 big外形+見た目幅x(t) の05:29クラスタ限定スコアは82.2%。内訳は count 0.929、laneHist 0.900、sequence 0.723、y 0.711、sourceSize 0.900、speed 0.806。
- 不採用実験: scroll visible durationを5750msに短縮すると、medium/bigの速度は近づくが評価窓内候補数が9件へ減り、総合64.3%へ悪化した。不採用実験: `NICO_SCROLL_LANE_HEIGHT_RATIO` を2.2へ下げると、候補数とレーン分布が崩れて総合62.1%へ悪化した。現時点ではduration 6000ms、laneHeight ratio 2.525を維持する。
- 追加の不採用実験: leaf単体入力は51.3%、trunkの2026-03-02以前だけに絞ると59.7%、trunkのno 80317/80325だけ除外しても69.2%で悪化した。公式教師はtrunk寄りだが、単純なfork切替や日付cutoffでは再現できない。現時点ではfixtureのtrunk優先を維持し、入力集合差は未解決リスクとして扱う。
- 追加の不採用実験: `NICO_SCROLL_EXTENSION_BASE_PX = 150` はmedium/big速度だけは教師へ近づくが、候補数が落ちて64.3%へ悪化した。現時点ではscroll extension base 80を維持する。
- `scripts/nico-fetch-comments.mjs` を追加し、CDPでログイン済みニコニコページ内から `meta[name="server-response"]` と `nvComment` APIを使って現在コメントを再取得できるようにした。2026-06-16時点の取得結果は owner/main/easy の3threadsで、mainは `commentCount=80335` / `commentsLen=1408`。既存 `overlay-tests/fixtures/sm6240144-comments.json` とID/no/vpos/body単位で完全一致したため、コメントデータ自体の古さは否定できる。
- `scripts/nico-lane-reverse.mjs` の `--sample-limit` は、従来 `trajectorySamples` のJSON出力自体も切っていた。採点に使うデータが途中で欠けて偽の低スコアになるため、出力JSONは全軌跡を保持するよう修正した。以後、採点には `sample-limit` に依存しないfull reportを使う。
- `sample-limit` 修正後の再評価では、v3.1.35外形・見た目幅x(t)・`NICO_LANE_REUSE_TOTAL_END_WEIGHT=0.5/0.75/1.0` はいずれも総合83.2%。ただし1.0は先頭レーンが `1,2,0...` に崩れるため不採用。0.5/0.75は同点で、既存経緯と先頭順の自然さから0.75を採用する。
- 2026-06-16 の追加調査で、`scripts/nico-lane-reverse.mjs` に `fillText` / `strokeText` 由来の `text` / `fillStyle` / `fontSize` / CO側 `commentVposMs` / `commentCreationIndex` を `trajectorySamples` へ付与した。`scripts/nico-lane-score.mjs` も、時系列順スコアに加えて、色・フォント・テクスチャサイズ・時刻で対応付ける `matchedProgressPercent` を出す。
- 同日、Chrome CDPで `lane-ordinary-563s-14s-current-cdp-refresh` を再採取したところ、公式教師は `trunk` 単独でも `leaf+trunk` 全量でもなく、trunk中心に一部leafが混ざった受信済みコメント集合として見える。現在のCO auto/trunk候補は、この再採取教師に対して通常スコア80.6%、属性対応スコア75.7%。
- 教師軌跡をコメント本文・色・fontSize・推定vposで生コメントへ機械マッチすると、05:29区間では `no=80317/80325` 相当が公式教師に見えず、代わりに `leaf` の `no=79119/78923/79068` 相当が見える。実験的に `--exclude-nos 80317,80325 --include-nos 79119,78923,79068` で入力集合を揃えると、同じレンダラ規則のまま通常スコア89.4%、属性対応スコア90.9%まで上がる。
- したがって05:29区間の未達主因は、レーン選択式だけではなく「公式プレイヤーが実際に受信済みのコメント集合」とfixtureのflatten済み集合の差。これはコメントアート専用処理では直さない。次は公式プレイヤーの受信済みコメント集合をCDPで安定取得するか、nvCommentのlayer/fork/leaf/trunk統合規則を再現する。
- `scripts/nico-overlay-trace.mjs` には検証用に `--comment-source auto|trunk|leaf|all`、`--exclude-nos`、`--include-nos` を追加した。`exclude/include` は校正実験用であり、本体レンダラの仕様に持ち込まない。
- `scripts/nico-trace.mjs` はreload採取のため、CDP例外詳細表示、`document.body === null` 対策、`--video-wait-ms` を追加した。ただし既存タブの `--reload true` は今回video要素が戻らず失敗したため、次は新規タブロードまたは正規nvCommentリクエスト再現で教師コメント集合を固定する。
- 次の調査対象は、`reservationWidth` / `preCollisionDurationMs` の短縮ではなく、実測側でlane 2が空いて見える局面でもlane 3へ飛ぶ理由、同時刻付近でlane 0とlane 6へ分かれる理由を `laneDecision.blockedBy` と実測 `sourceCanvasId` 時系列で対応させること。単純な「低い空きlane優先」「全lane順埋め」ではない。
- 現時点の推定: 通常 `naka` の本文レーンピッチはおおむね動画高665px時に68px、上から低いlane番号を優先する。ただし混雑時の実プレイヤーは lane 0 を強く再利用しつつ、長いコメントが連続すると lane 1,2,3...へ広げる。COの `getLanePriorityOrder()` が `nextAvailableTime` で強く並べ替える点は引き続き検証対象だが、先に同一コメント集合の取得が必要。
- 現時点の推定では、ニコニコ側のレーン選択は「低いlane番号から順に空きを試す」だけではなく、近接時刻の同時表示コメントで上位レーンをかなり強く再利用する。CO側の `getLanePriorityOrder()` は `nextAvailableTime` で並べ替えているため、ここがニコニコ実装との差分候補。次に、`lowest-free-first`、`earliest-reusable-first`、`stable-top-first-with-collision` の3候補を overlay trace で比較する。
- 同一コメントの `x(t)` を複数フレームでフィットし、開始位置、終了位置、速度を分けて比較する。
- コメントアートが密集している区間だけでなく、通常コメントが多い区間も教師データにする。
- 00:22 GRADIUS / 00:59 XEVIOUS / 01:21 スペランカー / 01:23 半魚人のような序盤CAを、同一コメントデータで時系列比較する。
- 既存の `early-logos-18s-70s` 実測traceは `network-comments.json` が空で、実測ニコニコ側コメントと `overlay-tests/fixtures/sm6240144-comments.json` の同一性が未確認。
- `scripts/nico-trace.mjs` の `network-comments.json` は、CDP attach 後の Network response と、ページ内 `fetch` / `XMLHttpRequest` フックが観測した response だけを保存する。公式プレイヤーが attach 前に受信済みのコメントデータや、プレイヤー内部メモリ上のコメント一覧を復元するものではない。
- 次回、公式プレイヤーのコメントデータを教師にする場合は、`--reload true` とページ内 response フックを併用して読み込み直し時の response を拾うか、正規のコメント取得リクエストを別途再現するか、プレイヤー内部状態から受信済みデータを探す必要がある。
- `full` 横流れは v3.1.6 で横長 `ender full` の幅スナップと lead を調整済み。右端切れは改善したが、GRADIUS / XEVIOUS の流れ位置は引き続き `x(t)` フィットで詰める。
- 05:45 付近の固定 `ue` CAは、RDP実測で `1252x52` を `0.8` 倍描画する横長レイヤーが中心だった。v3.1.8 で overlay側の横長固定CAを `2300x52 * 0.355` から、動画高基準 `1252/597.3833` 幅かつ `0.8` 描画スケールへ寄せた。
- 05:45.806 付近のゾーマCAでは、下地レイヤーが画面全体へ追従しても、ダークレッド系レイヤーだけが下地に対して右へ数十pxズレて見えるケースが残っている。次回は `#B72515` / `#E7311D` などのダークレッド層と、白・黄・青・紫・橙の下地層を同一vposの同期 `full` / `mincho` レイヤーとして扱い、`drawImage.x/y/width/height` と内部 `fillText` の基準点を色別に数値比較する。
- ゾーマのダークレッド層ズレはコメントアート個別分岐では直さない。`hasSameVposFullMinchoEnder` 系の同期レイヤー全般で、テクスチャ外形、内部描画スケール、`getTextureDrawOffsetX`、`virtualStartX`、`x(t)` のどれが下地層との差を作っているかを分解し、同じ規則でドラゴン三体・スケルトンドラゴン・猫マリオが崩れないことを確認する。
- overlay-tests には `CO: v...` と巨大 `full` コメントの `x/y/w/h/color` 診断表示を追加済み。視覚上ズレている場合は、まず診断欄で `CO` バージョンとダークレッド層の座標が更新済みかを確認し、古いビルド/別サーバー/キャッシュ問題とレンダラ本体の問題を切り分ける。

完了条件:
- 実測traceとoverlay traceで、普通コメントの `drawImage` 中心座標、テクスチャ幅/高さ、速度、lane `y` の平均誤差とp95誤差が安定して小さい。
- コメントアート専用分岐を増やさず、通常コメントも同じ式で悪化していない。
