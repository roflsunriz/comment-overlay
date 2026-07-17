import { NICO_SCROLL_ACTIVATION_LEAD_MS } from "@/comment/nico-scroll";
import { STATIC_VISIBLE_DURATION_MS } from "@/shared/constants";

export type NicoCommentTiming = {
  displayVposMs: number;
  activationVposMs: number;
};

export const resolveNicoCommentTiming = ({
  vposMs,
  durationMs,
  isScrolling,
}: {
  vposMs: number;
  durationMs: number;
  isScrolling: boolean;
}): NicoCommentTiming => {
  const latestDisplayVposMs =
    Number.isFinite(durationMs) && durationMs > 0
      ? Math.max(0, durationMs - STATIC_VISIBLE_DURATION_MS)
      : vposMs;
  const displayVposMs = Math.min(vposMs, latestDisplayVposMs);
  const activationVposMs = isScrolling
    ? Math.max(0, displayVposMs - NICO_SCROLL_ACTIVATION_LEAD_MS)
    : displayVposMs;

  return { displayVposMs, activationVposMs };
};
