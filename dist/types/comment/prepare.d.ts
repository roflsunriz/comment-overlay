import type { CommentPrepareOptions } from "@/shared/types";
import type { Comment } from "@/comment/comment";
declare const updateTextMetrics: (comment: Comment, ctx: CanvasRenderingContext2D) => void;
export declare const prepareComment: (comment: Comment, ctx: CanvasRenderingContext2D, visibleWidth: number, canvasHeight: number, options: CommentPrepareOptions) => void;
export { updateTextMetrics };
//# sourceMappingURL=prepare.d.ts.map