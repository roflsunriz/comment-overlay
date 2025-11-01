declare const unsafeWindow:
  | (Window & typeof globalThis & { [key: string]: unknown })
  | undefined;

export const getUnsafeWindow = (): Window & typeof globalThis => {
  if (typeof unsafeWindow !== "undefined" && unsafeWindow !== null) {
    return unsafeWindow;
  }
  return window;
};
