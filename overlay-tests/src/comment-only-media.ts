const SILENT_SAMPLE_RATE = 8000;
const WAV_HEADER_BYTES = 44;

const writeAscii = (view: DataView, offset: number, value: string): void => {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
};

/**
 * 動画fixtureがないcaseでもHTMLMediaElementの再生・停止・シークを利用できるよう、
 * コメント区間と同じ長さの無音PCMをメモリ上に生成する。
 */
export const createSilentTimeline = (durationSeconds: number): Blob => {
  const safeDuration = Math.max(1, Number.isFinite(durationSeconds) ? durationSeconds : 1);
  const sampleCount = Math.ceil(safeDuration * SILENT_SAMPLE_RATE);
  const bytes = new Uint8Array(WAV_HEADER_BYTES + sampleCount);
  const view = new DataView(bytes.buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + sampleCount, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SILENT_SAMPLE_RATE, true);
  view.setUint32(28, SILENT_SAMPLE_RATE, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, sampleCount, true);
  bytes.fill(128, WAV_HEADER_BYTES);

  return new Blob([bytes], { type: "audio/wav" });
};

export const resolveCommentTimelineDuration = (
  comments: ReadonlyArray<{ vposMs: number }>,
  tailSeconds = 10,
): number => {
  const lastVposMs = comments.reduce((maximum, comment) => Math.max(maximum, comment.vposMs), 0);
  return Math.max(1, lastVposMs / 1000 + tailSeconds);
};
