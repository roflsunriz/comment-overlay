const Ee = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, Te = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"游明朝体","游明朝","Yu Mincho",YuMincho,yumincho,YuMin-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic'
}, we = {
  defont: "600",
  gothic: "",
  mincho: ""
}, ae = {
  white: "#FFFFFF",
  red: "#FF0000",
  pink: "#FFA5CC",
  orange: "#FFBA66",
  yellow: "#FFFFAA",
  green: "#00FF00",
  cyan: "#88FFFF",
  blue: "#8899FF",
  purple: "#D9A5FF",
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
  black2: "#666"
}, G = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, xe = /^[,.:;]+/, Ie = /[,.:;]+$/, Le = (e) => {
  const t = e.trim();
  return t ? G.test(t) ? t : t.replace(xe, "").replace(Ie, "") : "";
}, Fe = (e) => G.test(e) ? e.toUpperCase() : null, re = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const i = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, s = Number.parseFloat(i);
  return Number.isFinite(s) ? s : null;
}, Re = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return re(t);
}, Ae = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, Pe = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), De = (e) => e === "naka" || e === "ue" || e === "shita", _e = (e) => e === "small" || e === "medium" || e === "big", Ve = (e) => e === "defont" || e === "gothic" || e === "mincho", Oe = (e) => e in ae, He = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, o = 1, l = null, u = !1, h = !1, r = !1, f = 0, d = 1;
  for (const S of e) {
    const y = Le(typeof S == "string" ? S : "");
    if (!y)
      continue;
    if (G.test(y)) {
      const b = Fe(y);
      if (b) {
        a = b;
        continue;
      }
    }
    const m = y.toLowerCase();
    if (De(m)) {
      i = m;
      continue;
    }
    if (_e(m)) {
      s = m;
      continue;
    }
    if (Ve(m)) {
      n = m;
      continue;
    }
    if (Oe(m)) {
      a = ae[m].toUpperCase();
      continue;
    }
    if (m === "_live") {
      l = 0.5;
      continue;
    }
    if (m === "invisible") {
      o = 0, u = !0;
      continue;
    }
    if (m === "full") {
      h = !0;
      continue;
    }
    if (m === "ender") {
      r = !0;
      continue;
    }
    if (m.startsWith("ls:") || m.startsWith("letterspacing:")) {
      const b = y.indexOf(":");
      if (b >= 0) {
        const x = re(y.slice(b + 1));
        x !== null && (f = Ae(x));
      }
      continue;
    }
    if (m.startsWith("lh:") || m.startsWith("lineheight:")) {
      const b = y.indexOf(":");
      if (b >= 0) {
        const x = Re(y.slice(b + 1));
        x !== null && (d = Pe(x));
      }
      continue;
    }
  }
  const c = Math.max(0, Math.min(1, o)), p = (a ?? t.defaultColor).toUpperCase(), g = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: i,
    size: s,
    sizeScale: Ee[s],
    font: n,
    fontFamily: Te[n],
    fontWeight: we[n],
    resolvedColor: p,
    colorOverride: a,
    opacityMultiplier: c,
    opacityOverride: g,
    isInvisible: u,
    isFull: h,
    isEnder: r,
    letterSpacing: f,
    lineHeight: d
  };
}, Ne = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, V = (e) => e.length === 1 ? e.repeat(2) : e, L = (e) => Number.parseInt(e, 16), P = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, oe = (e, t) => {
  const i = Ne.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, o, l = 1;
  s.length === 3 || s.length === 4 ? (n = L(V(s[0])), a = L(V(s[1])), o = L(V(s[2])), s.length === 4 && (l = L(V(s[3])) / 255)) : (n = L(s.slice(0, 2)), a = L(s.slice(2, 4)), o = L(s.slice(4, 6)), s.length === 8 && (l = L(s.slice(6, 8)) / 255));
  const u = P(l * P(t));
  return `rgba(${n}, ${a}, ${o}, ${u})`;
}, ke = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), le = () => ke(), T = (e) => e * 1e3, ze = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), U = 6e3, We = 2700, $e = 3, Xe = 0.35, Be = 48, Ge = 48, N = 0, w = 3e3, F = w + U, Ue = 240, K = 1, ce = 12, E = 1e-3, A = 50, j = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, Ye = (e, t, i) => {
  const n = [`[${t}]`, ...i];
  switch (e) {
    case "debug":
      console.debug(...n);
      break;
    case "info":
      console.info(...n);
      break;
    case "warn":
      console.warn(...n);
      break;
    case "error":
      console.error(...n);
      break;
    default:
      console.log(...n);
  }
}, he = (e, t = {}) => {
  const { level: i = "info", emitter: s = Ye } = t, n = j[i], a = (o, l) => {
    j[o] < n || s(o, e, l);
  };
  return {
    debug: (...o) => a("debug", o),
    info: (...o) => a("info", o),
    warn: (...o) => a("warn", o),
    error: (...o) => a("error", o)
  };
}, Y = he("CommentEngine:Comment"), J = /* @__PURE__ */ new WeakMap(), qe = (e) => {
  let t = J.get(e);
  return t || (t = /* @__PURE__ */ new Map(), J.set(e, t)), t;
}, q = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = qe(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const o = e.measureText(t).width;
  return n.set(s, o), o;
}, ue = 768, Ke = 0.1, z = (e) => Ke * (Math.max(1, e) / ue), je = {
  small: {
    resizeAtLineCount: 7,
    normal: {
      fontSize: 36,
      blockHeight: 46.4650603532791,
      lineAdvance: 36.0867458283901
    },
    resized: {
      fontSize: 20,
      blockHeight: 25.9252893924713,
      lineAdvance: 20.065746307373
    }
  },
  medium: {
    resizeAtLineCount: 5,
    normal: {
      fontSize: 54,
      blockHeight: 68.1645984649658,
      lineAdvance: 57.8541674613953
    },
    resized: {
      fontSize: 28,
      blockHeight: 35.4883227944374,
      lineAdvance: 30.0388290286064
    }
  },
  big: {
    resizeAtLineCount: 3,
    normal: {
      fontSize: 78,
      blockHeight: 98.6615376472473,
      lineAdvance: 90.4781694412232
    },
    resized: {
      fontSize: 40,
      blockHeight: 52.1674284785986,
      lineAdvance: 47.7538447529078
    }
  }
}, Z = ({
  canvasHeight: e,
  size: t,
  lineCount: i,
  isEnder: s,
  lineHeightMultiplier: n
}) => {
  const a = Math.max(1, e), o = Math.max(1, Math.floor(i)), l = je[t], u = !s && o >= l.resizeAtLineCount, h = u ? l.resized : l.normal, r = a / ue, f = Math.max(1, h.fontSize * r), d = Math.abs(n - 1) > Number.EPSILON, c = d ? Math.max(1, f * n) : Math.max(1, h.lineAdvance * r), p = f + (o - 1) * c, g = (h.blockHeight + (o - 1) * h.lineAdvance) * r, S = d ? p : Math.max(1, g - z(a));
  return { fontSize: f, lineAdvance: c, textHeight: p, slotHeight: S, wasResizedForLineCount: u };
}, Je = 1364, Ze = 1024, de = 4e3, fe = 2e3, Qe = 1e3, $ = (e) => Math.max(0, e) / 2 + 3, et = ({
  visibleWidth: e,
  inkWidth: t,
  texturePaddingX: i,
  direction: s,
  traversalDurationMs: n = de
}) => {
  const a = Math.max(1, e), o = Math.max(0, t), l = Math.max(0, i), u = Math.max(1, n), h = a * (Ze / Je), r = (a - h) / 2, f = (h + o) / u, d = f * Qe, c = s === "rtl" ? r + h + l + d : r - o - l - d, p = s === "rtl" ? -o - l : a + l, g = Math.abs(p - c) / Math.max(f, Number.EPSILON), S = o / Math.max(f, Number.EPSILON);
  return {
    renderLeft: r,
    renderWidth: h,
    pixelsPerMs: f,
    startX: c,
    exitX: p,
    collisionDurationMs: S,
    totalDurationMs: g
  };
}, tt = 768, it = 0.75, st = 10, Q = 2, nt = (e, t) => Math.floor((e + Number.EPSILON) / t) * t, at = ({
  visibleWidth: e,
  canvasHeight: t,
  isFull: i,
  isEnder: s,
  lineCount: n,
  verticalFontSize: a,
  verticalTextWidth: o,
  originalFontSize: l,
  originalTextWidth: u
}) => {
  const h = Math.max(0.01, t / tt), r = Q * h, f = st * Q * h, d = Math.max(1, e * (i ? 1 : it)), c = !s && n > 1 && o > d, p = c ? l : a, g = c ? u : o, S = c ? d * 2 : d;
  let y = p;
  g > S && (y = nt(p * (S / g), r)), c && !i && (y -= r), y = Math.max(f, Math.min(p, y));
  const m = p > 0 ? g * (y / p) : 0;
  let b = 1;
  return m > S && y <= f + Number.EPSILON && (b = Math.max(0.1, Math.floor(S / m * 10) / 10)), { fontSize: y, drawScale: b, useOriginalMetrics: c, targetWidth: S };
}, k = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, rt = "  ", ot = (e) => e.replaceAll("	", rt), lt = (e) => {
  const t = ot(e);
  if (t.includes(`
`)) {
    const i = t.split(/\r?\n/);
    return i.length > 0 ? i : [""];
  }
  return [t];
}, ee = (e, t, i = Math.max(1, e.fontSize * e.lineHeightMultiplier)) => {
  let s = 0;
  const n = e.letterSpacing;
  for (const o of e.lines) {
    const l = q(t, o), u = o.length > 1 ? n * (o.length - 1) : 0, h = Math.max(0, l + u);
    h > s && (s = h);
  }
  e.width = s, e.lineHeightPx = Math.max(1, i);
  const a = e.lines.length > 1 ? (e.lines.length - 1) * e.lineHeightPx : 0;
  e.height = e.fontSize + a;
}, ct = (e, t, i) => (t.font = `${e.fontWeight ? `${e.fontWeight} ` : ""}${i}px ${e.fontFamily}`, Math.max(
  0,
  ...e.lines.map((s) => {
    const n = s.length > 1 ? e.letterSpacing * (s.length - 1) : 0;
    return Math.max(0, q(t, s) + n);
  })
)), ht = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1);
    e.lines = lt(e.text);
    const o = Z({
      canvasHeight: s,
      size: e.size,
      lineCount: e.lines.length,
      isEnder: e.isEnder,
      lineHeightMultiplier: e.lineHeightMultiplier
    });
    if (e.fontSize = o.fontSize, e.slotHeight = o.slotHeight, e.staticWidthScale = 1, t.font = k(e), ee(e, t, o.lineAdvance), !e.isScrolling) {
      const d = e.width, c = Z({
        canvasHeight: s,
        size: e.size,
        lineCount: e.lines.length,
        isEnder: !0,
        lineHeightMultiplier: e.lineHeightMultiplier
      }), p = ct(e, t, c.fontSize), g = at({
        visibleWidth: a,
        canvasHeight: s,
        isFull: e.isFull,
        isEnder: e.isEnder,
        lineCount: e.lines.length,
        verticalFontSize: o.fontSize,
        verticalTextWidth: d,
        originalFontSize: c.fontSize,
        originalTextWidth: p
      }), S = g.useOriginalMetrics ? c : o, y = g.fontSize / Math.max(1, S.fontSize);
      e.fontSize = g.fontSize, e.staticWidthScale = g.drawScale, t.font = k(e), ee(e, t, S.lineAdvance * y), e.slotHeight = Math.max(1, S.slotHeight * y * g.drawScale);
    }
    if (!e.isScrolling) {
      e.bufferWidth = 0;
      const d = (a - e.width) / 2;
      e.virtualStartX = d, e.x = d, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = w, e.preCollisionDurationMs = w, e.totalDurationMs = w, e.reservationWidth = e.width * e.staticWidthScale, e.staticExpiryTimeMs = e.vposMs + w, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const u = n.maxVisibleDurationMs === n.minVisibleDurationMs ? n.maxVisibleDurationMs : de, h = $(e.fontSize), r = et({
      visibleWidth: a,
      inkWidth: e.width,
      texturePaddingX: h,
      direction: e.scrollDirection,
      traversalDurationMs: u
    });
    e.bufferWidth = 0, e.virtualStartX = r.startX, e.x = r.startX, e.exitThreshold = r.exitX;
    const f = r.pixelsPerMs * 1e3 / 60;
    e.baseSpeed = f, e.speed = e.baseSpeed, e.speedPixelsPerMs = r.pixelsPerMs, e.visibleDurationMs = u, e.preCollisionDurationMs = Math.ceil(r.collisionDurationMs), e.totalDurationMs = Math.ceil(r.totalDurationMs), e.reservationWidth = e.width, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw Y.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: i,
      canvasHeight: s,
      hasContext: !!t
    }), a;
  }
}, X = 5, I = {
  enabled: !1,
  maxLogsPerCategory: X
}, D = /* @__PURE__ */ new Map(), ut = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return X;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, dt = (e) => {
  I.enabled = !!e.enabled, I.maxLogsPerCategory = ut(e.maxLogsPerCategory), I.enabled || D.clear();
}, Ns = () => {
  D.clear();
}, R = () => I.enabled, ft = (e) => {
  const t = D.get(e) ?? 0;
  return t >= I.maxLogsPerCategory ? (t === I.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), D.set(e, t + 1)), !1) : (D.set(e, t + 1), !0);
}, C = (e, ...t) => {
  I.enabled && ft(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, _ = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, pt = (e, t) => {
  I.enabled && (console.group(`[CommentOverlay][state-dump] ${e}`), console.table({
    "Current Time": `${t.currentTime.toFixed(2)}ms`,
    Duration: `${t.duration.toFixed(2)}ms`,
    "Is Playing": t.isPlaying,
    "Epoch ID": t.epochId,
    "Total Comments": t.totalComments,
    "Active Comments": t.activeComments,
    "Reserved Lanes": t.reservedLanes,
    "Final Phase": t.finalPhaseActive,
    "Playback Begun": t.playbackHasBegun,
    "Is Stalled": t.isStalled
  }), console.groupEnd());
}, gt = (e, t, i) => {
  I.enabled && C("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
}, te = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, pe = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), vt = (e) => {
  if (typeof e.getTransform != "function")
    return;
  const t = e.getTransform();
  return [t.a, t.b, t.c, t.d, t.e, t.f];
}, St = (e) => {
  const t = e.canvas;
  return t ? {
    canvasWidth: t.width,
    canvasHeight: t.height
  } : {};
}, mt = (e) => e ? {
  ...e.no !== void 0 ? { no: e.no } : {},
  ...e.fork !== void 0 ? { fork: e.fork } : {},
  ...e.source !== void 0 ? { source: e.source } : {},
  ...e.threadId !== void 0 ? { threadId: e.threadId } : {},
  ...e.date !== void 0 ? { date: e.date } : {},
  ...e.userIdHash !== void 0 ? { userIdHash: e.userIdHash } : {}
} : {}, ge = (e) => ({
  text: e.text,
  vposMs: e.vposMs,
  ...mt(e.meta),
  layout: e.layout,
  lane: e.lane,
  fontSize: e.fontSize,
  width: e.width,
  height: e.height,
  lineHeightPx: e.lineHeightPx,
  slotHeight: e.slotHeight,
  color: e.color,
  opacity: e.opacity,
  creationIndex: e.creationIndex
}), B = (e, t, i, s) => {
  const n = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof n != "function" || n({
    source: "comment-overlay",
    op: e,
    timestampMs: pe(),
    font: t.font,
    fillStyle: te(t.fillStyle),
    strokeStyle: te(t.strokeStyle),
    lineWidth: t.lineWidth,
    lineJoin: t.lineJoin,
    globalAlpha: t.globalAlpha,
    shadowColor: t.shadowColor,
    shadowBlur: t.shadowBlur,
    shadowOffsetX: t.shadowOffsetX,
    shadowOffsetY: t.shadowOffsetY,
    transform: vt(t),
    ...St(t),
    comment: ge(i),
    ...s
  });
}, yt = (e, t, i) => {
  const s = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof s != "function" || s({
    source: "comment-overlay",
    op: e,
    timestampMs: pe(),
    comment: ge(t),
    ...i
  });
}, v = {
  hits: 0,
  misses: 0,
  creates: 0,
  fallbacks: 0,
  outlineCallsInCache: 0,
  fillCallsInCache: 0,
  outlineCallsInFallback: 0,
  fillCallsInFallback: 0,
  letterSpacingComments: 0,
  normalComments: 0,
  multiLineComments: 0,
  totalCharactersDrawn: 0,
  lastReported: 0
}, ie = () => {
  if (!R())
    return;
  const e = performance.now();
  if (e - v.lastReported <= 5e3)
    return;
  const t = v.hits + v.misses, i = t > 0 ? v.hits / t * 100 : 0, s = v.creates > 0 ? (v.totalCharactersDrawn / v.creates).toFixed(1) : "0", n = v.outlineCallsInCache + v.outlineCallsInFallback, a = v.fillCallsInCache + v.fillCallsInFallback;
  console.log(
    "[TextureCache Stats]",
    `
  Cache: Hits=${v.hits}, Misses=${v.misses}, Hit Rate=${i.toFixed(1)}%`,
    `
  Creates: ${v.creates}, Fallbacks: ${v.fallbacks}`,
    `
  Comments: Normal=${v.normalComments}, LetterSpacing=${v.letterSpacingComments}, MultiLine=${v.multiLineComments}`,
    `
  Draw Calls: Outline=${n}, Fill=${a}`,
    `
  Avg Characters/Comment: ${s}`
  ), v.lastReported = e;
}, Ct = () => typeof OffscreenCanvas < "u", ve = (e, t, i) => {
  if (e === "none")
    return { blur: 0, alpha: 0 };
  const s = {
    light: 0.06,
    medium: 0.1,
    strong: 0.15
  }[e], n = {
    light: 0.6,
    medium: 0.8,
    strong: 0.95
  }[e], a = Math.max(2, t * s), o = P(i * n);
  return { blur: a, alpha: o };
}, Se = () => 2.8, Mt = 0.5, bt = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const i = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!i)
    return !1;
  const s = i[1], n = s.length === 3 || s.length === 4, a = (h) => h.length === 1 ? `${h}${h}` : h, o = Number.parseInt(a(n ? s[0] : s.slice(0, 2)), 16), l = Number.parseInt(a(n ? s[1] : s.slice(2, 4)), 16), u = Number.parseInt(a(n ? s[2] : s.slice(4, 6)), 16);
  return o === 0 && l === 0 && u === 0;
}, me = (e) => bt(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", Et = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const i = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + i;
}, ye = (e) => {
  if (e.isScrolling && e.lines.length > 1) {
    const o = $(e.fontSize), l = e.fontSize * 0.5;
    return {
      paddingX: o,
      paddingY: l,
      textureWidth: Math.ceil(e.width + o * 2),
      textureHeight: Math.ceil(e.height + e.fontSize * 1.25)
    };
  }
  if (!e.isScrolling) {
    const l = Math.ceil(
      e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
    );
    return {
      paddingX: 0,
      paddingY: Math.max(0, (l - e.height) / 2),
      textureWidth: Math.ceil(e.width + 0),
      textureHeight: l
    };
  }
  const t = e.isScrolling ? $(e.fontSize) : Math.max(10, e.fontSize * 0.5), i = e.fontSize, s = e.isScrolling ? Math.round(i * (20 / 9)) : e.height + e.fontSize / 3, n = Math.ceil(
    Math.max(e.height + Math.max(10, e.fontSize), s)
  ), a = e.isScrolling ? e.fontSize * 0.5 : Math.max(0, (n - e.height) / 2);
  return {
    paddingX: t,
    paddingY: a,
    textureWidth: Math.ceil(e.width + t * 2),
    textureHeight: n
  };
}, Tt = (e) => e.isScrolling ? 1 : e.staticWidthScale, wt = (e, t) => e.isScrolling ? 1 : t, xt = (e, t, i, s, n) => {
  const a = wt(e, n), o = !e.isScrolling && a !== 1 ? t.width * (1 - a) * Mt : 0;
  return {
    x: i - s + o,
    scaleX: a,
    scaleY: n
  };
}, Ce = (e, t, i, s, n) => (a, o, l, u = 0) => {
  if (a.length === 0)
    return;
  const h = n + u, r = () => {
    s === "cache" ? l === "outline" ? v.outlineCallsInCache++ : v.fillCallsInCache++ : l === "outline" ? v.outlineCallsInFallback++ : v.fillCallsInFallback++;
  }, f = (c, p, g) => {
    if (r(), l === "outline") {
      t.strokeText(c, p, o), B("strokeText", t, e, {
        text: c,
        x: p,
        y: o,
        meta: { statsTarget: s, mode: l, ...g }
      });
      return;
    }
    t.fillText(c, p, o), B("fillText", t, e, {
      text: c,
      x: p,
      y: o,
      meta: { statsTarget: s, mode: l, ...g }
    });
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    f(a, h);
    return;
  }
  let d = h;
  for (let c = 0; c < a.length; c += 1) {
    const p = a[c];
    f(p, d, { characterIndex: c });
    const g = q(i, p);
    d += g, c < a.length - 1 && (d += e.letterSpacing);
  }
}, It = (e) => `v9::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.width}::${e.height}::${e.staticWidthScale}::${e.lines.length}`, Lt = (e, t) => {
  if (!Ct())
    return null;
  const i = Math.abs(e.letterSpacing) >= Number.EPSILON, s = e.lines.length > 1;
  i && v.letterSpacingComments++, s && v.multiLineComments++, !i && !s && v.normalComments++, v.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: o, textureHeight: l } = ye(e), u = new OffscreenCanvas(o, l), h = u.getContext("2d");
  if (!h)
    return null;
  h.save(), h.font = k(e);
  const r = P(e.opacity), f = n, d = e.lines.length > 0 ? e.lines : [e.text], c = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, p = Et(e, a), g = Ce(e, h, t, "cache", f), S = oe(e.color, r), y = e.renderStyle === "outline-only", m = y ? { blur: 0, alpha: 0 } : ve(e.shadowIntensity, e.fontSize, r);
  return R() && console.log(
    "[Shadow Debug - Cache]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${m.blur}px`,
    `
  Shadow alpha: ${m.alpha}`,
    `
  Fill style: ${S}`
  ), h.save(), h.shadowColor = `rgba(0, 0, 0, ${m.alpha})`, h.shadowBlur = m.blur, h.shadowOffsetX = 0, h.shadowOffsetY = 0, h.lineJoin = "round", h.lineWidth = Se(), h.strokeStyle = me(e), h.fillStyle = S, y && d.forEach((b, x) => {
    const W = p + x * c;
    g(b, W, "outline");
  }), d.forEach((b, x) => {
    const W = p + x * c;
    g(b, W, "fill");
  }), h.restore(), h.restore(), u;
}, Ft = (e, t, i) => {
  v.fallbacks++, t.save(), t.font = k(e);
  const s = P(e.opacity);
  let n = i ?? e.x;
  const a = e.lines.length > 0 ? e.lines : [e.text], o = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize;
  let l = e.y + e.fontSize;
  if (!e.isScrolling && e.staticWidthScale !== 1) {
    const d = n + e.width / 2;
    t.translate(d, e.y), t.scale(e.staticWidthScale, e.staticWidthScale), n = -e.width / 2, l = e.fontSize;
  }
  const u = Ce(e, t, t, "fallback", n), h = oe(e.color, s), r = e.renderStyle === "outline-only", f = r ? { blur: 0, alpha: 0 } : ve(e.shadowIntensity, e.fontSize, s);
  R() && console.log(
    "[Shadow Debug - Fallback]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${f.blur}px`,
    `
  Shadow alpha: ${f.alpha}`,
    `
  Fill style: ${h}`
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${f.alpha})`, t.shadowBlur = f.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = Se(), t.strokeStyle = me(e), t.fillStyle = h, r && a.forEach((d, c) => {
    const p = l + c * o;
    u(d, p, "outline");
  }), a.forEach((d, c) => {
    const p = l + c * o;
    u(d, p, "fill");
  }), t.restore(), t.restore();
}, Rt = (e, t, i) => {
  try {
    if (!e.isActive || !t)
      return;
    const s = It(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== s || !n) {
      v.misses++, v.creates++;
      const o = Lt(e, t);
      e.setCachedTexture(o), e.setTextureCacheKey(s);
    } else
      v.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const o = i ?? e.x, { paddingX: l, paddingY: u } = ye(e), h = Tt(e), r = xt(e, a, o, l, h), f = r.x, d = e.y - u;
      r.scaleX === 1 && r.scaleY === 1 ? t.drawImage(a, f, d) : t.drawImage(
        a,
        f,
        d,
        a.width * r.scaleX,
        a.height * r.scaleY
      ), B("drawImage", t, e, {
        x: f,
        y: d,
        width: a.width * r.scaleX,
        height: a.height * r.scaleY,
        sourceWidth: a.width,
        sourceHeight: a.height,
        meta: {
          statsTarget: "cache",
          paddingX: l,
          paddingY: u,
          drawScale: h,
          drawScaleX: r.scaleX,
          drawScaleY: r.scaleY
        }
      }), ie();
      return;
    }
    Ft(e, t, i), ie();
  } catch (s) {
    Y.error("Comment.draw", s, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: i
    });
  }
}, At = (e) => e === "ltr" ? "ltr" : "rtl", Pt = (e) => e === "ltr" ? 1 : -1;
class Dt {
  text;
  vposMs;
  commands;
  layout;
  isScrolling;
  size;
  sizeScale;
  opacityMultiplier;
  opacityOverride;
  colorOverride;
  isInvisible;
  isFull;
  isEnder;
  meta;
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  baseSpeed = 0;
  speed = 0;
  lane = -1;
  color;
  fontSize = 0;
  fontFamily;
  fontWeight;
  opacity;
  activationTimeMs = null;
  staticExpiryTimeMs = null;
  isActive = !1;
  hasShown = !1;
  isPaused = !1;
  lastUpdateTime = 0;
  reservationWidth = 0;
  bufferWidth = 0;
  visibleDurationMs = 0;
  totalDurationMs = 0;
  preCollisionDurationMs = 0;
  speedPixelsPerMs = 0;
  virtualStartX = 0;
  exitThreshold = 0;
  scrollDirection = "rtl";
  renderStyle = "outline-only";
  shadowIntensity = "medium";
  creationIndex = 0;
  letterSpacing = 0;
  lineHeightMultiplier = 1;
  lineHeightPx = 0;
  slotHeight = 0;
  staticWidthScale = 1;
  lines = [];
  epochId = 0;
  directionSign = -1;
  timeSource;
  lastSyncedSettingsVersion = -1;
  cachedTexture = null;
  textureCacheKey = "";
  constructor(t, i, s, n, a = {}, o = null) {
    if (typeof t != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(i) || i < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = t, this.vposMs = i, this.commands = Array.isArray(s) ? [...s] : [], this.meta = o ? { ...o } : null;
    const l = He(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = l.layout, this.isScrolling = this.layout === "naka", this.size = l.size, this.sizeScale = l.sizeScale, this.opacityMultiplier = l.opacityMultiplier, this.opacityOverride = l.opacityOverride, this.colorOverride = l.colorOverride, this.isInvisible = l.isInvisible, this.isFull = l.isFull, this.isEnder = l.isEnder, this.fontFamily = l.fontFamily, this.fontWeight = l.fontWeight, this.color = l.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = l.letterSpacing, this.lineHeightMultiplier = l.lineHeight, this.timeSource = a.timeSource ?? le(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, i, s, n) {
    ht(this, t, i, s, n);
  }
  draw(t, i = null) {
    Rt(this, t, i);
  }
  update(t = 1, i = !1) {
    try {
      if (!this.isActive) {
        this.isPaused = i;
        return;
      }
      const s = this.timeSource.now();
      if (!this.isScrolling) {
        this.isPaused = i, this.lastUpdateTime = s;
        return;
      }
      if (i) {
        this.isPaused = !0, this.lastUpdateTime = s;
        return;
      }
      const n = (s - this.lastUpdateTime) / (1e3 / 60);
      this.speed = this.baseSpeed * t, this.x += this.speed * n * this.directionSign, (this.scrollDirection === "rtl" && this.x <= this.exitThreshold || this.scrollDirection === "ltr" && this.x >= this.exitThreshold) && (this.isActive = !1), this.lastUpdateTime = s, this.isPaused = !1;
    } catch (s) {
      Y.error("Comment.update", s, {
        text: this.text,
        playbackRate: t,
        isPaused: i,
        isActive: this.isActive
      });
    }
  }
  syncWithSettings(t, i) {
    typeof i == "number" && i === this.lastSyncedSettingsVersion || (this.color = this.getEffectiveColor(t.commentColor), this.opacity = this.getEffectiveOpacity(t.commentOpacity), this.applyScrollDirection(t.scrollDirection), this.renderStyle = t.renderStyle, this.shadowIntensity = t.shadowIntensity, typeof i == "number" && (this.lastSyncedSettingsVersion = i));
  }
  getEffectiveColor(t) {
    const i = this.colorOverride ?? t;
    return typeof i != "string" || i.length === 0 ? t : i.toUpperCase();
  }
  getEffectiveOpacity(t) {
    if (typeof this.opacityOverride == "number")
      return P(this.opacityOverride);
    const i = t * this.opacityMultiplier;
    return Number.isFinite(i) ? P(i) : 0;
  }
  markActivated(t) {
    this.activationTimeMs = t;
  }
  clearActivation() {
    this.activationTimeMs = null, this.isScrolling || (this.staticExpiryTimeMs = null), this.resetTextureCache();
  }
  hasStaticExpired(t) {
    return this.isScrolling || this.staticExpiryTimeMs === null ? !1 : t >= this.staticExpiryTimeMs;
  }
  getDirectionSign() {
    return this.directionSign;
  }
  getTimeSource() {
    return this.timeSource;
  }
  getTextureCacheKey() {
    return this.textureCacheKey;
  }
  setTextureCacheKey(t) {
    this.textureCacheKey = t;
  }
  getCachedTexture() {
    return this.cachedTexture;
  }
  setCachedTexture(t) {
    this.cachedTexture = t;
  }
  resetTextureCache() {
    this.cachedTexture = null, this.textureCacheKey = "";
  }
  applyScrollDirection(t) {
    const i = At(t);
    this.scrollDirection = i, this.directionSign = Pt(i);
  }
}
const H = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: null,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, ks = H, _t = () => ({
  ...H,
  ngWords: [...H.ngWords],
  ngRegexps: [...H.ngRegexps]
}), zs = "v4.1.5", Vt = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, O = (e) => {
  const t = e.scrollVisibleDurationMs, i = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: Vt(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: i,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, Ot = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(Number(t))
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, Ht = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Nt = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, se = (e) => {
  const t = e.meta?.no;
  return typeof t == "number" && Number.isFinite(t) ? t : null;
}, kt = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const i of e) {
    const { text: s, vposMs: n, commands: a = [], meta: o = null } = i, l = _(s);
    if (this.isNGComment(s)) {
      C("comment-skip-ng", { preview: l, vposMs: n });
      continue;
    }
    const u = ze(n);
    if (u === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), C("comment-skip-invalid-vpos", { preview: l, vposMs: n });
      continue;
    }
    const h = o?.no !== void 0 ? `no:${o.source ?? ""}:${o.fork ?? ""}:${o.threadId ?? ""}:${o.no}` : `fallback:${s}\0${u}`, r = (c) => c.meta?.no !== void 0 ? `no:${c.meta.source ?? ""}:${c.meta.fork ?? ""}:${c.meta.threadId ?? ""}:${c.meta.no}` : `fallback:${c.text}\0${c.vposMs}`;
    if (this.comments.some((c) => r(c) === h) || t.some((c) => r(c) === h)) {
      C("comment-skip-duplicate", { preview: l, vposMs: u });
      continue;
    }
    const d = new Dt(
      s,
      u,
      a,
      this._settings,
      this.commentDependencies,
      o
    );
    d.creationIndex = this.commentSequence++, d.epochId = this.epochId, t.push(d), C("comment-added", {
      preview: l,
      vposMs: u,
      commands: d.commands.length,
      layout: d.layout,
      isScrolling: d.isScrolling,
      invisible: d.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    if (Math.abs(n) > E)
      return n;
    const a = se(i), o = se(s);
    return a !== null && o !== null && Math.abs(a - o) > E ? a - o : i.creationIndex - s.creationIndex;
  }), t);
}, zt = function(e, t, i = [], s = null) {
  const [n] = this.addComments([{ text: e, vposMs: t, commands: i, meta: s }]);
  return n ?? null;
}, Wt = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, i);
  }
}, $t = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Me = function() {
  const e = this._settings, t = Array.isArray(e.ngWords) ? e.ngWords : [];
  this.normalizedNgWords = t.filter((s) => typeof s == "string");
  const i = Array.isArray(e.ngRegexps) ? e.ngRegexps : [];
  this.compiledNgRegexps = i.map((s) => {
    if (typeof s != "string")
      return null;
    try {
      return new RegExp(s, "i");
    } catch (n) {
      return this.log.warn("CommentRenderer.invalidNgRegexp", n, { entry: s }), null;
    }
  }).filter((s) => !!s);
}, Xt = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, Bt = (e) => {
  e.prototype.addComments = kt, e.prototype.addComment = zt, e.prototype.clearComments = Wt, e.prototype.resetState = $t, e.prototype.rebuildNgMatchers = Me, e.prototype.isNGComment = Xt;
}, Gt = ({
  vposMs: e,
  durationMs: t,
  isScrolling: i
}) => {
  const s = Number.isFinite(t) && t > 0 ? Math.max(0, t - w) : e, n = Math.min(e, s), a = i ? Math.max(0, n - fe) : n;
  return { displayVposMs: n, activationVposMs: a };
}, Ut = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, Yt = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, gt(t, this.epochId, e), this.eventHooks.onEpochChange) {
    const i = {
      previousEpochId: t,
      newEpochId: this.epochId,
      reason: e,
      timestamp: this.timeSource.now()
    };
    try {
      this.eventHooks.onEpochChange(i);
    } catch (s) {
      this.log.error("CommentRenderer.incrementEpoch.callback", s, { info: i });
    }
  }
  this.comments.forEach((i) => {
    i.epochId = this.epochId;
  });
}, qt = function(e) {
  const t = this.timeSource.now();
  if (t - this.lastSnapshotEmitTime < this.snapshotEmitThrottleMs)
    return;
  const i = {
    currentTime: this.currentTime,
    duration: this.duration,
    isPlaying: this.isPlaying,
    epochId: this.epochId,
    totalComments: this.comments.length,
    activeComments: this.activeComments.size,
    reservedLanes: this.reservedLanes.size,
    finalPhaseActive: this.finalPhaseActive,
    playbackHasBegun: this.playbackHasBegun,
    isStalled: this.isStalled
  };
  if (pt(e, i), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(i);
    } catch (s) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
    }
  this.lastSnapshotEmitTime = t;
}, Kt = function(e) {
  return Gt({
    vposMs: e.vposMs,
    durationMs: this.duration,
    isScrolling: e.isScrolling
  }).activationVposMs;
}, jt = function(e) {
  if (!e.isScrolling)
    return w;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : U;
}, Jt = function(e) {
  return this.getEffectiveCommentVpos(e);
}, Zt = function() {
  this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
}, Qt = (e) => {
  e.prototype.resetFinalPhaseState = Ut, e.prototype.incrementEpoch = Yt, e.prototype.emitStateSnapshot = qt, e.prototype.getEffectiveCommentVpos = Kt, e.prototype.getFinalPhaseDisplayDuration = jt, e.prototype.resolveFinalPhaseVpos = Jt, e.prototype.recomputeFinalPhaseTimeline = Zt;
}, ei = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= A;
}, ti = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > A) && (this.playbackHasBegun = !0);
}, ii = (e) => {
  e.prototype.shouldSuppressRendering = ei, e.prototype.updatePlaybackProgressState = ti;
}, si = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : T(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, o = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(o);
  this.pruneStaticLaneReservations(this.currentTime);
  for (const r of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(r), d = f < this.currentTime - F, c = f > this.currentTime + F;
    if (d || c) {
      r.isActive = !1, this.activeComments.delete(r), r.clearActivation(), r.lane >= 0 && (r.layout === "ue" ? this.releaseStaticLane("ue", r.lane) : r.layout === "shita" && this.releaseStaticLane("shita", r.lane));
      continue;
    }
    r.isScrolling && r.hasShown && (r.scrollDirection === "rtl" && r.x <= r.exitThreshold || r.scrollDirection === "ltr" && r.x >= r.exitThreshold) && (r.isActive = !1, this.activeComments.delete(r), r.clearActivation());
  }
  const h = this.getCommentsInTimeWindow(this.currentTime, F);
  for (const r of h) {
    const f = R(), d = f ? _(r.text) : "";
    if (f && C("comment-evaluate", {
      stage: "update",
      preview: d,
      vposMs: r.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(r),
      currentTime: this.currentTime,
      isActive: r.isActive,
      hasShown: r.hasShown
    }), this.isNGComment(r.text)) {
      f && C("comment-eval-skip", {
        preview: d,
        vposMs: r.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(r),
        reason: "ng-runtime"
      });
      continue;
    }
    if (r.isInvisible) {
      f && C("comment-eval-skip", {
        preview: d,
        vposMs: r.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(r),
        reason: "invisible"
      }), r.isActive = !1, this.activeComments.delete(r), r.hasShown = !0, r.clearActivation();
      continue;
    }
    if (r.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(r, this.currentTime, d) && this.activateComment(
      r,
      s,
      o,
      l,
      u,
      this.currentTime
    ), r.isActive) {
      if (r.layout !== "naka" && r.hasStaticExpired(this.currentTime)) {
        const c = r.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(c, r.lane), r.isActive = !1, this.activeComments.delete(r), r.clearActivation();
        continue;
      }
      if (r.layout === "naka" && this.getEffectiveCommentVpos(r) > this.currentTime + A) {
        r.x = r.virtualStartX, r.lastUpdateTime = this.timeSource.now();
        continue;
      }
      if (r.hasShown = !0, r.update(this.playbackRate, !this.isPlaying), !r.isScrolling && r.hasStaticExpired(this.currentTime)) {
        const c = r.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(c, r.lane), r.isActive = !1, this.activeComments.delete(r), r.clearActivation();
      }
    }
  }
}, ni = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = U, s = We;
  return t !== null && (i = t, s = t), {
    visibleWidth: e,
    virtualExtension: Ue,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: $e,
    bufferRatio: Xe,
    baseBufferPx: Be,
    entryBufferPx: Ge
  };
}, ai = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.createLaneReservation(e, t), s = [...this.reservedLanes.values()].flat().filter((d) => this.areReservationsConflicting(d, i)).sort((d, c) => d.verticalStart - c.verticalStart), n = Math.max(1, e.slotHeight || e.height), a = Math.max(1, this.displayHeight || this.canvas?.height || n), o = this._settings.useFixedLaneCount ? Math.min(a, Math.max(n, this.laneCount * this.laneHeight)) : a, l = z(a), u = [], h = [];
  let r = 0, f = !1;
  for (; ; ) {
    u.push(r);
    const d = r + n, c = s.find(
      (p) => !(p.verticalEnd < r || d < p.verticalStart)
    );
    if (!c)
      break;
    if (h.push(
      `${c.comment.creationIndex}@${c.comment.vposMs}:${c.verticalStart.toFixed(3)}-${c.verticalEnd.toFixed(3)}`
    ), r = c.verticalEnd + l, r + n >= o) {
      f = !0, r = Math.random() * (o - n);
      break;
    }
  }
  return i.verticalStart = r, i.verticalEnd = r + n, this.storeLaneReservation(r, i), yt("laneDecision", e, {
    meta: {
      currentTimeMs: t,
      selectedLane: r,
      selectedTop: r,
      selectedBottom: r + n,
      slotHeight: n,
      usedFallback: f,
      candidateLanes: u.map((d) => d.toFixed(3)).join(","),
      availableLanes: r.toFixed(3),
      nextAvailableTimes: "",
      blockedBy: h.join(","),
      reservationStartTimeMs: Math.round(i.startTime),
      reservationEndTimeMs: Math.round(i.endTime),
      reservationTotalEndTimeMs: Math.round(i.totalEndTime),
      reservationWidth: Math.round(i.width)
    }
  }), r;
}, ri = (e) => {
  e.prototype.updateComments = si, e.prototype.buildPrepareOptions = ni, e.prototype.findAvailableLane = ai;
}, oi = function(e, t) {
  let i = 0, s = e.length;
  for (; i < s; ) {
    const n = Math.floor((i + s) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + N <= t ? i = n + 1 : s = n;
  }
  return i;
}, li = function(e) {
  for (const [t, i] of this.reservedLanes.entries()) {
    const s = this.findFirstValidReservationIndex(i, e);
    s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
  }
}, ci = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
}, hi = (e) => {
  e.prototype.findFirstValidReservationIndex = oi, e.prototype.pruneLaneReservations = li, e.prototype.pruneStaticLaneReservations = ci;
}, ui = function(e) {
  let t = 0, i = this.comments.length;
  for (; t < i; ) {
    const s = Math.floor((t + i) / 2), n = this.comments[s];
    n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
  }
  return t;
}, di = function(e, t) {
  if (this.comments.length === 0)
    return [];
  const i = e - t, s = e + t, n = Math.max(
    0,
    this.duration - w - fe
  ), a = this.duration > 0 && s >= n, o = this.findCommentIndexAtOrAfter(i), l = [];
  for (let u = o; u < this.comments.length; u++) {
    const h = this.comments[u];
    if (!h)
      continue;
    if (!a && h.vposMs > s)
      break;
    const r = this.getEffectiveCommentVpos(h);
    r >= i && r <= s && l.push(h);
  }
  return l;
}, fi = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, pi = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, gi = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, vi = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, Si = function(e, t, i, s) {
  const n = this.pendingStaticPlacementOffsets.get(s);
  if (n !== void 0)
    return this.pendingStaticPlacementOffsets.delete(s), n;
  const a = Math.max(1, i), o = Math.max(1, s.slotHeight || s.height), l = z(a);
  if (e === "ue") {
    let d = 0;
    const p = this.getStaticReservations(e).filter((g) => g.lane < t).sort((g, S) => g.lane - S.lane);
    for (const g of p) {
      const S = g.yEnd - g.yStart;
      d += S + l;
    }
    return d;
  }
  let u = a;
  const r = this.getStaticReservations(e).filter((d) => d.lane < t).sort((d, c) => d.lane - c.lane);
  for (const d of r) {
    const c = d.yEnd - d.yStart;
    u -= c + l;
  }
  const f = u - o;
  return Math.max(0, f);
}, mi = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, yi = (e) => {
  e.prototype.findCommentIndexAtOrAfter = ui, e.prototype.getCommentsInTimeWindow = di, e.prototype.getStaticReservations = fi, e.prototype.getStaticLaneDepth = pi, e.prototype.getStaticLaneLimit = gi, e.prototype.getGlobalLaneIndexForBottom = vi, e.prototype.resolveStaticCommentOffset = Si, e.prototype.getStaticReservedLaneSet = mi;
}, be = (e) => Math.max(1, e.slotHeight || e.height), Ci = ({
  position: e,
  reservationHeight: t,
  displayHeight: i,
  reservations: s,
  currentTime: n,
  random: a = Math.random
}) => {
  const o = Math.max(1, i), l = Math.max(1, t), u = z(o), h = s.filter((f) => f.releaseTime > n), r = e === "ue" ? [0, ...h.sort((f, d) => f.yEnd - d.yEnd).map((f) => f.yEnd + u)] : [
    o - l,
    ...h.sort((f, d) => d.yStart - f.yStart).map((f) => f.yStart - u - l)
  ];
  if (l < o) {
    for (const f of r) {
      if (f < 0 || f + l > o) continue;
      if (!h.some(
        (c) => !(f + l <= c.yStart || f >= c.yEnd)
      )) return { y: f, usedFallback: !1 };
    }
    return {
      y: a() * (o - l),
      usedFallback: !0
    };
  }
  return {
    y: e === "ue" ? 0 : o - l,
    usedFallback: h.length > 0
  };
}, Mi = function(e, t, i = "") {
  const s = i.length > 0 && R(), n = this.resolveFinalPhaseVpos(e);
  return e.isInvisible ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "invisible"
  }), !1) : e.isActive ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-active"
  }), !1) : e.hasShown && n <= t ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-shown",
    currentTime: t
  }), !1) : n > t + A ? (s && C("comment-eval-pending", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "future",
    currentTime: t
  }), !1) : n < t - F ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "expired-window",
    currentTime: t
  }), !1) : !e.isScrolling && n + w <= t ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "static-expired",
    currentTime: t
  }), !1) : (s && C("comment-eval-ready", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    currentTime: t
  }), !0);
}, bi = function(e, t, i, s, n, a) {
  e.prepare(t, i, s, n);
  const o = this.resolveFinalPhaseVpos(e);
  if (R() && C("comment-prepared", {
    preview: _(e.text),
    layout: e.layout,
    isScrolling: e.isScrolling,
    width: e.width,
    height: e.height,
    bufferWidth: e.bufferWidth,
    visibleDurationMs: e.visibleDurationMs,
    effectiveVposMs: o
  }), e.layout === "naka") {
    const l = Math.max(0, a - o), u = e.speedPixelsPerMs * l;
    e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    const h = this.findAvailableLane(e), r = Math.max(1, this.laneHeight);
    e.lane = Math.max(0, Math.round(h / r));
    const f = Math.max(0, s - e.height);
    e.y = Math.max(0, Math.min(h, f));
  } else {
    const l = e.layout === "ue" ? "ue" : "shita", u = this.assignStaticLane(l, e, s, a), h = this.resolveStaticCommentOffset(
      l,
      u,
      s,
      e
    );
    e.x = e.virtualStartX, e.y = h, e.lane = l === "ue" ? u : this.getGlobalLaneIndexForBottom(u), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0;
    const r = o + w;
    e.visibleDurationMs = Math.max(0, r - a), this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = r, this.reserveStaticLane(l, e, u, r), R() && C("comment-activate-static", {
      preview: _(e.text),
      lane: e.lane,
      position: l,
      displayEnd: r,
      effectiveVposMs: o
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, Ei = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = be(t), o = Ci({
    position: e,
    reservationHeight: a,
    displayHeight: i,
    reservations: n,
    currentTime: s
  });
  this.pendingStaticPlacementOffsets.set(t, o.y);
  const l = new Set(n.map((h) => h.lane));
  let u = 0;
  for (; l.has(u); ) u++;
  return u;
}, Ti = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = t.y, o = t.y + be(t);
  n.push({
    comment: t,
    releaseTime: s,
    yStart: a,
    yEnd: o,
    lane: i
  });
}, wi = function(e, t) {
  if (t < 0)
    return;
  const i = this.getStaticReservations(e), s = i.findIndex(
    (n) => e === "shita" ? this.getGlobalLaneIndexForBottom(n.lane) === t : n.lane === t
  );
  s >= 0 && i.splice(s, 1);
}, xi = (e) => {
  e.prototype.shouldActivateCommentAtTime = Mi, e.prototype.activateComment = bi, e.prototype.assignStaticLane = Ei, e.prototype.reserveStaticLane = Ti, e.prototype.releaseStaticLane = wi;
}, Ii = 1e-3, Li = function() {
  return Array.from({ length: this.laneCount }, (e, t) => t);
}, Fi = function(e, t) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return t;
  const s = this.findFirstValidReservationIndex(i, t), n = i[s];
  return n ? Math.max(t, n.endTime + N) : t;
}, Ri = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, E), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), o = Number.isFinite(e.width) && e.width > 0 ? e.width : e.reservationWidth, l = i > 0 ? Math.max(o, 0) / i : e.preCollisionDurationMs, u = a + l + N, h = a + e.totalDurationMs + N;
  return {
    comment: e,
    startTime: a,
    endTime: Math.max(a, u),
    totalEndTime: Math.max(a, h),
    startLeft: e.virtualStartX,
    width: o,
    speed: i,
    buffer: 0,
    directionSign: e.getDirectionSign(),
    verticalStart: 0,
    verticalEnd: Math.max(1, e.slotHeight || e.height)
  };
}, Ai = function(e, t, i) {
  const s = Math.max(1, t.verticalEnd - t.verticalStart);
  return t.verticalStart = e, t.verticalEnd = e + s, [...this.reservedLanes.values()].flat().every((n) => n.totalEndTime <= i ? !0 : n.verticalEnd < t.verticalStart || t.verticalEnd < n.verticalStart || !this.areReservationsConflicting(n, t));
}, Pi = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, Di = function(e, t) {
  if (e.directionSign === t.directionSign) {
    const l = e.speed > 0 ? Math.max(e.width, 0) / e.speed : 0, u = t.speed > 0 ? Math.max(t.width, 0) / t.speed : 0, h = Math.max(l, u);
    return Math.abs(t.startTime - e.startTime) + Ii < h;
  }
  const i = Math.max(e.startTime, t.startTime), s = Math.min(e.endTime, t.endTime);
  if (i >= s)
    return !1;
  const n = /* @__PURE__ */ new Set([
    i,
    s,
    i + (s - i) / 2
  ]), a = this.solveLeftRightEqualityTime(e, t);
  a !== null && a >= i - E && a <= s + E && n.add(a);
  const o = this.solveLeftRightEqualityTime(t, e);
  o !== null && o >= i - E && o <= s + E && n.add(o);
  for (const l of n) {
    if (l < i - E || l > s + E)
      continue;
    const u = this.computeForwardGap(e, t, l), h = this.computeForwardGap(t, e, l);
    if (u <= -24 && h <= -24)
      return !0;
  }
  return !1;
}, _i = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, Vi = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, o = n + e.width + e.buffer;
  return { left: a, right: o };
}, Oi = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < E)
    return null;
  const o = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(o) ? o : null;
}, Hi = (e) => {
  e.prototype.getLanePriorityOrder = Li, e.prototype.getLaneNextAvailableTime = Fi, e.prototype.createLaneReservation = Ri, e.prototype.isLaneAvailable = Ai, e.prototype.storeLaneReservation = Pi, e.prototype.areReservationsConflicting = Di, e.prototype.computeForwardGap = _i, e.prototype.getBufferedEdges = Vi, e.prototype.solveLeftRightEqualityTime = Oi;
}, Ni = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i, a = this.timeSource.now();
  if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering() || this.isStalled) {
    t.clearRect(0, 0, s, n), this.lastDrawTime = a;
    return;
  }
  t.clearRect(0, 0, s, n);
  const o = Array.from(this.activeComments);
  if (this._settings.isCommentVisible) {
    const l = (a - this.lastDrawTime) / 16.666666666666668;
    o.sort((u, h) => {
      const r = this.getEffectiveCommentVpos(u), f = this.getEffectiveCommentVpos(h), d = r - f;
      return Math.abs(d) > E ? d : u.isScrolling !== h.isScrolling ? u.isScrolling ? 1 : -1 : u.creationIndex - h.creationIndex;
    }), o.forEach((u) => {
      const r = this.isPlaying && !u.isPaused ? u.x + u.getDirectionSign() * u.speed * l : u.x;
      u.draw(t, r);
    });
  }
  this.lastDrawTime = a;
}, ki = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : T(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, o = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(o);
  this.activeComments.forEach((r) => {
    r.isActive = !1, r.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.getCommentsInTimeWindow(this.currentTime, F).forEach((r) => {
    if (this.isNGComment(r.text) || r.isInvisible) {
      r.isActive = !1, this.activeComments.delete(r), r.clearActivation();
      return;
    }
    if (r.syncWithSettings(this._settings, this.settingsVersion), r.isActive = !1, this.activeComments.delete(r), r.lane = -1, r.hasShown = !1, r.clearActivation(), this.shouldActivateCommentAtTime(r, this.currentTime)) {
      this.activateComment(
        r,
        s,
        o,
        l,
        u,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(r) < this.currentTime - F ? r.hasShown = !0 : r.hasShown = !1;
  });
}, zi = (e) => {
  e.prototype.draw = Ni, e.prototype.performInitialSync = ki;
}, Wi = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, $i = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, Xi = function(e, t) {
  this.videoFrameHandle = null;
  const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
}, Bi = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, Gi = function() {
  const e = this.videoElement;
  if (e) {
    if (this.shouldUseVideoFrameCallback()) {
      this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
      const t = e.requestVideoFrameCallback;
      typeof t == "function" && (this.videoFrameHandle = t.call(e, this.handleVideoFrame));
      return;
    }
    this.cancelVideoFrameCallback(), this.frameId = this.animationFrameProvider.request(this.handleAnimationFrame);
  }
}, Ui = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, Yi = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, qi = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, Ki = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, ji = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  if (!e || !t || !i)
    return;
  const s = T(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
  if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
    this.currentTime = s, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
    return;
  }
  const l = n > A;
  if (this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !l) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const u = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : e.width / u, r = this.displayHeight > 0 ? this.displayHeight : e.height / u, f = this.buildPrepareOptions(h);
  this.getCommentsInTimeWindow(this.currentTime, F).forEach((c) => {
    const p = R(), g = p ? _(c.text) : "";
    if (p && C("comment-evaluate", {
      stage: "seek",
      preview: g,
      vposMs: c.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(c),
      currentTime: this.currentTime,
      isActive: c.isActive,
      hasShown: c.hasShown
    }), this.isNGComment(c.text)) {
      p && C("comment-eval-skip", {
        preview: g,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "ng-runtime"
      }), c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
      return;
    }
    if (c.isInvisible) {
      p && C("comment-eval-skip", {
        preview: g,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "invisible"
      }), c.isActive = !1, this.activeComments.delete(c), c.hasShown = !0, c.clearActivation();
      return;
    }
    if (c.syncWithSettings(this._settings, this.settingsVersion), c.isActive = !1, this.activeComments.delete(c), c.lane = -1, c.hasShown = !1, c.clearActivation(), this.shouldActivateCommentAtTime(c, this.currentTime, g)) {
      this.activateComment(
        c,
        t,
        h,
        r,
        f,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(c) < this.currentTime - F ? c.hasShown = !0 : c.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Ji = (e) => {
  e.prototype.processFrame = Wi, e.prototype.handleAnimationFrame = $i, e.prototype.handleVideoFrame = Xi, e.prototype.shouldUseVideoFrameCallback = Bi, e.prototype.scheduleNextFrame = Gi, e.prototype.cancelAnimationFrameRequest = Ui, e.prototype.cancelVideoFrameCallback = Yi, e.prototype.startAnimation = qi, e.prototype.stopAnimation = Ki, e.prototype.onSeek = ji;
}, Zi = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, Qi = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, es = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, i = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(i ?? null, t);
    this.videoElement = t, this.containerElement = s, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? T(t.duration) : 0, this.currentTime = T(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > A, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.right = "0", n.style.bottom = "0", n.style.display = "block", n.style.pointerEvents = "none", n.style.zIndex = "2147483647";
    const o = this.containerElement;
    o instanceof HTMLElement && (this.ensureContainerPositioning(o), o.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, ts = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, is = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, ss = (e) => {
  e.prototype.resolveContainer = Zi, e.prototype.ensureContainerPositioning = Qi, e.prototype.initialize = es, e.prototype.destroy = ts, e.prototype.destroyCanvasOnly = is;
}, ns = function(e) {
  try {
    const t = () => {
      this.isPlaying = !0, this.playbackHasBegun = !0;
      const d = this.timeSource.now();
      this.lastDrawTime = d, this.lastPlayResumeTime = d, this.comments.forEach((c) => {
        c.lastUpdateTime = d, c.isPaused = !1;
      });
    }, i = () => {
      this.isPlaying = !1;
      const d = this.timeSource.now();
      this.comments.forEach((c) => {
        c.lastUpdateTime = d, c.isPaused = !0;
      });
    }, s = () => {
      this.onSeek();
    }, n = () => {
      this.onSeek();
    }, a = () => {
      this.playbackRate = e.playbackRate;
      const d = this.timeSource.now();
      this.comments.forEach((c) => {
        c.lastUpdateTime = d;
      });
    }, o = () => {
      this.handleVideoMetadataLoaded(e);
    }, l = () => {
      this.duration = Number.isFinite(e.duration) ? T(e.duration) : 0;
    }, u = () => {
      this.handleVideoSourceChange();
    }, h = () => {
      this.handleVideoStalled();
    }, r = () => {
      this.handleVideoCanPlay();
    }, f = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", o), e.addEventListener("durationchange", l), e.addEventListener("emptied", u), e.addEventListener("waiting", h), e.addEventListener("canplay", r), e.addEventListener("playing", f), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", o)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", u)), this.addCleanup(() => e.removeEventListener("waiting", h)), this.addCleanup(() => e.removeEventListener("canplay", r)), this.addCleanup(() => e.removeEventListener("playing", f));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, as = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, rs = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
  t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, os = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = T(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, ls = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, cs = function(e) {
  this.duration = Number.isFinite(e.duration) ? T(e.duration) : 0, this.currentTime = T(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > A, this.lastDrawTime = this.timeSource.now();
}, hs = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > A, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, us = function(e, t) {
  if (typeof MutationObserver > "u") {
    this.log.debug(
      "MutationObserver is not available in this environment. Video change detection is disabled."
    );
    return;
  }
  const i = new MutationObserver((n) => {
    for (const a of n) {
      if (a.type === "attributes" && a.attributeName === "src") {
        const o = a.target;
        let l = null, u = null;
        if ((o instanceof HTMLVideoElement || o instanceof HTMLSourceElement) && (l = typeof a.oldValue == "string" ? a.oldValue : null, u = o.getAttribute("src")), l === u)
          continue;
        this.handleVideoSourceChange(e);
        return;
      }
      if (a.type === "childList") {
        for (const o of a.addedNodes)
          if (o instanceof HTMLSourceElement) {
            this.handleVideoSourceChange(e);
            return;
          }
        for (const o of a.removedNodes)
          if (o instanceof HTMLSourceElement) {
            this.handleVideoSourceChange(e);
            return;
          }
      }
    }
  });
  i.observe(e, {
    attributes: !0,
    attributeFilter: ["src"],
    attributeOldValue: !0,
    childList: !0,
    subtree: !0
  }), this.addCleanup(() => i.disconnect());
  const s = new MutationObserver((n) => {
    for (const a of n)
      if (a.type === "childList") {
        for (const o of a.addedNodes) {
          const l = this.extractVideoElement(o);
          if (l && l !== this.videoElement) {
            this.initialize(l);
            return;
          }
        }
        for (const o of a.removedNodes) {
          if (o === this.videoElement) {
            this.videoElement = null, this.handleVideoSourceChange(null);
            return;
          }
          if (o instanceof Element) {
            const l = o.querySelector("video");
            if (l && l === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
          }
        }
      }
  });
  s.observe(t, { childList: !0, subtree: !0 }), this.addCleanup(() => s.disconnect());
}, ds = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, fs = (e) => {
  e.prototype.setupVideoEventListeners = ns, e.prototype.handleVideoMetadataLoaded = as, e.prototype.handleVideoStalled = rs, e.prototype.handleVideoCanPlay = os, e.prototype.handleVideoSourceChange = ls, e.prototype.syncVideoState = cs, e.prototype.resetCommentActivity = hs, e.prototype.setupVideoChangeDetection = us, e.prototype.extractVideoElement = ds;
}, ps = function() {
  if (typeof document > "u" || typeof document.addEventListener != "function" || typeof document.removeEventListener != "function")
    return;
  const e = () => {
    if (document.visibilityState !== "visible") {
      this.stopAnimation();
      return;
    }
    this._settings.isCommentVisible && (this.handleVisibilityRestore(), this.startAnimation());
  };
  document.addEventListener("visibilitychange", e), this.addCleanup(() => document.removeEventListener("visibilitychange", e)), document.visibilityState !== "visible" && this.stopAnimation();
}, gs = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  !e || !t || !i || (this.currentTime = T(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, vs = function(e) {
  const t = this._settings.isCommentVisible;
  if (this._settings.isCommentVisible = e, t === e)
    return;
  this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion;
  const i = this.canvas, s = this.ctx;
  if (!(!i || !s))
    if (e)
      this.lastDrawTime = this.timeSource.now(), this.pendingInitialSync = !0, this.scheduleNextFrame();
    else {
      const n = this.canvasDpr > 0 ? this.canvasDpr : 1, a = this.displayWidth > 0 ? this.displayWidth : i.width / n, o = this.displayHeight > 0 ? this.displayHeight : i.height / n;
      s.clearRect(0, 0, a, o);
    }
}, Ss = (e) => {
  e.prototype.setupVisibilityHandling = ps, e.prototype.handleVisibilityRestore = gs, e.prototype.setCommentVisibility = vs;
}, ms = 768, ys = 68.1645984649658, Cs = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const o = (this.fullscreenActive && s.parentElement instanceof HTMLElement ? s.parentElement.getBoundingClientRect() : null) ?? i.getBoundingClientRect(), l = this.canvasDpr > 0 ? this.canvasDpr : 1, u = this.displayWidth > 0 ? this.displayWidth : s.width / l, h = this.displayHeight > 0 ? this.displayHeight : s.height / l, r = e ?? o.width ?? u, f = t ?? o.height ?? h;
  if (!Number.isFinite(r) || !Number.isFinite(f) || r <= 0 || f <= 0)
    return;
  const d = Math.max(1, Math.floor(r)), c = Math.max(1, Math.floor(f)), p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, g = Math.max(1, Math.round(d * p)), S = Math.max(1, Math.round(c * p));
  (this.displayWidth !== d || this.displayHeight !== c || Math.abs(this.canvasDpr - p) > Number.EPSILON || s.width !== g || s.height !== S) && (this.displayWidth = d, this.displayHeight = c, this.canvasDpr = p, s.width = g, s.height = S, s.style.width = `${d}px`, s.style.height = `${c}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p)), this.calculateLaneMetrics(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.performInitialSync(T(i.currentTime)), this.draw());
}, Ms = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, bs = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1);
  this.laneHeight = t * (ys / ms);
  const i = Math.max(this.laneHeight, 1), n = Math.floor(Math.max(0, t - i) / i);
  if (this._settings.useFixedLaneCount) {
    const a = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : ce, o = Math.max(K, Math.min(n, a));
    this.laneCount = o;
  } else
    this.laneCount = Math.max(K, n);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, Es = function(e) {
  this.cleanupResizeHandling();
  let t = !1;
  const i = () => {
    if (t)
      return;
    t = !0;
    const n = () => {
      t = !1, this.resize();
    };
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame(n);
      return;
    }
    n();
  };
  if (this._settings.useContainerResizeObserver && this.isResizeObserverAvailable) {
    const n = this.resolveResizeObserverTarget(e), a = new ResizeObserver((o) => {
      for (const l of o) {
        const { width: u, height: h } = l.contentRect;
        u > 0 && h > 0 ? this.resize(u, h) : this.resize();
      }
    });
    a.observe(n), this.resizeObserver = a, this.resizeObserverTarget = n;
  } else
    this.log.debug(
      "Resize handling is disabled because neither ResizeObserver nor window APIs are available."
    );
  typeof window < "u" && typeof window.addEventListener == "function" && (window.addEventListener("resize", i), this.addCleanup(() => window.removeEventListener("resize", i)));
  const s = typeof window < "u" ? window.visualViewport : void 0;
  s && typeof s.addEventListener == "function" && (s.addEventListener("resize", i), s.addEventListener("scroll", i), this.addCleanup(() => {
    s.removeEventListener("resize", i), s.removeEventListener("scroll", i);
  }));
}, Ts = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, ws = (e) => {
  e.prototype.resize = Cs, e.prototype.resolveDevicePixelRatio = Ms, e.prototype.calculateLaneMetrics = bs, e.prototype.setupResizeHandling = Es, e.prototype.cleanupResizeHandling = Ts;
}, xs = function() {
  if (typeof document > "u" || typeof document.addEventListener != "function" || typeof document.removeEventListener != "function")
    return;
  const e = () => {
    this.handleFullscreenChange();
  };
  [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange"
  ].forEach((i) => {
    document.addEventListener(i, e), this.addCleanup(() => document.removeEventListener(i, e));
  }), this.handleFullscreenChange();
}, ne = (e) => {
  const t = () => {
    const i = e.getFullscreenElement();
    if (i instanceof HTMLElement) {
      const s = i.getBoundingClientRect();
      e.resize(s.width, s.height);
      return;
    }
    e.resize();
  };
  typeof requestAnimationFrame == "function" && requestAnimationFrame(t), typeof setTimeout == "function" && setTimeout(t, 80);
}, Is = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, Ls = async function() {
  const e = this.canvas, t = this.videoElement;
  if (!e || !t)
    return;
  const i = this.containerElement ?? t.parentElement ?? null, s = this.getFullscreenElement(), n = this.resolveActiveOverlayContainer(t, i, s);
  if (!(n instanceof HTMLElement))
    return;
  e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
  const a = s instanceof HTMLElement && s.contains(t) ? s : null, o = a !== null;
  if (this.fullscreenActive !== o && (this.fullscreenActive = o, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", e.style.right = "0", e.style.bottom = "0", e.style.display = "block", e.style.pointerEvents = "none", e.style.zIndex = "2147483647", a) {
    const l = a.getBoundingClientRect();
    this.resize(l.width, l.height), ne(this);
    return;
  }
  this.resize(), ne(this);
}, Fs = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, Rs = function(e, t, i) {
  return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
}, As = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, Ps = (e) => {
  e.prototype.setupFullscreenHandling = xs, e.prototype.resolveResizeObserverTarget = Is, e.prototype.handleFullscreenChange = Ls, e.prototype.resolveFullscreenContainer = Fs, e.prototype.resolveActiveOverlayContainer = Rs, e.prototype.getFullscreenElement = As;
}, Ds = function(e) {
  this.cleanupTasks.push(e);
}, _s = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, Vs = (e) => {
  e.prototype.addCleanup = Ds, e.prototype.runCleanupTasks = _s;
};
class M {
  _settings;
  comments = [];
  activeComments = /* @__PURE__ */ new Set();
  reservedLanes = /* @__PURE__ */ new Map();
  topStaticLaneReservations = [];
  bottomStaticLaneReservations = [];
  pendingStaticPlacementOffsets = /* @__PURE__ */ new WeakMap();
  log;
  timeSource;
  animationFrameProvider;
  createCanvasElement;
  commentDependencies;
  settingsVersion = 0;
  normalizedNgWords = [];
  compiledNgRegexps = [];
  canvas = null;
  ctx = null;
  videoElement = null;
  containerElement = null;
  fullscreenActive = !1;
  laneCount = ce;
  laneHeight = 0;
  displayWidth = 0;
  displayHeight = 0;
  canvasDpr = 1;
  currentTime = 0;
  duration = 0;
  playbackRate = 1;
  isPlaying = !0;
  isStalled = !1;
  lastDrawTime = 0;
  /** @deprecated Retained for API compatibility; official timing has no phase state. */
  finalPhaseActive = !1;
  /** @deprecated Retained for API compatibility; always null. */
  finalPhaseStartTime = null;
  /** @deprecated Retained for API compatibility; always false. */
  finalPhaseScheduleDirty = !1;
  playbackHasBegun = !1;
  skipDrawingForCurrentFrame = !1;
  pendingInitialSync = !1;
  /** @deprecated Retained for API compatibility; official timing uses no override map. */
  finalPhaseVposOverrides = /* @__PURE__ */ new Map();
  frameId = null;
  videoFrameHandle = null;
  resizeObserver = null;
  resizeObserverTarget = null;
  isResizeObserverAvailable = typeof ResizeObserver < "u";
  cleanupTasks = [];
  commentSequence = 0;
  epochId = 0;
  eventHooks;
  lastSnapshotEmitTime = 0;
  snapshotEmitThrottleMs = 1e3;
  lastPlayResumeTime = 0;
  playResumeSeekIgnoreDurationMs = 500;
  lastVideoSource = null;
  rebuildNgMatchers() {
    Me.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (Nt(t))
      s = O({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = O(_t());
    }
    this._settings = O(s), this.timeSource = n.timeSource ?? le(), this.animationFrameProvider = n.animationFrameProvider ?? Ot(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? Ht(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = he(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && dt(n.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(t) {
    this._settings = O(t), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
  }
  getVideoElement() {
    return this.videoElement;
  }
  getCurrentVideoSource() {
    const t = this.videoElement;
    if (!t)
      return null;
    if (typeof t.currentSrc == "string" && t.currentSrc.length > 0)
      return t.currentSrc;
    const i = t.getAttribute("src");
    if (i && i.length > 0)
      return i;
    const s = t.querySelector("source[src]");
    return s && typeof s.src == "string" ? s.src : null;
  }
  getCommentsSnapshot() {
    return [...this.comments];
  }
}
Bt(M);
Qt(M);
ii(M);
ri(M);
hi(M);
yi(M);
xi(M);
Hi(M);
zi(M);
Ji(M);
ss(M);
fs(M);
Ss(M);
ws(M);
Ps(M);
Vs(M);
const Os = (e) => ({
  text: e.text,
  vposMs: e.vposMs,
  ...e.meta?.no !== void 0 ? { no: e.meta.no } : {},
  ...e.meta?.fork !== void 0 ? { fork: e.meta.fork } : {},
  ...e.meta?.source !== void 0 ? { source: e.meta.source } : {},
  ...e.meta?.threadId !== void 0 ? { threadId: e.meta.threadId } : {},
  ...e.meta?.date !== void 0 ? { date: e.meta.date } : {},
  ...e.meta?.userIdHash !== void 0 ? { userIdHash: e.meta.userIdHash } : {},
  commands: e.commands,
  layout: e.layout,
  lane: e.lane,
  x: e.x,
  y: e.y,
  width: e.width,
  height: e.height,
  fontSize: e.fontSize,
  lineHeightPx: e.lineHeightPx,
  slotHeight: e.slotHeight,
  fontFamily: e.fontFamily,
  color: e.color,
  opacity: e.opacity,
  visibleDurationMs: e.visibleDurationMs,
  totalDurationMs: e.totalDurationMs,
  preCollisionDurationMs: e.preCollisionDurationMs,
  speedPixelsPerMs: e.speedPixelsPerMs,
  virtualStartX: e.virtualStartX,
  exitThreshold: e.exitThreshold,
  bufferWidth: e.bufferWidth,
  reservationWidth: e.reservationWidth,
  creationIndex: e.creationIndex
}), Hs = (e) => {
  const t = e.canvas;
  if (!t)
    return null;
  const i = e.canvasDpr > 0 ? e.canvasDpr : 1;
  return {
    width: t.width,
    height: t.height,
    cssWidth: e.displayWidth > 0 ? e.displayWidth : t.width / i,
    cssHeight: e.displayHeight > 0 ? e.displayHeight : t.height / i,
    dpr: i
  };
}, Ws = (e, t, i = {}) => {
  const s = [], n = globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__, a = globalThis.__COMMENT_OVERLAY_TRACE__;
  if (i.collectTrace === !0) {
    const o = i.traceOps && i.traceOps.length > 0 ? new Set(i.traceOps) : null;
    globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = !0, globalThis.__COMMENT_OVERLAY_TRACE__ = ((l) => {
      o && !o.has(l.op) || s.push(l);
    });
  }
  try {
    e.processFrame(t);
  } finally {
    i.collectTrace === !0 && (globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = n, globalThis.__COMMENT_OVERLAY_TRACE__ = a);
  }
  return {
    frameTimeMs: t,
    canvas: Hs(e),
    activeComments: Array.from(e.activeComments, Os),
    records: s
  };
};
export {
  zs as COMMENT_OVERLAY_VERSION,
  Dt as Comment,
  M as CommentRenderer,
  ks as DEFAULT_RENDERER_SETTINGS,
  Ws as captureRendererCalibrationFrame,
  _t as cloneDefaultSettings,
  dt as configureDebugLogging,
  Ot as createDefaultAnimationFrameProvider,
  le as createDefaultTimeSource,
  he as createLogger,
  C as debugLog,
  pt as dumpRendererState,
  R as isDebugLoggingEnabled,
  gt as logEpochChange,
  Ns as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
