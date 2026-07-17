# ニコニコ横断プローブ計画

> 旧評価基盤の計画と途中経過です。現在の合成実験基盤は [`research/`](../../research/README.md) に集約されています。

目的:
- 1動画1区間への過剰適合を避けるため、複数動画・複数コメントソース・複数区間の教師traceとCO traceを同じ評価器で横断採点する。
- 個別CAの見た目に合わせた分岐ではなく、通常 `naka` / 固定 `ue` / `shita` / `full` / 多行コメントアートが同じ一般規則で改善しているかを見る。
- 当面の合成スコアは、`sm6240144` / `sm38851567` / `sm6945510` の複数通常コメント区間、合計9プローブで定義する。

原則:
- 単一区間の `progressPercent` は採用判断に使わない。採用判断は横断プローブの平均、下位パーセンタイル、悪化件数で見る。
- 合成スコアは9プローブすべてが `ok` になった場合だけ算出する。missingを除いた暫定平均は採用判断に使わない。
- `--exclude-nos` / `--include-nos` は原因分解用であり、本体レンダラへの採用根拠にしない。
- 教師コメント集合は、可能な限り公式プレイヤーが実際に受信済みの集合に固定する。固定できない場合は、そのプローブを `unstableInput: true` として総合採用判定から分ける。
- コメントアート区間は通常 `naka` レーン位置取りの合成評価には使わない。コメントアートは別の描画プリミティブ比較・外形比較で扱う。

プローブ種別:
- `lane`: 通常 `naka` のレーン、Y、速度、テクスチャサイズを `scripts/nico-lane-score.mjs` で比較する。
- `strict`: 同一vposの外形レイヤー位置を `scripts/nico-strict-score.mjs` で比較する。
- `internal`: 同一vposの内部 `fillText` 配置を `scripts/nico-internal-score.mjs` で比較する。

最低限の採用ゲート案:
- `lane` プローブ平均 `matchedProgressPercent >= 90`。
- `lane` プローブの最小 `matchedProgressPercent >= 82`。
- 変更前より悪化したプローブが全体の20%以下。
- `strict` / `internal` は対象CAの `valid: true` を必須にし、外形・内部の下位ケースを人間が視覚確認する。

9プローブ:
- `sm6240144-lane-215s-ordinary`: sm6240144 03:35 通常 `naka` 密集。
- `sm38851567-lane-096s-dense`: sm38851567 01:36 通常 `naka` 密集。
- `sm6240144-lane-565s-ordinary`: sm6240144 05:29 通常 `naka` 密集。
- `sm38851567-lane-030s-static-heavy`: sm38851567 00:30 固定/通常混在。
- `sm38851567-lane-090s-dense`: sm38851567 01:30 最密コメント区間。
- `sm38851567-lane-130s-ending`: sm38851567 02:10 終盤コメント密集。
- `sm6945510-lane-080s-reaction`: sm6945510 01:20 リアクション密集。
- `sm6945510-lane-210s-dense`: sm6945510 03:30 通常コメント密集。
- `sm6945510-lane-140s-dense`: sm6945510 02:20 通常コメント密集。

運用:
- プローブ定義は `.calibration/nico/probes.json` に置く。
- `scripts/nico-probe-score.mjs --config .calibration/nico/probes.json` で横断集計する。
- trackedな当時の雛形は [`cross-video-probes.example.json`](./cross-video-probes.example.json) に保存している。
- 新しい校正変更を入れたら、個別スクリーンショットを見る前に横断スコアを確認する。
- プローブの教師traceが無い場合は `missing` として報告し、勝手に0点にも成功扱いにも入れない。

