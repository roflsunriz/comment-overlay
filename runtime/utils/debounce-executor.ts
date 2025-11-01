interface TimerEntry {
  timerId?: ReturnType<typeof setTimeout> | null;
  lastExec?: number;
  executedOnce?: boolean;
  scheduled?: boolean;
}

export class DebounceExecutor {
  private readonly delay: number;
  private readonly timers = new Map<number, TimerEntry>();
  private readonly funcIds = new Map<(...args: unknown[]) => unknown, number>();
  private nextId = 1;

  constructor(delay: number) {
    this.delay = delay;
  }

  private getFuncId(func: (...args: unknown[]) => unknown): number {
    if (!this.funcIds.has(func)) {
      this.funcIds.set(func, this.nextId++);
    }
    return this.funcIds.get(func) ?? 0;
  }

  exec(func: () => void): void {
    const funcId = this.getFuncId(func);
    const now = Date.now();
    const lastExec = this.timers.get(funcId)?.lastExec ?? 0;
    const elapsed = now - lastExec;

    if (elapsed > this.delay) {
      func();
      this.timers.set(funcId, { lastExec: now });
    } else {
      clearTimeout(this.timers.get(funcId)?.timerId ?? undefined);
      const timerId = setTimeout(() => {
        func();
        this.timers.set(funcId, { lastExec: Date.now() });
      }, this.delay - elapsed);
      this.timers.set(funcId, { timerId, lastExec });
    }
  }

  execOnce(func: () => void): void {
    const funcId = this.getFuncId(func);
    const currentTimer = this.timers.get(funcId);
    if (currentTimer?.executedOnce) {
      if (currentTimer.timerId) {
        clearTimeout(currentTimer.timerId);
      }
      return;
    }

    if (currentTimer?.timerId) {
      clearTimeout(currentTimer.timerId);
    }

    const timerId = setTimeout(() => {
      try {
        func();
      } finally {
        this.timers.set(funcId, {
          executedOnce: true,
          lastExec: Date.now(),
          timerId: null,
        });
      }
    }, this.delay);

    this.timers.set(funcId, {
      timerId,
      executedOnce: false,
      scheduled: true,
    });
  }

  cancel(func: () => void): void {
    const funcId = this.getFuncId(func);
    const entry = this.timers.get(funcId);
    if (entry?.timerId) {
      clearTimeout(entry.timerId);
    }
    this.timers.delete(funcId);
  }

  resetExecution(func: () => void): void {
    const funcId = this.getFuncId(func);
    const entry = this.timers.get(funcId);
    if (entry) {
      if (entry.timerId) {
        clearTimeout(entry.timerId);
      }
      this.timers.set(funcId, {
        executedOnce: false,
        scheduled: false,
      });
    }
  }

  clearAll(): void {
    for (const [, timer] of this.timers) {
      if (timer.timerId) {
        clearTimeout(timer.timerId);
      }
    }
    this.timers.clear();
    this.funcIds.clear();
  }
}
