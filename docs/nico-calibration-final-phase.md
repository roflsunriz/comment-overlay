# ファイナルフェーズキャリブレーション

目的:
- 動画終盤や停止/終端付近で、ニコニコ実プレイヤーに近いコメント出現、保持、消滅挙動にする。

現状:
- rendererには final phase 関連の状態とスケジュールがある。
- 猫マリオCAや羽モンスターCAの調整では、終盤特有の挙動までは深く見ていない。

次に見ること:
- 終盤の実プレイヤーtraceを採取し、コメントの activation / expiry / static reservation の差分を見る。
- `video.currentTime`、`duration`、`playbackRate`、pause/seek後の再同期を含めて、終盤だけで発生するズレを切り分ける。
- overlay-testsに終盤確認用のpresetまたはジャンプ導線を追加するか判断する。

完了条件:
- 終盤でも通常コメントとCAの表示開始/終了が実プレイヤーと大きくズレない。
- seek、pause、resume後に古いコメントが残ったり、必要なコメントが欠けたりしない。

