# 2026-07-17 複数行コメント・可変高スロット観測結果

## 目的

通常コメントの縦配置が固定間隔のレーンなのか、コメントごとの描画高を持つ可変高スロットなのかを分離する。あわせて、複数行でsizeコマンドが文字サイズと行高をどう変えるかを調べる。

実行環境、外部通信遮断、NicoCache由来の `/local/` 資産除外は [合成コメント注入・通常nakaレーン観測](./2026-07-17-synthetic-comment-lane-results.md) と同じである。各ケースは独立したオフライン再生へ2コメントだけを投入した。

## 座標系

公式プレイヤーの外側Canvasはウィンドウ寸法を変えても内部高 `768 px` を維持し、CSS表示矩形だけを動画領域へ比例拡縮していた。`devicePixelRatio` は観測した両条件で1だった。文字描画元Canvasでは `scale(2, 2)` が適用されているため、本書の `source font=27 px` は外側Canvas上では `54 px` に相当する。

ウィンドウを `1366×768` から `1600×900` へ変えても、外側Canvas内部座標で測るmedium単行の縦ブロック高は `68.164598 px` のままだった。したがってCOへ移す際は、外側Canvas基準の文字サイズ `small=36`、`medium=54`、`big=78` とブロック高を `768` で正規化し、COの論理表示高へ比例させる。

## 同サイズの行数別ブロック高

同一時刻の2コメント間のY差を、縦スロットが消費したブロック高として測った。smallとmediumは自動縮小の閾値直前まで、行が1本増えるごとに一定量だけブロック高が増えた。

| size   | 行数 | 最終font | source高さ | 縦ブロック高 |
| ------ | ---: | -------: | ---------: | -----------: |
| small  |    1 |    18 px |      84 px |     46.47 px |
| small  |    2 |    18 px |     120 px |     82.55 px |
| small  |    3 |    18 px |     156 px |    118.64 px |
| small  |    4 |    18 px |     192 px |    154.73 px |
| small  |    6 |    18 px |     266 px |    226.90 px |
| medium |    1 |    27 px |     120 px |     68.16 px |
| medium |    2 |    27 px |     178 px |    126.02 px |
| medium |    3 |    27 px |     236 px |    183.87 px |
| medium |    4 |    27 px |     294 px |    241.73 px |
| big    |    1 |    39 px |     174 px |     98.66 px |
| big    |    2 |    39 px |     266 px |    189.14 px |

mediumの2行から予測した3行のブロック高と、実測値の差は `0.00001 px` 未満だった。smallも丸め表示上は同じ線形関係になった。

`naka`、`ue`、`shita` へmedium 2行を投入すると、絶対ブロック高はすべて `126.02 px`だった。`naka`と`ue`は下向き、`shita`は上向きに積む。

## 行数閾値での自動縮小

bigの3行目で線形予測が成立せず、公式側がfontを39pxから20pxへ縮小した。短文へ変えても結果が同じだったため、横幅ではなく行数が分岐条件である。

| size   |    閾値直前 | 閾値 | 閾値での最終font | 閾値でのsource高さ | 閾値でのブロック高 |
| ------ | ----------: | ---: | ---------------: | -----------------: | -----------------: |
| big    | 2行 / 39 px |  3行 |            20 px |             188 px |          147.68 px |
| medium | 4行 / 27 px |  5行 |            14 px |             186 px |          155.64 px |
| small  | 6行 / 18 px |  7行 |            10 px |             170 px |          146.32 px |

縮小後も同一size内では一定行高で増えた。

| size   | 行数 | 最終font | source高さ | 縦ブロック高 | 1行追加時の増分 |
| ------ | ---: | -------: | ---------: | -----------: | --------------: |
| big    |    3 |    20 px |     188 px |    147.68 px |               - |
| big    |    4 |    20 px |     236 px |    195.43 px |        47.75 px |
| medium |    5 |    14 px |     186 px |    155.64 px |               - |
| medium |    6 |    14 px |     216 px |    185.68 px |        30.04 px |
| small  |    7 |    10 px |     170 px |    146.32 px |               - |
| small  |    8 |    10 px |     192 px |    166.39 px |        20.07 px |

## 保存済み公式バンドルとの照合

キャプチャ済み公式プレイヤー資産内に、実測した閾値と一致する次の横画面用定数が含まれていた。これはオフラインに保存した資産を検索したもので、追加の外部通信は行っていない。

| 用途                     | big | medium | small |
| ------------------------ | --: | -----: | ----: |
| 文字サイズ用の基準行数   | 7.8 |   11.3 |  16.6 |
| 通常行高用の基準行数     | 8.4 |   13.1 |    21 |
| 縮小時行高用の基準行数   |  16 |   25.4 |    38 |
| 自動縮小を開始する実行数 |   3 |      5 |     7 |

バンドルの処理を変数名だけ一般化すると、横画面の初期値は次の式になっている。

```text
characterSize = baseHeight / characterSizeLineCount[size]

lineHeight =
  (baseHeight - characterSize)
  / (lineHeightLineCount[size] - 1)

resizedLineHeight =
  (
    baseHeight
    - lineHeightLineCount[size]
      / resizedLineHeightLineCount[size]
      * characterSize
  )
  / (resizedLineHeightLineCount[size] - 1)
```

