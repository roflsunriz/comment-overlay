import type { CommentRenderer } from "../../comment-renderer";
import { Comment } from "../../comment";
import { formatCommentPreview, debugLog } from "../../../shared/debug";
import { EDGE_EPSILON, sanitizeVposMs } from "../constants";

const addCommentsImpl = function (
  this: CommentRenderer,
  entries: ReadonlyArray<{ text: string; vposMs: number; commands?: string[] }>,
): Comment[] {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  const addedComments: Comment[] = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;

  for (const entry of entries) {
    const { text, vposMs, commands = [] } = entry;
    const preview = formatCommentPreview(text);

    if (this.isNGComment(text)) {
      debugLog("comment-skip-ng", { preview, vposMs });
      continue;
    }

    const normalizedVposMs = sanitizeVposMs(vposMs);
    if (normalizedVposMs === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text, vposMs });
      debugLog("comment-skip-invalid-vpos", { preview, vposMs });
      continue;
    }

    const duplicate =
      this.comments.some(
        (comment) => comment.text === text && comment.vposMs === normalizedVposMs,
      ) ||
      addedComments.some((comment) => comment.text === text && comment.vposMs === normalizedVposMs);
    if (duplicate) {
      debugLog("comment-skip-duplicate", { preview, vposMs: normalizedVposMs });
      continue;
    }

    const comment = new Comment(
      text,
      normalizedVposMs,
      commands,
      this._settings,
      this.commentDependencies,
    );
    comment.creationIndex = this.commentSequence++;
    comment.epochId = this.epochId;
    addedComments.push(comment);
    debugLog("comment-added", {
      preview,
      vposMs: normalizedVposMs,
      commands: comment.commands.length,
      layout: comment.layout,
      isScrolling: comment.isScrolling,
      invisible: comment.isInvisible,
    });
  }

  if (addedComments.length === 0) {
    return [];
  }

  this.comments.push(...addedComments);
  if (this.finalPhaseActive) {
    this.finalPhaseScheduleDirty = true;
  }
  this.comments.sort((a, b) => {
    const vposMsDiff = a.vposMs - b.vposMs;
    if (Math.abs(vposMsDiff) > EDGE_EPSILON) {
      return vposMsDiff;
    }
    return a.creationIndex - b.creationIndex;
  });

  return addedComments;
};

const addCommentImpl = function (
  this: CommentRenderer,
  text: string,
  vposMs: number,
  commands: string[] = [],
): Comment | null {
  const [comment] = this.addComments([{ text, vposMs, commands }]);
  return comment ?? null;
};

const clearCommentsImpl = function (this: CommentRenderer): void {
  this.comments.length = 0;
  this.activeComments.clear();
  this.reservedLanes.clear();
  this.topStaticLaneReservations.length = 0;
  this.bottomStaticLaneReservations.length = 0;
  this.commentSequence = 0;
  if (this.ctx && this.canvas) {
    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const width = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / effectiveDpr;
    const height = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / effectiveDpr;
    this.ctx.clearRect(0, 0, width, height);
  }
};

const resetStateImpl = function (this: CommentRenderer): void {
  this.clearComments();
  this.currentTime = 0;
  this.resetFinalPhaseState();
  this.playbackHasBegun = false;
  this.skipDrawingForCurrentFrame = false;
  this.isStalled = false;
  this.pendingInitialSync = false;
};

export const rebuildNgMatchersImpl = function (this: CommentRenderer): void {
  const settings = this._settings;
  const ngWords = Array.isArray(settings.ngWords) ? settings.ngWords : [];
  this.normalizedNgWords = ngWords.filter((word): word is string => typeof word === "string");
  const sourcePatterns = Array.isArray(settings.ngRegexps) ? settings.ngRegexps : [];
  this.compiledNgRegexps = sourcePatterns
    .map((entry): RegExp | null => {
      if (typeof entry !== "string") {
        return null;
      }
      try {
        return new RegExp(entry, "i");
      } catch (error) {
        this.log.warn("CommentRenderer.invalidNgRegexp", error as Error, { entry });
        return null;
      }
    })
    .filter((entry): entry is RegExp => Boolean(entry));
};

const isNgCommentImpl = function (this: CommentRenderer, text: string): boolean {
  if (typeof text !== "string" || text.length === 0) {
    return false;
  }
  if (this.normalizedNgWords.some((word) => word.length > 0 && text.includes(word))) {
    return true;
  }
  return this.compiledNgRegexps.some((regexp) => regexp.test(text));
};

export const registerCommentCollectionMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.addComments = addCommentsImpl;
  ctor.prototype.addComment = addCommentImpl;
  ctor.prototype.clearComments = clearCommentsImpl;
  ctor.prototype.resetState = resetStateImpl;
  ctor.prototype.rebuildNgMatchers = rebuildNgMatchersImpl;
  ctor.prototype.isNGComment = isNgCommentImpl;
};
