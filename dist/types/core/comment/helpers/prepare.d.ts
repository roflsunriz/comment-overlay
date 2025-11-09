import type { CommentPrepareOptions } from "../types";
import type { Comment } from "../../comment";
declare const updateTextMetrics: (comment: Comment, ctx: CanvasRenderingContext2D) => void;
export declare const prepareComment: (comment: Comment, ctx: CanvasRenderingContext2D, visibleWidth: number, canvasHeight: number, options: CommentPrepareOptions) => void;
export { updateTextMetrics };
//# sourceMappingURL=prepare.d.ts.map