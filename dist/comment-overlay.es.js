const Xe = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, Ue = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"游明朝体","游明朝","Yu Mincho",YuMincho,yumincho,YuMin-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic'
}, Be = {
  defont: "600",
  gothic: "",
  mincho: ""
}, Ee = {
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
}, j = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Ge = /^[,.:;]+/, Ye = /[,.:;]+$/, $e = (e) => {
  const t = e.trim();
  return t ? j.test(t) ? t : t.replace(Ge, "").replace(Ye, "") : "";
}, qe = (e) => j.test(e) ? e.toUpperCase() : null, be = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const i = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, s = Number.parseFloat(i);
  return Number.isFinite(s) ? s : null;
}, Ke = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return be(t);
}, je = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, Ze = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), Je = (e) => e === "naka" || e === "ue" || e === "shita", Qe = (e) => e === "small" || e === "medium" || e === "big", et = (e) => e === "defont" || e === "gothic" || e === "mincho", tt = (e) => e in Ee, it = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, r = 1, l = null, d = !1, u = !1, h = !1, o = 0, f = 1;
  for (const C of e) {
    const M = $e(typeof C == "string" ? C : "");
    if (!M)
      continue;
    if (j.test(M)) {
      const g = qe(M);
      if (g) {
        a = g;
        continue;
      }
    }
    const S = M.toLowerCase();
    if (Je(S)) {
      i = S;
      continue;
    }
    if (Qe(S)) {
      s = S;
      continue;
    }
    if (et(S)) {
      n = S;
      continue;
    }
    if (tt(S)) {
      a = Ee[S].toUpperCase();
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
      h = !0;
      continue;
    }
    if (S.startsWith("ls:") || S.startsWith("letterspacing:")) {
      const g = M.indexOf(":");
      if (g >= 0) {
        const T = be(M.slice(g + 1));
        T !== null && (o = je(T));
      }
      continue;
    }
    if (S.startsWith("lh:") || S.startsWith("lineheight:")) {
      const g = M.indexOf(":");
      if (g >= 0) {
        const T = Ke(M.slice(g + 1));
        T !== null && (f = Ze(T));
      }
      continue;
    }
  }
  const c = Math.max(0, Math.min(1, r)), p = (a ?? t.defaultColor).toUpperCase(), v = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: i,
    size: s,
    sizeScale: Xe[s],
    font: n,
    fontFamily: Ue[n],
    fontWeight: Be[n],
    resolvedColor: p,
    colorOverride: a,
    opacityMultiplier: c,
    opacityOverride: v,
    isInvisible: d,
    isFull: u,
    isEnder: h,
    letterSpacing: o,
    lineHeight: f
  };
}, st = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, z = (e) => e.length === 1 ? e.repeat(2) : e, F = (e) => Number.parseInt(e, 16), O = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, Z = (e, t) => {
  const i = st.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, r, l = 1;
  s.length === 3 || s.length === 4 ? (n = F(z(s[0])), a = F(z(s[1])), r = F(z(s[2])), s.length === 4 && (l = F(z(s[3])) / 255)) : (n = F(s.slice(0, 2)), a = F(s.slice(2, 4)), r = F(s.slice(4, 6)), s.length === 8 && (l = F(s.slice(6, 8)) / 255));
  const d = O(l * O(t));
  return `rgba(${n}, ${a}, ${r}, ${d})`;
}, nt = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), Le = () => nt(), m = (e) => e * 1e3, at = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), J = 6e3, re = 2700, rt = 3, ot = 0.25, lt = 32, ht = 48, B = 120, ct = 6e3, $ = 120, ut = 800, dt = 2, H = 6e3, N = 3e3, w = N + J, ft = 240, pt = 2e3, oe = 1, me = 12, we = 24, b = 1e-3, P = 50, gt = 2400, le = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, vt = (e, t, i) => {
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
}, xe = (e, t = {}) => {
  const { level: i = "info", emitter: s = vt } = t, n = le[i], a = (r, l) => {
    le[r] < n || s(r, e, l);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, Q = xe("CommentEngine:Comment"), he = /* @__PURE__ */ new WeakMap(), St = (e) => {
  let t = he.get(e);
  return t || (t = /* @__PURE__ */ new Map(), he.set(e, t)), t;
}, ee = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = St(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(s, r), r;
}, G = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, yt = 27 / 665, Ct = 12, Mt = "  ", It = 1252 / 597.38330078125, V = [366, 510, 1662], _t = 566, Tt = 806 / 665, Et = 808 / 665, ce = 1176 / 665, ue = 900 / 665, bt = 1126 / 665, de = 810 / 665, Lt = 1126 / 665, mt = 1046 / 665, wt = 1254 / 665, xt = 1140 / 665, Ft = 878 / 665, Ot = 0.25, At = 160, Pt = 420, Rt = 80, Nt = 0.18, Dt = 400, Vt = 0.2, Ht = 420, kt = 250, Wt = 1.8, zt = 420, Xt = 20, Ut = 0.045, Bt = (e) => e.replaceAll("	", Mt), Gt = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g, Yt = (e) => {
  const t = Bt(e);
  if (t.includes(`
`)) {
    const i = t.split(/\r?\n/);
    return i.length > 0 ? i : [""];
  }
  return [t];
}, fe = (e, t = Ct) => Math.max(t, e), $t = (e) => {
  if (e.fontSize >= 35)
    return _t;
  const t = e.text.split(/\r?\n/), i = Math.max(0, ...t.map((n) => n.length));
  return e.isEnder && i >= 25 || Math.max(0, ...t.map((n) => (n.match(/\t/g) || []).length)) >= 12 || e.width >= 1200 ? V[2] : e.width >= 300 ? V[1] : V[0];
}, qt = (e) => Math.min(
  Pt,
  Math.max(At, e.width * Ot)
), Kt = (e) => Math.min(
  Ht,
  Rt + e.width * Nt + Math.max(0, e.width - Dt) * Vt
), jt = (e) => Math.min(
  zt,
  Math.max(0, e.width - kt) * Wt
), Zt = (e) => e.lines.filter((t) => t.replace(Gt, "").length > 0).length, pe = (e) => e.lines.length > 1 && Zt(e) === 1, Jt = (e, t) => {
  let i = 0;
  const s = e.letterSpacing;
  for (const r of e.lines) {
    const l = ee(t, r), d = r.length > 1 ? s * (r.length - 1) : 0, u = Math.max(0, l + d);
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
}, Qt = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1), r = fe(Math.floor(s * yt)), l = fe(Math.floor(r * e.sizeScale));
    if (e.fontSize = l, t.font = G(e), e.lines = Yt(e.text), Jt(e, t), e.isScrolling && e.isFull) {
      const L = e.lines.length > 1 && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("游明朝"));
      if (L && e.hasSameVposFullMinchoEnder && !e.isEnder && e.fontSize >= 35)
        e.width = Math.round(
          s * (pe(e) ? mt : Lt)
        ), e.height = Math.max(
          e.height,
          Math.round(s * de)
        );
      else if (L && e.hasSameVposFullMinchoEnder && e.isEnder && e.fontSize >= 35)
        e.width = Math.round(
          s * (pe(e) ? wt : ce)
        ), e.height = Math.max(
          e.height,
          Math.round(s * ue)
        );
      else if (L && e.hasSameVposFullMinchoEnder && e.isEnder)
        e.width = Math.round(
          s * xt
        ), e.height = Math.max(
          e.height,
          Math.round(s * Ft)
        );
      else if (L && e.fontSize >= 35)
        e.width = Math.round(s * ce), e.height = Math.max(
          e.height,
          Math.round(s * ue)
        );
      else if (L)
        e.width = Math.round(s * bt), e.height = Math.max(
          e.height,
          Math.round(s * de)
        );
      else {
        const D = e.fontSize >= 35 ? Et : Tt;
        e.width = $t(e), e.height = Math.max(e.height, Math.round(s * D));
      }
    }
    if (!e.isScrolling) {
      const L = a + r * 2.6666666666666665;
      e.width >= L * 0.95 && e.fontSize >= 35 ? e.width = Math.round(s * It) : e.width = Math.min(e.width, L), e.bufferWidth = 0;
      const D = (a - e.width) / 2;
      e.virtualStartX = D, e.x = D, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = N, e.preCollisionDurationMs = N, e.totalDurationMs = N, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + N, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const d = ee(t, "??".repeat(150)), u = e.width * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, u);
    const h = Math.max(n.entryBufferPx, e.bufferWidth), o = e.scrollDirection, f = e.isFull ? qt(e) : 0, c = e.isFull ? Xt + e.width * Ut : 0, p = e.isFull ? 0 : Kt(e), v = e.isFull ? 0 : jt(e), C = o === "rtl" ? a + n.virtualExtension + f + p : -e.width - e.bufferWidth - n.virtualExtension - f - p, M = o === "rtl" ? -e.width - e.bufferWidth - h + f - p - v : a + h - f + p + v, S = o === "rtl" ? a + h : -h, g = o === "rtl" ? C + e.width + e.bufferWidth : C - e.bufferWidth;
    e.virtualStartX = C, e.x = C, e.exitThreshold = M;
    const T = a > 0 ? e.width / a : 0, I = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let R = n.maxVisibleDurationMs;
    if (!I && T > 1 && !e.isFull) {
      const L = Math.min(T, n.maxWidthRatio), D = n.maxVisibleDurationMs / Math.max(L, 1);
      R = Math.max(n.minVisibleDurationMs, Math.floor(D));
    }
    const De = a + e.width + e.bufferWidth + h + n.virtualExtension + c + p * 2 + v, Ve = Math.max(R, 1), Y = De / Ve, He = Y * 1e3 / 60;
    e.baseSpeed = He, e.speed = e.baseSpeed, e.speedPixelsPerMs = Y;
    const ke = Math.abs(M - C), We = o === "rtl" ? Math.max(0, g - S) : Math.max(0, S - g), ae = Math.max(Y, Number.EPSILON);
    e.visibleDurationMs = R, e.preCollisionDurationMs = Math.max(0, Math.ceil(We / ae)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(ke / ae)
    );
    const ze = e.width + e.bufferWidth + h;
    e.reservationWidth = Math.min(d, ze), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw Q.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: i,
      canvasHeight: s,
      hasContext: !!t
    }), a;
  }
}, q = 5, x = {
  enabled: !1,
  maxLogsPerCategory: q
}, k = /* @__PURE__ */ new Map(), ei = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return q;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, ti = (e) => {
  x.enabled = !!e.enabled, x.maxLogsPerCategory = ei(e.maxLogsPerCategory), x.enabled || k.clear();
}, Zn = () => {
  k.clear();
}, A = () => x.enabled, ii = (e) => {
  const t = k.get(e) ?? 0;
  return t >= x.maxLogsPerCategory ? (t === x.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), k.set(e, t + 1)), !1) : (k.set(e, t + 1), !0);
}, _ = (e, ...t) => {
  x.enabled && ii(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, W = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, si = (e, t) => {
  x.enabled && (console.group(`[CommentOverlay][state-dump] ${e}`), console.table({
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
}, ni = (e, t, i) => {
  x.enabled && _("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
}, ge = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, ai = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), ri = (e) => {
  if (typeof e.getTransform != "function")
    return;
  const t = e.getTransform();
  return [t.a, t.b, t.c, t.d, t.e, t.f];
}, oi = (e) => {
  const t = e.canvas;
  return t ? {
    canvasWidth: t.width,
    canvasHeight: t.height
  } : {};
}, li = (e) => ({
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
}), K = (e, t, i, s) => {
  const n = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof n != "function" || n({
    source: "comment-overlay",
    op: e,
    timestampMs: ai(),
    font: t.font,
    fillStyle: ge(t.fillStyle),
    strokeStyle: ge(t.strokeStyle),
    lineWidth: t.lineWidth,
    lineJoin: t.lineJoin,
    globalAlpha: t.globalAlpha,
    shadowColor: t.shadowColor,
    shadowBlur: t.shadowBlur,
    shadowOffsetX: t.shadowOffsetX,
    shadowOffsetY: t.shadowOffsetY,
    transform: ri(t),
    ...oi(t),
    comment: li(i),
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
}, ve = () => {
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
}, hi = () => typeof OffscreenCanvas < "u", te = (e, t, i) => {
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
  }[e], a = Math.max(2, t * s), r = O(i * n);
  return { blur: a, alpha: r };
}, ie = () => 2.8, Se = 566, ye = 808, ci = 1098, ui = 1530, di = 20.9, fi = 58.9, pi = 45.23908523908523 / 39, gi = 20, Ce = 11.4, Me = 31.4, Ie = 23.87692307692307, vi = 2.4, Si = 20, yi = 2, Ci = 66.9, Mi = 55.6, Ii = 46, _i = 10, Ti = 6.75, Ei = 16.75, bi = 12.11423203055002, Li = 0.5, mi = 1.42, wi = 0.12, xi = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const i = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!i)
    return !1;
  const s = i[1], n = s.length === 3 || s.length === 4, a = (u) => u.length === 1 ? `${u}${u}` : u, r = Number.parseInt(a(n ? s[0] : s.slice(0, 2)), 16), l = Number.parseInt(a(n ? s[1] : s.slice(2, 4)), 16), d = Number.parseInt(a(n ? s[2] : s.slice(4, 6)), 16);
  return r === 0 && l === 0 && d === 0;
}, se = (e) => xi(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", Fi = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, Oi = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const i = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + i;
}, Fe = (e) => {
  if (e.isScrolling && e.isFull) {
    const r = e.hasSameVposFullMinchoEnder && e.isEnder ? e.fontSize >= 35 ? Ci : Mi : null;
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: r ?? (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + vi,
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
}, Ai = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35 ? 0.8 : 1, Oe = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, Ae = (e) => Oe(e) && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("YuMincho") || e.fontFamily.includes("游明朝")), Pi = (e, t) => Ae(e) ? mi : t, Ri = (e) => Math.max(1, e.width + e.virtualStartX * 2), Ni = (e) => e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder ? Ii : 0, Di = (e, t, i, s, n) => {
  const a = Pi(e, n);
  if (Ae(e))
    return {
      x: Ri(e) * wi,
      scaleX: a,
      scaleY: n
    };
  const r = !e.isScrolling && a !== 1 ? t.width * (1 - a) * Li : 0;
  return {
    x: i - s + r + Ni(e),
    scaleX: a,
    scaleY: n
  };
}, ne = (e, t, i, s, n) => (a, r, l, d = 0) => {
  if (a.length === 0)
    return;
  const u = n + d, h = () => {
    s === "cache" ? l === "outline" ? y.outlineCallsInCache++ : y.fillCallsInCache++ : l === "outline" ? y.outlineCallsInFallback++ : y.fillCallsInFallback++;
  }, o = (c, p, v) => {
    if (h(), l === "outline") {
      t.strokeText(c, p, r), K("strokeText", t, e, {
        text: c,
        x: p,
        y: r,
        meta: { statsTarget: s, mode: l, ...v }
      });
      return;
    }
    t.fillText(c, p, r), K("fillText", t, e, {
      text: c,
      x: p,
      y: r,
      meta: { statsTarget: s, mode: l, ...v }
    });
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    o(a, u);
    return;
  }
  let f = u;
  for (let c = 0; c < a.length; c += 1) {
    const p = a[c];
    o(p, f, { characterIndex: c });
    const v = ee(i, p);
    f += v, c < a.length - 1 && (f += e.letterSpacing);
  }
}, Vi = (e) => `v6::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.lines.length}`, _e = (e, t, i) => {
  const s = new OffscreenCanvas(i.width, i.height), n = s.getContext("2d");
  if (!n)
    return null;
  n.save(), n.font = i.sourceFont ? G(e) : Fi(e, i.fontSize);
  const a = O(e.opacity), r = Z(e.color, a), l = e.renderStyle === "outline-only", d = l ? { blur: 0, alpha: 0 } : te(e.shadowIntensity, i.fontSize, a);
  n.shadowColor = `rgba(0, 0, 0, ${d.alpha})`, n.shadowBlur = d.blur, n.shadowOffsetX = 0, n.shadowOffsetY = 0, n.lineJoin = "round", n.lineWidth = ie(), n.strokeStyle = se(e), n.fillStyle = r, typeof i.canvasScale == "number" && n.scale(i.canvasScale, i.canvasScale);
  const u = e.lines.length > 0 ? e.lines : [e.text], h = ne(e, n, t, "cache", i.paddingX);
  return l && u.forEach((o, f) => {
    h(o, i.baselineY + f * i.lineHeight, "outline");
  }), u.forEach((o, f) => {
    h(o, i.baselineY + f * i.lineHeight, "fill");
  }), n.restore(), s;
}, Hi = (e, t, i) => {
  for (const s of i.traces ?? [])
    _e(e, t, s);
  return _e(e, t, i.output);
}, ki = (e, t, i) => e.isScrolling && e.isFull && e.fontSize >= 35 && t === Se && i === ye ? {
  traces: [
    {
      width: ci,
      height: ui,
      fontSize: e.fontSize,
      paddingX: di,
      baselineY: fi,
      lineHeight: e.fontSize * pi,
      sourceFont: !0
    }
  ],
  output: {
    width: Se,
    height: ye,
    fontSize: gi,
    paddingX: Ce,
    baselineY: Me,
    lineHeight: Ie
  }
} : e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder && !e.isEnder && t >= 1e3 && i >= 800 ? {
  output: {
    width: t,
    height: i,
    fontSize: Si,
    paddingX: Ce,
    baselineY: Me,
    lineHeight: Ie,
    canvasScale: yi
  }
} : Oe(e) ? {
  output: {
    width: t,
    height: i,
    fontSize: _i,
    paddingX: Ti,
    baselineY: Ei,
    lineHeight: bi
  }
} : null, Wi = (e, t) => {
  if (!hi())
    return null;
  const i = Math.abs(e.letterSpacing) >= Number.EPSILON, s = e.lines.length > 1;
  i && y.letterSpacingComments++, s && y.multiLineComments++, !i && !s && y.normalComments++, y.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: l } = Fe(e), d = ki(e, r, l);
  if (d)
    return Hi(e, t, d);
  const u = new OffscreenCanvas(r, l), h = u.getContext("2d");
  if (!h)
    return null;
  h.save(), h.font = G(e);
  const o = O(e.opacity), f = n, c = e.lines.length > 0 ? e.lines : [e.text], p = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, v = Oi(e, a), C = ne(e, h, t, "cache", f), M = Z(e.color, o), S = e.renderStyle === "outline-only", g = S ? { blur: 0, alpha: 0 } : te(e.shadowIntensity, e.fontSize, o);
  return A() && console.log(
    "[Shadow Debug - Cache]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${g.blur}px`,
    `
  Shadow alpha: ${g.alpha}`,
    `
  Fill style: ${M}`
  ), h.save(), h.shadowColor = `rgba(0, 0, 0, ${g.alpha})`, h.shadowBlur = g.blur, h.shadowOffsetX = 0, h.shadowOffsetY = 0, h.lineJoin = "round", h.lineWidth = ie(), h.strokeStyle = se(e), h.fillStyle = M, S && c.forEach((T, I) => {
    const R = v + I * p;
    C(T, R, "outline");
  }), c.forEach((T, I) => {
    const R = v + I * p;
    C(T, R, "fill");
  }), h.restore(), h.restore(), u;
}, zi = (e, t, i) => {
  y.fallbacks++, t.save(), t.font = G(e);
  const s = O(e.opacity), n = i ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, l = e.y + e.fontSize, d = ne(e, t, t, "fallback", n), u = Z(e.color, s), h = e.renderStyle === "outline-only", o = h ? { blur: 0, alpha: 0 } : te(e.shadowIntensity, e.fontSize, s);
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
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${o.alpha})`, t.shadowBlur = o.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = ie(), t.strokeStyle = se(e), t.fillStyle = u, h && a.forEach((f, c) => {
    const p = l + c * r;
    d(f, p, "outline");
  }), a.forEach((f, c) => {
    const p = l + c * r;
    d(f, p, "fill");
  }), t.restore(), t.restore();
}, Xi = (e, t, i) => {
  try {
    if (!e.isActive || !t)
      return;
    const s = Vi(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== s || !n) {
      y.misses++, y.creates++;
      const r = Wi(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(s);
    } else
      y.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = i ?? e.x, { paddingX: l, paddingY: d } = Fe(e), u = Ai(e), h = Di(e, a, r, l, u), o = h.x, f = e.y - d;
      h.scaleX === 1 && h.scaleY === 1 ? t.drawImage(a, o, f) : t.drawImage(
        a,
        o,
        f,
        a.width * h.scaleX,
        a.height * h.scaleY
      ), K("drawImage", t, e, {
        x: o,
        y: f,
        width: a.width * h.scaleX,
        height: a.height * h.scaleY,
        sourceWidth: a.width,
        sourceHeight: a.height,
        meta: {
          statsTarget: "cache",
          paddingX: l,
          paddingY: d,
          drawScale: u,
          drawScaleX: h.scaleX,
          drawScaleY: h.scaleY
        }
      }), ve();
      return;
    }
    zi(e, t, i), ve();
  } catch (s) {
    Q.error("Comment.draw", s, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: i
    });
  }
}, Ui = (e) => e === "ltr" ? "ltr" : "rtl", Bi = (e) => e === "ltr" ? 1 : -1;
class Gi {
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
    const r = it(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.size = r.size, this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.isFull = r.isFull, this.isEnder = r.isEnder, this.fontFamily = r.fontFamily, this.fontWeight = r.fontWeight, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = a.timeSource ?? Le(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, i, s, n) {
    Qt(this, t, i, s, n);
  }
  draw(t, i = null) {
    Xi(this, t, i);
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
      Q.error("Comment.update", s, {
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
      return O(this.opacityOverride);
    const i = t * this.opacityMultiplier;
    return Number.isFinite(i) ? O(i) : 0;
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
    const i = Ui(t);
    this.scrollDirection = i, this.directionSign = Bi(i);
  }
}
const Yi = 6e3, U = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: Yi,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, Jn = U, $i = () => ({
  ...U,
  ngWords: [...U.ngWords],
  ngRegexps: [...U.ngRegexps]
}), Qn = "v3.1.9", qi = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, X = (e) => {
  const t = e.scrollVisibleDurationMs, i = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: qi(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: i,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, Ki = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(Number(t))
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, ji = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Zi = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, Te = (e) => e.isScrolling && e.isFull && e.text.includes(`
`) && e.commands.some((t) => t.toLowerCase() === "mincho"), Ji = (e) => {
  const t = /* @__PURE__ */ new Set();
  e.forEach((i) => {
    i.isEnder && Te(i) && t.add(i.vposMs);
  }), e.forEach((i) => {
    i.hasSameVposFullMinchoEnder = t.has(i.vposMs) && Te(i);
  });
}, Qi = function(e) {
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
    const l = at(n);
    if (l === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), _("comment-skip-invalid-vpos", { preview: r, vposMs: n });
      continue;
    }
    if (this.comments.some(
      (h) => h.text === s && h.vposMs === l
    ) || t.some((h) => h.text === s && h.vposMs === l)) {
      _("comment-skip-duplicate", { preview: r, vposMs: l });
      continue;
    }
    const u = new Gi(
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
  return t.length === 0 ? [] : (this.comments.push(...t), Ji(this.comments), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    return Math.abs(n) > b ? n : i.creationIndex - s.creationIndex;
  }), t);
}, es = function(e, t, i = []) {
  const [s] = this.addComments([{ text: e, vposMs: t, commands: i }]);
  return s ?? null;
}, ts = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, i);
  }
}, is = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Pe = function() {
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
}, ss = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, ns = (e) => {
  e.prototype.addComments = Qi, e.prototype.addComment = es, e.prototype.clearComments = ts, e.prototype.resetState = is, e.prototype.rebuildNgMatchers = Pe, e.prototype.isNGComment = ss;
}, as = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, rs = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, ni(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, os = function(e) {
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
  if (si(e, i), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(i);
    } catch (s) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
    }
  this.lastSnapshotEmitTime = t;
}, ls = function(e) {
  this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  return t !== void 0 ? t : Re(e);
}, Re = (e) => {
  if (!e.isScrolling)
    return e.vposMs;
  const t = e.isFull ? gt : pt;
  return Math.max(0, e.vposMs - t);
}, hs = function(e) {
  if (!e.isScrolling)
    return N;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : J;
}, cs = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), Re(e);
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const i = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, i), i;
}, us = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + H, i = Math.max(e + H, t), s = this.comments.filter((u) => u.hasShown || u.isInvisible || this.isNGComment(u.text) ? !1 : u.vposMs >= e - w).sort((u, h) => {
    const o = u.vposMs - h.vposMs;
    return Math.abs(o) > b ? o : u.creationIndex - h.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(i - e, H) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : $, l = Math.max($, Math.min(r, ut));
  let d = e;
  s.forEach((u, h) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(u)), f = i - o;
    let c = Math.max(e, Math.min(d, f));
    Number.isFinite(c) || (c = e);
    const p = dt * h;
    c + p <= f && (c += p), this.finalPhaseVposOverrides.set(u, c);
    const v = Math.max($, Math.min(o / 2, l));
    d = c + v;
  }), this.finalPhaseScheduleDirty = !1;
}, ds = (e) => {
  e.prototype.resetFinalPhaseState = as, e.prototype.incrementEpoch = rs, e.prototype.emitStateSnapshot = os, e.prototype.getEffectiveCommentVpos = ls, e.prototype.getFinalPhaseDisplayDuration = hs, e.prototype.resolveFinalPhaseVpos = cs, e.prototype.recomputeFinalPhaseTimeline = us;
}, fs = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= P;
}, ps = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > P) && (this.playbackHasBegun = !0);
}, gs = (e) => {
  e.prototype.shouldSuppressRendering = fs, e.prototype.updatePlaybackProgressState = ps;
}, vs = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : m(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, d = this.buildPrepareOptions(r), u = this.duration > 0 && this.duration - this.currentTime <= ct;
  u && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, l), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !u && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const o of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(o), c = f < this.currentTime - w, p = f > this.currentTime + w;
    if (c || p) {
      o.isActive = !1, this.activeComments.delete(o), o.clearActivation(), o.lane >= 0 && (o.layout === "ue" ? this.releaseStaticLane("ue", o.lane) : o.layout === "shita" && this.releaseStaticLane("shita", o.lane));
      continue;
    }
    o.isScrolling && o.hasShown && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
  }
  const h = this.getCommentsInTimeWindow(this.currentTime, w);
  for (const o of h) {
    const f = A(), c = f ? W(o.text) : "";
    if (f && _("comment-evaluate", {
      stage: "update",
      preview: c,
      vposMs: o.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(o),
      currentTime: this.currentTime,
      isActive: o.isActive,
      hasShown: o.hasShown
    }), this.isNGComment(o.text)) {
      f && _("comment-eval-skip", {
        preview: c,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "ng-runtime"
      });
      continue;
    }
    if (o.isInvisible) {
      f && _("comment-eval-skip", {
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
      d,
      this.currentTime
    ), o.isActive) {
      if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
        continue;
      }
      if (o.layout === "naka" && this.getEffectiveCommentVpos(o) > this.currentTime + P) {
        o.x = o.virtualStartX, o.lastUpdateTime = this.timeSource.now();
        continue;
      }
      if (o.hasShown = !0, o.update(this.playbackRate, !this.isPlaying), !o.isScrolling && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
      }
    }
  }
}, Ss = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = J, s = re;
  return t !== null && (i = t, s = Math.max(1, Math.min(t, re))), {
    visibleWidth: e,
    virtualExtension: ft,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: rt,
    bufferRatio: ot,
    baseBufferPx: lt,
    entryBufferPx: ht
  };
}, ys = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t);
  for (const a of i)
    if (this.isLaneAvailable(a, s, t))
      return this.storeLaneReservation(a, s), a;
  const n = i[0] ?? 0;
  return this.storeLaneReservation(n, s), n;
}, Cs = (e) => {
  e.prototype.updateComments = vs, e.prototype.buildPrepareOptions = Ss, e.prototype.findAvailableLane = ys;
}, Ms = function(e, t) {
  let i = 0, s = e.length;
  for (; i < s; ) {
    const n = Math.floor((i + s) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + B <= t ? i = n + 1 : s = n;
  }
  return i;
}, Is = function(e) {
  for (const [t, i] of this.reservedLanes.entries()) {
    const s = this.findFirstValidReservationIndex(i, e);
    s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
  }
}, _s = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
}, Ts = (e) => {
  e.prototype.findFirstValidReservationIndex = Ms, e.prototype.pruneLaneReservations = Is, e.prototype.pruneStaticLaneReservations = _s;
}, Es = function(e) {
  let t = 0, i = this.comments.length;
  for (; t < i; ) {
    const s = Math.floor((t + i) / 2), n = this.comments[s];
    n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
  }
  return t;
}, bs = function(e, t) {
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
}, Ls = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, ms = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, ws = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, xs = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, Fs = (e) => {
  const t = Math.ceil(
    e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
  );
  return Math.max(0, (t - e.height) / 2);
}, Os = function(e, t, i, s) {
  const n = Math.max(1, i), a = Math.max(s.height, s.fontSize), r = 5, l = 0, d = Fs(s);
  if (e === "ue") {
    const c = r + d;
    let p = c;
    const C = this.getStaticReservations(e).filter((S) => S.lane < t).sort((S, g) => S.lane - g.lane);
    for (const S of C) {
      const g = S.yEnd - S.yStart;
      p += g + l;
    }
    const M = Math.max(r, n * 2);
    return Math.max(c, Math.min(p, M));
  }
  let u = n - r;
  const o = this.getStaticReservations(e).filter((c) => c.lane < t).sort((c, p) => c.lane - p.lane);
  for (const c of o) {
    const p = c.yEnd - c.yStart;
    u -= p + l;
  }
  const f = u - a;
  return Math.max(r, f);
}, As = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, Ps = (e) => {
  e.prototype.findCommentIndexAtOrAfter = Es, e.prototype.getCommentsInTimeWindow = bs, e.prototype.getStaticReservations = Ls, e.prototype.getStaticLaneDepth = ms, e.prototype.getStaticLaneLimit = ws, e.prototype.getGlobalLaneIndexForBottom = xs, e.prototype.resolveStaticCommentOffset = Os, e.prototype.getStaticReservedLaneSet = As;
}, Rs = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, Ne = (e) => Math.max(1, e.fontSize * (Rs(e) ? 0.46 : 1)), Ns = function(e, t, i = "") {
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
  }), !1) : n > t + P ? (s && _("comment-eval-pending", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "future",
    currentTime: t
  }), !1) : n < t - w ? (s && _("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "expired-window",
    currentTime: t
  }), !1) : (s && _("comment-eval-ready", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    currentTime: t
  }), !0);
}, Ds = function(e, t, i, s, n, a) {
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
      const c = this.duration > 0 ? this.duration : this.finalPhaseStartTime + H, p = Math.max(
        this.finalPhaseStartTime + H,
        c
      ), v = e.width + i, C = v > 0 ? v / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + C > p) {
        const S = p - a, g = Math.max(0, S) * e.speedPixelsPerMs, T = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - d, i - g) : Math.min(e.virtualStartX + d, g - e.width);
        e.x = T;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - d : e.virtualStartX + d;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - d : e.virtualStartX + d;
    const u = this.findAvailableLane(e);
    e.lane = u;
    const h = Math.max(1, this.laneHeight), o = Math.max(0, s - e.height), f = u * h;
    e.y = e.isFull ? 0 : Math.max(0, Math.min(f, o));
  } else {
    const l = e.layout === "ue" ? "ue" : "shita", d = this.assignStaticLane(l, e, s, a), u = this.resolveStaticCommentOffset(
      l,
      d,
      s,
      e
    );
    e.x = e.virtualStartX, e.y = u, e.lane = l === "ue" ? d : this.getGlobalLaneIndexForBottom(d), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = N;
    const h = a + e.visibleDurationMs;
    this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = h, this.reserveStaticLane(l, e, d, h), A() && _("comment-activate-static", {
      preview: W(e.text),
      lane: e.lane,
      position: l,
      displayEnd: h,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, Vs = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = Ne(t), r = Math.max(1, a), l = Math.max(
    this.laneCount,
    Math.ceil(Math.max(1, i) / r) + n.length + 1
  ), d = Array.from({ length: l }, (o, f) => f);
  for (const o of d) {
    const f = this.resolveStaticCommentOffset(e, o, i, t), c = f, p = f + a;
    if (!n.some((C) => C.releaseTime > s ? !(p <= C.yStart || c >= C.yEnd) : !1))
      return o;
  }
  let u = d[0] ?? 0, h = Number.POSITIVE_INFINITY;
  for (const o of n)
    o.releaseTime < h && (h = o.releaseTime, u = o.lane);
  return u;
}, Hs = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = t.y, r = t.y + Ne(t);
  n.push({
    comment: t,
    releaseTime: s,
    yStart: a,
    yEnd: r,
    lane: i
  });
}, ks = function(e, t) {
  if (t < 0)
    return;
  const i = this.getStaticReservations(e), s = i.findIndex((n) => n.lane === t);
  s >= 0 && i.splice(s, 1);
}, Ws = (e) => {
  e.prototype.shouldActivateCommentAtTime = Ns, e.prototype.activateComment = Ds, e.prototype.assignStaticLane = Vs, e.prototype.reserveStaticLane = Hs, e.prototype.releaseStaticLane = ks;
}, zs = function(e) {
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
}, Xs = function(e, t) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return t;
  const s = this.findFirstValidReservationIndex(i, t), n = i[s];
  return n ? Math.max(t, n.endTime + B) : t;
}, Us = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, b), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + B, l = a + e.totalDurationMs + B;
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
}, Bs = function(e, t, i) {
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
}, Gs = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, Ys = function(e, t) {
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
}, $s = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, qs = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, Ks = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < b)
    return null;
  const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, js = (e) => {
  e.prototype.getLanePriorityOrder = zs, e.prototype.getLaneNextAvailableTime = Xs, e.prototype.createLaneReservation = Us, e.prototype.isLaneAvailable = Bs, e.prototype.storeLaneReservation = Gs, e.prototype.areReservationsConflicting = Ys, e.prototype.computeForwardGap = $s, e.prototype.getBufferedEdges = qs, e.prototype.solveLeftRightEqualityTime = Ks;
}, Zs = function() {
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
      const h = this.getEffectiveCommentVpos(d), o = this.getEffectiveCommentVpos(u), f = h - o;
      return Math.abs(f) > b ? f : d.isScrolling !== u.isScrolling ? d.isScrolling ? 1 : -1 : d.creationIndex - u.creationIndex;
    }), r.forEach((d) => {
      const h = this.isPlaying && !d.isPaused ? d.x + d.getDirectionSign() * d.speed * l : d.x;
      d.draw(t, h);
    });
  }
  this.lastDrawTime = a;
}, Js = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : m(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, d = this.buildPrepareOptions(r);
  this.getCommentsInTimeWindow(this.currentTime, w).forEach((h) => {
    if (this.isNGComment(h.text) || h.isInvisible) {
      h.isActive = !1, this.activeComments.delete(h), h.clearActivation();
      return;
    }
    if (h.syncWithSettings(this._settings, this.settingsVersion), h.isActive = !1, this.activeComments.delete(h), h.lane = -1, h.clearActivation(), this.shouldActivateCommentAtTime(h, this.currentTime)) {
      this.activateComment(
        h,
        s,
        r,
        l,
        d,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(h) < this.currentTime - w ? h.hasShown = !0 : h.hasShown = !1;
  });
}, Qs = (e) => {
  e.prototype.draw = Zs, e.prototype.performInitialSync = Js;
}, en = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, tn = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, sn = function(e, t) {
  this.videoFrameHandle = null;
  const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
}, nn = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, an = function() {
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
}, rn = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, on = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, ln = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, hn = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, cn = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  if (!e || !t || !i)
    return;
  const s = m(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
  if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
    this.currentTime = s, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
    return;
  }
  const l = n > P;
  if (this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !l) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const d = this.canvasDpr > 0 ? this.canvasDpr : 1, u = this.displayWidth > 0 ? this.displayWidth : e.width / d, h = this.displayHeight > 0 ? this.displayHeight : e.height / d, o = this.buildPrepareOptions(u);
  this.getCommentsInTimeWindow(this.currentTime, w).forEach((c) => {
    const p = A(), v = p ? W(c.text) : "";
    if (p && _("comment-evaluate", {
      stage: "seek",
      preview: v,
      vposMs: c.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(c),
      currentTime: this.currentTime,
      isActive: c.isActive,
      hasShown: c.hasShown
    }), this.isNGComment(c.text)) {
      p && _("comment-eval-skip", {
        preview: v,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "ng-runtime"
      }), c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
      return;
    }
    if (c.isInvisible) {
      p && _("comment-eval-skip", {
        preview: v,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "invisible"
      }), c.isActive = !1, this.activeComments.delete(c), c.hasShown = !0, c.clearActivation();
      return;
    }
    if (c.syncWithSettings(this._settings, this.settingsVersion), c.isActive = !1, this.activeComments.delete(c), c.lane = -1, c.clearActivation(), this.shouldActivateCommentAtTime(c, this.currentTime, v)) {
      this.activateComment(
        c,
        t,
        u,
        h,
        o,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(c) < this.currentTime - w ? c.hasShown = !0 : c.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, un = (e) => {
  e.prototype.processFrame = en, e.prototype.handleAnimationFrame = tn, e.prototype.handleVideoFrame = sn, e.prototype.shouldUseVideoFrameCallback = nn, e.prototype.scheduleNextFrame = an, e.prototype.cancelAnimationFrameRequest = rn, e.prototype.cancelVideoFrameCallback = on, e.prototype.startAnimation = ln, e.prototype.stopAnimation = hn, e.prototype.onSeek = cn;
}, dn = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, fn = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, pn = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, i = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(i ?? null, t);
    this.videoElement = t, this.containerElement = s, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? m(t.duration) : 0, this.currentTime = m(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.right = "0", n.style.bottom = "0", n.style.display = "block", n.style.pointerEvents = "none", n.style.zIndex = "2147483647";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, gn = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, vn = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, Sn = (e) => {
  e.prototype.resolveContainer = dn, e.prototype.ensureContainerPositioning = fn, e.prototype.initialize = pn, e.prototype.destroy = gn, e.prototype.destroyCanvasOnly = vn;
}, yn = function(e) {
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
      this.duration = Number.isFinite(e.duration) ? m(e.duration) : 0;
    }, d = () => {
      this.handleVideoSourceChange();
    }, u = () => {
      this.handleVideoStalled();
    }, h = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", l), e.addEventListener("emptied", d), e.addEventListener("waiting", u), e.addEventListener("canplay", h), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", d)), this.addCleanup(() => e.removeEventListener("waiting", u)), this.addCleanup(() => e.removeEventListener("canplay", h)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, Cn = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, Mn = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
  t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, In = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = m(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, _n = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, Tn = function(e) {
  this.duration = Number.isFinite(e.duration) ? m(e.duration) : 0, this.currentTime = m(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.lastDrawTime = this.timeSource.now();
}, En = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, bn = function(e, t) {
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
}, Ln = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, mn = (e) => {
  e.prototype.setupVideoEventListeners = yn, e.prototype.handleVideoMetadataLoaded = Cn, e.prototype.handleVideoStalled = Mn, e.prototype.handleVideoCanPlay = In, e.prototype.handleVideoSourceChange = _n, e.prototype.syncVideoState = Tn, e.prototype.resetCommentActivity = En, e.prototype.setupVideoChangeDetection = bn, e.prototype.extractVideoElement = Ln;
}, wn = function() {
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
}, xn = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  !e || !t || !i || (this.currentTime = m(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, Fn = function(e) {
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
}, On = (e) => {
  e.prototype.setupVisibilityHandling = wn, e.prototype.handleVisibilityRestore = xn, e.prototype.setCommentVisibility = Fn;
}, An = 2.525, Pn = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const a = i.getBoundingClientRect(), r = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : s.width / r, d = this.displayHeight > 0 ? this.displayHeight : s.height / r, u = e ?? a.width ?? l, h = t ?? a.height ?? d;
  if (!Number.isFinite(u) || !Number.isFinite(h) || u <= 0 || h <= 0)
    return;
  const o = Math.max(1, Math.floor(u)), f = Math.max(1, Math.floor(h)), c = this.displayWidth > 0 ? this.displayWidth : o, p = this.displayHeight > 0 ? this.displayHeight : f, v = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, C = Math.max(1, Math.round(o * v)), M = Math.max(1, Math.round(f * v));
  if (!(this.displayWidth !== o || this.displayHeight !== f || Math.abs(this.canvasDpr - v) > Number.EPSILON || s.width !== C || s.height !== M))
    return;
  this.displayWidth = o, this.displayHeight = f, this.canvasDpr = v, s.width = C, s.height = M, s.style.width = `${o}px`, s.style.height = `${f}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(v, v));
  const g = c > 0 ? o / c : 1, T = p > 0 ? f / p : 1;
  (g !== 1 || T !== 1) && this.comments.forEach((I) => {
    I.isActive && (I.x *= g, I.y *= T, I.width *= g, I.fontSize = Math.max(
      we,
      Math.floor(Math.max(1, I.fontSize) * T)
    ), I.height = I.fontSize, I.virtualStartX *= g, I.exitThreshold *= g, I.baseSpeed *= g, I.speed *= g, I.speedPixelsPerMs *= g, I.bufferWidth *= g, I.reservationWidth *= g);
  }), this.calculateLaneMetrics();
}, Rn = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, Nn = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(we, Math.floor(t * (27 / 665)));
  this.laneHeight = i * An;
  const s = Math.floor(t / Math.max(this.laneHeight, 1));
  if (this._settings.useFixedLaneCount) {
    const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : me, a = Math.max(oe, Math.min(s, n));
    this.laneCount = a;
  } else
    this.laneCount = Math.max(oe, s);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, Dn = function(e) {
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
}, Vn = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, Hn = (e) => {
  e.prototype.resize = Pn, e.prototype.resolveDevicePixelRatio = Rn, e.prototype.calculateLaneMetrics = Nn, e.prototype.setupResizeHandling = Dn, e.prototype.cleanupResizeHandling = Vn;
}, kn = function() {
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
}, Wn = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, zn = async function() {
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
}, Xn = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, Un = function(e, t, i) {
  return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
}, Bn = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, Gn = (e) => {
  e.prototype.setupFullscreenHandling = kn, e.prototype.resolveResizeObserverTarget = Wn, e.prototype.handleFullscreenChange = zn, e.prototype.resolveFullscreenContainer = Xn, e.prototype.resolveActiveOverlayContainer = Un, e.prototype.getFullscreenElement = Bn;
}, Yn = function(e) {
  this.cleanupTasks.push(e);
}, $n = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, qn = (e) => {
  e.prototype.addCleanup = Yn, e.prototype.runCleanupTasks = $n;
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
  laneCount = me;
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
    Pe.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (Zi(t))
      s = X({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = X($i());
    }
    this._settings = X(s), this.timeSource = n.timeSource ?? Le(), this.animationFrameProvider = n.animationFrameProvider ?? Ki(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? ji(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = xe(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && ti(n.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(t) {
    this._settings = X(t), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
ns(E);
ds(E);
gs(E);
Cs(E);
Ts(E);
Ps(E);
Ws(E);
js(E);
Qs(E);
un(E);
Sn(E);
mn(E);
On(E);
Hn(E);
Gn(E);
qn(E);
const Kn = (e) => ({
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
}), jn = (e) => {
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
}, ea = (e, t, i = {}) => {
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
    canvas: jn(e),
    activeComments: Array.from(e.activeComments, Kn),
    records: s
  };
};
export {
  Qn as COMMENT_OVERLAY_VERSION,
  Gi as Comment,
  E as CommentRenderer,
  Jn as DEFAULT_RENDERER_SETTINGS,
  ea as captureRendererCalibrationFrame,
  $i as cloneDefaultSettings,
  ti as configureDebugLogging,
  Ki as createDefaultAnimationFrameProvider,
  Le as createDefaultTimeSource,
  xe as createLogger,
  _ as debugLog,
  si as dumpRendererState,
  A as isDebugLoggingEnabled,
  ni as logEpochChange,
  Zn as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
