const applyTransform = (transform, x, y) => {
  const [a, b, c, d, e, f] = transform ?? [1, 0, 0, 1, 0, 0];
  return { x: a * x + c * y + e, y: b * x + d * y + f };
};

export const destinationGeometry = (record) => {
  const args = Array.isArray(record.args) ? record.args : [];
  let destinationX;
  let destinationY;
  let destinationWidth;
  let destinationHeight;
  if (args.length >= 8) {
    [destinationX, destinationY, destinationWidth, destinationHeight] = args.slice(4, 8);
  } else if (args.length >= 4) {
    [destinationX, destinationY, destinationWidth, destinationHeight] = args.slice(0, 4);
  } else if (args.length >= 2) {
    [destinationX, destinationY] = args;
    destinationWidth = record.sourceWidth ?? null;
    destinationHeight = record.sourceHeight ?? null;
  } else {
    return null;
  }
  const transform = Array.isArray(record.transform) ? record.transform : [1, 0, 0, 1, 0, 0];
  const topLeft = applyTransform(transform, destinationX, destinationY);
  const bottomRight =
    destinationWidth === null || destinationHeight === null
      ? null
      : applyTransform(
          transform,
          destinationX + destinationWidth,
          destinationY + destinationHeight,
        );
  return {
    destinationX,
    destinationY,
    destinationWidth,
    destinationHeight,
    transformedX: topLeft.x,
    transformedY: topLeft.y,
    transformedWidth: bottomRight ? bottomRight.x - topLeft.x : null,
    transformedHeight: bottomRight ? bottomRight.y - topLeft.y : null,
    translationX: transform[4],
    translationY: transform[5],
  };
};

const median = (values) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export const analyzeScenarioCanvasTrace = (records, scenario) => {
  const drawRecords = records.filter(
    (record) =>
      record.operation === "drawImage" && typeof record.sourceCanvasText?.text === "string",
  );
  const comments = scenario.comments.map((comment) => {
    const matches = drawRecords
      .filter(
        (record) =>
          record.sourceCanvasText.text === comment.body ||
          record.sourceCanvasText.text.includes(comment.body),
      )
      .map((record) => ({
        sequence: record.sequence,
        videoCurrentTimeMs: record.videoCurrentTimeMs,
        canvasId: record.canvasId,
        canvasWidth: record.canvasWidth,
        canvasHeight: record.canvasHeight,
        sourceCanvasId: record.sourceCanvasId,
        sourceWidth: record.sourceWidth,
        sourceHeight: record.sourceHeight,
        sourceText: record.sourceCanvasText.text,
        sourceFont: record.sourceCanvasText.font ?? null,
        measuredTextWidth: record.sourceCanvasText.measuredTextWidth ?? null,
        renderedTextWidth: record.sourceCanvasText.renderedTextWidth ?? null,
        textTransform: record.sourceCanvasText.textTransform ?? null,
        geometry: destinationGeometry(record),
      }));
    return {
      id: comment.id,
      no: comment.no,
      vposMs: comment.vposMs,
      body: comment.body,
      commands: comment.commands,
      drawCallCount: matches.length,
      drawCalls: matches,
    };
  });
  const firstCalls = comments.flatMap((comment) =>
    comment.drawCalls.length > 0
      ? [{ ...comment.drawCalls[0], body: comment.body, no: comment.no }]
      : [],
  );
  const laneTranslationYs = [
    ...new Set(
      firstCalls
        .map((call) => call.geometry?.translationY)
        .filter(Number.isFinite)
        .map((value) => Math.round(value * 1_000_000) / 1_000_000),
    ),
  ].sort((left, right) => left - right);
  const adjacentLaneDeltas = laneTranslationYs
    .slice(1)
    .map((value, index) => value - laneTranslationYs[index]);
  return {
    formatVersion: 1,
    scenario: {
      name: scenario.name,
      targetFork: scenario.targetFork,
      commentCount: scenario.comments.length,
    },
    summary: {
      recordCount: records.length,
      matchedCommentCount: comments.filter((comment) => comment.drawCallCount > 0).length,
      unmatchedCommentCount: comments.filter((comment) => comment.drawCallCount === 0).length,
      laneTranslationYs,
      adjacentLaneDeltas,
      medianLanePitch: median(adjacentLaneDeltas),
      processingOrder: firstCalls
        .sort((left, right) => left.sequence - right.sequence)
        .map((call) => ({ body: call.body, no: call.no, sequence: call.sequence })),
    },
    comments,
  };
};

export const canvasAnalysisMarkdown = (analysis) => {
  const rows = analysis.comments.map((comment) => {
    const first = comment.drawCalls[0];
    return `| ${comment.no} | ${comment.body.replaceAll("|", "\\|")} | ${comment.drawCallCount} | ${first?.sequence ?? "-"} | ${first?.geometry?.translationY ?? "-"} | ${first?.geometry?.transformedY ?? "-"} |`;
  });
  return `# Canvas trace analysis: ${analysis.scenario.name}

## Summary

- matched comments: ${analysis.summary.matchedCommentCount} / ${analysis.scenario.commentCount}
- processing order: ${analysis.summary.processingOrder.map((entry) => entry.body).join(" -> ") || "none"}
- lane translation Y: ${analysis.summary.laneTranslationYs.join(", ") || "none"}
- adjacent lane delta: ${analysis.summary.adjacentLaneDeltas.join(", ") || "none"}
- median lane pitch: ${analysis.summary.medianLanePitch ?? "unknown"}

| no | body | draw calls | first sequence | translation Y | transformed Y |
| ---: | --- | ---: | ---: | ---: | ---: |
${rows.join("\n")}
`;
};
