export type CommentLayoutCommand = "naka" | "ue" | "shita";
export type CommentSizeCommand = "small" | "medium" | "big";
export type CommentFontCommand = "defont" | "gothic" | "mincho";
export type CommentColorCommand = "white" | "red" | "pink" | "orange" | "yellow" | "green" | "cyan" | "blue" | "purple" | "black" | "white2" | "red2" | "pink2" | "orange2" | "yellow2" | "green2" | "cyan2" | "blue2" | "purple2" | "black2";
export type CommentSpecialCommand = "_live" | "invisible";
export type CommentHexColorCommand = `#${string}`;
export interface CommentCommandParseContext {
    readonly defaultColor: string;
}
export interface CommentCommandParseResult {
    readonly size: CommentSizeCommand;
    readonly sizeScale: number;
    readonly layout: CommentLayoutCommand;
    readonly font: CommentFontCommand;
    readonly fontFamily: string;
    readonly resolvedColor: string;
    readonly colorOverride: string | null;
    readonly opacityMultiplier: number;
    readonly opacityOverride: number | null;
    readonly isInvisible: boolean;
}
//# sourceMappingURL=comment.d.ts.map