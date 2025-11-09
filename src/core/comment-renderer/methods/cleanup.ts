import type { CommentRenderer } from "../../comment-renderer";

const addCleanupImpl = function (this: CommentRenderer, task: () => void): void {
  this.cleanupTasks.push(task);
};

const runCleanupTasksImpl = function (this: CommentRenderer): void {
  while (this.cleanupTasks.length > 0) {
    const task = this.cleanupTasks.pop();
    try {
      task?.();
    } catch (error) {
      this.log.error("CommentRenderer.cleanupTask", error as Error);
    }
  }
};

export const registerCleanupMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.addCleanup = addCleanupImpl;
  ctor.prototype.runCleanupTasks = runCleanupTasksImpl;
};
