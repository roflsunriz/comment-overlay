# findings.md

このリポジトリ固有の実現手段と調査知見の正本です。作業前に全文を読み、行動規範は [AGENTS.md](AGENTS.md) と [COMMON-AGENTS.md](COMMON-AGENTS.md) に従ってください。移動元の本文は以下に保持しています。

## 共通方針の適用と具体的な例外

| 項目                       | このリポジトリでの扱い                                                                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象の共通ルール           | ブラウザ検証と依存更新の互換性条件                                                                                                                                                     |
| 理由と適用範囲             | 既存の利用者指示によりoverlay-testsの目視操作をエージェントは行わない。TypeScript7もtypescript-eslintのpeer範囲外のため採用しない。対象は目視テスト経路とTypeScript/lint依存の互換性。 |
| 同等の品質を保つ手段・検証 | 既存lint・型・ビルドと自動テストを使い、目視確認は手順を示して実施者と未確認範囲を区別する。根拠: `AGENTS.md`、`package.json`、`tsconfig.build.json`、[検証記録](verification.md)。    |

## 文書の役割と適用範囲

- 共通ルールの対象は「ローカル AGENTS.md との関係」「設計と実装方針」「検証」「ドキュメント」。この文書は本リポジトリの構成と既存運用に適用し、共通の行動規範を弱めません。
- ファイル配置・ツール・環境をここに集約する理由は、作業規範と実装上の事実を分け、次の作業者が根拠を確認できるようにするためです。下記の既存手段は同じ対象の設定・CI・検証記録と照合して使います。
- README は利用開始・操作、更新手順は更新と復旧、verification.md は検証手順と実測証跡、専門の設計・研究文書は詳細な根拠を担います。これらの用途は維持し、この文書から参照します。
- 更新・検証の代替は一律のBunコマンドに固定せず、下記の採用技術と既存CIに対応する検査を使います。実行不能や未検証の条件は成功扱いせず verification.md に残します。

<a id="agents-1"></a>

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

移動元: `AGENTS.md`。

<a id="agents-2"></a>

## 依存監査で確定した事項（2026-09-23）

- `bun audit fix` だけでは js-yaml の脆弱版が上流の厳密な依存範囲で残る。`package.json` の既存 `overrides` と `bun.lock` を同時に更新し、`bun audit` と関連テスト・ビルドで確認する。上流が安全版を取り込んだ場合は override の必要性を再評価する。

移動元: `AGENTS.md`。

<a id="agents-3"></a>

## Dependabot の限定修復（2026-09-23）

- CI 再失敗後の自動修復は `bun.lock` だけをパッチとして適用する。修復後は `workflow_dispatch` で `.github/workflows/ci.yml` を再実行するため、この CI の `contents: read` と checkout の `persist-credentials: false` を維持し、PR コードを実行するジョブへ書き込み権限や秘密情報を渡さない。根拠は `.github/workflows/dependabot-automation.yml` と共通ワークフローの権限分離。
- 2026-10-11 時点の既定ブランチは `master`。PR #15 の自動処理は CI 成功後に `Base branch was modified` でマージに失敗した。複数 PR の統合が重なった場合は callback 実行のログ、現在の head SHA、全チェック、マージ可否を再確認してから手動で統合する。根拠は Actions run 37412698121 と `.github/workflows/ci.yml`。

移動元: `AGENTS.md`。

<a id="agents-4"></a>

## TypeScript メジャー更新の上限（2026-09-23）

- `@typescript-eslint/eslint-plugin` 8.71.1 の peer は `typescript >=4.8.4 <6.1.0` のため、TypeScript 7 系では `bun run lint` が「does not support TS 7.0」で失敗する。TS 7 対応は上流の typescript-eslint#10940 待ちとし、更新は 6.0 系の最大版に留める。2026-10-11 に npm の peerDependencies で再確認した。
- TypeScript 6 では `tsconfig.build.json` の `rootDir` 明示が必須（未設定は TS5011）なので、`"rootDir": "src"` を維持する。根拠は `tsconfig.build.json` と `bun run build` の検証結果。

移動元: `AGENTS.md`。

<a id="readme-1"></a>

## ニコニコ動画コメントシステムとの高い互換性

`comment-overlay` の現行レンダラーは、見本となるコメントアートへ座標を合わせた実装ではありません。保存した公式プレイヤーを外部通信なしで隔離再生し、本文、コマンド、サイズ、行数、時刻差、処理順、表示領域、seek、動画終端などを1軸ずつ変えた合成コメントを投入して、Canvasの描画結果から一般規則を導出しています。

調査は、固定コメント21 profile・321ケース、スクロールコメント12 profile・431ケース、動画終端3系列・72ケース、合計824ケースまで実施しました。連続量は境界の直前・一致・直後、離散入力は同値類、複合条件は直交ケースで反証し、規則導出に使わなかった実コメントアートをホールドアウトにしています。その結果、次の挙動を作品固有条件やコメントアート専用分岐なしで説明し、`src/` へ反映しました。

