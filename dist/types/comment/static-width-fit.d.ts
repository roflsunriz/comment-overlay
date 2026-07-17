export type NicoStaticWidthFit = {
    fontSize: number;
    drawScale: number;
    useOriginalMetrics: boolean;
    targetWidth: number;
};
export declare const resolveNicoStaticWidthFit: ({ visibleWidth, canvasHeight, isFull, isEnder, lineCount, verticalFontSize, verticalTextWidth, originalFontSize, originalTextWidth, }: {
    visibleWidth: number;
    canvasHeight: number;
    isFull: boolean;
    isEnder: boolean;
    lineCount: number;
    verticalFontSize: number;
    verticalTextWidth: number;
    originalFontSize: number;
    originalTextWidth: number;
}) => NicoStaticWidthFit;
//# sourceMappingURL=static-width-fit.d.ts.map