import type { CommentPrepareOptions } from "@/shared/types";
import type { Comment } from "@/comment/comment";
export declare const getCommentCanvasFont: (comment: Pick<Comment, "fontSize" | "fontFamily" | "fontWeight">) => string;
declare const updateTextMetrics: (comment: Comment, ctx: CanvasRenderingContext2D, lineHeightPx?: number) => void;
export declare const prepareComment: (comment: Comment, ctx: CanvasRenderingContext2D, visibleWidth: number, canvasHeight: number, options: CommentPrepareOptions) => void;
export { updateTextMetrics };
//# sourceMappingURL=prepare.d.ts.map