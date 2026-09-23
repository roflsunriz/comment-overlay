# 更新手順

## 前提

- Bun 1.3.8以降を使用する。
- 依存関係を変更する場合は `bun.lock` の差分を確認する。
- 作業前後に `git status --short --branch` でユーザーの既存変更と今回の変更を区別する。

## 更新と検証

```powershell
bun install
bun run lint
bun run format
bun run type-check
bun run test
bun run research:test
bun run build
```

`overlay-tests` は視覚確認を前提とするため、自動操作による合否判定は行わず、必要な場合に `bun run serve` で利用者が確認する。

READMEのカバー画像を更新するときは `bun run capture:cover` を実行する。このコマンドはライブラリと `overlay-tests` をビルドし、ヘッドレスChromeのCDPから `sm6240144` の34層コメントアートを334.2秒で撮影して `images/cover.png` を更新する。撮影中はMP4を読み込まず、コメント専用タイムラインと黒背景だけを使うため、動画映像はカバーへ含まれない。撮影後は画像を目視し、コメントアートが画面の大半を覆うこと、動画由来の画素、個人情報、認証情報が含まれないことを確認する。

CASEプルダウンへfixtureを追加するときは、`overlay-tests/fixtures/` に `<case-id>-comments.json` を配置する。コメントJSONにはコメント配列、トップレベル `comments` 配列、またはニコニコの現行コメントAPI応答 `{ "meta": ..., "data": { "threads": ... } }` を使用できる。トップレベル `label` は任意で、省略時はcase IDが表示名になる。同名の `<case-id>.mp4` は任意であり、存在しない場合はコメントJSONの最終時刻から生成した無音タイムラインで再生する。動画はgit管理対象外とし、コメントfixtureにもユーザーID、投稿日時、Cookie、認証情報、配信セッションURLを保存しない。`bun run build:overlay-tests` または `bun run serve` を実行すると、`overlay-tests/src/video-cases.generated.ts` が自動更新される。

研究用のオンラインキャプチャとオフライン再生は [research/README.md](./research/README.md) に従う。キャプチャ、監査結果、ブラウザー一時プロファイルをコミットしない。

## リリース

1. npmで公開済みの最新版とローカルタグを確認し、未使用の次版を `package.json` と `src/config/default-settings.ts` に設定する。
2. `CHANGELOG.md` の `[Unreleased]` 以下を `## [x.y.z] - YYYY-MM-DD` へ移し、上に空の `[Unreleased]` を残す。
3. 上記の更新・検証をすべて実行し、`bun audit` で依存関係の脆弱性が0件であることを確認する。
4. 生成された `dist/` と `overlay-tests/dist/` を含む意図した差分だけを、日本語Conventional Commits形式でコミットする。
5. `master` を `origin` へpushし、同じコミットへ注釈付きタグ `vX.Y.Z` を作成してpushする。
6. GitHub Actionsの `Publish to npm` が成功するまで確認し、npmの公開バージョンがタグと一致することを確認する。

```powershell
bun audit
git push origin master
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
gh run list --workflow publish.yml --limit 5
gh run watch <run-id> --exit-status
```

## 復旧

ビルドに失敗した場合は、最初の失敗コマンドと実ファイルの差分を確認する。生成物だけを直接修正せず、`src/` または生成元スクリプトを直して再度 `bun run build` を実行する。ロールバックが必要な場合も、ユーザーの未コミット変更を消す `git reset --hard` や一括checkoutは使用せず、今回変更したファイルだけを明示的に戻す。

タグpush前に問題が判明した場合は修正コミット後にタグを作る。タグpush後に公開が失敗した場合はタグを付け替えず、Actionsログから原因を修正して同じworkflowを再実行する。誤ったパッケージが公開済みの場合はnpmの既存版を上書きせず、新しいpatch版で修正する。

## Dependabot PR の更新

前提は `.github/dependabot.yml` と PR 用 CI（CI）です。更新 PR の head SHA と `gh pr checks <PR番号>` の結果を確認してください。patch／minor は全チェック成功後に自動取り込みされます。初回 CI 失敗は failed jobs のみを 1 回再実行し、再失敗時は `bun.lock` の再生成を試み、修復後の CI を再実行します。変更がない場合や再度失敗した場合は PR を残します。

設定を変えたときは `actionlint .github/workflows/dependabot-automation.yml` と実際の PR の Actions 結果を確認します。問題があれば呼び出し先の共通 workflow SHA を直前の検証済み値へ戻すコミットを push します。取り込まれた依存更新に問題があれば通常の revert コミットで復旧します。

## 依存脆弱性の更新

`package.json` の `overrides` は、上流パッケージが js-yaml の旧版を固定している間に安全な patch 版を選ぶために使う。上流が安全版を採用したら override を減らせるか確認する。更新時は `bun install --lockfile-only --ignore-scripts`、`bun install --frozen-lockfile`、`bun audit` を実行し、該当する lint・型・テスト・ビルドを確認する。問題があれば更新コミットを revert し、lockfile と package.json を同じ版へ戻す。
