import type { CommentSizeCommand } from "@/shared/types";
export declare const resolveNicoVerticalSlotGap: (canvasHeight: number) => number;
export type NicoCommentLayoutMetrics = {
    fontSize: number;
    lineAdvance: number;
    textHeight: number;
    slotHeight: number;
    wasResizedForLineCount: boolean;
};
export declare const resolveNicoCommentLayoutMetrics: ({ canvasHeight, size, lineCount, isEnder, lineHeightMultiplier, }: {
    canvasHeight: number;
    size: CommentSizeCommand;
    lineCount: number;
    isEnder: boolean;
    lineHeightMultiplier: number;
}) => NicoCommentLayoutMetrics;
//# sourceMappingURL=nico-layout.d.ts.map