declare const GM_getValue:
  | (<T>(key: string, defaultValue?: T | null) => T | null)
  | undefined;
declare const GM_setValue:
  | (<T>(key: string, value: T) => void)
  | undefined;
declare const GM_addStyle: ((css: string) => void) | undefined;

const STORAGE_PREFIX = "comment-overlay:";

const getFallbackStorage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const serialize = <T>(value: T): string => JSON.stringify(value);
const deserialize = <T>(value: string | null, defaultValue: T | null): T | null => {
  if (value === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
};

export const gmGetValue = <T>(key: string, defaultValue: T | null = null): T | null => {
  if (typeof GM_getValue === "function") {
    return GM_getValue(key, defaultValue);
  }
  const storage = getFallbackStorage();
  if (!storage) {
    return defaultValue;
  }
  return deserialize(storage.getItem(`${STORAGE_PREFIX}${key}`), defaultValue);
};

export const gmSetValue = <T>(key: string, value: T): void => {
  if (typeof GM_setValue === "function") {
    GM_setValue(key, value);
    return;
  }
  const storage = getFallbackStorage();
  if (!storage) {
    return;
  }
  storage.setItem(`${STORAGE_PREFIX}${key}`, serialize(value));
};

export const gmAddStyle = (css: string): void => {
  if (typeof GM_addStyle === "function") {
    GM_addStyle(css);
    return;
  }
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
};
