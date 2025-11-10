const HEX_COLOR_PATTERN = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;

const expandHex = (fragment: string): string =>
  fragment.length === 1 ? fragment.repeat(2) : fragment;

const parseHexComponent = (component: string): number => Number.parseInt(component, 16);

export const clampOpacity = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
};

export const resolveFillStyleWithOpacity = (color: string, opacity: number): string => {
  const match = HEX_COLOR_PATTERN.exec(color);
  if (!match) {
    return color;
  }
  const body = match[1];
  let red: number;
  let green: number;
  let blue: number;
  let alpha = 1;

  if (body.length === 3 || body.length === 4) {
    red = parseHexComponent(expandHex(body[0]));
    green = parseHexComponent(expandHex(body[1]));
    blue = parseHexComponent(expandHex(body[2]));
    if (body.length === 4) {
      alpha = parseHexComponent(expandHex(body[3])) / 255;
    }
  } else {
    red = parseHexComponent(body.slice(0, 2));
    green = parseHexComponent(body.slice(2, 4));
    blue = parseHexComponent(body.slice(4, 6));
    if (body.length === 8) {
      alpha = parseHexComponent(body.slice(6, 8)) / 255;
    }
  }

  const combinedAlpha = clampOpacity(alpha * clampOpacity(opacity));
  return `rgba(${red}, ${green}, ${blue}, ${combinedAlpha})`;
};
