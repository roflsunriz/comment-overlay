const Ge = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, Ye = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"游明朝体","游明朝","Yu Mincho",YuMincho,yumincho,YuMin-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic'
}, $e = {
  defont: "600",
  gothic: "",
  mincho: ""
}, Le = {
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
}, te = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, qe = /^[,.:;]+/, Ke = /[,.:;]+$/, je = (e) => {
  const t = e.trim();
  return t ? te.test(t) ? t : t.replace(qe, "").replace(Ke, "") : "";
}, Ze = (e) => te.test(e) ? e.toUpperCase() : null, me = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const i = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, s = Number.parseFloat(i);
  return Number.isFinite(s) ? s : null;
}, Je = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return me(t);
}, Qe = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, et = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), tt = (e) => e === "naka" || e === "ue" || e === "shita", it = (e) => e === "small" || e === "medium" || e === "big", st = (e) => e === "defont" || e === "gothic" || e === "mincho", nt = (e) => e in Le, at = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, r = 1, l = null, d = !1, u = !1, c = !1, o = 0, f = 1;
  for (const I of e) {
    const C = je(typeof I == "string" ? I : "");
    if (!C)
      continue;
    if (te.test(C)) {
      const v = Ze(C);
      if (v) {
        a = v;
        continue;
      }
    }
    const S = C.toLowerCase();
    if (tt(S)) {
      i = S;
      continue;
    }
    if (it(S)) {
      s = S;
      continue;
    }
    if (st(S)) {
      n = S;
      continue;
    }
    if (nt(S)) {
      a = Le[S].toUpperCase();
      continue;
    }
    if (S === "_live") {
      l = 0.5;
      continue;
    }
    if (S === "invisible") {
      r = 0, d = !0;
      continue;
    }
    if (S === "full") {
      u = !0;
      continue;
    }
    if (S === "ender") {
      c = !0;
      continue;
    }
    if (S.startsWith("ls:") || S.startsWith("letterspacing:")) {
      const v = C.indexOf(":");
      if (v >= 0) {
        const T = me(C.slice(v + 1));
        T !== null && (o = Qe(T));
      }
      continue;
    }
    if (S.startsWith("lh:") || S.startsWith("lineheight:")) {
      const v = C.indexOf(":");
      if (v >= 0) {
        const T = Je(C.slice(v + 1));
        T !== null && (f = et(T));
      }
      continue;
    }
  }
  const h = Math.max(0, Math.min(1, r)), p = (a ?? t.defaultColor).toUpperCase(), g = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: i,
    size: s,
    sizeScale: Ge[s],
    font: n,
    fontFamily: Ye[n],
    fontWeight: $e[n],
    resolvedColor: p,
    colorOverride: a,
    opacityMultiplier: h,
    opacityOverride: g,
    isInvisible: d,
    isFull: u,
    isEnder: c,
    letterSpacing: o,
    lineHeight: f
  };
}, rt = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, z = (e) => e.length === 1 ? e.repeat(2) : e, w = (e) => Number.parseInt(e, 16), P = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, ie = (e, t) => {
  const i = rt.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, r, l = 1;
  s.length === 3 || s.length === 4 ? (n = w(z(s[0])), a = w(z(s[1])), r = w(z(s[2])), s.length === 4 && (l = w(z(s[3])) / 255)) : (n = w(s.slice(0, 2)), a = w(s.slice(2, 4)), r = w(s.slice(4, 6)), s.length === 8 && (l = w(s.slice(6, 8)) / 255));
  const d = P(l * P(t));
  return `rgba(${n}, ${a}, ${r}, ${d})`;
}, ot = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), xe = () => ot(), m = (e) => e * 1e3, lt = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), se = 6e3, ue = 2700, ht = 3, ct = 0.25, ut = 32, dt = 48, G = 120, ft = 6e3, K = 120, pt = 800, gt = 2, H = 6e3, O = 3e3, x = O + se, vt = 240, St = 2e3, de = 1, Fe = 12, we = 24, b = 1e-3, R = 50, yt = 2400, fe = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, Ct = (e, t, i) => {
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
}, Oe = (e, t = {}) => {
  const { level: i = "info", emitter: s = Ct } = t, n = fe[i], a = (r, l) => {
    fe[r] < n || s(r, e, l);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, ne = Oe("CommentEngine:Comment"), pe = /* @__PURE__ */ new WeakMap(), Mt = (e) => {
  let t = pe.get(e);
  return t || (t = /* @__PURE__ */ new Map(), pe.set(e, t)), t;
}, ae = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = Mt(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(s, r), r;
}, Y = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, It = 27 / 665, _t = 12, Tt = "  ", Et = 1252 / 597.38330078125, V = [366, 510, 1662], bt = 566, Lt = 806 / 665, mt = 808 / 665, ge = 1176 / 665, xt = 900 / 665, Ft = 1126 / 665, wt = 810 / 665, Ot = 1126 / 665, Pt = 1046 / 665, Pe = 1254 / 665, At = 1140 / 665, j = 1, Rt = 0.25, Nt = 160, Dt = 420, Vt = 80, Ht = 0.18, kt = 400, Wt = 0.2, zt = 420, Xt = 250, Bt = 1.8, Ut = 420, Gt = 20, Yt = 0.045, $t = (e) => e.replaceAll("	", Tt), qt = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g, Kt = (e) => {
  const t = $t(e);
  if (t.includes(`
`)) {
    const i = t.split(/\r?\n/);
    return i.length > 0 ? i : [""];
  }
  return [t];
}, ve = (e, t = _t) => Math.max(t, e), jt = (e) => {
  if (e.fontSize >= 35)
    return bt;
  const t = e.text.split(/\r?\n/), i = Math.max(0, ...t.map((n) => n.length));
  return e.isEnder && i >= 25 || Math.max(0, ...t.map((n) => (n.match(/\t/g) || []).length)) >= 12 || e.width >= 1200 ? V[2] : e.width >= 300 ? V[1] : V[0];
}, Zt = (e) => Math.min(
  Dt,
  Math.max(Nt, e * Rt)
), Jt = (e, t) => e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder ? Math.round(t * Pe) : e.width, Qt = (e) => Math.min(
  zt,
  Vt + e.width * Ht + Math.max(0, e.width - kt) * Wt
), ei = (e) => Math.min(
  Ut,
  Math.max(0, e.width - Xt) * Bt
), ti = (e) => e.lines.filter((t) => t.replace(qt, "").length > 0).length, Se = (e) => e.lines.length > 1 && ti(e) === 1, X = (e) => e.size === "big" || e.fontSize >= 35, ii = (e, t) => {
  let i = 0;
  const s = e.letterSpacing;
  for (const r of e.lines) {
    const l = ae(t, r), d = r.length > 1 ? s * (r.length - 1) : 0, u = Math.max(0, l + d);
    u > i && (i = u);
  }
  e.width = i;
  const n = Math.max(
    1,
    Math.floor(e.fontSize * e.lineHeightMultiplier)
  );
  e.lineHeightPx = n;
  const a = e.lines.length > 1 ? (e.lines.length - 1) * n : 0;
  e.height = e.fontSize + a;
}, si = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1), r = ve(Math.floor(s * It)), l = ve(Math.floor(r * e.sizeScale));
    if (e.fontSize = l, t.font = Y(e), e.lines = Kt(e.text), ii(e, t), e.isScrolling && e.isFull) {
      const L = e.lines.length > 1 && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("游明朝"));
      if (L && e.hasSameVposFullMinchoEnder && !e.isEnder && X(e))
        e.width = Math.round(
          s * (Se(e) ? Pt : Ot)
        ), e.height = Math.max(
          e.height,
          Math.round(s * j)
        );
      else if (L && e.hasSameVposFullMinchoEnder && e.isEnder && X(e))
        e.width = Math.round(
          s * (Se(e) ? Pe : ge)
        ), e.height = Math.max(
          e.height,
          Math.round(s * j)
        );
      else if (L && e.hasSameVposFullMinchoEnder && e.isEnder)
        e.width = Math.round(s * At), e.height = Math.max(
          e.height,
          Math.round(s * j)
        );
      else if (L && X(e))
        e.width = Math.round(s * ge), e.height = Math.max(
          e.height,
          Math.round(s * xt)
        );
      else if (L)
        e.width = Math.round(s * Ft), e.height = Math.max(
          e.height,
          Math.round(s * wt)
        );
      else {
        const N = X(e) ? mt : Lt;
        e.width = jt(e), e.height = Math.max(e.height, Math.round(s * N));
      }
    }
    if (!e.isScrolling) {
      const L = a + r * 2.6666666666666665;
      e.width >= L * 0.95 && e.fontSize >= 35 ? e.width = Math.round(s * Et) : e.width = Math.min(e.width, L), e.bufferWidth = 0;
      const N = (a - e.width) / 2;
      e.virtualStartX = N, e.x = N, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = O, e.preCollisionDurationMs = O, e.totalDurationMs = O, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + O, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const d = ae(t, "??".repeat(150)), u = Jt(e, s), c = u * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, c);
    const o = Math.max(n.entryBufferPx, e.bufferWidth), f = e.scrollDirection, h = e.isFull ? Zt(u) : 0, p = e.isFull ? Gt + u * Yt : 0, g = e.isFull ? 0 : Qt(e), I = e.isFull ? 0 : ei(e), C = f === "rtl" ? a + n.virtualExtension + h + g : -e.width - e.bufferWidth - n.virtualExtension - h - g, S = f === "rtl" ? -e.width - e.bufferWidth - o + h - g - I : a + o - h + g + I, v = f === "rtl" ? a + o : -o, T = f === "rtl" ? C + e.width + e.bufferWidth : C - e.bufferWidth;
    e.virtualStartX = C, e.x = C, e.exitThreshold = S;
    const M = a > 0 ? e.width / a : 0, D = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let $ = n.maxVisibleDurationMs;
    if (!D && M > 1 && !e.isFull) {
      const L = Math.min(M, n.maxWidthRatio), N = n.maxVisibleDurationMs / Math.max(L, 1);
      $ = Math.max(n.minVisibleDurationMs, Math.floor(N));
    }
    const ke = a + u + e.bufferWidth + o + n.virtualExtension + p + g * 2 + I, We = Math.max($, 1), q = ke / We, ze = q * 1e3 / 60;
    e.baseSpeed = ze, e.speed = e.baseSpeed, e.speedPixelsPerMs = q;
    const Xe = Math.abs(S - C), Be = f === "rtl" ? Math.max(0, T - v) : Math.max(0, v - T), ce = Math.max(q, Number.EPSILON);
    e.visibleDurationMs = $, e.preCollisionDurationMs = Math.max(0, Math.ceil(Be / ce)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(Xe / ce)
    );
    const Ue = e.width + e.bufferWidth + o;
    e.reservationWidth = Math.min(d, Ue), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw ne.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: i,
      canvasHeight: s,
      hasContext: !!t
    }), a;
  }
}, Z = 5, F = {
  enabled: !1,
  maxLogsPerCategory: Z
}, k = /* @__PURE__ */ new Map(), ni = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return Z;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, ai = (e) => {
  F.enabled = !!e.enabled, F.maxLogsPerCategory = ni(e.maxLogsPerCategory), F.enabled || k.clear();
}, sa = () => {
  k.clear();
}, A = () => F.enabled, ri = (e) => {
  const t = k.get(e) ?? 0;
  return t >= F.maxLogsPerCategory ? (t === F.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), k.set(e, t + 1)), !1) : (k.set(e, t + 1), !0);
}, _ = (e, ...t) => {
  F.enabled && ri(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, W = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, oi = (e, t) => {
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
}, li = (e, t, i) => {
  F.enabled && _("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
}, ye = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, hi = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), ci = (e) => {
  if (typeof e.getTransform != "function")
    return;
  const t = e.getTransform();
  return [t.a, t.b, t.c, t.d, t.e, t.f];
}, ui = (e) => {
  const t = e.canvas;
  return t ? {
    canvasWidth: t.width,
    canvasHeight: t.height
  } : {};
}, di = (e) => ({
  text: e.text,
  vposMs: e.vposMs,
  layout: e.layout,
  lane: e.lane,
  fontSize: e.fontSize,
  width: e.width,
  height: e.height,
  color: e.color,
  opacity: e.opacity,
  creationIndex: e.creationIndex
}), J = (e, t, i, s) => {
  const n = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof n != "function" || n({
    source: "comment-overlay",
    op: e,
    timestampMs: hi(),
    font: t.font,
    fillStyle: ye(t.fillStyle),
    strokeStyle: ye(t.strokeStyle),
    lineWidth: t.lineWidth,
    lineJoin: t.lineJoin,
    globalAlpha: t.globalAlpha,
    shadowColor: t.shadowColor,
    shadowBlur: t.shadowBlur,
    shadowOffsetX: t.shadowOffsetX,
    shadowOffsetY: t.shadowOffsetY,
    transform: ci(t),
    ...ui(t),
    comment: di(i),
    ...s
  });
}, y = {
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
}, Ce = () => {
  if (!A())
    return;
  const e = performance.now();
  if (e - y.lastReported <= 5e3)
    return;
  const t = y.hits + y.misses, i = t > 0 ? y.hits / t * 100 : 0, s = y.creates > 0 ? (y.totalCharactersDrawn / y.creates).toFixed(1) : "0", n = y.outlineCallsInCache + y.outlineCallsInFallback, a = y.fillCallsInCache + y.fillCallsInFallback;
  console.log(
    "[TextureCache Stats]",
    `
  Cache: Hits=${y.hits}, Misses=${y.misses}, Hit Rate=${i.toFixed(1)}%`,
    `
  Creates: ${y.creates}, Fallbacks: ${y.fallbacks}`,
    `
  Comments: Normal=${y.normalComments}, LetterSpacing=${y.letterSpacingComments}, MultiLine=${y.multiLineComments}`,
    `
  Draw Calls: Outline=${n}, Fill=${a}`,
    `
  Avg Characters/Comment: ${s}`
  ), y.lastReported = e;
}, fi = () => typeof OffscreenCanvas < "u", re = (e, t, i) => {
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
  }[e], a = Math.max(2, t * s), r = P(i * n);
  return { blur: a, alpha: r };
}, oe = () => 2.8, Me = 566, Ie = 808, pi = 1098, gi = 1530, vi = 20.9, Si = 58.9, yi = 45.23908523908523 / 39, Ci = 20, _e = 11.4, Q = 31.4, ee = 23.87692307692307, Mi = 2.4, Ii = 20, Te = 2, _i = 66.9, Ti = 55.6, Ei = 46, bi = 0.4, Li = 10, mi = 6.75, xi = 16.75, Fi = 12.11423203055002, wi = 0.5, Oi = 1.42, Pi = 0.12, Ai = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const i = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!i)
    return !1;
  const s = i[1], n = s.length === 3 || s.length === 4, a = (u) => u.length === 1 ? `${u}${u}` : u, r = Number.parseInt(a(n ? s[0] : s.slice(0, 2)), 16), l = Number.parseInt(a(n ? s[1] : s.slice(2, 4)), 16), d = Number.parseInt(a(n ? s[2] : s.slice(4, 6)), 16);
  return r === 0 && l === 0 && d === 0;
}, le = (e) => Ai(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", Ri = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, Ni = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const i = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + i;
}, Ae = (e) => {
  if (e.isScrolling && e.isFull) {
    if (e.hasSameVposFullMinchoEnder)
      return {
        paddingX: Math.max(10, e.fontSize * 0.5),
        paddingY: 0,
        textureWidth: Math.ceil(e.width),
        textureHeight: Math.ceil(e.height)
      };
    const r = e.hasSameVposFullMinchoEnder && e.isEnder ? e.fontSize >= 35 ? _i : Ti : null;
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: r ?? (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + Mi,
      textureWidth: Math.ceil(e.width),
      textureHeight: Math.ceil(e.height)
    };
  }
  if (e.isScrolling && e.lines.length > 1) {
    const r = e.fontSize * 1.3333333333333333, l = e.fontSize;
    return {
      paddingX: r,
      paddingY: l,
      textureWidth: Math.ceil(e.width + r * 2),
      textureHeight: Math.ceil(e.height + e.fontSize * 6.1)
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
  const i = e.isScrolling ? e.fontSize * 1.15 : Math.max(10, e.fontSize * 0.5), s = e.isScrolling ? Math.round(e.fontSize * (40 / 9)) : e.height + e.fontSize / 3, n = Math.ceil(
    Math.max(e.height + Math.max(10, e.fontSize), s)
  ), a = e.isScrolling ? e.fontSize : Math.max(0, (n - e.height) / 2);
  return {
    paddingX: i,
    paddingY: a,
    textureWidth: Math.ceil(
      e.isScrolling ? e.width * 2 + i * 2 : e.width + i * 2
    ),
    textureHeight: n
  };
}, Di = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35 ? 0.8 : 1, Re = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, Ne = (e) => Re(e) && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("YuMincho") || e.fontFamily.includes("游明朝")), Vi = (e, t) => Ne(e) ? Oi : t, Hi = (e) => Math.max(1, e.width + e.virtualStartX * 2), ki = (e) => e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder ? Ei : 0, Wi = (e, t, i, s, n) => {
  const a = Vi(e, n);
  if (Ne(e))
    return {
      x: Hi(e) * Pi,
      scaleX: a,
      scaleY: n
    };
  const r = !e.isScrolling && a !== 1 ? t.width * (1 - a) * wi : 0;
  return {
    x: i - s + r + ki(e),
    scaleX: a,
    scaleY: n
  };
}, he = (e, t, i, s, n) => (a, r, l, d = 0) => {
  if (a.length === 0)
    return;
  const u = n + d, c = () => {
    s === "cache" ? l === "outline" ? y.outlineCallsInCache++ : y.fillCallsInCache++ : l === "outline" ? y.outlineCallsInFallback++ : y.fillCallsInFallback++;
  }, o = (h, p, g) => {
    if (c(), l === "outline") {
      t.strokeText(h, p, r), J("strokeText", t, e, {
        text: h,
        x: p,
        y: r,
        meta: { statsTarget: s, mode: l, ...g }
      });
      return;
    }
    t.fillText(h, p, r), J("fillText", t, e, {
      text: h,
      x: p,
      y: r,
      meta: { statsTarget: s, mode: l, ...g }
    });
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    o(a, u);
    return;
  }
  let f = u;
  for (let h = 0; h < a.length; h += 1) {
    const p = a[h];
    o(p, f, { characterIndex: h });
    const g = ae(i, p);
    f += g, h < a.length - 1 && (f += e.letterSpacing);
  }
}, zi = (e) => `v6::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.lines.length}`, Xi = (e, t, i) => {
  const s = Math.max(1, e.lines.length);
  if (s <= 1)
    return ee;
  const n = t / i;
  return Math.max(
    ee,
    n - Q - bi
  ) / (s - 1);
}, Bi = (e) => Math.min(Ii, Math.max(1, e * 0.95)), Ee = (e, t, i) => {
  const s = new OffscreenCanvas(i.width, i.height), n = s.getContext("2d");
  if (!n)
    return null;
  n.save(), n.font = i.sourceFont ? Y(e) : Ri(e, i.fontSize);
  const a = P(e.opacity), r = ie(e.color, a), l = e.renderStyle === "outline-only", d = l ? { blur: 0, alpha: 0 } : re(e.shadowIntensity, i.fontSize, a);
  n.shadowColor = `rgba(0, 0, 0, ${d.alpha})`, n.shadowBlur = d.blur, n.shadowOffsetX = 0, n.shadowOffsetY = 0, n.lineJoin = "round", n.lineWidth = oe(), n.strokeStyle = le(e), n.fillStyle = r, typeof i.canvasScale == "number" && n.scale(i.canvasScale, i.canvasScale);
  const u = e.lines.length > 0 ? e.lines : [e.text], c = he(e, n, t, "cache", i.paddingX);
  return l && u.forEach((o, f) => {
    c(o, i.baselineY + f * i.lineHeight, "outline");
  }), u.forEach((o, f) => {
    c(o, i.baselineY + f * i.lineHeight, "fill");
  }), n.restore(), s;
}, Ui = (e, t, i) => {
  for (const s of i.traces ?? [])
    Ee(e, t, s);
  return Ee(e, t, i.output);
}, Gi = (e, t, i) => {
  if (e.isScrolling && e.isFull && e.fontSize >= 35 && t === Me && i === Ie)
    return {
      traces: [
        {
          width: pi,
          height: gi,
          fontSize: e.fontSize,
          paddingX: vi,
          baselineY: Si,
          lineHeight: e.fontSize * yi,
          sourceFont: !0
        }
      ],
      output: {
        width: Me,
        height: Ie,
        fontSize: Ci,
        paddingX: _e,
        baselineY: Q,
        lineHeight: ee
      }
    };
  if (e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder) {
    const s = Xi(
      e,
      i,
      Te
    );
    return {
      output: {
        width: t,
        height: i,
        fontSize: Bi(s),
        paddingX: _e,
        baselineY: Q,
        lineHeight: s,
        canvasScale: Te
      }
    };
  }
  return Re(e) ? {
    output: {
      width: t,
      height: i,
      fontSize: Li,
      paddingX: mi,
      baselineY: xi,
      lineHeight: Fi
    }
  } : null;
}, Yi = (e, t) => {
  if (!fi())
    return null;
  const i = Math.abs(e.letterSpacing) >= Number.EPSILON, s = e.lines.length > 1;
  i && y.letterSpacingComments++, s && y.multiLineComments++, !i && !s && y.normalComments++, y.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: l } = Ae(e), d = Gi(e, r, l);
  if (d)
    return Ui(e, t, d);
  const u = new OffscreenCanvas(r, l), c = u.getContext("2d");
  if (!c)
    return null;
  c.save(), c.font = Y(e);
  const o = P(e.opacity), f = n, h = e.lines.length > 0 ? e.lines : [e.text], p = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, g = Ni(e, a), I = he(e, c, t, "cache", f), C = ie(e.color, o), S = e.renderStyle === "outline-only", v = S ? { blur: 0, alpha: 0 } : re(e.shadowIntensity, e.fontSize, o);
  return A() && console.log(
    "[Shadow Debug - Cache]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${v.blur}px`,
    `
  Shadow alpha: ${v.alpha}`,
    `
  Fill style: ${C}`
  ), c.save(), c.shadowColor = `rgba(0, 0, 0, ${v.alpha})`, c.shadowBlur = v.blur, c.shadowOffsetX = 0, c.shadowOffsetY = 0, c.lineJoin = "round", c.lineWidth = oe(), c.strokeStyle = le(e), c.fillStyle = C, S && h.forEach((T, M) => {
    const D = g + M * p;
    I(T, D, "outline");
  }), h.forEach((T, M) => {
    const D = g + M * p;
    I(T, D, "fill");
  }), c.restore(), c.restore(), u;
}, $i = (e, t, i) => {
  y.fallbacks++, t.save(), t.font = Y(e);
  const s = P(e.opacity), n = i ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, l = e.y + e.fontSize, d = he(e, t, t, "fallback", n), u = ie(e.color, s), c = e.renderStyle === "outline-only", o = c ? { blur: 0, alpha: 0 } : re(e.shadowIntensity, e.fontSize, s);
  A() && console.log(
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
  Fill style: ${u}`
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${o.alpha})`, t.shadowBlur = o.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = oe(), t.strokeStyle = le(e), t.fillStyle = u, c && a.forEach((f, h) => {
    const p = l + h * r;
    d(f, p, "outline");
  }), a.forEach((f, h) => {
    const p = l + h * r;
    d(f, p, "fill");
  }), t.restore(), t.restore();
}, qi = (e, t, i) => {
  try {
    if (!e.isActive || !t)
      return;
    const s = zi(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== s || !n) {
      y.misses++, y.creates++;
      const r = Yi(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(s);
    } else
      y.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = i ?? e.x, { paddingX: l, paddingY: d } = Ae(e), u = Di(e), c = Wi(e, a, r, l, u), o = c.x, f = e.y - d;
      c.scaleX === 1 && c.scaleY === 1 ? t.drawImage(a, o, f) : t.drawImage(
        a,
        o,
        f,
        a.width * c.scaleX,
        a.height * c.scaleY
      ), J("drawImage", t, e, {
        x: o,
        y: f,
        width: a.width * c.scaleX,
        height: a.height * c.scaleY,
        sourceWidth: a.width,
        sourceHeight: a.height,
        meta: {
          statsTarget: "cache",
          paddingX: l,
          paddingY: d,
          drawScale: u,
          drawScaleX: c.scaleX,
          drawScaleY: c.scaleY
        }
      }), Ce();
      return;
    }
    $i(e, t, i), Ce();
  } catch (s) {
    ne.error("Comment.draw", s, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: i
    });
  }
}, Ki = (e) => e === "ltr" ? "ltr" : "rtl", ji = (e) => e === "ltr" ? 1 : -1;
class Zi {
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
  lines = [];
  epochId = 0;
  directionSign = -1;
  timeSource;
  lastSyncedSettingsVersion = -1;
  cachedTexture = null;
  textureCacheKey = "";
  constructor(t, i, s, n, a = {}) {
    if (typeof t != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(i) || i < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = t, this.vposMs = i, this.commands = Array.isArray(s) ? [...s] : [];
    const r = at(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.size = r.size, this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.isFull = r.isFull, this.isEnder = r.isEnder, this.fontFamily = r.fontFamily, this.fontWeight = r.fontWeight, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = a.timeSource ?? xe(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, i, s, n) {
    si(this, t, i, s, n);
  }
  draw(t, i = null) {
    qi(this, t, i);
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
      ne.error("Comment.update", s, {
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
    const i = Ki(t);
    this.scrollDirection = i, this.directionSign = ji(i);
  }
}
const Ji = 6e3, U = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: Ji,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, na = U, Qi = () => ({
  ...U,
  ngWords: [...U.ngWords],
  ngRegexps: [...U.ngRegexps]
}), aa = "v3.1.10", es = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, B = (e) => {
  const t = e.scrollVisibleDurationMs, i = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: es(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: i,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, ts = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(Number(t))
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, is = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), ss = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, be = (e) => e.isScrolling && e.isFull && e.text.includes(`
`) && e.commands.some((t) => t.toLowerCase() === "mincho"), ns = (e) => {
  const t = /* @__PURE__ */ new Set();
  e.forEach((i) => {
    i.isEnder && be(i) && t.add(i.vposMs);
  }), e.forEach((i) => {
    i.hasSameVposFullMinchoEnder = t.has(i.vposMs) && be(i);
  });
}, as = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const i of e) {
    const { text: s, vposMs: n, commands: a = [] } = i, r = W(s);
    if (this.isNGComment(s)) {
      _("comment-skip-ng", { preview: r, vposMs: n });
      continue;
    }
    const l = lt(n);
    if (l === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), _("comment-skip-invalid-vpos", { preview: r, vposMs: n });
      continue;
    }
    if (this.comments.some(
      (c) => c.text === s && c.vposMs === l
    ) || t.some((c) => c.text === s && c.vposMs === l)) {
      _("comment-skip-duplicate", { preview: r, vposMs: l });
      continue;
    }
    const u = new Zi(
      s,
      l,
      a,
      this._settings,
      this.commentDependencies
    );
    u.creationIndex = this.commentSequence++, u.epochId = this.epochId, t.push(u), _("comment-added", {
      preview: r,
      vposMs: l,
      commands: u.commands.length,
      layout: u.layout,
      isScrolling: u.isScrolling,
      invisible: u.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), ns(this.comments), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    return Math.abs(n) > b ? n : i.creationIndex - s.creationIndex;
  }), t);
}, rs = function(e, t, i = []) {
  const [s] = this.addComments([{ text: e, vposMs: t, commands: i }]);
  return s ?? null;
}, os = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, i);
  }
}, ls = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, De = function() {
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
}, hs = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, cs = (e) => {
  e.prototype.addComments = as, e.prototype.addComment = rs, e.prototype.clearComments = os, e.prototype.resetState = ls, e.prototype.rebuildNgMatchers = De, e.prototype.isNGComment = hs;
}, us = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, ds = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, li(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, fs = function(e) {
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
  if (oi(e, i), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(i);
    } catch (s) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
    }
  this.lastSnapshotEmitTime = t;
}, ps = function(e) {
  this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  return t !== void 0 ? t : Ve(e);
}, Ve = (e) => {
  if (!e.isScrolling)
    return e.vposMs;
  const t = e.isFull ? yt : St;
  return Math.max(0, e.vposMs - t);
}, gs = function(e) {
  if (!e.isScrolling)
    return O;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : se;
}, vs = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), Ve(e);
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const i = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, i), i;
}, Ss = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + H, i = Math.max(e + H, t), s = this.comments.filter((u) => u.hasShown || u.isInvisible || this.isNGComment(u.text) ? !1 : u.vposMs >= e - x).sort((u, c) => {
    const o = u.vposMs - c.vposMs;
    return Math.abs(o) > b ? o : u.creationIndex - c.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(i - e, H) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : K, l = Math.max(K, Math.min(r, pt));
  let d = e;
  s.forEach((u, c) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(u)), f = i - o;
    let h = Math.max(e, Math.min(d, f));
    Number.isFinite(h) || (h = e);
    const p = gt * c;
    h + p <= f && (h += p), this.finalPhaseVposOverrides.set(u, h);
    const g = Math.max(K, Math.min(o / 2, l));
    d = h + g;
  }), this.finalPhaseScheduleDirty = !1;
}, ys = (e) => {
  e.prototype.resetFinalPhaseState = us, e.prototype.incrementEpoch = ds, e.prototype.emitStateSnapshot = fs, e.prototype.getEffectiveCommentVpos = ps, e.prototype.getFinalPhaseDisplayDuration = gs, e.prototype.resolveFinalPhaseVpos = vs, e.prototype.recomputeFinalPhaseTimeline = Ss;
}, Cs = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= R;
}, Ms = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > R) && (this.playbackHasBegun = !0);
}, Is = (e) => {
  e.prototype.shouldSuppressRendering = Cs, e.prototype.updatePlaybackProgressState = Ms;
}, _s = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : m(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, d = this.buildPrepareOptions(r), u = this.duration > 0 && this.duration - this.currentTime <= ft;
  u && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, l), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !u && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const o of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(o), h = f < this.currentTime - x, p = f > this.currentTime + x;
    if (h || p) {
      o.isActive = !1, this.activeComments.delete(o), o.clearActivation(), o.lane >= 0 && (o.layout === "ue" ? this.releaseStaticLane("ue", o.lane) : o.layout === "shita" && this.releaseStaticLane("shita", o.lane));
      continue;
    }
    o.isScrolling && o.hasShown && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
  }
  const c = this.getCommentsInTimeWindow(this.currentTime, x);
  for (const o of c) {
    const f = A(), h = f ? W(o.text) : "";
    if (f && _("comment-evaluate", {
      stage: "update",
      preview: h,
      vposMs: o.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(o),
      currentTime: this.currentTime,
      isActive: o.isActive,
      hasShown: o.hasShown
    }), this.isNGComment(o.text)) {
      f && _("comment-eval-skip", {
        preview: h,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "ng-runtime"
      });
      continue;
    }
    if (o.isInvisible) {
      f && _("comment-eval-skip", {
        preview: h,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "invisible"
      }), o.isActive = !1, this.activeComments.delete(o), o.hasShown = !0, o.clearActivation();
      continue;
    }
    if (o.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(o, this.currentTime, h) && this.activateComment(
      o,
      s,
      r,
      l,
      d,
      this.currentTime
    ), o.isActive) {
      if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
        continue;
      }
      if (o.layout === "naka" && this.getEffectiveCommentVpos(o) > this.currentTime + R) {
        o.x = o.virtualStartX, o.lastUpdateTime = this.timeSource.now();
        continue;
      }
      if (o.hasShown = !0, o.update(this.playbackRate, !this.isPlaying), !o.isScrolling && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
      }
    }
  }
}, Ts = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = se, s = ue;
  return t !== null && (i = t, s = Math.max(1, Math.min(t, ue))), {
    visibleWidth: e,
    virtualExtension: vt,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: ht,
    bufferRatio: ct,
    baseBufferPx: ut,
    entryBufferPx: dt
  };
}, Es = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t);
  for (const a of i)
    if (this.isLaneAvailable(a, s, t))
      return this.storeLaneReservation(a, s), a;
  const n = i[0] ?? 0;
  return this.storeLaneReservation(n, s), n;
}, bs = (e) => {
  e.prototype.updateComments = _s, e.prototype.buildPrepareOptions = Ts, e.prototype.findAvailableLane = Es;
}, Ls = function(e, t) {
  let i = 0, s = e.length;
  for (; i < s; ) {
    const n = Math.floor((i + s) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + G <= t ? i = n + 1 : s = n;
  }
  return i;
}, ms = function(e) {
  for (const [t, i] of this.reservedLanes.entries()) {
    const s = this.findFirstValidReservationIndex(i, e);
    s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
  }
}, xs = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
}, Fs = (e) => {
  e.prototype.findFirstValidReservationIndex = Ls, e.prototype.pruneLaneReservations = ms, e.prototype.pruneStaticLaneReservations = xs;
}, ws = function(e) {
  let t = 0, i = this.comments.length;
  for (; t < i; ) {
    const s = Math.floor((t + i) / 2), n = this.comments[s];
    n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
  }
  return t;
}, Os = function(e, t) {
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
}, Ps = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, As = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, Rs = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, Ns = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, Ds = (e) => {
  const t = Math.ceil(
    e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
  );
  return Math.max(0, (t - e.height) / 2);
}, Vs = function(e, t, i, s) {
  const n = Math.max(1, i), a = Math.max(s.height, s.fontSize), r = 5, l = 0, d = Ds(s);
  if (e === "ue") {
    const h = r + d;
    let p = h;
    const I = this.getStaticReservations(e).filter((S) => S.lane < t).sort((S, v) => S.lane - v.lane);
    for (const S of I) {
      const v = S.yEnd - S.yStart;
      p += v + l;
    }
    const C = Math.max(r, n * 2);
    return Math.max(h, Math.min(p, C));
  }
  let u = n - r;
  const o = this.getStaticReservations(e).filter((h) => h.lane < t).sort((h, p) => h.lane - p.lane);
  for (const h of o) {
    const p = h.yEnd - h.yStart;
    u -= p + l;
  }
  const f = u - a;
  return Math.max(r, f);
}, Hs = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, ks = (e) => {
  e.prototype.findCommentIndexAtOrAfter = ws, e.prototype.getCommentsInTimeWindow = Os, e.prototype.getStaticReservations = Ps, e.prototype.getStaticLaneDepth = As, e.prototype.getStaticLaneLimit = Rs, e.prototype.getGlobalLaneIndexForBottom = Ns, e.prototype.resolveStaticCommentOffset = Vs, e.prototype.getStaticReservedLaneSet = Hs;
}, Ws = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, He = (e) => Math.max(1, e.fontSize * (Ws(e) ? 0.46 : 1)), zs = function(e, t, i = "") {
  const s = i.length > 0 && A(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - b ? (s && _("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "final-phase-trimmed",
    finalPhaseStartTime: this.finalPhaseStartTime
  }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (s && _("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "invisible"
  }), !1) : e.isActive ? (s && _("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-active"
  }), !1) : e.hasShown && n <= t ? (s && _("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-shown",
    currentTime: t
  }), !1) : n > t + R ? (s && _("comment-eval-pending", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "future",
    currentTime: t
  }), !1) : n < t - x ? (s && _("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "expired-window",
    currentTime: t
  }), !1) : !e.isScrolling && n + O <= t ? (s && _("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "static-expired",
    currentTime: t
  }), !1) : (s && _("comment-eval-ready", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    currentTime: t
  }), !0);
}, Xs = function(e, t, i, s, n, a) {
  e.prepare(t, i, s, n);
  const r = this.resolveFinalPhaseVpos(e);
  if (A() && _("comment-prepared", {
    preview: W(e.text),
    layout: e.layout,
    isScrolling: e.isScrolling,
    width: e.width,
    height: e.height,
    bufferWidth: e.bufferWidth,
    visibleDurationMs: e.visibleDurationMs,
    effectiveVposMs: r
  }), e.layout === "naka") {
    const l = Math.max(0, a - r), d = e.speedPixelsPerMs * l;
    if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
      const h = this.duration > 0 ? this.duration : this.finalPhaseStartTime + H, p = Math.max(
        this.finalPhaseStartTime + H,
        h
      ), g = e.width + i, I = g > 0 ? g / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + I > p) {
        const S = p - a, v = Math.max(0, S) * e.speedPixelsPerMs, T = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - d, i - v) : Math.min(e.virtualStartX + d, v - e.width);
        e.x = T;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - d : e.virtualStartX + d;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - d : e.virtualStartX + d;
    const u = this.findAvailableLane(e);
    e.lane = u;
    const c = Math.max(1, this.laneHeight), o = Math.max(0, s - e.height), f = u * c;
    e.y = e.isFull ? 0 : Math.max(0, Math.min(f, o));
  } else {
    const l = e.layout === "ue" ? "ue" : "shita", d = this.assignStaticLane(l, e, s, a), u = this.resolveStaticCommentOffset(
      l,
      d,
      s,
      e
    );
    e.x = e.virtualStartX, e.y = u, e.lane = l === "ue" ? d : this.getGlobalLaneIndexForBottom(d), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0;
    const c = r + O;
    e.visibleDurationMs = Math.max(0, c - a), this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = c, this.reserveStaticLane(l, e, d, c), A() && _("comment-activate-static", {
      preview: W(e.text),
      lane: e.lane,
      position: l,
      displayEnd: c,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, Bs = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = He(t), r = Math.max(1, a), l = Math.max(
    this.laneCount,
    Math.ceil(Math.max(1, i) / r) + n.length + 1
  ), d = Array.from({ length: l }, (o, f) => f);
  for (const o of d) {
    const f = this.resolveStaticCommentOffset(e, o, i, t), h = f, p = f + a;
    if (!n.some((I) => I.releaseTime > s ? !(p <= I.yStart || h >= I.yEnd) : !1))
      return o;
  }
  let u = d[0] ?? 0, c = Number.POSITIVE_INFINITY;
  for (const o of n)
    o.releaseTime < c && (c = o.releaseTime, u = o.lane);
  return u;
}, Us = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = t.y, r = t.y + He(t);
  n.push({
    comment: t,
    releaseTime: s,
    yStart: a,
    yEnd: r,
    lane: i
  });
}, Gs = function(e, t) {
  if (t < 0)
    return;
  const i = this.getStaticReservations(e), s = i.findIndex((n) => n.lane === t);
  s >= 0 && i.splice(s, 1);
}, Ys = (e) => {
  e.prototype.shouldActivateCommentAtTime = zs, e.prototype.activateComment = Xs, e.prototype.assignStaticLane = Bs, e.prototype.reserveStaticLane = Us, e.prototype.releaseStaticLane = Gs;
}, $s = function(e) {
  const i = Array.from({ length: this.laneCount }, (r, l) => l).sort((r, l) => {
    const d = this.getLaneNextAvailableTime(r, e), u = this.getLaneNextAvailableTime(l, e);
    return Math.abs(d - u) <= b ? r - l : d - u;
  }), s = this.getStaticReservedLaneSet();
  if (s.size === 0)
    return i;
  const n = i.filter((r) => !s.has(r));
  if (n.length === 0)
    return i;
  const a = i.filter((r) => s.has(r));
  return [...n, ...a];
}, qs = function(e, t) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return t;
  const s = this.findFirstValidReservationIndex(i, t), n = i[s];
  return n ? Math.max(t, n.endTime + G) : t;
}, Ks = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, b), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + G, l = a + e.totalDurationMs + G;
  return {
    comment: e,
    startTime: a,
    endTime: Math.max(a, r),
    totalEndTime: Math.max(a, l),
    startLeft: e.virtualStartX,
    width: e.width,
    speed: i,
    buffer: e.bufferWidth,
    directionSign: e.getDirectionSign()
  };
}, js = function(e, t, i) {
  const s = this.reservedLanes.get(e);
  if (!s || s.length === 0)
    return !0;
  const n = this.findFirstValidReservationIndex(s, i);
  for (let a = n; a < s.length; a += 1) {
    const r = s[a];
    if (r && this.areReservationsConflicting(r, t))
      return !1;
  }
  return !0;
}, Zs = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, Js = function(e, t) {
  const i = Math.max(e.startTime, t.startTime), s = Math.min(e.endTime, t.endTime);
  if (i >= s)
    return !1;
  const n = /* @__PURE__ */ new Set([
    i,
    s,
    i + (s - i) / 2
  ]), a = this.solveLeftRightEqualityTime(e, t);
  a !== null && a >= i - b && a <= s + b && n.add(a);
  const r = this.solveLeftRightEqualityTime(t, e);
  r !== null && r >= i - b && r <= s + b && n.add(r);
  for (const l of n) {
    if (l < i - b || l > s + b)
      continue;
    const d = this.computeForwardGap(e, t, l), u = this.computeForwardGap(t, e, l);
    if (d <= b && u <= b)
      return !0;
  }
  return !1;
}, Qs = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, en = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, tn = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < b)
    return null;
  const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, sn = (e) => {
  e.prototype.getLanePriorityOrder = $s, e.prototype.getLaneNextAvailableTime = qs, e.prototype.createLaneReservation = Ks, e.prototype.isLaneAvailable = js, e.prototype.storeLaneReservation = Zs, e.prototype.areReservationsConflicting = Js, e.prototype.computeForwardGap = Qs, e.prototype.getBufferedEdges = en, e.prototype.solveLeftRightEqualityTime = tn;
}, nn = function() {
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
    r.sort((d, u) => {
      const c = this.getEffectiveCommentVpos(d), o = this.getEffectiveCommentVpos(u), f = c - o;
      return Math.abs(f) > b ? f : d.isScrolling !== u.isScrolling ? d.isScrolling ? 1 : -1 : d.creationIndex - u.creationIndex;
    }), r.forEach((d) => {
      const c = this.isPlaying && !d.isPaused ? d.x + d.getDirectionSign() * d.speed * l : d.x;
      d.draw(t, c);
    });
  }
  this.lastDrawTime = a;
}, an = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : m(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, d = this.buildPrepareOptions(r);
  this.getCommentsInTimeWindow(this.currentTime, x).forEach((c) => {
    if (this.isNGComment(c.text) || c.isInvisible) {
      c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
      return;
    }
    if (c.syncWithSettings(this._settings, this.settingsVersion), c.isActive = !1, this.activeComments.delete(c), c.lane = -1, c.clearActivation(), this.shouldActivateCommentAtTime(c, this.currentTime)) {
      this.activateComment(
        c,
        s,
        r,
        l,
        d,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(c) < this.currentTime - x ? c.hasShown = !0 : c.hasShown = !1;
  });
}, rn = (e) => {
  e.prototype.draw = nn, e.prototype.performInitialSync = an;
}, on = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, ln = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, hn = function(e, t) {
  this.videoFrameHandle = null;
  const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
}, cn = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, un = function() {
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
}, dn = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, fn = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, pn = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, gn = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, vn = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  if (!e || !t || !i)
    return;
  const s = m(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
  if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
    this.currentTime = s, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
    return;
  }
  const l = n > R;
  if (this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !l) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const d = this.canvasDpr > 0 ? this.canvasDpr : 1, u = this.displayWidth > 0 ? this.displayWidth : e.width / d, c = this.displayHeight > 0 ? this.displayHeight : e.height / d, o = this.buildPrepareOptions(u);
  this.getCommentsInTimeWindow(this.currentTime, x).forEach((h) => {
    const p = A(), g = p ? W(h.text) : "";
    if (p && _("comment-evaluate", {
      stage: "seek",
      preview: g,
      vposMs: h.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(h),
      currentTime: this.currentTime,
      isActive: h.isActive,
      hasShown: h.hasShown
    }), this.isNGComment(h.text)) {
      p && _("comment-eval-skip", {
        preview: g,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        reason: "ng-runtime"
      }), h.isActive = !1, this.activeComments.delete(h), h.clearActivation();
      return;
    }
    if (h.isInvisible) {
      p && _("comment-eval-skip", {
        preview: g,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        reason: "invisible"
      }), h.isActive = !1, this.activeComments.delete(h), h.hasShown = !0, h.clearActivation();
      return;
    }
    if (h.syncWithSettings(this._settings, this.settingsVersion), h.isActive = !1, this.activeComments.delete(h), h.lane = -1, h.clearActivation(), this.shouldActivateCommentAtTime(h, this.currentTime, g)) {
      this.activateComment(
        h,
        t,
        u,
        c,
        o,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(h) < this.currentTime - x ? h.hasShown = !0 : h.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Sn = (e) => {
  e.prototype.processFrame = on, e.prototype.handleAnimationFrame = ln, e.prototype.handleVideoFrame = hn, e.prototype.shouldUseVideoFrameCallback = cn, e.prototype.scheduleNextFrame = un, e.prototype.cancelAnimationFrameRequest = dn, e.prototype.cancelVideoFrameCallback = fn, e.prototype.startAnimation = pn, e.prototype.stopAnimation = gn, e.prototype.onSeek = vn;
}, yn = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, Cn = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, Mn = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, i = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(i ?? null, t);
    this.videoElement = t, this.containerElement = s, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? m(t.duration) : 0, this.currentTime = m(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > R, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.right = "0", n.style.bottom = "0", n.style.display = "block", n.style.pointerEvents = "none", n.style.zIndex = "2147483647";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, In = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, _n = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, Tn = (e) => {
  e.prototype.resolveContainer = yn, e.prototype.ensureContainerPositioning = Cn, e.prototype.initialize = Mn, e.prototype.destroy = In, e.prototype.destroyCanvasOnly = _n;
}, En = function(e) {
  try {
    const t = () => {
      this.isPlaying = !0, this.playbackHasBegun = !0;
      const f = this.timeSource.now();
      this.lastDrawTime = f, this.lastPlayResumeTime = f, this.comments.forEach((h) => {
        h.lastUpdateTime = f, h.isPaused = !1;
      });
    }, i = () => {
      this.isPlaying = !1;
      const f = this.timeSource.now();
      this.comments.forEach((h) => {
        h.lastUpdateTime = f, h.isPaused = !0;
      });
    }, s = () => {
      this.onSeek();
    }, n = () => {
      this.onSeek();
    }, a = () => {
      this.playbackRate = e.playbackRate;
      const f = this.timeSource.now();
      this.comments.forEach((h) => {
        h.lastUpdateTime = f;
      });
    }, r = () => {
      this.handleVideoMetadataLoaded(e);
    }, l = () => {
      this.duration = Number.isFinite(e.duration) ? m(e.duration) : 0;
    }, d = () => {
      this.handleVideoSourceChange();
    }, u = () => {
      this.handleVideoStalled();
    }, c = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", l), e.addEventListener("emptied", d), e.addEventListener("waiting", u), e.addEventListener("canplay", c), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", d)), this.addCleanup(() => e.removeEventListener("waiting", u)), this.addCleanup(() => e.removeEventListener("canplay", c)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, bn = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, Ln = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
  t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, mn = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = m(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, xn = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, Fn = function(e) {
  this.duration = Number.isFinite(e.duration) ? m(e.duration) : 0, this.currentTime = m(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > R, this.lastDrawTime = this.timeSource.now();
}, wn = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > R, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, On = function(e, t) {
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
        let l = null, d = null;
        if ((r instanceof HTMLVideoElement || r instanceof HTMLSourceElement) && (l = typeof a.oldValue == "string" ? a.oldValue : null, d = r.getAttribute("src")), l === d)
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
}, Pn = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, An = (e) => {
  e.prototype.setupVideoEventListeners = En, e.prototype.handleVideoMetadataLoaded = bn, e.prototype.handleVideoStalled = Ln, e.prototype.handleVideoCanPlay = mn, e.prototype.handleVideoSourceChange = xn, e.prototype.syncVideoState = Fn, e.prototype.resetCommentActivity = wn, e.prototype.setupVideoChangeDetection = On, e.prototype.extractVideoElement = Pn;
}, Rn = function() {
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
}, Nn = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  !e || !t || !i || (this.currentTime = m(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, Dn = function(e) {
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
}, Vn = (e) => {
  e.prototype.setupVisibilityHandling = Rn, e.prototype.handleVisibilityRestore = Nn, e.prototype.setCommentVisibility = Dn;
}, Hn = 2.525, kn = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const a = i.getBoundingClientRect(), r = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : s.width / r, d = this.displayHeight > 0 ? this.displayHeight : s.height / r, u = e ?? a.width ?? l, c = t ?? a.height ?? d;
  if (!Number.isFinite(u) || !Number.isFinite(c) || u <= 0 || c <= 0)
    return;
  const o = Math.max(1, Math.floor(u)), f = Math.max(1, Math.floor(c)), h = this.displayWidth > 0 ? this.displayWidth : o, p = this.displayHeight > 0 ? this.displayHeight : f, g = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, I = Math.max(1, Math.round(o * g)), C = Math.max(1, Math.round(f * g));
  if (!(this.displayWidth !== o || this.displayHeight !== f || Math.abs(this.canvasDpr - g) > Number.EPSILON || s.width !== I || s.height !== C))
    return;
  this.displayWidth = o, this.displayHeight = f, this.canvasDpr = g, s.width = I, s.height = C, s.style.width = `${o}px`, s.style.height = `${f}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(g, g));
  const v = h > 0 ? o / h : 1, T = p > 0 ? f / p : 1;
  (v !== 1 || T !== 1) && this.comments.forEach((M) => {
    M.isActive && (M.x *= v, M.y *= T, M.width *= v, M.fontSize = Math.max(
      we,
      Math.floor(Math.max(1, M.fontSize) * T)
    ), M.height = M.fontSize, M.virtualStartX *= v, M.exitThreshold *= v, M.baseSpeed *= v, M.speed *= v, M.speedPixelsPerMs *= v, M.bufferWidth *= v, M.reservationWidth *= v);
  }), this.calculateLaneMetrics();
}, Wn = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, zn = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(we, Math.floor(t * (27 / 665)));
  this.laneHeight = i * Hn;
  const s = Math.floor(t / Math.max(this.laneHeight, 1));
  if (this._settings.useFixedLaneCount) {
    const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : Fe, a = Math.max(de, Math.min(s, n));
    this.laneCount = a;
  } else
    this.laneCount = Math.max(de, s);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, Xn = function(e) {
  if (this.cleanupResizeHandling(), this._settings.useContainerResizeObserver && this.isResizeObserverAvailable) {
    const t = this.resolveResizeObserverTarget(e), i = new ResizeObserver((s) => {
      for (const n of s) {
        const { width: a, height: r } = n.contentRect;
        a > 0 && r > 0 ? this.resize(a, r) : this.resize();
      }
    });
    i.observe(t), this.resizeObserver = i, this.resizeObserverTarget = t;
  } else if (typeof window < "u" && typeof window.addEventListener == "function") {
    const t = () => {
      this.resize();
    };
    window.addEventListener("resize", t), this.addCleanup(() => window.removeEventListener("resize", t));
  } else
    this.log.debug(
      "Resize handling is disabled because neither ResizeObserver nor window APIs are available."
    );
}, Bn = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, Un = (e) => {
  e.prototype.resize = kn, e.prototype.resolveDevicePixelRatio = Wn, e.prototype.calculateLaneMetrics = zn, e.prototype.setupResizeHandling = Xn, e.prototype.cleanupResizeHandling = Bn;
}, Gn = function() {
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
}, Yn = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, $n = async function() {
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
    this.resize(l.width, l.height);
    return;
  }
  this.resize();
}, qn = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, Kn = function(e, t, i) {
  return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
}, jn = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, Zn = (e) => {
  e.prototype.setupFullscreenHandling = Gn, e.prototype.resolveResizeObserverTarget = Yn, e.prototype.handleFullscreenChange = $n, e.prototype.resolveFullscreenContainer = qn, e.prototype.resolveActiveOverlayContainer = Kn, e.prototype.getFullscreenElement = jn;
}, Jn = function(e) {
  this.cleanupTasks.push(e);
}, Qn = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, ea = (e) => {
  e.prototype.addCleanup = Jn, e.prototype.runCleanupTasks = Qn;
};
class E {
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
  laneCount = Fe;
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
    De.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (ss(t))
      s = B({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = B(Qi());
    }
    this._settings = B(s), this.timeSource = n.timeSource ?? xe(), this.animationFrameProvider = n.animationFrameProvider ?? ts(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? is(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = Oe(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && ai(n.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(t) {
    this._settings = B(t), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
cs(E);
ys(E);
Is(E);
bs(E);
Fs(E);
ks(E);
Ys(E);
sn(E);
rn(E);
Sn(E);
Tn(E);
An(E);
Vn(E);
Un(E);
Zn(E);
ea(E);
const ta = (e) => ({
  text: e.text,
  vposMs: e.vposMs,
  commands: e.commands,
  layout: e.layout,
  lane: e.lane,
  x: e.x,
  y: e.y,
  width: e.width,
  height: e.height,
  fontSize: e.fontSize,
  fontFamily: e.fontFamily,
  color: e.color,
  opacity: e.opacity,
  visibleDurationMs: e.visibleDurationMs,
  totalDurationMs: e.totalDurationMs,
  speedPixelsPerMs: e.speedPixelsPerMs,
  creationIndex: e.creationIndex
}), ia = (e) => {
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
}, ra = (e, t, i = {}) => {
  const s = [], n = globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__, a = globalThis.__COMMENT_OVERLAY_TRACE__;
  i.collectTrace === !0 && (globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = !0, globalThis.__COMMENT_OVERLAY_TRACE__ = ((r) => {
    s.push(r);
  }));
  try {
    e.processFrame(t);
  } finally {
    i.collectTrace === !0 && (globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = n, globalThis.__COMMENT_OVERLAY_TRACE__ = a);
  }
  return {
    frameTimeMs: t,
    canvas: ia(e),
    activeComments: Array.from(e.activeComments, ta),
    records: s
  };
};
export {
  aa as COMMENT_OVERLAY_VERSION,
  Zi as Comment,
  E as CommentRenderer,
  na as DEFAULT_RENDERER_SETTINGS,
  ra as captureRendererCalibrationFrame,
  Qi as cloneDefaultSettings,
  ai as configureDebugLogging,
  ts as createDefaultAnimationFrameProvider,
  xe as createDefaultTimeSource,
  Oe as createLogger,
  _ as debugLog,
  oi as dumpRendererState,
  A as isDebugLoggingEnabled,
  li as logEpochChange,
  sa as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