現在の開始状態:
- 2026-06-16時点では9プローブ定義、CO候補trace生成、CDP教師trace取得、横断スコア集計まで到達済み。
- `sm6945510-lane-240s-tail` は候補traceが空になったため、`sm6945510-lane-140s-dense` に置き換えた。
- 9プローブすべてが `ok` になり、コメントアート区間を通常レーン評価から除外して通常コメント区間へ差し替えた後の合成スコアは `matchedProgressPercent: 61.9`。
- 安定プローブ7本だけの平均は `61.5`、最小は `25.2`。
- `sm6240144-lane-022s-gradius` / `sm6240144-lane-083s-spelunker` / `sm6240144-lane-563s-ordinary` はコメントアート寄り区間のため、通常 `naka` レーン位置取りプローブから外した。
- `sm6240144-lane-565s-ordinary` は `75.7`、`sm6945510-lane-210s-dense` は `59.0` で、現時点ではこの2本がレーン校正の主な足場になる。
- CO候補traceは `.calibration/nico/<videoId>/input-current/nvcomment-current-main-comments.json` が存在する場合、それを優先して生成する。公式APIから取得したmainコメント集合に切り替えても初回合成スコアは `35.4` のままだったため、低スコアの主因は単純なfixture差ではない。
- CO候補traceは公式traceと同じく3秒プリロールしてから採取する。これにより開始時点で既に流れているコメントのレーン予約状態を再現する。
- `scripts/nico-lane-reverse.mjs` は描画Yではなく描画矩形下端で候補判定する。ニコニコ公式はトップレーンで `drawImage` のYが負になることがあるため、従来条件では教師候補を落としていた。
- `scripts/nico-lane-score.mjs` はテキスト不一致ペナルティを強め、別コメント同士の誤ペアリングを抑える。
- `scripts/nico-lane-score.mjs` は `maxPairCost` を導入し、高コストな別コメント同士の強制ペアリングを未対応扱いにする。これにより診断は厳密化しつつ、誤ペアによる低スコアノイズが減った。
- `scripts/nico-lane-score.mjs` は評価区間と軌跡が交差しているコメントを採点対象にする。区間開始前に流入して区間内に表示されているコメントを落とさない。
- `scripts/nico-probe-score.mjs` は `excludeFromComposite` に対応するが、現在の9プローブはすべて通常コメント区間へ差し替え済みで、合成対象外プローブは0件。
- `naka` レーン選択は「次に空く時刻で並べ替える」方式より、上から順に衝突判定する方式のほうが9プローブ合成で改善した。固定コメント占有レーンをスクロールコメントが避ける処理も外したほうが教師traceに近い。
- スクロール予約幅はテクスチャ幅の2倍相当ではなく、通常コメント幅ベースに寄せたほうが安定プローブ平均が改善した。
- スクロール可視時間は `6000ms` より `6700ms` のほうが9プローブ合成で改善した。`6800ms` では合成が落ちたため、現時点では `6700ms` を採用値にする。
- `scripts/nico-lane-diagnose.mjs` で、`probe-score-current.json` のmatched pairとCO内部 `laneDecision` を突き合わせる。出力は `.calibration/nico/lane-diagnosis-current.json` と `.calibration/nico/lane-diagnosis-current.md`。
- `scripts/nico-overlay-trace.mjs` はプリロール中の `laneDecision` だけをtraceへ残す。描画trajectoryにはプリロールを混ぜず、開始時点で既に流れているコメントのレーン決定だけ診断できるようにする。
- レーンスキャン開始位置を選択レーンの次へ進める単純カーソル方式は、9プローブ合成 `44.5 -> 41.5` に悪化したため不採用。ニコニコ側は単純ラウンドロビンではない。
- 近接vposのコメントだけ開始レーンを進めるバーストカーソル方式も、9プローブ合成が `49.5 -> 48.7` に悪化したため不採用。見た目上の連続投入はあるが、単純な同時刻カーソルでは説明できない。
- `text + vpos` の重複排除を外す実験は、9プローブ合成が `49.7 -> 49.1` に悪化したため不採用。現行プローブ入力では、教師より余計な候補コメントを増やす方向に働く。
- 衝突判定は24pxまでの横方向重なりを許容したほうが9プローブ合成で微増した。16px/48pxは24pxより悪かったため、現時点では24pxを採用値にする。
- 通常 `naka` のvpos leadは `2000ms` より `1800ms` のほうが9プローブ合成で改善した。`1700ms` / `1900ms` は `1800ms` より悪かったため、現時点では `1800ms` を採用値にする。
- スクロールレーンピッチは `2.525` から `2.1` へ詰めると、教師側の下位レーンを候補範囲外に落とすケースが少し減り、9プローブ合成が `49.5 -> 49.7` に微増した。`2.0` では `49.6` に落ちたため、現時点では `2.1` を採用値にする。
- 現行診断では平均レーン差 `-1.08`、平均絶対レーン差 `1.95`。プリロール中のlaneDecision取得により `preexistingAtTraceStart` / `missingCandidateLaneDecision` は解消した。COはまだ教師より上レーンへ寄る傾向が残るため、次はコメント順序・発火時刻・衝突幾何をさらに分解する。
