# 2026-07-17 上固定full明朝・同一vposレイヤーCA観測結果

## 目的

『ようこそ実力至上主義の教室へ』第5話EDで、四角形と白抜き歌詞を複数コメントの重ね合わせで作るコメントアートがCO v4.1.0では崩れる原因を切り分ける。

## 実サンプルの構造

`so31723295` の `1385.750–1427.310秒`（ED fixtureでは `45.750–87.310秒`）には、次の同一構造を持つ11バッチ、計48コメントがある。

- sourceはすべて旧 `leaf`
- 1バッチは同一投稿者による同一 `vposMs` の3〜5コメント
- コマンドはすべて `ue big full mincho` で、色だけがblack、white、red、pinkに分かれる
- 本文はすべて16行で、空行と全角空白で描画行を縦方向へ位置決めする
- `ender` は付かない
- 黒い矩形、白い抜き、歌詞は別コメントであり、同一座標へ重なって初めて完成する

代表例は `vposMs=45.750秒` のコメント番号 `12945–12947` である。後続バッチもコメント番号昇順に矩形層、色層、文字層を追加する。

## 既存研究の適用範囲

[合成コメント注入・通常nakaレーン観測](./2026-07-17-synthetic-comment-lane-results.md) が固定位置について確認したのは、単行・同時2コメントまでだった。同文書では `full`、フォント、色の分離が未確定事項として残っていた。

[通常コメントoverflow観測](./2026-07-17-overflow-results.md) も通常 `naka` の表示高超過を対象とし、`ue` / `shita` のoverflowと「固定コメント固有の短時間重ね許容条件」を次の反証として残していた。このため、今回の入力領域はv4.1.0へ反映した実験範囲の外側だった。

## 公式バンドルへの最小プローブ

[fixed-full-mincho-layered-ca.json](../scenarios/fixed-full-mincho-layered-ca.json) を、保存済み公式バンドルの隔離再生へ注入した。実サンプルと同じ16行、`ue big full mincho`、同一vposの3レイヤーを使用した。

```powershell
bun run research:nico:replay -- `
  --archive research/captures/sm6240144-baseline-20260717/manifest.json `
  --scenario research/scenarios/fixed-full-mincho-layered-ca.json `
  --seek-ms 10000 `
  --settle-ms 3000 `
  --out research/runs/fixed-full-mincho-layered-ca `
  --allow-misses

bun run research:nico:analyze -- `
  --trace research/runs/fixed-full-mincho-layered-ca/canvas-trace.jsonl `
  --scenario research/scenarios/fixed-full-mincho-layered-ca.json
```

公式の観測結果は次の通りだった。

|     no | 処理sequence | source canvas | outer canvas上のtranslation X | translation Y |
| -----: | -----------: | ------------: | ----------------------------: | ------------: |
| 900101 |          206 |     `326×810` |                           539 |     -1.339982 |
| 900102 |          207 |     `326×810` |                           539 |     -1.339982 |
| 900103 |          208 |     `326×810` |                           539 |     -1.339982 |

処理順はコメント番号昇順だが、3件の描画座標は完全に一致した。source canvas高さ810pxは外側Canvas高さ768pxを超えるが、公式は次レーンへ送らず、同じ上端座標へ描画している。

## CO v4.1.0との差

COの `assignStaticLane` は、表示中の上固定コメントを高さ区間として予約し、時間とY区間が重なる次コメントを下の空き位置へ送る。今回の16行bigコメントはほぼ表示高全体を予約するため、同一vposの2枚目以降が下側の画面外へ積まれる。

また、`hasSameVposFullMinchoEnder` は `naka full mincho` の複数行コメントだけを対象にし、同一vposに `ender` がある場合に限って有効になる。今回のコメントは `ue` かつ `ender` なしなので、この既存補正は適用されない。

したがって主因は色、字体、文字幅ではなく、固定コメントの同一vposレイヤーを衝突回避対象にしている配置・予約規則である。黒、白、歌詞の各レイヤーが別位置へ分離されることで、四角形と白抜きの合成が失われる。

## 結論

このコメントアートは既存研究で漏れたサンプルケースである。より正確には、既存文書で未確定と明記していた「固定位置・表示高超え・同一vposの重ね許容」に該当する。

## 実装修正前に必要な反証

1. 2枚目のvposを同一、`+1ms`、`+10ms`、`+100ms`、`+1000ms`へ変え、固定レイヤーを同位置へ重ねる時間差境界を測る。
2. `ue` と `shita`、単行と16行、表示高以内と表示高超えを直交させる。
3. `full`、`mincho`、色、本文幅を一つずつ外し、重ね許容の判定入力を特定する。
4. 同一vposの配列順と `no` を逆転し、座標と最終描画順を分離する。
5. 3〜5レイヤーの実バッチをホールドアウトとして使い、最小プローブから得た一般規則で全11バッチが復元することを確認する。

単に「同一vposなら固定コメントを常に重ねる」と実装するのは、通常の上固定弾幕まで重なる可能性があるため、上記境界を観測してから一般規則として反映する。