- 公式の内部`1364×768`座標を表示領域へ比例変換する文字寸法とレーン間隔
- 実測文字幅、行数、`full`、`ender`から決まる固定コメントの縮小と可変高予約
- 表示高を使い切った場合のランダム退避と、表示高以上の多層コメントを同じ端へ重ねる境界
- 横流れコメントが描画領域と文字幅を4秒で横断する速度、開始・退出位置、同一レーン再利用
- 動画終端3秒前へ表示基準時刻を丸めた後、固定・横流れの通常規則をそのまま適用する終端処理

画素単位一致は目標にしていません。公式プレイヤー自身も読み込み順や再生位置によってレーン選択が揺れるため、同値な配置クラスと一般規則の一致を互換性の基準にしています。実験設計、観測結果、未採用仮説、再実行手順は [`research/`](./research/README.md) に、旧校正の経緯は [`history/`](./history/README.md) に保存しています。

移動元: `README.md`。

<a id="readme-2"></a>

## 開発に必要な環境

- Bun 1.3.8 以降

移動元: `README.md`。

<a id="readme-3"></a>

## 開発環境のセットアップ

```bash
bun install
```

移動元: `README.md`。

<a id="readme-4"></a>

## スクリプト

- `bun run dev`: Vite 開発サーバーを起動します。
- `bun run build`: 出力をクリーンアップして型定義を生成した後、ライブラリをビルドします。
- `bun run lint`: `src` ディレクトリの TypeScript ファイルを ESLint で検査します。
- `bun run type-check`: `tsconfig.build.json` を用いた型チェックを実行します。
- `bun run serve`: `overlay-tests` ディレクトリを静的サーバーで起動し、ビルド成果物を使って動作確認できます。
- `bun run nico:trace -- ...`: CDP 接続した Chrome 上のニコニコ動画プレイヤーから Canvas 描画ログとスクリーンショットを採取します。
- `bun run nico:overlay-trace -- ...`: 生コメントJSONを `comment-overlay` で描画し、校正トレースを採取します。
- `bun run nico:report -- ...`: 実プレイヤー採取ログと `comment-overlay` 側ログの差分レポートを生成します。
- `bun run nico:strict-score -- ...`: 実プレイヤーと `comment-overlay` の `drawImage` 外側レイヤー位置を数値比較します。
- `bun run nico:internal-score -- ...`: 実プレイヤーと `comment-overlay` のソースキャンバス内部 `fillText` 配置を数値比較します。
- `bun run research:nico:capture -- ...`: 匿名のニコニコ動画セッションを、Git管理外の研究用アーカイブへ記録します。
- `bun run research:nico:replay -- ...`: 記録済みセッションを、外部通信を遮断したChromeで再生して通信監査結果を生成します。
- `bun run research:nico:supplement -- ...`: 監査で不足が判明した公式静的資産1件を、ホストと拡張子を制限して追補します。
- `bun run research:test`: `research/tools` 配下の研究基盤をテストします。

ニコニコ互換性研究の方針、隔離要件、具体的な使用手順は [`research/README.md`](./research/README.md) に集約しています。

開発にあたり、変更後は `bun run lint`、`bun run type-check`、`bun run build` を順番に実行して品質を確認してください。

移動元: `README.md`。

<a id="readme-5"></a>

## パブリッシュ手順（メンテナー向け）

このプロジェクトはGitHub Actionsを使用してnpmに自動パブリッシュします。npmは2025年12月9日にクラシックトークンを無効化したため、新しいグラニュラートークンを使用します。

### 初回セットアップ

1. npmで新しいグラニュラートークンを作成
   - https://www.npmjs.com/settings/[your-username]/tokens にアクセス
   - "Generate New Token" → "Granular Access Token"を選択
   - Permissions: "Read and write"を付与
   - Packages: "All packages"または`comment-overlay`を選択
   - "Automation"オプションを有効化（2FAバイパス用）

2. GitHubリポジトリのSecretsに追加
   - Settings → Secrets and variables → Actions → New repository secret
   - Name: `NPM_TOKEN`
   - Value: 作成したnpmトークンを貼り付け

### パッケージのパブリッシュ

1. `package.json`のバージョンを更新（例: 2.9.0 → 2.10.0）
2. `src/config/default-settings.ts`のバージョンも更新
3. 変更をコミット＆プッシュ
4. タグを作成してプッシュ:
   ```bash
   git tag v2.10.0
   git push origin v2.10.0
   ```
5. GitHub Actionsが自動的に実行され、npmにパブリッシュされます

または、GitHubの"Actions"タブから"Publish to npm"ワークフローを手動実行することもできます。

移動元: `README.md`。

<a id="readme-6"></a>

## 依存更新の自動処理

Dependabot は対象の依存関係を毎週確認します。patch／minor 更新は PR のチェック（CI）が成功した後に自動で squash merge されます。CI の失敗ジョブは 1 回だけ再実行します。再失敗時は読み取り権限のジョブで `bun.lock` を再生成し、限定した修正コミットで CI を再実行します。基準ブランチの同時更新などで自動マージが失敗した場合は、現在の PR とチェックを確認して手動で処理します。major 更新は手動で確認します。

移動元: `README.md`。

## 根拠と検証記録

- [README.md](README.md): 利用者向けの導入と操作。
- [verification.md](verification.md): 検証手順、実測結果、未確認事項。
- [how-to-update.md](how-to-update.md): 更新・復旧の実手順。
