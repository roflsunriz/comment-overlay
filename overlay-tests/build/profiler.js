const overlayDebugSamples = [];
export const pushOverlaySample = (sample) => {
    overlayDebugSamples.push({
        ts: performance.now(),
        ...sample,
    });
};
export const createOverlayProfiler = () => ({
    clear() {
        overlayDebugSamples.length = 0;
        console.log("[COOverlayProfiler] サンプルをクリアしました。");
    },
    getRaw() {
        return overlayDebugSamples.slice();
    },
    getStats() {
        const frames = overlayDebugSamples.filter((sample) => sample.kind === "frame");
        const events = overlayDebugSamples.filter((sample) => sample.kind === "event");
        return {
            total: overlayDebugSamples.length,
            frames: frames.length,
            events: events.length,
            firstTs: overlayDebugSamples[0]?.ts ?? 0,
            lastTs: overlayDebugSamples[overlayDebugSamples.length - 1]?.ts ?? 0,
        };
    },
    downloadRaw() {
        const blob = new Blob([JSON.stringify(overlayDebugSamples, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `comment-overlay-debug-raw-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        console.log(`[COOverlayProfiler] Raw JSON をダウンロードしました (${overlayDebugSamples.length} samples)`);
    },
    downloadCompact() {
        const compact = overlayDebugSamples.map((sample) => ({
            k: sample.kind,
            t: Math.round(sample.ts ?? 0),
            vt: Math.round(sample.videoTimeMs ?? 0),
            rt: Math.round(sample.rendererTimeMs ?? 0),
            ac: sample.activeCount ?? 0,
            tc: sample.totalComments ?? 0,
            ep: sample.epochId ?? 0,
            ev: sample.event ?? null,
            dw: sample.displayWidth ?? 0,
            dh: sample.displayHeight ?? 0,
            cw: sample.canvasWidth ?? 0,
            ch: sample.canvasHeight ?? 0,
            pr: sample.playbackRate ?? 1,
            ps: sample.isPaused ?? false,
            acMinVpos: sample.acMinVpos !== null && sample.acMinVpos !== undefined
                ? Math.round(sample.acMinVpos)
                : null,
            acMaxVpos: sample.acMaxVpos !== null && sample.acMaxVpos !== undefined
                ? Math.round(sample.acMaxVpos)
                : null,
            acMinLane: sample.acMinLane ?? null,
            acMaxLane: sample.acMaxLane ?? null,
            acHasScroll: sample.acHasScrolling ?? false,
        }));
        const blob = new Blob([JSON.stringify(compact)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `comment-overlay-debug-compact-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        console.log(`[COOverlayProfiler] Compact JSON をダウンロードしました (${compact.length} samples)`);
    },
});
export const installOverlayProfiler = () => {
    const profiler = createOverlayProfiler();
    window.COOverlayProfiler = profiler;
    console.log("[COOverlayProfiler] 初期化完了。使い方:");
    console.log("  COOverlayProfiler.getStats() - 統計情報を表示");
    console.log("  COOverlayProfiler.downloadCompact() - コンパクトJSON（分析用、ac/acMinVpos含む）");
    console.log("  COOverlayProfiler.downloadRaw() - 詳細JSON（調査用、sampleComments含む）");
    console.log("  COOverlayProfiler.clear() - サンプルをクリア");
    console.log("");
    console.log("新規追加フィールド:");
    console.log("  ac: activeComments.size（実値）");
    console.log("  acMinVpos/acMaxVpos: アクティブコメントのvpos範囲");
    console.log("  acMinLane/acMaxLane: レーン範囲");
    console.log("  acHasScroll: スクロール系コメントの有無");
    return profiler;
};
//# sourceMappingURL=profiler.js.map