const ft = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, pt = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"游明朝体","游明朝","Yu Mincho",YuMincho,yumincho,YuMin-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic'
}, gt = {
  defont: "600",
  gothic: "",
  mincho: ""
}, Xe = {
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
}, ie = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, vt = /^[,.:;]+/, St = /[,.:;]+$/, Ct = (e) => {
  const t = e.trim();
  return t ? ie.test(t) ? t : t.replace(vt, "").replace(St, "") : "";
}, yt = (e) => ie.test(e) ? e.toUpperCase() : null, Ue = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const i = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, s = Number.parseFloat(i);
  return Number.isFinite(s) ? s : null;
}, Mt = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return Ue(t);
}, _t = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, It = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), Et = (e) => e === "naka" || e === "ue" || e === "shita", Tt = (e) => e === "small" || e === "medium" || e === "big", Lt = (e) => e === "defont" || e === "gothic" || e === "mincho", bt = (e) => e in Xe, mt = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, r = 1, l = null, u = !1, d = !1, h = !1, o = 0, f = 1;
  for (const C of e) {
    const M = Ct(typeof C == "string" ? C : "");
    if (!M)
      continue;
    if (ie.test(M)) {
      const _ = yt(M);
      if (_) {
        a = _;
        continue;
      }
    }
    const S = M.toLowerCase();
    if (Et(S)) {
      i = S;
      continue;
    }
    if (Tt(S)) {
      s = S;
      continue;
    }
    if (Lt(S)) {
      n = S;
      continue;
    }
    if (bt(S)) {
      a = Xe[S].toUpperCase();
      continue;
    }
    if (S === "_live") {
      l = 0.5;
      continue;
    }
    if (S === "invisible") {
      r = 0, u = !0;
      continue;
    }
    if (S === "full") {
      d = !0;
      continue;
    }
    if (S === "ender") {
      h = !0;
      continue;
    }
    if (S.startsWith("ls:") || S.startsWith("letterspacing:")) {
      const _ = M.indexOf(":");
      if (_ >= 0) {
        const T = Ue(M.slice(_ + 1));
        T !== null && (o = _t(T));
      }
      continue;
    }
    if (S.startsWith("lh:") || S.startsWith("lineheight:")) {
      const _ = M.indexOf(":");
      if (_ >= 0) {
        const T = Mt(M.slice(_ + 1));
        T !== null && (f = It(T));
      }
      continue;
    }
  }
  const c = Math.max(0, Math.min(1, r)), p = (a ?? t.defaultColor).toUpperCase(), g = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: i,
    size: s,
    sizeScale: ft[s],
    font: n,
    fontFamily: pt[n],
    fontWeight: gt[n],
    resolvedColor: p,
    colorOverride: a,
    opacityMultiplier: c,
    opacityOverride: g,
    isInvisible: u,
    isFull: d,
    isEnder: h,
    letterSpacing: o,
    lineHeight: f
  };
}, Ft = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, U = (e) => e.length === 1 ? e.repeat(2) : e, w = (e) => Number.parseInt(e, 16), A = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, se = (e, t) => {
  const i = Ft.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, r, l = 1;
  s.length === 3 || s.length === 4 ? (n = w(U(s[0])), a = w(U(s[1])), r = w(U(s[2])), s.length === 4 && (l = w(U(s[3])) / 255)) : (n = w(s.slice(0, 2)), a = w(s.slice(2, 4)), r = w(s.slice(4, 6)), s.length === 8 && (l = w(s.slice(6, 8)) / 255));
  const u = A(l * A(t));
  return `rgba(${n}, ${a}, ${r}, ${u})`;
}, wt = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), Be = () => wt(), L = (e) => e * 1e3, xt = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), ne = 6e3, pe = 2700, Ot = 3, At = 0.35, Rt = 48, Nt = 48, Y = 0, Pt = 6e3, J = 120, Dt = 800, Ht = 2, z = 6e3, x = 3e3, m = x + ne, Vt = 240, kt = 1800, ge = 1, Ge = 12, E = 1e-3, N = 50, zt = 2300, ve = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, Wt = (e, t, i) => {
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
}, $e = (e, t = {}) => {
  const { level: i = "info", emitter: s = Wt } = t, n = ve[i], a = (r, l) => {
    ve[r] < n || s(r, e, l);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, ae = $e("CommentEngine:Comment"), Se = /* @__PURE__ */ new WeakMap(), Xt = (e) => {
  let t = Se.get(e);
  return t || (t = /* @__PURE__ */ new Map(), Se.set(e, t)), t;
}, re = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = Xt(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(s, r), r;
}, Ye = 768, Ut = 0.1, oe = (e) => Ut * (Math.max(1, e) / Ye), Bt = {
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
}, Gt = ({
  canvasHeight: e,
  size: t,
  lineCount: i,
  isEnder: s,
  lineHeightMultiplier: n
}) => {
  const a = Math.max(1, e), r = Math.max(1, Math.floor(i)), l = Bt[t], u = !s && r >= l.resizeAtLineCount, d = u ? l.resized : l.normal, h = a / Ye, o = Math.max(1, d.fontSize * h), f = Math.abs(n - 1) > Number.EPSILON, c = f ? Math.max(1, o * n) : Math.max(1, d.lineAdvance * h), p = o + (r - 1) * c, g = (d.blockHeight + (r - 1) * d.lineAdvance) * h, C = f ? p : Math.max(1, g - oe(a));
  return { fontSize: o, lineAdvance: c, textHeight: p, slotHeight: C, wasResizedForLineCount: u };
}, q = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, H = 665, $t = "  ", Yt = 1252 / 597.38330078125, k = [
  366 / H,
  510 / H,
  1662 / H
], qt = 566 / H, Kt = 806 / 665, jt = 808 / 665, Ce = 1176 / 665, ye = 900 / 665, Jt = 1126 / 665, Me = 810 / 665, Zt = 1126 / 665, _e = 1046 / 665, Ie = 1254 / 665, Qt = 1140 / 665, ei = 878 / 665, ti = 0.25, ii = 160, si = 420, ni = 80, ai = 0.18, ri = 400, oi = 0.2, li = 420, hi = 250, ci = 1.8, ui = 420, di = 20, fi = 0.045, pi = 850 / 1182, gi = (e) => Math.max(0.01, e / H), O = (e, t) => e * gi(t), vi = (e) => e.replaceAll("	", $t), qe = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g, Si = (e) => {
  const t = vi(e);
  if (t.includes(`
`)) {
    const i = t.split(/\r?\n/);
    return i.length > 0 ? i : [""];
  }
  return [t];
}, Ci = (e, t) => {
  if (e.fontSize >= 35)
    return Math.round(t * qt);
  const i = e.text.split(/\r?\n/), s = Math.max(0, ...i.map((a) => a.length));
  return e.isEnder && s >= 25 || Math.max(0, ...i.map((a) => (a.match(/\t/g) || []).length)) >= 12 || e.width >= 1200 ? Math.round(t * k[2]) : e.width >= 300 ? Math.round(t * k[1]) : Math.round(t * k[0]);
}, yi = (e, t) => Math.min(
  O(si, t),
  Math.max(
    O(ii, t),
    e * ti
  )
), Mi = (e, t) => {
  const i = O(
    ri,
    t
  );
  return Math.min(
    O(li, t),
    O(ni, t) + e.width * ai + Math.max(0, e.width - i) * oi
  );
}, _i = (e, t) => Math.min(
  O(ui, t),
  Math.max(
    0,
    e.width - O(hi, t)
  ) * ci
), Ii = (e, t) => {
  if (e.isFull)
    return e.width;
  const i = Math.max(e.sizeScale, 1), n = e.width / i, a = t * pi;
  return Math.min(n, a);
}, Ei = (e) => e.lines.filter((t) => t.replace(qe, "").length > 0).length, Ee = (e) => e.lines.length > 1 && Ei(e) === 1, Ti = (e) => e.lines.map((t) => t.replace(qe, "")).filter((t) => t.length > 0), Te = (e) => {
  if (e.lines.length <= 1)
    return !1;
  const t = Ti(e);
  return t.length === 1 && /^[●○◉◎]+$/u.test(t[0]);
}, B = (e) => e.size === "big" || e.fontSize >= 35, Li = (e, t, i = Math.max(1, e.fontSize * e.lineHeightMultiplier)) => {
  let s = 0;
  const n = e.letterSpacing;
  for (const r of e.lines) {
    const l = re(t, r), u = r.length > 1 ? n * (r.length - 1) : 0, d = Math.max(0, l + u);
    d > s && (s = d);
  }
  e.width = s, e.lineHeightPx = Math.max(1, i);
  const a = e.lines.length > 1 ? (e.lines.length - 1) * e.lineHeightPx : 0;
  e.height = e.fontSize + a;
}, bi = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1);
    e.lines = Si(e.text);
    const r = Gt({
      canvasHeight: s,
      size: e.size,
      lineCount: e.lines.length,
      isEnder: e.isEnder,
      lineHeightMultiplier: e.lineHeightMultiplier
    });
    if (e.fontSize = r.fontSize, e.slotHeight = r.slotHeight, t.font = q(e), Li(e, t, r.lineAdvance), e.isScrolling && e.isFull) {
      const b = e.lines.length > 1 && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("游明朝"));
      if (b && e.hasSameVposFullMinchoEnder && !e.isEnder && B(e))
        e.width = Math.round(
          s * (Te(e) ? _e : Zt)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Me)
        );
      else if (b && e.hasSameVposFullMinchoEnder && e.isEnder && B(e))
        e.width = Math.round(
          s * (Ee(e) ? Ie : Ce)
        ), e.height = Math.max(
          e.height,
          Math.round(s * ye)
        );
      else if (b && e.hasSameVposFullMinchoEnder && e.isEnder)
        e.width = Math.round(
          s * (Ee(e) ? Ie : Qt)
        ), e.height = Math.max(
          e.height,
          Math.round(s * ei)
        );
      else if (b && B(e))
        e.width = Math.round(
          s * (Te(e) ? _e : Ce)
        ), e.height = Math.max(
          e.height,
          Math.round(s * ye)
        );
      else if (b)
        e.width = Math.round(s * Jt), e.height = Math.max(
          e.height,
          Math.round(s * Me)
        );
      else {
        const D = B(e) ? jt : Kt;
        e.width = Ci(e, s), e.height = Math.max(e.height, Math.round(s * D));
      }
      e.slotHeight = Math.max(e.slotHeight, e.height);
    }
    if (!e.isScrolling) {
      const b = a + e.fontSize * 2.6666666666666665;
      e.width >= b * 0.95 && e.fontSize >= 35 ? e.width = Math.round(s * Yt) : e.width = Math.min(e.width, b), e.bufferWidth = 0;
      const D = (a - e.width) / 2;
      e.virtualStartX = D, e.x = D, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = x, e.preCollisionDurationMs = x, e.totalDurationMs = x, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + x, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const l = re(t, "??".repeat(150)), u = e.width, d = u * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, d);
    const h = Math.max(n.entryBufferPx, e.bufferWidth), o = e.scrollDirection, f = Math.min(1, s / H), c = e.isFull ? n.virtualExtension * f : n.virtualExtension, p = e.isFull ? yi(e.width, s) : 0, g = e.isFull ? O(di, s) + e.width * fi : 0, C = e.isFull ? 0 : Mi(e, s), M = e.isFull ? 0 : _i(e, s), S = o === "rtl" ? a + c + p + C : -u - e.bufferWidth - c - p - C, _ = o === "rtl" ? -u - e.bufferWidth - h + p - C - M : a + h - p + C + M, T = o === "rtl" ? a + h : -h;
    e.virtualStartX = S, e.x = S, e.exitThreshold = _;
    const P = a > 0 ? u / a : 0, V = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let K = n.maxVisibleDurationMs;
    if (!V && P > 1 && !e.isFull) {
      const b = Math.min(P, n.maxWidthRatio), D = n.maxVisibleDurationMs / Math.max(b, 1);
      K = Math.max(n.minVisibleDurationMs, Math.floor(D));
    }
    const rt = a + u + e.bufferWidth + h + c + g + C * 2 + M, ot = Math.max(K, 1), j = rt / ot, lt = j * 1e3 / 60;
    e.baseSpeed = lt, e.speed = e.baseSpeed, e.speedPixelsPerMs = j;
    const ht = Math.abs(_ - S), de = o === "rtl" ? S + u + e.bufferWidth : S - e.bufferWidth, ct = o === "rtl" ? Math.max(0, de - T) : Math.max(0, T - de), fe = Math.max(j, Number.EPSILON);
    e.visibleDurationMs = K, e.preCollisionDurationMs = Math.max(0, Math.ceil(ct / fe)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(ht / fe)
    );
    const ut = u + e.bufferWidth + h, dt = Ii(e, a);
    e.reservationWidth = Math.min(
      l,
      Math.max(ut, dt)
    ), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw ae.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: i,
      canvasHeight: s,
      hasContext: !!t
    }), a;
  }
}, Q = 5, F = {
  enabled: !1,
  maxLogsPerCategory: Q
}, W = /* @__PURE__ */ new Map(), mi = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return Q;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, Fi = (e) => {
  F.enabled = !!e.enabled, F.maxLogsPerCategory = mi(e.maxLogsPerCategory), F.enabled || W.clear();
}, Ea = () => {
  W.clear();
}, R = () => F.enabled, wi = (e) => {
  const t = W.get(e) ?? 0;
  return t >= F.maxLogsPerCategory ? (t === F.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), W.set(e, t + 1)), !1) : (W.set(e, t + 1), !0);
}, y = (e, ...t) => {
  F.enabled && wi(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, X = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, xi = (e, t) => {
  F.enabled && (console.group(`[CommentOverlay][state-dump] ${e}`), console.table({
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
}, Oi = (e, t, i) => {
  F.enabled && y("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
}, Le = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, Ke = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), Ai = (e) => {
  if (typeof e.getTransform != "function")
    return;
  const t = e.getTransform();
  return [t.a, t.b, t.c, t.d, t.e, t.f];
}, Ri = (e) => {
  const t = e.canvas;
  return t ? {
    canvasWidth: t.width,
    canvasHeight: t.height
  } : {};
}, Ni = (e) => e ? {
  ...e.no !== void 0 ? { no: e.no } : {},
  ...e.fork !== void 0 ? { fork: e.fork } : {},
  ...e.source !== void 0 ? { source: e.source } : {},
  ...e.threadId !== void 0 ? { threadId: e.threadId } : {},
  ...e.date !== void 0 ? { date: e.date } : {},
  ...e.userIdHash !== void 0 ? { userIdHash: e.userIdHash } : {}
} : {}, je = (e) => ({
  text: e.text,
  vposMs: e.vposMs,
  ...Ni(e.meta),
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
}), ee = (e, t, i, s) => {
  const n = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof n != "function" || n({
    source: "comment-overlay",
    op: e,
    timestampMs: Ke(),
    font: t.font,
    fillStyle: Le(t.fillStyle),
    strokeStyle: Le(t.strokeStyle),
    lineWidth: t.lineWidth,
    lineJoin: t.lineJoin,
    globalAlpha: t.globalAlpha,
    shadowColor: t.shadowColor,
    shadowBlur: t.shadowBlur,
    shadowOffsetX: t.shadowOffsetX,
    shadowOffsetY: t.shadowOffsetY,
    transform: Ai(t),
    ...Ri(t),
    comment: je(i),
    ...s
  });
}, Pi = (e, t, i) => {
  const s = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof s != "function" || s({
    source: "comment-overlay",
    op: e,
    timestampMs: Ke(),
    comment: je(t),
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
}, be = () => {
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
}, Di = () => typeof OffscreenCanvas < "u", le = (e, t, i) => {
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
  }[e], a = Math.max(2, t * s), r = A(i * n);
  return { blur: a, alpha: r };
}, he = () => 2.8, Je = 665, Hi = 566, te = 808, me = Hi / Je, Fe = te / Je, Vi = 1098, ki = 1530, we = 20.9, xe = 58.9, Oe = 45.23908523908523 / 39, zi = 14.9, Wi = 41.9, Xi = 28.92708257149126 / 27, Ae = 20, Re = 11.4, Ne = 31.4, Pe = 23.87692307692307, Ui = 2.4, Z = 2, De = 66.9, He = 55.6, Bi = 59, Gi = 810, $i = 21.5, Ze = 878, Qe = 900, Yi = 10, qi = 6.75, Ki = 16.75, ji = 12.11423203055002, Ji = 0.5, Zi = 1.42, Qi = 0.12, es = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const i = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!i)
    return !1;
  const s = i[1], n = s.length === 3 || s.length === 4, a = (d) => d.length === 1 ? `${d}${d}` : d, r = Number.parseInt(a(n ? s[0] : s.slice(0, 2)), 16), l = Number.parseInt(a(n ? s[1] : s.slice(2, 4)), 16), u = Number.parseInt(a(n ? s[2] : s.slice(4, 6)), 16);
  return r === 0 && l === 0 && u === 0;
}, ce = (e) => es(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", ts = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, is = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const i = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + i;
}, et = (e) => {
  if (e.isScrolling && e.isFull) {
    if (e.hasSameVposFullMinchoEnder) {
      const u = Math.ceil(e.height);
      return {
        paddingX: Math.max(10, e.fontSize * 0.5),
        paddingY: u >= Qe ? De : u >= Ze ? He : $i,
        textureWidth: Math.ceil(e.width),
        textureHeight: u
      };
    }
    const l = e.hasSameVposFullMinchoEnder && e.isEnder ? e.fontSize >= 35 ? De : He : null;
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: l ?? (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + Ui,
      textureWidth: Math.ceil(e.width),
      textureHeight: Math.ceil(e.height)
    };
  }
  if (e.isScrolling && e.lines.length > 1) {
    const l = e.fontSize * 0.5555555555555556, u = e.fontSize * 0.5;
    return {
      paddingX: l,
      paddingY: u,
      textureWidth: Math.ceil(e.width + l * 2),
      textureHeight: Math.ceil(e.height + e.fontSize * 1.25)
    };
  }
  if (!e.isScrolling) {
    const u = Math.ceil(
      e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
    );
    return {
      paddingX: 0,
      paddingY: Math.max(0, (u - e.height) / 2),
      textureWidth: Math.ceil(e.width + 0),
      textureHeight: u
    };
  }
  const i = e.isScrolling ? e.fontSize * (5 / 9) : Math.max(10, e.fontSize * 0.5), s = e.fontSize, n = e.isScrolling ? Math.round(s * (20 / 9)) : e.height + e.fontSize / 3, a = Math.ceil(
    Math.max(e.height + Math.max(10, e.fontSize), n)
  ), r = e.isScrolling ? e.fontSize * 0.5 : Math.max(0, (a - e.height) / 2);
  return {
    paddingX: i,
    paddingY: r,
    textureWidth: Math.ceil(e.width + i * 2),
    textureHeight: a
  };
}, ss = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35 ? 0.8 : 1, tt = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, it = (e) => tt(e) && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("YuMincho") || e.fontFamily.includes("游明朝")), ns = (e, t) => it(e) ? Zi : t, as = (e) => Math.max(1, e.width + e.virtualStartX * 2), rs = (e) => e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder ? Bi * Math.min(1, e.height / Gi) : 0, os = (e, t, i, s, n) => {
  const a = ns(e, n);
  if (it(e))
    return {
      x: as(e) * Qi,
      scaleX: a,
      scaleY: n
    };
  const r = !e.isScrolling && a !== 1 ? t.width * (1 - a) * Ji : 0;
  return {
    x: i - s + r + rs(e),
    scaleX: a,
    scaleY: n
  };
}, ue = (e, t, i, s, n) => (a, r, l, u = 0) => {
  if (a.length === 0)
    return;
  const d = n + u, h = () => {
    s === "cache" ? l === "outline" ? v.outlineCallsInCache++ : v.fillCallsInCache++ : l === "outline" ? v.outlineCallsInFallback++ : v.fillCallsInFallback++;
  }, o = (c, p, g) => {
    if (h(), l === "outline") {
      t.strokeText(c, p, r), ee("strokeText", t, e, {
        text: c,
        x: p,
        y: r,
        meta: { statsTarget: s, mode: l, ...g }
      });
      return;
    }
    t.fillText(c, p, r), ee("fillText", t, e, {
      text: c,
      x: p,
      y: r,
      meta: { statsTarget: s, mode: l, ...g }
    });
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    o(a, d);
    return;
  }
  let f = d;
  for (let c = 0; c < a.length; c += 1) {
    const p = a[c];
    o(p, f, { characterIndex: c });
    const g = re(i, p);
    f += g, c < a.length - 1 && (f += e.letterSpacing);
  }
}, ls = (e) => `v8::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.width}::${e.height}::${e.lines.length}`, Ve = (e, t, i) => {
  const s = new OffscreenCanvas(i.width, i.height), n = s.getContext("2d");
  if (!n)
    return null;
  n.save(), n.font = i.sourceFont ? q(e) : ts(e, i.fontSize);
  const a = A(e.opacity), r = se(e.color, a), l = e.renderStyle === "outline-only", u = l ? { blur: 0, alpha: 0 } : le(e.shadowIntensity, i.fontSize, a);
  n.shadowColor = `rgba(0, 0, 0, ${u.alpha})`, n.shadowBlur = u.blur, n.shadowOffsetX = 0, n.shadowOffsetY = 0, n.lineJoin = "round", n.lineWidth = he(), n.strokeStyle = ce(e), n.fillStyle = r, typeof i.canvasScale == "number" && n.scale(i.canvasScale, i.canvasScale);
  const d = e.lines.length > 0 ? e.lines : [e.text], h = ue(e, n, t, "cache", i.paddingX);
  return l && d.forEach((o, f) => {
    h(o, i.baselineY + f * i.lineHeight, "outline");
  }), d.forEach((o, f) => {
    h(o, i.baselineY + f * i.lineHeight, "fill");
  }), n.restore(), s;
}, hs = (e, t, i) => {
  for (const s of i.traces ?? [])
    Ve(e, t, s);
  return Ve(e, t, i.output);
}, cs = (e, t, i) => {
  if (e.isScrolling && e.isFull && e.fontSize >= 35 && Math.abs(
    t - e.height * (me / Fe)
  ) <= 2 && Math.abs(
    i - t * (Fe / me)
  ) <= 3) {
    const n = i / te;
    return {
      traces: [
        {
          width: Math.round(Vi * n),
          height: Math.round(ki * n),
          fontSize: e.fontSize,
          paddingX: we * n,
          baselineY: xe * n,
          lineHeight: e.fontSize * Oe,
          sourceFont: !0
        }
      ],
      output: {
        width: t,
        height: i,
        fontSize: Ae * n,
        paddingX: Re * n,
        baselineY: Ne * n,
        lineHeight: Pe * n
      }
    };
  }
  if (e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder) {
    if (i <= Ze - 1) {
      const n = i / te;
      return {
        output: {
          width: t,
          height: i,
          fontSize: Ae * n,
          paddingX: Re * n,
          baselineY: Ne * n,
          lineHeight: Pe * n,
          canvasScale: Z
        }
      };
    }
    return i < Qe ? {
      output: {
        width: t,
        height: i,
        fontSize: e.fontSize,
        paddingX: zi,
        baselineY: Wi,
        lineHeight: e.fontSize * Xi,
        canvasScale: Z,
        sourceFont: !0
      }
    } : {
      output: {
        width: t,
        height: i,
        fontSize: e.fontSize,
        paddingX: we,
        baselineY: xe,
        lineHeight: e.fontSize * Oe,
        canvasScale: Z,
        sourceFont: !0
      }
    };
  }
  return tt(e) ? {
    output: {
      width: t,
      height: i,
      fontSize: Yi,
      paddingX: qi,
      baselineY: Ki,
      lineHeight: ji
    }
  } : null;
}, us = (e, t) => {
  if (!Di())
    return null;
  const i = Math.abs(e.letterSpacing) >= Number.EPSILON, s = e.lines.length > 1;
  i && v.letterSpacingComments++, s && v.multiLineComments++, !i && !s && v.normalComments++, v.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: l } = et(e), u = cs(e, r, l);
  if (u)
    return hs(e, t, u);
  const d = new OffscreenCanvas(r, l), h = d.getContext("2d");
  if (!h)
    return null;
  h.save(), h.font = q(e);
  const o = A(e.opacity), f = n, c = e.lines.length > 0 ? e.lines : [e.text], p = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, g = is(e, a), C = ue(e, h, t, "cache", f), M = se(e.color, o), S = e.renderStyle === "outline-only", _ = S ? { blur: 0, alpha: 0 } : le(e.shadowIntensity, e.fontSize, o);
  return R() && console.log(
    "[Shadow Debug - Cache]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${_.blur}px`,
    `
  Shadow alpha: ${_.alpha}`,
    `
  Fill style: ${M}`
  ), h.save(), h.shadowColor = `rgba(0, 0, 0, ${_.alpha})`, h.shadowBlur = _.blur, h.shadowOffsetX = 0, h.shadowOffsetY = 0, h.lineJoin = "round", h.lineWidth = he(), h.strokeStyle = ce(e), h.fillStyle = M, S && c.forEach((T, P) => {
    const V = g + P * p;
    C(T, V, "outline");
  }), c.forEach((T, P) => {
    const V = g + P * p;
    C(T, V, "fill");
  }), h.restore(), h.restore(), d;
}, ds = (e, t, i) => {
  v.fallbacks++, t.save(), t.font = q(e);
  const s = A(e.opacity), n = i ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, l = e.y + e.fontSize, u = ue(e, t, t, "fallback", n), d = se(e.color, s), h = e.renderStyle === "outline-only", o = h ? { blur: 0, alpha: 0 } : le(e.shadowIntensity, e.fontSize, s);
  R() && console.log(
    "[Shadow Debug - Fallback]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${o.blur}px`,
    `
  Shadow alpha: ${o.alpha}`,
    `
  Fill style: ${d}`
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${o.alpha})`, t.shadowBlur = o.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = he(), t.strokeStyle = ce(e), t.fillStyle = d, h && a.forEach((f, c) => {
    const p = l + c * r;
    u(f, p, "outline");
  }), a.forEach((f, c) => {
    const p = l + c * r;
    u(f, p, "fill");
  }), t.restore(), t.restore();
}, fs = (e, t, i) => {
  try {
    if (!e.isActive || !t)
      return;
    const s = ls(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== s || !n) {
      v.misses++, v.creates++;
      const r = us(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(s);
    } else
      v.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = i ?? e.x, { paddingX: l, paddingY: u } = et(e), d = ss(e), h = os(e, a, r, l, d), o = h.x, f = e.y - u;
      h.scaleX === 1 && h.scaleY === 1 ? t.drawImage(a, o, f) : t.drawImage(
        a,
        o,
        f,
        a.width * h.scaleX,
        a.height * h.scaleY
      ), ee("drawImage", t, e, {
        x: o,
        y: f,
        width: a.width * h.scaleX,
        height: a.height * h.scaleY,
        sourceWidth: a.width,
        sourceHeight: a.height,
        meta: {
          statsTarget: "cache",
          paddingX: l,
          paddingY: u,
          drawScale: d,
          drawScaleX: h.scaleX,
          drawScaleY: h.scaleY
        }
      }), be();
      return;
    }
    ds(e, t, i), be();
  } catch (s) {
    ae.error("Comment.draw", s, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: i
    });
  }
}, ps = (e) => e === "ltr" ? "ltr" : "rtl", gs = (e) => e === "ltr" ? 1 : -1;
class vs {
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
  hasSameVposFullMinchoEnder = !1;
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
  lines = [];
  epochId = 0;
  directionSign = -1;
  timeSource;
  lastSyncedSettingsVersion = -1;
  cachedTexture = null;
  textureCacheKey = "";
  constructor(t, i, s, n, a = {}, r = null) {
    if (typeof t != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(i) || i < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = t, this.vposMs = i, this.commands = Array.isArray(s) ? [...s] : [], this.meta = r ? { ...r } : null;
    const l = mt(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = l.layout, this.isScrolling = this.layout === "naka", this.size = l.size, this.sizeScale = l.sizeScale, this.opacityMultiplier = l.opacityMultiplier, this.opacityOverride = l.opacityOverride, this.colorOverride = l.colorOverride, this.isInvisible = l.isInvisible, this.isFull = l.isFull, this.isEnder = l.isEnder, this.fontFamily = l.fontFamily, this.fontWeight = l.fontWeight, this.color = l.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = l.letterSpacing, this.lineHeightMultiplier = l.lineHeight, this.timeSource = a.timeSource ?? Be(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, i, s, n) {
    bi(this, t, i, s, n);
  }
  draw(t, i = null) {
    fs(this, t, i);
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
      ae.error("Comment.update", s, {
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
      return A(this.opacityOverride);
    const i = t * this.opacityMultiplier;
    return Number.isFinite(i) ? A(i) : 0;
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
    const i = ps(t);
    this.scrollDirection = i, this.directionSign = gs(i);
  }
}
const Ss = 6700, $ = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: Ss,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, Ta = $, Cs = () => ({
  ...$,
  ngWords: [...$.ngWords],
  ngRegexps: [...$.ngRegexps]
}), La = "v4.1.0", ys = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, G = (e) => {
  const t = e.scrollVisibleDurationMs, i = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: ys(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: i,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, Ms = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(Number(t))
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, _s = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Is = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, ke = (e) => e.isScrolling && e.isFull && e.text.includes(`
`) && e.commands.some((t) => t.toLowerCase() === "mincho"), Es = (e) => {
  const t = /* @__PURE__ */ new Set();
  e.forEach((i) => {
    i.isEnder && ke(i) && t.add(i.vposMs);
  }), e.forEach((i) => {
    i.hasSameVposFullMinchoEnder = t.has(i.vposMs) && ke(i);
  });
}, ze = (e) => {
  const t = e.meta?.no;
  return typeof t == "number" && Number.isFinite(t) ? t : null;
}, Ts = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const i of e) {
    const { text: s, vposMs: n, commands: a = [], meta: r = null } = i, l = X(s);
    if (this.isNGComment(s)) {
      y("comment-skip-ng", { preview: l, vposMs: n });
      continue;
    }
    const u = xt(n);
    if (u === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), y("comment-skip-invalid-vpos", { preview: l, vposMs: n });
      continue;
    }
    const d = r?.no !== void 0 ? `no:${r.source ?? ""}:${r.fork ?? ""}:${r.threadId ?? ""}:${r.no}` : `fallback:${s}\0${u}`, h = (c) => c.meta?.no !== void 0 ? `no:${c.meta.source ?? ""}:${c.meta.fork ?? ""}:${c.meta.threadId ?? ""}:${c.meta.no}` : `fallback:${c.text}\0${c.vposMs}`;
    if (this.comments.some((c) => h(c) === d) || t.some((c) => h(c) === d)) {
      y("comment-skip-duplicate", { preview: l, vposMs: u });
      continue;
    }
    const f = new vs(
      s,
      u,
      a,
      this._settings,
      this.commentDependencies,
      r
    );
    f.creationIndex = this.commentSequence++, f.epochId = this.epochId, t.push(f), y("comment-added", {
      preview: l,
      vposMs: u,
      commands: f.commands.length,
      layout: f.layout,
      isScrolling: f.isScrolling,
      invisible: f.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), Es(this.comments), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    if (Math.abs(n) > E)
      return n;
    const a = ze(i), r = ze(s);
    return a !== null && r !== null && Math.abs(a - r) > E ? a - r : i.creationIndex - s.creationIndex;
  }), t);
}, Ls = function(e, t, i = [], s = null) {
  const [n] = this.addComments([{ text: e, vposMs: t, commands: i, meta: s }]);
  return n ?? null;
}, bs = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, i);
  }
}, ms = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, st = function() {
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
}, Fs = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, ws = (e) => {
  e.prototype.addComments = Ts, e.prototype.addComment = Ls, e.prototype.clearComments = bs, e.prototype.resetState = ms, e.prototype.rebuildNgMatchers = st, e.prototype.isNGComment = Fs;
}, xs = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, Os = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, Oi(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, As = function(e) {
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
  if (xi(e, i), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(i);
    } catch (s) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
    }
  this.lastSnapshotEmitTime = t;
}, Rs = function(e) {
  this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  return t !== void 0 ? t : nt(e);
}, nt = (e) => {
  if (!e.isScrolling)
    return e.vposMs;
  const t = e.isFull ? zt : kt;
  return Math.max(0, e.vposMs - t);
}, Ns = function(e) {
  if (!e.isScrolling)
    return x;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : ne;
}, Ps = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), nt(e);
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const i = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, i), i;
}, Ds = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + z, i = Math.max(e + z, t), s = this.comments.filter((d) => d.hasShown || d.isInvisible || this.isNGComment(d.text) ? !1 : d.vposMs >= e - m).sort((d, h) => {
    const o = d.vposMs - h.vposMs;
    return Math.abs(o) > E ? o : d.creationIndex - h.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(i - e, z) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : J, l = Math.max(J, Math.min(r, Dt));
  let u = e;
  s.forEach((d, h) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(d)), f = i - o;
    let c = Math.max(e, Math.min(u, f));
    Number.isFinite(c) || (c = e);
    const p = Ht * h;
    c + p <= f && (c += p), this.finalPhaseVposOverrides.set(d, c);
    const g = Math.max(J, Math.min(o / 2, l));
    u = c + g;
  }), this.finalPhaseScheduleDirty = !1;
}, Hs = (e) => {
  e.prototype.resetFinalPhaseState = xs, e.prototype.incrementEpoch = Os, e.prototype.emitStateSnapshot = As, e.prototype.getEffectiveCommentVpos = Rs, e.prototype.getFinalPhaseDisplayDuration = Ns, e.prototype.resolveFinalPhaseVpos = Ps, e.prototype.recomputeFinalPhaseTimeline = Ds;
}, Vs = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= N;
}, ks = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > N) && (this.playbackHasBegun = !0);
}, zs = (e) => {
  e.prototype.shouldSuppressRendering = Vs, e.prototype.updatePlaybackProgressState = ks;
}, Ws = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(r), d = this.duration > 0 && this.duration - this.currentTime <= Pt;
  d && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, l), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !d && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const o of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(o), c = f < this.currentTime - m, p = f > this.currentTime + m;
    if (c || p) {
      o.isActive = !1, this.activeComments.delete(o), o.clearActivation(), o.lane >= 0 && (o.layout === "ue" ? this.releaseStaticLane("ue", o.lane) : o.layout === "shita" && this.releaseStaticLane("shita", o.lane));
      continue;
    }
    o.isScrolling && o.hasShown && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
  }
  const h = this.getCommentsInTimeWindow(this.currentTime, m);
  for (const o of h) {
    const f = R(), c = f ? X(o.text) : "";
    if (f && y("comment-evaluate", {
      stage: "update",
      preview: c,
      vposMs: o.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(o),
      currentTime: this.currentTime,
      isActive: o.isActive,
      hasShown: o.hasShown
    }), this.isNGComment(o.text)) {
      f && y("comment-eval-skip", {
        preview: c,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "ng-runtime"
      });
      continue;
    }
    if (o.isInvisible) {
      f && y("comment-eval-skip", {
        preview: c,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "invisible"
      }), o.isActive = !1, this.activeComments.delete(o), o.hasShown = !0, o.clearActivation();
      continue;
    }
    if (o.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(o, this.currentTime, c) && this.activateComment(
      o,
      s,
      r,
      l,
      u,
      this.currentTime
    ), o.isActive) {
      if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
        continue;
      }
      if (o.layout === "naka" && this.getEffectiveCommentVpos(o) > this.currentTime + N) {
        o.x = o.virtualStartX, o.lastUpdateTime = this.timeSource.now();
        continue;
      }
      if (o.hasShown = !0, o.update(this.playbackRate, !this.isPlaying), !o.isScrolling && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
      }
    }
  }
}, Xs = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = ne, s = pe;
  return t !== null && (i = t, s = Math.max(1, Math.min(t, pe))), {
    visibleWidth: e,
    virtualExtension: Vt,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: Ot,
    bufferRatio: At,
    baseBufferPx: Rt,
    entryBufferPx: Nt
  };
}, Us = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.createLaneReservation(e, t), s = [...this.reservedLanes.values()].flat().filter((f) => this.areReservationsConflicting(f, i)).sort((f, c) => f.verticalStart - c.verticalStart), n = Math.max(1, e.slotHeight || e.height), a = Math.max(1, this.displayHeight || this.canvas?.height || n), r = this._settings.useFixedLaneCount ? Math.min(a, Math.max(n, this.laneCount * this.laneHeight)) : a, l = oe(a), u = [], d = [];
  let h = 0, o = !1;
  for (; ; ) {
    u.push(h);
    const f = h + n, c = s.find(
      (p) => !(p.verticalEnd < h || f < p.verticalStart)
    );
    if (!c)
      break;
    if (d.push(
      `${c.comment.creationIndex}@${c.comment.vposMs}:${c.verticalStart.toFixed(3)}-${c.verticalEnd.toFixed(3)}`
    ), h = c.verticalEnd + l, h + n >= r) {
      o = !0, h = Math.random() * (r - n);
      break;
    }
  }
  return i.verticalStart = h, i.verticalEnd = h + n, this.storeLaneReservation(h, i), Pi("laneDecision", e, {
    meta: {
      currentTimeMs: t,
      selectedLane: h,
      selectedTop: h,
      selectedBottom: h + n,
      slotHeight: n,
      usedFallback: o,
      candidateLanes: u.map((f) => f.toFixed(3)).join(","),
      availableLanes: h.toFixed(3),
      nextAvailableTimes: "",
      blockedBy: d.join(","),
      reservationStartTimeMs: Math.round(i.startTime),
      reservationEndTimeMs: Math.round(i.endTime),
      reservationTotalEndTimeMs: Math.round(i.totalEndTime),
      reservationWidth: Math.round(i.width)
    }
  }), h;
}, Bs = (e) => {
  e.prototype.updateComments = Ws, e.prototype.buildPrepareOptions = Xs, e.prototype.findAvailableLane = Us;
}, Gs = function(e, t) {
  let i = 0, s = e.length;
  for (; i < s; ) {
    const n = Math.floor((i + s) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + Y <= t ? i = n + 1 : s = n;
  }
  return i;
}, $s = function(e) {
  for (const [t, i] of this.reservedLanes.entries()) {
    const s = this.findFirstValidReservationIndex(i, e);
    s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
  }
}, Ys = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
}, qs = (e) => {
  e.prototype.findFirstValidReservationIndex = Gs, e.prototype.pruneLaneReservations = $s, e.prototype.pruneStaticLaneReservations = Ys;
}, Ks = function(e) {
  let t = 0, i = this.comments.length;
  for (; t < i; ) {
    const s = Math.floor((t + i) / 2), n = this.comments[s];
    n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
  }
  return t;
}, js = function(e, t) {
  if (this.comments.length === 0)
    return [];
  const i = e - t, s = e + t, n = this.findCommentIndexAtOrAfter(i), a = [];
  for (let r = n; r < this.comments.length; r++) {
    const l = this.comments[r];
    if (l) {
      if (l.vposMs > s)
        break;
      a.push(l);
    }
  }
  return a;
}, Js = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, Zs = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, Qs = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, en = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, tn = function(e, t, i, s) {
  const n = Math.max(1, i), a = Math.max(1, s.slotHeight || s.height), r = oe(n);
  if (e === "ue") {
    let o = 0;
    const c = this.getStaticReservations(e).filter((p) => p.lane < t).sort((p, g) => p.lane - g.lane);
    for (const p of c) {
      const g = p.yEnd - p.yStart;
      o += g + r;
    }
    return o;
  }
  let l = n;
  const d = this.getStaticReservations(e).filter((o) => o.lane < t).sort((o, f) => o.lane - f.lane);
  for (const o of d) {
    const f = o.yEnd - o.yStart;
    l -= f + r;
  }
  const h = l - a;
  return Math.max(0, h);
}, sn = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, nn = (e) => {
  e.prototype.findCommentIndexAtOrAfter = Ks, e.prototype.getCommentsInTimeWindow = js, e.prototype.getStaticReservations = Js, e.prototype.getStaticLaneDepth = Zs, e.prototype.getStaticLaneLimit = Qs, e.prototype.getGlobalLaneIndexForBottom = en, e.prototype.resolveStaticCommentOffset = tn, e.prototype.getStaticReservedLaneSet = sn;
}, an = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, at = (e) => Math.max(
  1,
  an(e) ? e.fontSize * 0.46 : e.slotHeight || e.height
), rn = function(e, t, i = "") {
  const s = i.length > 0 && R(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - E ? (s && y("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "final-phase-trimmed",
    finalPhaseStartTime: this.finalPhaseStartTime
  }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (s && y("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "invisible"
  }), !1) : e.isActive ? (s && y("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-active"
  }), !1) : e.hasShown && n <= t ? (s && y("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-shown",
    currentTime: t
  }), !1) : n > t + N ? (s && y("comment-eval-pending", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "future",
    currentTime: t
  }), !1) : n < t - m ? (s && y("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "expired-window",
    currentTime: t
  }), !1) : !e.isScrolling && n + x <= t ? (s && y("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "static-expired",
    currentTime: t
  }), !1) : (s && y("comment-eval-ready", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    currentTime: t
  }), !0);
}, on = function(e, t, i, s, n, a) {
  e.prepare(t, i, s, n);
  const r = this.resolveFinalPhaseVpos(e);
  if (R() && y("comment-prepared", {
    preview: X(e.text),
    layout: e.layout,
    isScrolling: e.isScrolling,
    width: e.width,
    height: e.height,
    bufferWidth: e.bufferWidth,
    visibleDurationMs: e.visibleDurationMs,
    effectiveVposMs: r
  }), e.layout === "naka") {
    const l = Math.max(0, a - r), u = e.speedPixelsPerMs * l;
    if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
      const f = this.duration > 0 ? this.duration : this.finalPhaseStartTime + z, c = Math.max(
        this.finalPhaseStartTime + z,
        f
      ), p = e.width + i, g = p > 0 ? p / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + g > c) {
        const M = c - a, S = Math.max(0, M) * e.speedPixelsPerMs, _ = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - u, i - S) : Math.min(e.virtualStartX + u, S - e.width);
        e.x = _;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    const d = this.findAvailableLane(e), h = Math.max(1, this.laneHeight);
    e.lane = Math.max(0, Math.round(d / h));
    const o = Math.max(0, s - e.height);
    e.y = e.isFull ? 0 : Math.max(0, Math.min(d, o));
  } else {
    const l = e.layout === "ue" ? "ue" : "shita", u = this.assignStaticLane(l, e, s, a), d = this.resolveStaticCommentOffset(
      l,
      u,
      s,
      e
    );
    e.x = e.virtualStartX, e.y = d, e.lane = l === "ue" ? u : this.getGlobalLaneIndexForBottom(u), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0;
    const h = r + x;
    e.visibleDurationMs = Math.max(0, h - a), this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = h, this.reserveStaticLane(l, e, u, h), R() && y("comment-activate-static", {
      preview: X(e.text),
      lane: e.lane,
      position: l,
      displayEnd: h,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, ln = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = at(t), r = Math.max(1, a), l = Math.max(
    this.laneCount,
    Math.ceil(Math.max(1, i) / r) + n.length + 1
  ), u = Array.from({ length: l }, (o, f) => f);
  for (const o of u) {
    const f = this.resolveStaticCommentOffset(e, o, i, t), c = f, p = f + a;
    if (!n.some((C) => C.releaseTime > s ? !(p <= C.yStart || c >= C.yEnd) : !1))
      return o;
  }
  let d = u[0] ?? 0, h = Number.POSITIVE_INFINITY;
  for (const o of n)
    o.releaseTime < h && (h = o.releaseTime, d = o.lane);
  return d;
}, hn = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = t.y, r = t.y + at(t);
  n.push({
    comment: t,
    releaseTime: s,
    yStart: a,
    yEnd: r,
    lane: i
  });
}, cn = function(e, t) {
  if (t < 0)
    return;
  const i = this.getStaticReservations(e), s = i.findIndex((n) => n.lane === t);
  s >= 0 && i.splice(s, 1);
}, un = (e) => {
  e.prototype.shouldActivateCommentAtTime = rn, e.prototype.activateComment = on, e.prototype.assignStaticLane = ln, e.prototype.reserveStaticLane = hn, e.prototype.releaseStaticLane = cn;
}, dn = 1e-3, fn = function() {
  return Array.from({ length: this.laneCount }, (e, t) => t);
}, pn = function(e, t) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return t;
  const s = this.findFirstValidReservationIndex(i, t), n = i[s];
  return n ? Math.max(t, n.endTime + Y) : t;
}, gn = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, E), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = Number.isFinite(e.width) && e.width > 0 ? e.width : e.reservationWidth, l = i > 0 ? Math.max(r, 0) / i : e.preCollisionDurationMs, u = a + l + Y, d = a + e.totalDurationMs + Y;
  return {
    comment: e,
    startTime: a,
    endTime: Math.max(a, u),
    totalEndTime: Math.max(a, d),
    startLeft: e.virtualStartX,
    width: r,
    speed: i,
    buffer: 0,
    directionSign: e.getDirectionSign(),
    verticalStart: 0,
    verticalEnd: Math.max(1, e.slotHeight || e.height)
  };
}, vn = function(e, t, i) {
  const s = Math.max(1, t.verticalEnd - t.verticalStart);
  return t.verticalStart = e, t.verticalEnd = e + s, [...this.reservedLanes.values()].flat().every((n) => n.totalEndTime <= i ? !0 : n.verticalEnd < t.verticalStart || t.verticalEnd < n.verticalStart || !this.areReservationsConflicting(n, t));
}, Sn = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, Cn = function(e, t) {
  if (e.directionSign === t.directionSign) {
    const l = e.speed > 0 ? Math.max(e.width, 0) / e.speed : 0, u = t.speed > 0 ? Math.max(t.width, 0) / t.speed : 0, d = Math.max(l, u);
    return Math.abs(t.startTime - e.startTime) + dn < d;
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
  const r = this.solveLeftRightEqualityTime(t, e);
  r !== null && r >= i - E && r <= s + E && n.add(r);
  for (const l of n) {
    if (l < i - E || l > s + E)
      continue;
    const u = this.computeForwardGap(e, t, l), d = this.computeForwardGap(t, e, l);
    if (u <= -24 && d <= -24)
      return !0;
  }
  return !1;
}, yn = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, Mn = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, _n = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < E)
    return null;
  const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, In = (e) => {
  e.prototype.getLanePriorityOrder = fn, e.prototype.getLaneNextAvailableTime = pn, e.prototype.createLaneReservation = gn, e.prototype.isLaneAvailable = vn, e.prototype.storeLaneReservation = Sn, e.prototype.areReservationsConflicting = Cn, e.prototype.computeForwardGap = yn, e.prototype.getBufferedEdges = Mn, e.prototype.solveLeftRightEqualityTime = _n;
}, En = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i, a = this.timeSource.now();
  if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering() || this.isStalled) {
    t.clearRect(0, 0, s, n), this.lastDrawTime = a;
    return;
  }
  t.clearRect(0, 0, s, n);
  const r = Array.from(this.activeComments);
  if (this._settings.isCommentVisible) {
    const l = (a - this.lastDrawTime) / 16.666666666666668;
    r.sort((u, d) => {
      const h = this.getEffectiveCommentVpos(u), o = this.getEffectiveCommentVpos(d), f = h - o;
      return Math.abs(f) > E ? f : u.isScrolling !== d.isScrolling ? u.isScrolling ? 1 : -1 : u.creationIndex - d.creationIndex;
    }), r.forEach((u) => {
      const h = this.isPlaying && !u.isPaused ? u.x + u.getDirectionSign() * u.speed * l : u.x;
      u.draw(t, h);
    });
  }
  this.lastDrawTime = a;
}, Tn = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(r);
  this.activeComments.forEach((h) => {
    h.isActive = !1, h.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.getCommentsInTimeWindow(this.currentTime, m).forEach((h) => {
    if (this.isNGComment(h.text) || h.isInvisible) {
      h.isActive = !1, this.activeComments.delete(h), h.clearActivation();
      return;
    }
    if (h.syncWithSettings(this._settings, this.settingsVersion), h.isActive = !1, this.activeComments.delete(h), h.lane = -1, h.hasShown = !1, h.clearActivation(), this.shouldActivateCommentAtTime(h, this.currentTime)) {
      this.activateComment(
        h,
        s,
        r,
        l,
        u,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(h) < this.currentTime - m ? h.hasShown = !0 : h.hasShown = !1;
  });
}, Ln = (e) => {
  e.prototype.draw = En, e.prototype.performInitialSync = Tn;
}, bn = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, mn = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, Fn = function(e, t) {
  this.videoFrameHandle = null;
  const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
}, wn = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, xn = function() {
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
}, On = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, An = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, Rn = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, Nn = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, Pn = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  if (!e || !t || !i)
    return;
  const s = L(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
  if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
    this.currentTime = s, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
    return;
  }
  const l = n > N;
  if (this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !l) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const u = this.canvasDpr > 0 ? this.canvasDpr : 1, d = this.displayWidth > 0 ? this.displayWidth : e.width / u, h = this.displayHeight > 0 ? this.displayHeight : e.height / u, o = this.buildPrepareOptions(d);
  this.getCommentsInTimeWindow(this.currentTime, m).forEach((c) => {
    const p = R(), g = p ? X(c.text) : "";
    if (p && y("comment-evaluate", {
      stage: "seek",
      preview: g,
      vposMs: c.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(c),
      currentTime: this.currentTime,
      isActive: c.isActive,
      hasShown: c.hasShown
    }), this.isNGComment(c.text)) {
      p && y("comment-eval-skip", {
        preview: g,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "ng-runtime"
      }), c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
      return;
    }
    if (c.isInvisible) {
      p && y("comment-eval-skip", {
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
        d,
        h,
        o,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(c) < this.currentTime - m ? c.hasShown = !0 : c.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Dn = (e) => {
  e.prototype.processFrame = bn, e.prototype.handleAnimationFrame = mn, e.prototype.handleVideoFrame = Fn, e.prototype.shouldUseVideoFrameCallback = wn, e.prototype.scheduleNextFrame = xn, e.prototype.cancelAnimationFrameRequest = On, e.prototype.cancelVideoFrameCallback = An, e.prototype.startAnimation = Rn, e.prototype.stopAnimation = Nn, e.prototype.onSeek = Pn;
}, Hn = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, Vn = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, kn = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, i = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(i ?? null, t);
    this.videoElement = t, this.containerElement = s, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? L(t.duration) : 0, this.currentTime = L(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > N, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.right = "0", n.style.bottom = "0", n.style.display = "block", n.style.pointerEvents = "none", n.style.zIndex = "2147483647";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, zn = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Wn = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, Xn = (e) => {
  e.prototype.resolveContainer = Hn, e.prototype.ensureContainerPositioning = Vn, e.prototype.initialize = kn, e.prototype.destroy = zn, e.prototype.destroyCanvasOnly = Wn;
}, Un = function(e) {
  try {
    const t = () => {
      this.isPlaying = !0, this.playbackHasBegun = !0;
      const f = this.timeSource.now();
      this.lastDrawTime = f, this.lastPlayResumeTime = f, this.comments.forEach((c) => {
        c.lastUpdateTime = f, c.isPaused = !1;
      });
    }, i = () => {
      this.isPlaying = !1;
      const f = this.timeSource.now();
      this.comments.forEach((c) => {
        c.lastUpdateTime = f, c.isPaused = !0;
      });
    }, s = () => {
      this.onSeek();
    }, n = () => {
      this.onSeek();
    }, a = () => {
      this.playbackRate = e.playbackRate;
      const f = this.timeSource.now();
      this.comments.forEach((c) => {
        c.lastUpdateTime = f;
      });
    }, r = () => {
      this.handleVideoMetadataLoaded(e);
    }, l = () => {
      this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0;
    }, u = () => {
      this.handleVideoSourceChange();
    }, d = () => {
      this.handleVideoStalled();
    }, h = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", l), e.addEventListener("emptied", u), e.addEventListener("waiting", d), e.addEventListener("canplay", h), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", u)), this.addCleanup(() => e.removeEventListener("waiting", d)), this.addCleanup(() => e.removeEventListener("canplay", h)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, Bn = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, Gn = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
  t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, $n = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = L(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, Yn = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, qn = function(e) {
  this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0, this.currentTime = L(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > N, this.lastDrawTime = this.timeSource.now();
}, Kn = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > N, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, jn = function(e, t) {
  if (typeof MutationObserver > "u") {
    this.log.debug(
      "MutationObserver is not available in this environment. Video change detection is disabled."
    );
    return;
  }
  const i = new MutationObserver((n) => {
    for (const a of n) {
      if (a.type === "attributes" && a.attributeName === "src") {
        const r = a.target;
        let l = null, u = null;
        if ((r instanceof HTMLVideoElement || r instanceof HTMLSourceElement) && (l = typeof a.oldValue == "string" ? a.oldValue : null, u = r.getAttribute("src")), l === u)
          continue;
        this.handleVideoSourceChange(e);
        return;
      }
      if (a.type === "childList") {
        for (const r of a.addedNodes)
          if (r instanceof HTMLSourceElement) {
            this.handleVideoSourceChange(e);
            return;
          }
        for (const r of a.removedNodes)
          if (r instanceof HTMLSourceElement) {
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
        for (const r of a.addedNodes) {
          const l = this.extractVideoElement(r);
          if (l && l !== this.videoElement) {
            this.initialize(l);
            return;
          }
        }
        for (const r of a.removedNodes) {
          if (r === this.videoElement) {
            this.videoElement = null, this.handleVideoSourceChange(null);
            return;
          }
          if (r instanceof Element) {
            const l = r.querySelector("video");
            if (l && l === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
          }
        }
      }
  });
  s.observe(t, { childList: !0, subtree: !0 }), this.addCleanup(() => s.disconnect());
}, Jn = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, Zn = (e) => {
  e.prototype.setupVideoEventListeners = Un, e.prototype.handleVideoMetadataLoaded = Bn, e.prototype.handleVideoStalled = Gn, e.prototype.handleVideoCanPlay = $n, e.prototype.handleVideoSourceChange = Yn, e.prototype.syncVideoState = qn, e.prototype.resetCommentActivity = Kn, e.prototype.setupVideoChangeDetection = jn, e.prototype.extractVideoElement = Jn;
}, Qn = function() {
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
}, ea = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  !e || !t || !i || (this.currentTime = L(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, ta = function(e) {
  const t = this._settings.isCommentVisible;
  if (this._settings.isCommentVisible = e, t === e)
    return;
  this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion;
  const i = this.canvas, s = this.ctx;
  if (!(!i || !s))
    if (e)
      this.lastDrawTime = this.timeSource.now(), this.pendingInitialSync = !0, this.scheduleNextFrame();
    else {
      const n = this.canvasDpr > 0 ? this.canvasDpr : 1, a = this.displayWidth > 0 ? this.displayWidth : i.width / n, r = this.displayHeight > 0 ? this.displayHeight : i.height / n;
      s.clearRect(0, 0, a, r);
    }
}, ia = (e) => {
  e.prototype.setupVisibilityHandling = Qn, e.prototype.handleVisibilityRestore = ea, e.prototype.setCommentVisibility = ta;
}, sa = 768, na = 68.1645984649658, aa = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const r = (this.fullscreenActive && s.parentElement instanceof HTMLElement ? s.parentElement.getBoundingClientRect() : null) ?? i.getBoundingClientRect(), l = this.canvasDpr > 0 ? this.canvasDpr : 1, u = this.displayWidth > 0 ? this.displayWidth : s.width / l, d = this.displayHeight > 0 ? this.displayHeight : s.height / l, h = e ?? r.width ?? u, o = t ?? r.height ?? d;
  if (!Number.isFinite(h) || !Number.isFinite(o) || h <= 0 || o <= 0)
    return;
  const f = Math.max(1, Math.floor(h)), c = Math.max(1, Math.floor(o)), p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, g = Math.max(1, Math.round(f * p)), C = Math.max(1, Math.round(c * p));
  (this.displayWidth !== f || this.displayHeight !== c || Math.abs(this.canvasDpr - p) > Number.EPSILON || s.width !== g || s.height !== C) && (this.displayWidth = f, this.displayHeight = c, this.canvasDpr = p, s.width = g, s.height = C, s.style.width = `${f}px`, s.style.height = `${c}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p)), this.calculateLaneMetrics(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.performInitialSync(L(i.currentTime)), this.draw());
}, ra = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, oa = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1);
  this.laneHeight = t * (na / sa);
  const i = Math.max(this.laneHeight, 1), n = Math.floor(Math.max(0, t - i) / i);
  if (this._settings.useFixedLaneCount) {
    const a = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : Ge, r = Math.max(ge, Math.min(n, a));
    this.laneCount = r;
  } else
    this.laneCount = Math.max(ge, n);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, la = function(e) {
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
    const n = this.resolveResizeObserverTarget(e), a = new ResizeObserver((r) => {
      for (const l of r) {
        const { width: u, height: d } = l.contentRect;
        u > 0 && d > 0 ? this.resize(u, d) : this.resize();
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
}, ha = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, ca = (e) => {
  e.prototype.resize = aa, e.prototype.resolveDevicePixelRatio = ra, e.prototype.calculateLaneMetrics = oa, e.prototype.setupResizeHandling = la, e.prototype.cleanupResizeHandling = ha;
}, ua = function() {
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
}, We = (e) => {
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
}, da = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, fa = async function() {
  const e = this.canvas, t = this.videoElement;
  if (!e || !t)
    return;
  const i = this.containerElement ?? t.parentElement ?? null, s = this.getFullscreenElement(), n = this.resolveActiveOverlayContainer(t, i, s);
  if (!(n instanceof HTMLElement))
    return;
  e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
  const a = s instanceof HTMLElement && s.contains(t) ? s : null, r = a !== null;
  if (this.fullscreenActive !== r && (this.fullscreenActive = r, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", e.style.right = "0", e.style.bottom = "0", e.style.display = "block", e.style.pointerEvents = "none", e.style.zIndex = "2147483647", a) {
    const l = a.getBoundingClientRect();
    this.resize(l.width, l.height), We(this);
    return;
  }
  this.resize(), We(this);
}, pa = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, ga = function(e, t, i) {
  return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
}, va = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, Sa = (e) => {
  e.prototype.setupFullscreenHandling = ua, e.prototype.resolveResizeObserverTarget = da, e.prototype.handleFullscreenChange = fa, e.prototype.resolveFullscreenContainer = pa, e.prototype.resolveActiveOverlayContainer = ga, e.prototype.getFullscreenElement = va;
}, Ca = function(e) {
  this.cleanupTasks.push(e);
}, ya = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, Ma = (e) => {
  e.prototype.addCleanup = Ca, e.prototype.runCleanupTasks = ya;
};
class I {
  _settings;
  comments = [];
  activeComments = /* @__PURE__ */ new Set();
  reservedLanes = /* @__PURE__ */ new Map();
  topStaticLaneReservations = [];
  bottomStaticLaneReservations = [];
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
  laneCount = Ge;
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
  finalPhaseActive = !1;
  finalPhaseStartTime = null;
  finalPhaseScheduleDirty = !1;
  playbackHasBegun = !1;
  skipDrawingForCurrentFrame = !1;
  pendingInitialSync = !1;
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
    st.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (Is(t))
      s = G({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = G(Cs());
    }
    this._settings = G(s), this.timeSource = n.timeSource ?? Be(), this.animationFrameProvider = n.animationFrameProvider ?? Ms(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? _s(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = $e(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && Fi(n.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(t) {
    this._settings = G(t), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
ws(I);
Hs(I);
zs(I);
Bs(I);
qs(I);
nn(I);
un(I);
In(I);
Ln(I);
Dn(I);
Xn(I);
Zn(I);
ia(I);
ca(I);
Sa(I);
Ma(I);
const _a = (e) => ({
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
}), Ia = (e) => {
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
}, ba = (e, t, i = {}) => {
  const s = [], n = globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__, a = globalThis.__COMMENT_OVERLAY_TRACE__;
  if (i.collectTrace === !0) {
    const r = i.traceOps && i.traceOps.length > 0 ? new Set(i.traceOps) : null;
    globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = !0, globalThis.__COMMENT_OVERLAY_TRACE__ = ((l) => {
      r && !r.has(l.op) || s.push(l);
    });
  }
  try {
    e.processFrame(t);
  } finally {
    i.collectTrace === !0 && (globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = n, globalThis.__COMMENT_OVERLAY_TRACE__ = a);
  }
  return {
    frameTimeMs: t,
    canvas: Ia(e),
    activeComments: Array.from(e.activeComments, _a),
    records: s
  };
};
export {
  La as COMMENT_OVERLAY_VERSION,
  vs as Comment,
  I as CommentRenderer,
  Ta as DEFAULT_RENDERER_SETTINGS,
  ba as captureRendererCalibrationFrame,
  Cs as cloneDefaultSettings,
  Fi as configureDebugLogging,
  Ms as createDefaultAnimationFrameProvider,
  Be as createDefaultTimeSource,
  $e as createLogger,
  y as debugLog,
  xi as dumpRendererState,
  R as isDebugLoggingEnabled,
  Oi as logEpochChange,
  Ea as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
