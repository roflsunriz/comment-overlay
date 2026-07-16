export const parseArgs = (argv) => {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const equalsIndex = token.indexOf("=");
    if (equalsIndex >= 0) {
      args[token.slice(2, equalsIndex)] = token.slice(equalsIndex + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = "true";
    }
  }
  return args;
};

export const numberArg = (args, key, fallback, { minimum = -Infinity } = {}) => {
  const value = Number(args[key]);
  return Number.isFinite(value) && value >= minimum ? value : fallback;
};

export const booleanArg = (args, key, fallback = false) => {
  if (args[key] === undefined) return fallback;
  return args[key] !== "false";
};

export const sleep = (milliseconds) =>
  new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));

export const settleOrTimeout = (promise, timeoutMs) =>
  new Promise((resolveResult, rejectResult) => {
    const timer = setTimeout(() => resolveResult({ timedOut: true, value: null }), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolveResult({ timedOut: false, value });
      },
      (error) => {
        clearTimeout(timer);
        rejectResult(error);
      },
    );
  });
