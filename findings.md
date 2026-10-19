# 調査知見

- `overlay-tests` の目視操作をエージェントは実行しない。静的・自動検査と、利用者が行う目視確認・未確認範囲を分ける。
- TypeScript 7はtypescript-eslint非対応のため6系を維持する。TS6では `tsconfig.build.json` の `rootDir: src` がないとTS5011になる。
- 公式互換規則は保存プレイヤーを外部通信なしで再生し、各軸の境界とholdoutで一般化したもの。作品・座標専用分岐を追加せず、公式自身の揺れを考慮して画素完全一致でなく同値配置classを基準にする（詳細は [research/](research/README.md)）。
- npm公開時は `package.json` と `src/config/default-settings.ts` のversion、README/DOCUMENTATIONを同時更新する。`files` は明示listなので `npm pack --dry-run` で必要文書と成果物を確認する。
- Dependabotのbase更新で自動mergeが失敗した場合はcallback log、現在head SHA、全check、mergeableを再確認する。自動修復jobは読取り権限でlockfileだけを扱う。
- `bun audit fix` だけで残る厳密な間接依存はoverrideとlockfileを同時更新し、上流解消後にoverrideを外す。
