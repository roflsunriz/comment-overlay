import {
  type CommentColorCommand,
  type CommentCommandParseContext,
  type CommentCommandParseResult,
  type CommentFontCommand,
  type CommentHexColorCommand,
  type CommentLayoutCommand,
  type CommentSizeCommand,
} from "../types/comment";

const COMMENT_SIZE_SCALE: Record<CommentSizeCommand, number> = {
  small: 0.8,
  medium: 1,
  big: 1.4,
};

const FONT_FAMILY_MAP: Record<CommentFontCommand, string> = {
  defont:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", sans-serif',
  gothic:
    '"Noto Sans JP", "Yu Gothic", "Yu Gothic Medium", "Hiragino Kaku Gothic ProN", "Meiryo", "Segoe UI", sans-serif',
  mincho:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "MS Mincho", "Times New Roman", serif',
};

const COLOR_COMMAND_MAP: Record<CommentColorCommand, string> = {
  white: "#FFFFFF",
  red: "#FF0000",
  pink: "#FF8080",
  orange: "#FF9900",
  yellow: "#FFFF00",
  green: "#00FF00",
  cyan: "#00FFFF",
  blue: "#0000FF",
  purple: "#C000FF",
  black: "#000000",
  white2: "#CC9",
  red2: "#C03",
  pink2: "#F3C",
  orange2: "#F60",
  yellow2: "#990",
  green2: "#0C6",
  cyan2: "#0CC",
  blue2: "#39F",
  purple2: "#63C",
  black2: "#666",
};

const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const COMMAND_PREFIX_STRIP_REGEX = /^[,.:;]+/;
const COMMAND_SUFFIX_STRIP_REGEX = /[,.:;]+$/;

const normalizeCommandToken = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (HEX_COLOR_REGEX.test(trimmed)) {
    return trimmed;
  }
  const withoutPrefix = trimmed.replace(COMMAND_PREFIX_STRIP_REGEX, "");
  const withoutSuffix = withoutPrefix.replace(COMMAND_SUFFIX_STRIP_REGEX, "");
  return withoutSuffix;
};

const normalizeHexColor = (command: CommentHexColorCommand): string | null => {
  if (!HEX_COLOR_REGEX.test(command)) {
    return null;
  }
  return command.toUpperCase();
};

const isLayoutCommand = (command: string): command is CommentLayoutCommand =>
  command === "naka" || command === "ue" || command === "shita";

const isSizeCommand = (command: string): command is CommentSizeCommand =>
  command === "small" || command === "medium" || command === "big";

const isFontCommand = (command: string): command is CommentFontCommand =>
  command === "defont" || command === "gothic" || command === "mincho";

const isColorCommand = (command: string): command is CommentColorCommand =>
  command in COLOR_COMMAND_MAP;

export const parseCommentCommands = (
  commands: readonly string[],
  context: CommentCommandParseContext,
): CommentCommandParseResult => {
  let layout: CommentLayoutCommand = "naka";
  let size: CommentSizeCommand = "medium";
  let font: CommentFontCommand = "defont";
  let colorOverride: string | null = null;
  let opacityMultiplier = 1;
  let opacityOverride: number | null = null;
  let isInvisible = false;

  for (const rawCommand of commands) {
    const normalizedToken = normalizeCommandToken(typeof rawCommand === "string" ? rawCommand : "");
    if (!normalizedToken) {
      continue;
    }

    if (HEX_COLOR_REGEX.test(normalizedToken)) {
      const normalized = normalizeHexColor(normalizedToken as CommentHexColorCommand);
      if (normalized) {
        colorOverride = normalized;
        continue;
      }
    }

    const lower = normalizedToken.toLowerCase();

    if (isLayoutCommand(lower)) {
      layout = lower;
      continue;
    }

    if (isSizeCommand(lower)) {
      size = lower;
      continue;
    }

    if (isFontCommand(lower)) {
      font = lower;
      continue;
    }

    if (isColorCommand(lower)) {
      colorOverride = COLOR_COMMAND_MAP[lower].toUpperCase();
      continue;
    }

    if (lower === "_live") {
      opacityOverride = 0.5;
      continue;
    }

    if (lower === "invisible") {
      opacityMultiplier = 0;
      isInvisible = true;
    }
  }

  const clampedOpacityMultiplier = Math.max(0, Math.min(1, opacityMultiplier));
  const resolvedColor = (colorOverride ?? context.defaultColor).toUpperCase();
  const resolvedOpacityOverride =
    typeof opacityOverride === "number" ? Math.max(0, Math.min(1, opacityOverride)) : null;

  return {
    layout,
    size,
    sizeScale: COMMENT_SIZE_SCALE[size],
    font,
    fontFamily: FONT_FAMILY_MAP[font],
    resolvedColor,
    colorOverride,
    opacityMultiplier: clampedOpacityMultiplier,
    opacityOverride: resolvedOpacityOverride,
    isInvisible,
  };
};
