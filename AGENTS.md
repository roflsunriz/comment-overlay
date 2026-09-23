# AGENTS.md

## 作業開始前の必須手順（最優先・例外なし）

1. エージェントは、調査、計画、コマンド実行、スキル利用、ファイル編集、コミット、プッシュを始める前に、必ずリポジトリ直下の `.\COMMON-AGENTS.md` を開き、先頭から末尾まで全文を読む。
2. `COMMON-AGENTS.md` はGit管理外のシンボリックリンクである。`git`や既定のignore設定が有効な`rg --files`の検索結果だけで、ファイルが存在しないと判断してはならない。PowerShellでは最初に次を実行する。

```powershell
Get-Content -Raw -LiteralPath .\COMMON-AGENTS.md
```

3. 読み取りに失敗した場合、出力が省略された場合、または末尾まで読めたことを確認できない場合は、一切の作業を開始せず、パスとシンボリックリンク先を確認して全文を再取得する。必要なら分割して末尾まで読む。
4. 全文を読了するまで、ローカル `AGENTS.md` だけを根拠に作業を続けてはならない。読了後は `COMMON-AGENTS.md` を最優先の指針とし、読了直後の最初の進捗報告で全文を読了したことを明示する。
   このファイルでは `comment-overlay` 固有の補足だけを記載する。

## コードベース環境

1. コードベース環境は`src`ディレクトリと`dist`ディレクトリです。
2. `src`ディレクトリにはコードが格納されています。
3. `dist`ディレクトリにはビルド成果物が格納されています。
4. `.github`ディレクトリにはGitHub Actionsの設定ファイルが格納されています。
5. `DOCUMENTATION.md`ファイルにはライブラリの使い方やAPI仕様が記載されています。
6. `README.md`ファイルにはライブラリの概要や使い方が記載されています。仕様変更やバグフィックスの際はこのファイルと`DOCUMENTATION.md`ファイルを更新してください。
7. `overlay-tests`ディレクトリにはテストコードが格納されています。基本的に視覚情報でしかテストできないので、あなた（アシスタント）がテストをしようとしないでください。`bun run serve`コマンドでテスト環境を起動できます。
8. `scripts`は`overlay-tests/dist`ディレクトリにビルド成果物を同期するためのスクリプトが格納されています。`bun run build`コマンドでビルド成果物を生成できます。
9. `src/config/default-settings.ts`にはバージョン情報が記載されています。仕様変更やバグフィックスの際はこのファイルを更新してください。
10. `images`ディレクトリにはライブラリのカバー画像が格納されています。`README.md`ファイルで使用しています。

## 依存監査で確定した事項（2026-09-23）

- `bun audit fix` だけでは js-yaml の脆弱版が上流の厳密な依存範囲で残る。`package.json` の既存 `overrides` と `bun.lock` を同時に更新し、`bun audit` と関連テスト・ビルドで確認する。上流が安全版を取り込んだ場合は override の必要性を再評価する。

## Dependabot の限定修復（2026-09-23）

- CI 再失敗後の自動修復は `bun.lock` だけをパッチとして適用する。修復後は `workflow_dispatch` で `.github/workflows/ci.yml` を再実行するため、この CI の `contents: read` と checkout の `persist-credentials: false` を維持し、PR コードを実行するジョブへ書き込み権限や秘密情報を渡さない。根拠は `.github/workflows/dependabot-automation.yml` と共通ワークフローの権限分離。

## TypeScript メジャー更新の上限（2026-09-23）

- `@typescript-eslint/eslint-plugin` の peer は `typescript >=4.8.4 <6.1.0` のため、TypeScript 7 系では `bun run lint` が「does not support TS 7.0」で失敗する。TS 7 対応は上流の typescript-eslint#10940 待ちとし、更新は 6.0 系の最大版に留める。
- TypeScript 6 では `tsconfig.build.json` の `rootDir` 明示が必須（未設定は TS5011）なので、`"rootDir": "src"` を維持する。根拠は `tsconfig.build.json` と `bun run build` の検証結果。
