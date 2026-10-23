# 検証手順

## 2026-10-23: 既定ブランチの `main` への変更

- GitHub のブランチ改名APIで `master` を `main` へ変更した。リポジトリの既定ブランチ、remote の `HEAD`、ローカルブランチと upstream がすべて `main` を指し、remote に旧 `master` が残っていないことを確認した。Open PR は0件だった。
- Ruleset `main protection(delete/force)` は `~DEFAULT_BRANCH` を対象とし、改名後の `main` に削除禁止と non-fast-forward 禁止が適用されることを GitHub Rules API で確認した。Issueフォームが参照する `main` 上の `README.md` と `SECURITY.md` も GitHub Contents API で取得できた。
- `bun install --frozen-lockfile`、変更YAMLの構文・Prettier検査、`bun run lint`、`bun run type-check`、33件のBunテスト、研究基盤12件のNode.jsテスト、`bun run research:test`、`bun run build`、`git diff --check` が成功した。`bun audit` は148パッケージの既知脆弱性0件、`bun outdated` は非互換のTypeScript 7以外に更新候補なしだった。
- push後の GitHub Actions `CI`（run 39938076999）は `main` のコミット `c6237ddf3c67cd097d1ece4032d4402967616964` に対して成功した。`overlay-tests` は既存方針どおり目視操作せず、生成とTypeScriptビルドまで確認した。

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

## 2026-10-16: findings.md への知見分離

- 対象: AGENTS.md、README.md。固有の環境・構成・実行手段・調査知見を [findings.md](findings.md) に分離し、AGENTSには純粋な指示と説明、目的、禁止事項を残した。利用者向けの操作・導入手順、更新・復旧手順、既存の実測証跡は保持した。
- 実測: 移動した10節について、書式上の空白・Markdown表の区切り幅を正規化して移動前本文との一致を確認した。変更文書の相対リンク・参照アンカーはすべて解決し、コードフェンスと見出し構造、文書以外の無関係な差分がないこと、`git diff --check` 成功を確認した。
- GitHub既存のDependabot警告を読み取り、未解決警告0件を確認した。既存Open PRは0件。これはGitHubで既に算出された結果の参照であり、新たなローカル監査の成功を示すものではない。
- ローカル脆弱性監査とレジストリへの最新版照会は、自動承認審査が依存情報のOSV・npm・PyPI等への送信を拒否したため未実行。依存名・版と送信先を承認できる環境で監査・更新確認を再開する。GitHub既存警告の0件だけでは、全依存の現時点の安全性や最新版であることを保証しない。
- アプリコード・依存定義・lockfileを変更しない文書移動のため、製品のビルド・GUI操作・ブラウザ操作・実機書込みは実行していない。製品挙動を新たに検証したとは扱わない。
- 既存ローカルPrettierで変更文書の書式を確認した。

### 配布経路と文書テストの追従

- npmのfilesへfindings.mdを追加し、オフラインのnpm pack dry-runでREADME.mdとfindings.mdの同梱を確認した。製品API・バンドル・版番号は未変更の未リリース文書更新。
- 追加差分も本文・参照・`git diff --check` を確認し、依存定義の変更や新たな外部監査送信は行っていない。

## 2026-10-20: Dependabot 月末一括処理

- `.github/dependabot.yml` は毎月28日00:00、`.github/workflows/dependabot-automation.yml` は同日18:00（いずれも `Asia/Tokyo`）に設定した。呼び出し先は検証済み共通 workflow の固定 SHA とし、現在の head SHA、Dependabot の資格状態、全 PR チェック成功を merge 前に再確認する。
- YAML 構文、変更差分、空白エラーをローカルで検査した。実際の月末 schedule と Dependabot PR の merge 経路は、次回の毎月28日実行で確認する。
