# 過去の互換性研究履歴

このフォルダは、ニコニコ動画のコメントシステムとの互換性を高める過程で作成した旧手順、途中経過、方針検討ログを保存します。内容は当時の判断を追跡するための履歴であり、現行仕様や今後の作業計画の正本ではありません。

現在の参照先は次のとおりです。

- 利用方法と公開API: [`README.md`](../README.md)、[`DOCUMENTATION.md`](../DOCUMENTATION.md)
- 再現可能な研究ツール、シナリオ、観測データ、採用結果: [`research/`](../research/README.md)
- リリースごとの変更: [`CHANGELOG.md`](../CHANGELOG.md)
- 更新と公開の手順: [`how-to-update.md`](../how-to-update.md)

## 旧キャリブレーション手順

- [`legacy-calibration-workflow.md`](./legacy-calibration-workflow.md): 公式プレイヤーtraceとoverlay traceを比較していた旧運用手順

## 方針検討の会話ログ

- [`discussions/lane-calibration-strategy.md`](./discussions/lane-calibration-strategy.md): 低速な定数校正を改善するための検討
- [`discussions/lane-algorithm-first.md`](./discussions/lane-algorithm-first.md): レーン決定アルゴリズムの推定を先行させた方針転換

## 個別調査と旧評価基盤

- [`investigations/comment-position-calibration.md`](./investigations/comment-position-calibration.md): コメント位置、速度、テクスチャ寸法の校正
- [`investigations/upper-lane-overflow.md`](./investigations/upper-lane-overflow.md): 上固定コメントの描画領域調査
- [`investigations/cross-video-probes.md`](./investigations/cross-video-probes.md): 9区間を使った旧横断評価と当時の測定値
- [`investigations/cross-video-probes.example.json`](./investigations/cross-video-probes.example.json): 旧評価設定の保存例
- [`investigations/lane-reverse-engineering-goal.md`](./investigations/lane-reverse-engineering-goal.md): 旧評価基盤から見た未観測範囲

2026年7月以降の隔離実験では、固定321ケース、スクロール431ケース、動画終端72ケースの合計824ケースを一般規則として検証しました。その設計、結果、反証可能性は `research/studies/` に保存しており、本フォルダに残る「次にやること」や旧スコアは完了判定には使用しません。
