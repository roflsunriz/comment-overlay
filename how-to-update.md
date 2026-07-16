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
bun run research:test
bun run build
```

`overlay-tests` は視覚確認を前提とするため、自動操作による合否判定は行わず、必要な場合に `bun run serve` で利用者が確認する。

`so31723295-ed` fixtureは、第5話の公式動画 `https://www.nicovideo.jp/watch/so31723295` の `1340–1440秒`に表示されるmainコメントと、第1話の公式動画から切り出した同一ED映像を使用する。コメントの `vposMs` は `1340000` を引いてクリップ先頭基準へ移し、旧コメントアートを含む `leaf` と現行 `trunk` の両方を保持する。fixtureにはユーザーID、投稿日時、Cookie、認証情報、配信セッションURLを保存しない。

動画選択プルダウンへfixtureを追加するときは、`overlay-tests/fixtures/` に `<case-id>-comments.json` と `<case-id>.mp4` を同名で配置する。コメントJSONのトップレベル `label` は任意で、省略時はcase IDが表示名になる。`bun run build:overlay-tests` または `bun run serve` を実行すると、`overlay-tests/src/video-cases.generated.ts` が自動更新される。

研究用のオンラインキャプチャとオフライン再生は [research/README.md](./research/README.md) に従う。キャプチャ、監査結果、ブラウザー一時プロファイルをコミットしない。

## 復旧

ビルドに失敗した場合は、最初の失敗コマンドと実ファイルの差分を確認する。生成物だけを直接修正せず、`src/` または生成元スクリプトを直して再度 `bun run build` を実行する。ロールバックが必要な場合も、ユーザーの未コミット変更を消す `git reset --hard` や一括checkoutは使用せず、今回変更したファイルだけを明示的に戻す。
