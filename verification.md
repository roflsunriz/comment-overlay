# 検証手順

## Dependabot 自動処理（2026-09-23）

`.github/workflows/dependabot-automation.yml` を actionlint で検査し、PR 用 workflow 名（CI）と一致することを確認する。Dependabot の patch／minor かつ全 PR チェック成功の場合だけ取り込み、major・古い SHA・限定修復後も失敗した PR は残す。

2026-10-11、PR #15 は CI 成功後の自動マージで基準ブランチの同時更新により失敗した（Actions run 37412698121）。現在の head SHA、全チェック、競合がないことを確認し、手動で `master` にマージした。CI の `pull_request` 対象が `main` になっていたため、実際の既定ブランチ `master` に修正した。次の PR で PR イベントによる CI と自動処理の結果を確認する。

## 依存脆弱性の確認（2026-09-23）

監査では js-yaml を含む推移依存の旧版が検出された。Bun 1.4.0 で lockfile の固定インストールと再監査を行い、既知脆弱性 0 件を確認した。型・lint・45件のテスト・ビルド成功。

2026-10-11 の監査では `brace-expansion` 5.0.9 と `source-map-js` 1.2.1 に既知の脆弱性が4件あった。前者の override を 5.0.12 に上げ、後者を依存更新で 1.2.2 に上げた。更新後の `bun audit` は既知脆弱性0件を報告した。`bun install --frozen-lockfile`、lint、型チェック、ビルド、src の24テスト、研究基盤の12テストが成功した。`overlay-tests` の視覚判定は行っていない。

大量の Dependabot PR により CI 完了より分類が遅れる場合でも、分類後の `workflow_dispatch` が現在の PR 番号と head SHA を照合して再評価する。別の作成者、古い SHA、未完了の CI はマージしない。

## 2026-10-05: GitHub受付・READMEの整備（公開前）

- 比較元: `6a0c426a08f8b01f7bf3be1ab142c20a1ff86774`（`master`）。
- 受付フォーム 2 件のYAML構造、重複キー・ID、入力型、選択肢、予約ファイル名を一括検査し、エラー0件。
- 既存の固有質問・入力例・必須条件を原文と照合。READMEのリンク・画像・コマンド・条件を確認し、裏付けがある誤記だけを訂正した。
- 既存のCI、Dependabot、labeler、ライセンスのファイル内容は比較元から変更していない。
- 製品のビルド・インストール・実機操作、GitHub上のフォーム表示、公開後CIは今回の静的検証に含めない。公開後に実際の受付表示と必要ラベルの適用を確認する。
