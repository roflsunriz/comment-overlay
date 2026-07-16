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

研究用のオンラインキャプチャとオフライン再生は [research/README.md](./research/README.md) に従う。キャプチャ、監査結果、ブラウザー一時プロファイルをコミットしない。

## 復旧

ビルドに失敗した場合は、最初の失敗コマンドと実ファイルの差分を確認する。生成物だけを直接修正せず、`src/` または生成元スクリプトを直して再度 `bun run build` を実行する。ロールバックが必要な場合も、ユーザーの未コミット変更を消す `git reset --hard` や一括checkoutは使用せず、今回変更したファイルだけを明示的に戻す。