行数が閾値以上かつ `ender` ではない場合、文字サイズも `resizedLineHeight / lineHeight` と同じ比率で縮小してから再計測する。

big 3行へ `ender` を付けた合成入力では、通常の20pxへの縮小が発生せず39pxを維持した。source高さは `356 px`、縦ブロック高は `279.62 px` で、bigの通常行高を3行へ線形延長した予測と一致した。したがって、バンドルで確認した `ender` の自動縮小除外もブラックボックス観測で支持された。

## 混在サイズと混在行数

単行のsmallとbigを同一時刻へ投入し、処理順を反転した。

| 先行  | 後続  |    先行Y |    後続Y |      Y差 |
| ----- | ----- | -------: | -------: | -------: |
| small | big   | -0.51 px | 48.60 px | 49.11 px |
| big   | small |  2.14 px | 98.15 px | 96.02 px |

各sizeが先頭に来たときの固有Yオフセットを後続Yから除くと、次のスロット開始位置はsmallで `46.47 px`、bigで `98.66 px` だった。これは各sizeを2本並べたときのブロック高と一致する。

mediumの単行と2行でも順序を反転した。

| 先行行数 | 後続行数 |   先行Y |     後続Y |       Y差 |
| -------: | -------: | ------: | --------: | --------: |
|        2 |        1 | 1.49 px | 127.58 px | 126.09 px |
|        1 |        2 | 1.56 px |  69.65 px |  68.09 px |

行数ごとの固有Yオフセットを除くと、先行2行では `126.02 px`、先行1行では `68.16 px` 進んだ。したがって、後続コメント自身の高さではなく、先行コメントが占有したブロック高が次のスロット開始位置を決める。

## 現時点で支持される規則

1. 通常コメントの縦配置は、全コメント共通の固定ピッチではなく、各コメントの文字サイズと行高から得た可変高ブロックを予約する。
2. 同じsizeで自動縮小の範囲が変わらなければ、ブロック高は行数に対して線形である。
3. 自動縮小の開始行数は `big=3`、`medium=5`、`small=7` で、`ender` はこの行数起因の縮小から除外される。
4. 混在条件では、先行コメントのブロック高が次のスロット開始位置を決める。
5. `naka`と`ue`は上から下、`shita`は下から上へ同じ可変高ブロックを積む。

## 時間差で生じた空き区間

可変高区間の探索方法を分離するため、次の3コメントを投入した。

1. A: small短文、`vposMs=28800`
2. B: big長文、`vposMs=28800`
3. C: smallまたはbig短文、`vposMs=30000`

A/Cだけの対照では1200ms後に同じ上段を再利用した。AとBを同時投入すると、BはAの下から始まり、1200ms後にも時間方向の衝突予約を維持した。

smallのCはAが解放した先頭の `46.47 px` 区間へ収まるため、Aと同じ `Y=-0.51 px` を再利用した。bigのCは必要な高さが `98.66 px` で先頭の空き区間へ収まらないため、Bの下の `Y=147.26 px` へ配置された。

この結果は、公式が固定レーン番号を選ぶのではなく、上端から候補コメントの縦区間を置き、時間方向で衝突中の予約区間と重ならない最初のYを採用する規則を支持する。

```text
for candidateTop from top to bottom:
  candidateBottom = candidateTop + candidateBlockHeight
  if every time-conflicting reservation is vertically disjoint:
    choose candidateTop
```

## 保存済みバンドルで確認したスロット探索

保存済みの `PlayerSeekBar-DhFwmJ0e.js`（response body SHA-256 `493fbda6d276b40b6a1cc903a2d867729aace173d61df0843010a2b70d5e9205`）には、描画位置が同じで縦区間と時間方向の両方が衝突するコメントを走査する処理が含まれていた。変数名だけを一般化すると次の規則である。

```text
candidateTop = renderArea.top

while a conflicting reservation exists:
  candidateTop = reservation.y + reservation.height + 0.1
  if candidateTop + candidate.height >= renderArea.bottom:
    overflow = true
    break

if overflow:
  candidateTop = renderArea.top
    + random() * (renderArea.height - candidate.height)
```

縦区間の重なり判定は端点が一致した場合も衝突として扱う。`shita` は同じ処理を下端から上向きに反転する。これは空き区間プローブの結果と一致し、表示高を超えた場合のランダムYはbundle読解から得た規則である。ランダムYの実測分布自体は、独立したoverflowプローブで引き続き反証する。

## CO実装への反映

v4.0.0までのCOは `src/renderer/resize.ts` で全コメント共通の `baseFontSize × 2.1` をlaneHeightにし、`src/renderer/lanes-activation.ts` で `laneIndex × laneHeight` からYを決めていた。このモデルでは、実測したsize別・行数別のブロック高と、混在順序に依存するスロット開始位置を表現できなかった。

v4.1.0では、`src/comment/nico-layout.ts` に768基準のsize別文字寸法、行高、自動縮小閾値を集約し、時間方向の既存衝突式を維持したまま、縦方向を上端から探索する可変高区間予約へ置き換えた。校正traceとframe snapshotには `lineHeightPx` と `slotHeight` も記録する。

## 次の反証

1. 横画面とは別の定数を使う縦長・short条件を独立に観測する。
2. 通常表示高を超えたときのoverflow配置は [通常コメントoverflow観測結果](./2026-07-17-overflow-results.md) で反証し、ランダムYフォールバックを支持した。
