import { moduleCandidates } from "./presets.js";

type StatusReporter = (message: string) => void;

export const loadOverlayModule = async (reportStatus: StatusReporter): Promise<unknown> => {
  const failures: Array<{ candidate: string; error: unknown }> = [];
  for (const candidate of moduleCandidates) {
    try {
      reportStatus(`Loading overlay module: ${candidate}`);
      const importPromise = import(`${candidate}?t=${Date.now()}`);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("import timeout")), 5000);
      });
      return await Promise.race([importPromise, timeoutPromise]);
    } catch (error) {
      failures.push({ candidate, error });
    }
  }

  failures.forEach(({ candidate, error }) => {
    console.error(`Failed to import ${candidate}`, error);
  });
  const detail = failures
    .map(
      ({ candidate, error }) =>
        `${candidate}: ${error instanceof Error ? error.message : String(error)}`,
    )
    .join("; ");
  throw new Error(`Unable to load comment overlay module. Attempts: ${detail}`);
};
