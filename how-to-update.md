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

`so31723295-ed` fixtureは、第5話の公式動画 `https://www.nicovideo.jp/watch/so31723295` の `1340–1440秒`に表示されるmainコメントと、第1話の公式動画から切り出した同一ED映像を使用する。コメントの `vposMs` は `1340000` を引いてクリップ先頭基準へ移し、旧コメントアートを含む `leaf` と現行 `trunk` の両方を保持する。fixtureにはユーザーID、投稿日時、Cookie、認証情報、配信セッションURLを保存しない。

動画選択プルダウンへfixtureを追加するときは、`overlay-tests/fixtures/` に `<case-id>-comments.json` と `<case-id>.mp4` を同名で配置する。コメントJSONのトップレベル `label` は任意で、省略時はcase IDが表示名になる。`bun run build:overlay-tests` または `bun run serve` を実行すると、`overlay-tests/src/video-cases.generated.ts` が自動更新される。

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
