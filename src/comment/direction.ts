import type { ScrollDirection } from "@/shared/types";

export const resolveScrollDirection = (input: ScrollDirection | string): ScrollDirection =>
  input === "ltr" ? "ltr" : "rtl";

export const getDirectionSign = (direction: ScrollDirection): -1 | 1 =>
  direction === "ltr" ? 1 : -1;
