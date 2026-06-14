const lt = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, ht = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"游明朝体","游明朝","Yu Mincho",YuMincho,yumincho,YuMin-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic'
}, ct = {
  defont: "600",
  gothic: "",
  mincho: ""
}, ze = {
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
}, ie = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, ut = /^[,.:;]+/, dt = /[,.:;]+$/, ft = (e) => {
  const t = e.trim();
  return t ? ie.test(t) ? t : t.replace(ut, "").replace(dt, "") : "";
}, pt = (e) => ie.test(e) ? e.toUpperCase() : null, We = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const i = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, s = Number.parseFloat(i);
  return Number.isFinite(s) ? s : null;
}, gt = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return We(t);
}, vt = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, St = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), Ct = (e) => e === "naka" || e === "ue" || e === "shita", yt = (e) => e === "small" || e === "medium" || e === "big", _t = (e) => e === "defont" || e === "gothic" || e === "mincho", Mt = (e) => e in ze, It = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, r = 1, l = null, d = !1, u = !1, h = !1, o = 0, f = 1;
  for (const C of e) {
    const M = ft(typeof C == "string" ? C : "");
    if (!M)
      continue;
    if (ie.test(M)) {
      const y = pt(M);
      if (y) {
        a = y;
        continue;
      }
    }
    const g = M.toLowerCase();
    if (Ct(g)) {
      i = g;
      continue;
    }
    if (yt(g)) {
      s = g;
      continue;
    }
    if (_t(g)) {
      n = g;
      continue;
    }
    if (Mt(g)) {
      a = ze[g].toUpperCase();
      continue;
    }
    if (g === "_live") {
      l = 0.5;
      continue;
    }
    if (g === "invisible") {
      r = 0, d = !0;
      continue;
    }
    if (g === "full") {
      u = !0;
      continue;
    }
    if (g === "ender") {
      h = !0;
      continue;
    }
    if (g.startsWith("ls:") || g.startsWith("letterspacing:")) {
      const y = M.indexOf(":");
      if (y >= 0) {
        const T = We(M.slice(y + 1));
        T !== null && (o = vt(T));
      }
      continue;
    }
    if (g.startsWith("lh:") || g.startsWith("lineheight:")) {
      const y = M.indexOf(":");
      if (y >= 0) {
        const T = gt(M.slice(y + 1));
        T !== null && (f = St(T));
      }
      continue;
    }
  }
  const c = Math.max(0, Math.min(1, r)), p = (a ?? t.defaultColor).toUpperCase(), S = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: i,
    size: s,
    sizeScale: lt[s],
    font: n,
    fontFamily: ht[n],
    fontWeight: ct[n],
    resolvedColor: p,
    colorOverride: a,
    opacityMultiplier: c,
    opacityOverride: S,
    isInvisible: d,
    isFull: u,
    isEnder: h,
    letterSpacing: o,
    lineHeight: f
  };
}, Et = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, U = (e) => e.length === 1 ? e.repeat(2) : e, w = (e) => Number.parseInt(e, 16), A = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, se = (e, t) => {
  const i = Et.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, r, l = 1;
  s.length === 3 || s.length === 4 ? (n = w(U(s[0])), a = w(U(s[1])), r = w(U(s[2])), s.length === 4 && (l = w(U(s[3])) / 255)) : (n = w(s.slice(0, 2)), a = w(s.slice(2, 4)), r = w(s.slice(4, 6)), s.length === 8 && (l = w(s.slice(6, 8)) / 255));
  const d = A(l * A(t));
  return `rgba(${n}, ${a}, ${r}, ${d})`;
}, Tt = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), Xe = () => Tt(), L = (e) => e * 1e3, Lt = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), ne = 6e3, de = 2700, mt = 3, bt = 0.25, Ft = 32, wt = 48, $ = 120, xt = 6e3, Z = 120, Ot = 800, At = 2, z = 6e3, x = 3e3, b = x + ne, Rt = 240, Pt = 2e3, fe = 1, Ue = 12, Nt = 24, E = 1e-3, P = 50, Dt = 2300, pe = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, Vt = (e, t, i) => {
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
}, Be = (e, t = {}) => {
  const { level: i = "info", emitter: s = Vt } = t, n = pe[i], a = (r, l) => {
    pe[r] < n || s(r, e, l);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, ae = Be("CommentEngine:Comment"), ge = /* @__PURE__ */ new WeakMap(), Ht = (e) => {
  let t = ge.get(e);
  return t || (t = /* @__PURE__ */ new Map(), ge.set(e, t)), t;
}, re = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = Ht(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(s, r), r;
}, q = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, kt = 27 / 665, H = 665, zt = 12, Wt = "  ", Xt = 1252 / 597.38330078125, k = [
  366 / H,
  510 / H,
  1662 / H
], Ut = 566 / H, Bt = 806 / 665, Gt = 808 / 665, ve = 1176 / 665, Se = 900 / 665, Yt = 1126 / 665, Ce = 810 / 665, $t = 1126 / 665, ye = 1046 / 665, _e = 1254 / 665, qt = 1140 / 665, Kt = 878 / 665, jt = 0.25, Zt = 160, Jt = 420, Qt = 80, ei = 0.18, ti = 400, ii = 0.2, si = 420, ni = 250, ai = 1.8, ri = 420, oi = 20, li = 0.045, hi = (e) => Math.max(0.01, e / H), O = (e, t) => e * hi(t), ci = (e) => e.replaceAll("	", Wt), Ge = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g, ui = (e) => {
  const t = ci(e);
  if (t.includes(`
`)) {
    const i = t.split(/\r?\n/);
    return i.length > 0 ? i : [""];
  }
  return [t];
}, Me = (e, t = zt) => Math.max(t, e), di = (e, t) => {
  if (e.fontSize >= 35)
    return Math.round(t * Ut);
  const i = e.text.split(/\r?\n/), s = Math.max(0, ...i.map((a) => a.length));
  return e.isEnder && s >= 25 || Math.max(0, ...i.map((a) => (a.match(/\t/g) || []).length)) >= 12 || e.width >= 1200 ? Math.round(t * k[2]) : e.width >= 300 ? Math.round(t * k[1]) : Math.round(t * k[0]);
}, fi = (e, t) => Math.min(
  O(Jt, t),
  Math.max(
    O(Zt, t),
    e * jt
  )
), pi = (e, t) => {
  const i = O(
    ti,
    t
  );
  return Math.min(
    O(si, t),
    O(Qt, t) + e.width * ei + Math.max(0, e.width - i) * ii
  );
}, gi = (e, t) => Math.min(
  O(ri, t),
  Math.max(
    0,
    e.width - O(ni, t)
  ) * ai
), vi = (e) => e.lines.filter((t) => t.replace(Ge, "").length > 0).length, Ie = (e) => e.lines.length > 1 && vi(e) === 1, Si = (e) => e.lines.map((t) => t.replace(Ge, "")).filter((t) => t.length > 0), Ee = (e) => {
  if (e.lines.length <= 1)
    return !1;
  const t = Si(e);
  return t.length === 1 && /^[●○◉◎]+$/u.test(t[0]);
}, B = (e) => e.size === "big" || e.fontSize >= 35, Ci = (e, t) => {
  let i = 0;
  const s = e.letterSpacing;
  for (const r of e.lines) {
    const l = re(t, r), d = r.length > 1 ? s * (r.length - 1) : 0, u = Math.max(0, l + d);
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
}, yi = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1), r = Me(Math.floor(s * kt)), l = Me(Math.floor(r * e.sizeScale));
    if (e.fontSize = l, t.font = q(e), e.lines = ui(e.text), Ci(e, t), e.isScrolling && e.isFull) {
      const m = e.lines.length > 1 && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("游明朝"));
      if (m && e.hasSameVposFullMinchoEnder && !e.isEnder && B(e))
        e.width = Math.round(
          s * (Ee(e) ? ye : $t)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Ce)
        );
      else if (m && e.hasSameVposFullMinchoEnder && e.isEnder && B(e))
        e.width = Math.round(
          s * (Ie(e) ? _e : ve)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Se)
        );
      else if (m && e.hasSameVposFullMinchoEnder && e.isEnder)
        e.width = Math.round(
          s * (Ie(e) ? _e : qt)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Kt)
        );
      else if (m && B(e))
        e.width = Math.round(
          s * (Ee(e) ? ye : ve)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Se)
        );
      else if (m)
        e.width = Math.round(s * Yt), e.height = Math.max(
          e.height,
          Math.round(s * Ce)
        );
      else {
        const V = B(e) ? Gt : Bt;
        e.width = di(e, s), e.height = Math.max(e.height, Math.round(s * V));
      }
    }
    if (!e.isScrolling) {
      const m = a + r * 2.6666666666666665;
      e.width >= m * 0.95 && e.fontSize >= 35 ? e.width = Math.round(s * Xt) : e.width = Math.min(e.width, m), e.bufferWidth = 0;
      const V = (a - e.width) / 2;
      e.virtualStartX = V, e.x = V, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = x, e.preCollisionDurationMs = x, e.totalDurationMs = x, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + x, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const d = re(t, "??".repeat(150)), u = e.width * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, u);
    const h = Math.max(n.entryBufferPx, e.bufferWidth), o = e.scrollDirection, f = Math.min(1, s / H), c = e.isFull ? n.virtualExtension * f : n.virtualExtension, p = e.isFull ? fi(e.width, s) : 0, S = e.isFull ? O(oi, s) + e.width * li : 0, C = e.isFull ? 0 : pi(e, s), M = e.isFull ? 0 : gi(e, s), g = o === "rtl" ? a + c + p + C : -e.width - e.bufferWidth - c - p - C, y = o === "rtl" ? -e.width - e.bufferWidth - h + p - C - M : a + h - p + C + M, T = o === "rtl" ? a + h : -h, N = o === "rtl" ? g + e.width + e.bufferWidth : g - e.bufferWidth;
    e.virtualStartX = g, e.x = g, e.exitThreshold = y;
    const D = a > 0 ? e.width / a : 0, tt = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let K = n.maxVisibleDurationMs;
    if (!tt && D > 1 && !e.isFull) {
      const m = Math.min(D, n.maxWidthRatio), V = n.maxVisibleDurationMs / Math.max(m, 1);
      K = Math.max(n.minVisibleDurationMs, Math.floor(V));
    }
    const it = a + e.width + e.bufferWidth + h + c + S + C * 2 + M, st = Math.max(K, 1), j = it / st, nt = j * 1e3 / 60;
    e.baseSpeed = nt, e.speed = e.baseSpeed, e.speedPixelsPerMs = j;
    const at = Math.abs(y - g), rt = o === "rtl" ? Math.max(0, N - T) : Math.max(0, T - N), ue = Math.max(j, Number.EPSILON);
    e.visibleDurationMs = K, e.preCollisionDurationMs = Math.max(0, Math.ceil(rt / ue)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(at / ue)
    );
    const ot = e.width + e.bufferWidth + h;
    e.reservationWidth = Math.min(d, ot), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
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
}, W = /* @__PURE__ */ new Map(), _i = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return Q;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, Mi = (e) => {
  F.enabled = !!e.enabled, F.maxLogsPerCategory = _i(e.maxLogsPerCategory), F.enabled || W.clear();
}, ga = () => {
  W.clear();
}, R = () => F.enabled, Ii = (e) => {
  const t = W.get(e) ?? 0;
  return t >= F.maxLogsPerCategory ? (t === F.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), W.set(e, t + 1)), !1) : (W.set(e, t + 1), !0);
}, _ = (e, ...t) => {
  F.enabled && Ii(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, X = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, Ei = (e, t) => {
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
}, Ti = (e, t, i) => {
  F.enabled && _("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
}, Te = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, Li = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), mi = (e) => {
  if (typeof e.getTransform != "function")
    return;
  const t = e.getTransform();
  return [t.a, t.b, t.c, t.d, t.e, t.f];
}, bi = (e) => {
  const t = e.canvas;
  return t ? {
    canvasWidth: t.width,
    canvasHeight: t.height
  } : {};
}, Fi = (e) => ({
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
}), ee = (e, t, i, s) => {
  const n = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof n != "function" || n({
    source: "comment-overlay",
    op: e,
    timestampMs: Li(),
    font: t.font,
    fillStyle: Te(t.fillStyle),
    strokeStyle: Te(t.strokeStyle),
    lineWidth: t.lineWidth,
    lineJoin: t.lineJoin,
    globalAlpha: t.globalAlpha,
    shadowColor: t.shadowColor,
    shadowBlur: t.shadowBlur,
    shadowOffsetX: t.shadowOffsetX,
    shadowOffsetY: t.shadowOffsetY,
    transform: mi(t),
    ...bi(t),
    comment: Fi(i),
    ...s
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
}, Le = () => {
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
}, wi = () => typeof OffscreenCanvas < "u", oe = (e, t, i) => {
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
}, le = () => 2.8, Ye = 665, xi = 566, te = 808, me = xi / Ye, be = te / Ye, Oi = 1098, Ai = 1530, Fe = 20.9, we = 58.9, xe = 45.23908523908523 / 39, Ri = 14.9, Pi = 41.9, Ni = 28.92708257149126 / 27, Oe = 20, Ae = 11.4, Re = 31.4, Pe = 23.87692307692307, Di = 2.4, J = 2, Ne = 66.9, De = 55.6, Vi = 59, Hi = 810, ki = 21.5, $e = 878, qe = 900, zi = 10, Wi = 6.75, Xi = 16.75, Ui = 12.11423203055002, Bi = 0.5, Gi = 1.42, Yi = 0.12, $i = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const i = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!i)
    return !1;
  const s = i[1], n = s.length === 3 || s.length === 4, a = (u) => u.length === 1 ? `${u}${u}` : u, r = Number.parseInt(a(n ? s[0] : s.slice(0, 2)), 16), l = Number.parseInt(a(n ? s[1] : s.slice(2, 4)), 16), d = Number.parseInt(a(n ? s[2] : s.slice(4, 6)), 16);
  return r === 0 && l === 0 && d === 0;
}, he = (e) => $i(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", qi = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, Ki = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const i = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + i;
}, Ke = (e) => {
  if (e.isScrolling && e.isFull) {
    if (e.hasSameVposFullMinchoEnder) {
      const l = Math.ceil(e.height);
      return {
        paddingX: Math.max(10, e.fontSize * 0.5),
        paddingY: l >= qe ? Ne : l >= $e ? De : ki,
        textureWidth: Math.ceil(e.width),
        textureHeight: l
      };
    }
    const r = e.hasSameVposFullMinchoEnder && e.isEnder ? e.fontSize >= 35 ? Ne : De : null;
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: r ?? (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + Di,
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
}, ji = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35 ? 0.8 : 1, je = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, Ze = (e) => je(e) && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("YuMincho") || e.fontFamily.includes("游明朝")), Zi = (e, t) => Ze(e) ? Gi : t, Ji = (e) => Math.max(1, e.width + e.virtualStartX * 2), Qi = (e) => e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder ? Vi * Math.min(1, e.height / Hi) : 0, es = (e, t, i, s, n) => {
  const a = Zi(e, n);
  if (Ze(e))
    return {
      x: Ji(e) * Yi,
      scaleX: a,
      scaleY: n
    };
  const r = !e.isScrolling && a !== 1 ? t.width * (1 - a) * Bi : 0;
  return {
    x: i - s + r + Qi(e),
    scaleX: a,
    scaleY: n
  };
}, ce = (e, t, i, s, n) => (a, r, l, d = 0) => {
  if (a.length === 0)
    return;
  const u = n + d, h = () => {
    s === "cache" ? l === "outline" ? v.outlineCallsInCache++ : v.fillCallsInCache++ : l === "outline" ? v.outlineCallsInFallback++ : v.fillCallsInFallback++;
  }, o = (c, p, S) => {
    if (h(), l === "outline") {
      t.strokeText(c, p, r), ee("strokeText", t, e, {
        text: c,
        x: p,
        y: r,
        meta: { statsTarget: s, mode: l, ...S }
      });
      return;
    }
    t.fillText(c, p, r), ee("fillText", t, e, {
      text: c,
      x: p,
      y: r,
      meta: { statsTarget: s, mode: l, ...S }
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
    const S = re(i, p);
    f += S, c < a.length - 1 && (f += e.letterSpacing);
  }
}, ts = (e) => `v8::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.width}::${e.height}::${e.lines.length}`, Ve = (e, t, i) => {
  const s = new OffscreenCanvas(i.width, i.height), n = s.getContext("2d");
  if (!n)
    return null;
  n.save(), n.font = i.sourceFont ? q(e) : qi(e, i.fontSize);
  const a = A(e.opacity), r = se(e.color, a), l = e.renderStyle === "outline-only", d = l ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, i.fontSize, a);
  n.shadowColor = `rgba(0, 0, 0, ${d.alpha})`, n.shadowBlur = d.blur, n.shadowOffsetX = 0, n.shadowOffsetY = 0, n.lineJoin = "round", n.lineWidth = le(), n.strokeStyle = he(e), n.fillStyle = r, typeof i.canvasScale == "number" && n.scale(i.canvasScale, i.canvasScale);
  const u = e.lines.length > 0 ? e.lines : [e.text], h = ce(e, n, t, "cache", i.paddingX);
  return l && u.forEach((o, f) => {
    h(o, i.baselineY + f * i.lineHeight, "outline");
  }), u.forEach((o, f) => {
    h(o, i.baselineY + f * i.lineHeight, "fill");
  }), n.restore(), s;
}, is = (e, t, i) => {
  for (const s of i.traces ?? [])
    Ve(e, t, s);
  return Ve(e, t, i.output);
}, ss = (e, t, i) => {
  if (e.isScrolling && e.isFull && e.fontSize >= 35 && Math.abs(
    t - e.height * (me / be)
  ) <= 2 && Math.abs(
    i - t * (be / me)
  ) <= 3) {
    const n = i / te;
    return {
      traces: [
        {
          width: Math.round(Oi * n),
          height: Math.round(Ai * n),
          fontSize: e.fontSize,
          paddingX: Fe * n,
          baselineY: we * n,
          lineHeight: e.fontSize * xe,
          sourceFont: !0
        }
      ],
      output: {
        width: t,
        height: i,
        fontSize: Oe * n,
        paddingX: Ae * n,
        baselineY: Re * n,
        lineHeight: Pe * n
      }
    };
  }
  if (e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder) {
    if (i <= $e - 1) {
      const n = i / te;
      return {
        output: {
          width: t,
          height: i,
          fontSize: Oe * n,
          paddingX: Ae * n,
          baselineY: Re * n,
          lineHeight: Pe * n,
          canvasScale: J
        }
      };
    }
    return i < qe ? {
      output: {
        width: t,
        height: i,
        fontSize: e.fontSize,
        paddingX: Ri,
        baselineY: Pi,
        lineHeight: e.fontSize * Ni,
        canvasScale: J,
        sourceFont: !0
      }
    } : {
      output: {
        width: t,
        height: i,
        fontSize: e.fontSize,
        paddingX: Fe,
        baselineY: we,
        lineHeight: e.fontSize * xe,
        canvasScale: J,
        sourceFont: !0
      }
    };
  }
  return je(e) ? {
    output: {
      width: t,
      height: i,
      fontSize: zi,
      paddingX: Wi,
      baselineY: Xi,
      lineHeight: Ui
    }
  } : null;
}, ns = (e, t) => {
  if (!wi())
    return null;
  const i = Math.abs(e.letterSpacing) >= Number.EPSILON, s = e.lines.length > 1;
  i && v.letterSpacingComments++, s && v.multiLineComments++, !i && !s && v.normalComments++, v.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: l } = Ke(e), d = ss(e, r, l);
  if (d)
    return is(e, t, d);
  const u = new OffscreenCanvas(r, l), h = u.getContext("2d");
  if (!h)
    return null;
  h.save(), h.font = q(e);
  const o = A(e.opacity), f = n, c = e.lines.length > 0 ? e.lines : [e.text], p = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, S = Ki(e, a), C = ce(e, h, t, "cache", f), M = se(e.color, o), g = e.renderStyle === "outline-only", y = g ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, e.fontSize, o);
  return R() && console.log(
    "[Shadow Debug - Cache]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${y.blur}px`,
    `
  Shadow alpha: ${y.alpha}`,
    `
  Fill style: ${M}`
  ), h.save(), h.shadowColor = `rgba(0, 0, 0, ${y.alpha})`, h.shadowBlur = y.blur, h.shadowOffsetX = 0, h.shadowOffsetY = 0, h.lineJoin = "round", h.lineWidth = le(), h.strokeStyle = he(e), h.fillStyle = M, g && c.forEach((T, N) => {
    const D = S + N * p;
    C(T, D, "outline");
  }), c.forEach((T, N) => {
    const D = S + N * p;
    C(T, D, "fill");
  }), h.restore(), h.restore(), u;
}, as = (e, t, i) => {
  v.fallbacks++, t.save(), t.font = q(e);
  const s = A(e.opacity), n = i ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, l = e.y + e.fontSize, d = ce(e, t, t, "fallback", n), u = se(e.color, s), h = e.renderStyle === "outline-only", o = h ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, e.fontSize, s);
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
  Fill style: ${u}`
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${o.alpha})`, t.shadowBlur = o.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = le(), t.strokeStyle = he(e), t.fillStyle = u, h && a.forEach((f, c) => {
    const p = l + c * r;
    d(f, p, "outline");
  }), a.forEach((f, c) => {
    const p = l + c * r;
    d(f, p, "fill");
  }), t.restore(), t.restore();
}, rs = (e, t, i) => {
  try {
    if (!e.isActive || !t)
      return;
    const s = ts(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== s || !n) {
      v.misses++, v.creates++;
      const r = ns(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(s);
    } else
      v.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = i ?? e.x, { paddingX: l, paddingY: d } = Ke(e), u = ji(e), h = es(e, a, r, l, u), o = h.x, f = e.y - d;
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
          paddingY: d,
          drawScale: u,
          drawScaleX: h.scaleX,
          drawScaleY: h.scaleY
        }
      }), Le();
      return;
    }
    as(e, t, i), Le();
  } catch (s) {
    ae.error("Comment.draw", s, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: i
    });
  }
}, os = (e) => e === "ltr" ? "ltr" : "rtl", ls = (e) => e === "ltr" ? 1 : -1;
class hs {
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
    const r = It(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.size = r.size, this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.isFull = r.isFull, this.isEnder = r.isEnder, this.fontFamily = r.fontFamily, this.fontWeight = r.fontWeight, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = a.timeSource ?? Xe(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, i, s, n) {
    yi(this, t, i, s, n);
  }
  draw(t, i = null) {
    rs(this, t, i);
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
    const i = os(t);
    this.scrollDirection = i, this.directionSign = ls(i);
  }
}
const cs = 6e3, Y = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: cs,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, va = Y, us = () => ({
  ...Y,
  ngWords: [...Y.ngWords],
  ngRegexps: [...Y.ngRegexps]
}), Sa = "v3.1.19", ds = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, G = (e) => {
  const t = e.scrollVisibleDurationMs, i = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: ds(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: i,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, fs = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(Number(t))
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, ps = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), gs = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, He = (e) => e.isScrolling && e.isFull && e.text.includes(`
`) && e.commands.some((t) => t.toLowerCase() === "mincho"), vs = (e) => {
  const t = /* @__PURE__ */ new Set();
  e.forEach((i) => {
    i.isEnder && He(i) && t.add(i.vposMs);
  }), e.forEach((i) => {
    i.hasSameVposFullMinchoEnder = t.has(i.vposMs) && He(i);
  });
}, Ss = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const i of e) {
    const { text: s, vposMs: n, commands: a = [] } = i, r = X(s);
    if (this.isNGComment(s)) {
      _("comment-skip-ng", { preview: r, vposMs: n });
      continue;
    }
    const l = Lt(n);
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
    const u = new hs(
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
  return t.length === 0 ? [] : (this.comments.push(...t), vs(this.comments), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    return Math.abs(n) > E ? n : i.creationIndex - s.creationIndex;
  }), t);
}, Cs = function(e, t, i = []) {
  const [s] = this.addComments([{ text: e, vposMs: t, commands: i }]);
  return s ?? null;
}, ys = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, i);
  }
}, _s = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Je = function() {
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
}, Ms = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, Is = (e) => {
  e.prototype.addComments = Ss, e.prototype.addComment = Cs, e.prototype.clearComments = ys, e.prototype.resetState = _s, e.prototype.rebuildNgMatchers = Je, e.prototype.isNGComment = Ms;
}, Es = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, Ts = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, Ti(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, Ls = function(e) {
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
  if (Ei(e, i), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(i);
    } catch (s) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
    }
  this.lastSnapshotEmitTime = t;
}, ms = function(e) {
  this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  return t !== void 0 ? t : Qe(e);
}, Qe = (e) => {
  if (!e.isScrolling)
    return e.vposMs;
  const t = e.isFull ? Dt : Pt;
  return Math.max(0, e.vposMs - t);
}, bs = function(e) {
  if (!e.isScrolling)
    return x;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : ne;
}, Fs = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), Qe(e);
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const i = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, i), i;
}, ws = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + z, i = Math.max(e + z, t), s = this.comments.filter((u) => u.hasShown || u.isInvisible || this.isNGComment(u.text) ? !1 : u.vposMs >= e - b).sort((u, h) => {
    const o = u.vposMs - h.vposMs;
    return Math.abs(o) > E ? o : u.creationIndex - h.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(i - e, z) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : Z, l = Math.max(Z, Math.min(r, Ot));
  let d = e;
  s.forEach((u, h) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(u)), f = i - o;
    let c = Math.max(e, Math.min(d, f));
    Number.isFinite(c) || (c = e);
    const p = At * h;
    c + p <= f && (c += p), this.finalPhaseVposOverrides.set(u, c);
    const S = Math.max(Z, Math.min(o / 2, l));
    d = c + S;
  }), this.finalPhaseScheduleDirty = !1;
}, xs = (e) => {
  e.prototype.resetFinalPhaseState = Es, e.prototype.incrementEpoch = Ts, e.prototype.emitStateSnapshot = Ls, e.prototype.getEffectiveCommentVpos = ms, e.prototype.getFinalPhaseDisplayDuration = bs, e.prototype.resolveFinalPhaseVpos = Fs, e.prototype.recomputeFinalPhaseTimeline = ws;
}, Os = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= P;
}, As = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > P) && (this.playbackHasBegun = !0);
}, Rs = (e) => {
  e.prototype.shouldSuppressRendering = Os, e.prototype.updatePlaybackProgressState = As;
}, Ps = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, d = this.buildPrepareOptions(r), u = this.duration > 0 && this.duration - this.currentTime <= xt;
  u && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, l), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !u && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const o of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(o), c = f < this.currentTime - b, p = f > this.currentTime + b;
    if (c || p) {
      o.isActive = !1, this.activeComments.delete(o), o.clearActivation(), o.lane >= 0 && (o.layout === "ue" ? this.releaseStaticLane("ue", o.lane) : o.layout === "shita" && this.releaseStaticLane("shita", o.lane));
      continue;
    }
    o.isScrolling && o.hasShown && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
  }
  const h = this.getCommentsInTimeWindow(this.currentTime, b);
  for (const o of h) {
    const f = R(), c = f ? X(o.text) : "";
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
}, Ns = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = ne, s = de;
  return t !== null && (i = t, s = Math.max(1, Math.min(t, de))), {
    visibleWidth: e,
    virtualExtension: Rt,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: mt,
    bufferRatio: bt,
    baseBufferPx: Ft,
    entryBufferPx: wt
  };
}, Ds = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t);
  for (const a of i)
    if (this.isLaneAvailable(a, s, t))
      return this.storeLaneReservation(a, s), a;
  const n = i[0] ?? 0;
  return this.storeLaneReservation(n, s), n;
}, Vs = (e) => {
  e.prototype.updateComments = Ps, e.prototype.buildPrepareOptions = Ns, e.prototype.findAvailableLane = Ds;
}, Hs = function(e, t) {
  let i = 0, s = e.length;
  for (; i < s; ) {
    const n = Math.floor((i + s) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + $ <= t ? i = n + 1 : s = n;
  }
  return i;
}, ks = function(e) {
  for (const [t, i] of this.reservedLanes.entries()) {
    const s = this.findFirstValidReservationIndex(i, e);
    s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
  }
}, zs = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
}, Ws = (e) => {
  e.prototype.findFirstValidReservationIndex = Hs, e.prototype.pruneLaneReservations = ks, e.prototype.pruneStaticLaneReservations = zs;
}, Xs = function(e) {
  let t = 0, i = this.comments.length;
  for (; t < i; ) {
    const s = Math.floor((t + i) / 2), n = this.comments[s];
    n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
  }
  return t;
}, Us = function(e, t) {
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
}, Bs = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, Gs = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, Ys = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, $s = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, qs = (e) => {
  const t = Math.ceil(
    e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
  );
  return Math.max(0, (t - e.height) / 2);
}, Ks = function(e, t, i, s) {
  const n = Math.max(1, i), a = Math.max(s.height, s.fontSize), r = 5, l = 0, d = qs(s);
  if (e === "ue") {
    const c = r + d;
    let p = c;
    const C = this.getStaticReservations(e).filter((g) => g.lane < t).sort((g, y) => g.lane - y.lane);
    for (const g of C) {
      const y = g.yEnd - g.yStart;
      p += y + l;
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
}, js = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, Zs = (e) => {
  e.prototype.findCommentIndexAtOrAfter = Xs, e.prototype.getCommentsInTimeWindow = Us, e.prototype.getStaticReservations = Bs, e.prototype.getStaticLaneDepth = Gs, e.prototype.getStaticLaneLimit = Ys, e.prototype.getGlobalLaneIndexForBottom = $s, e.prototype.resolveStaticCommentOffset = Ks, e.prototype.getStaticReservedLaneSet = js;
}, Js = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, et = (e) => Math.max(1, e.fontSize * (Js(e) ? 0.46 : 1)), Qs = function(e, t, i = "") {
  const s = i.length > 0 && R(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - E ? (s && _("comment-eval-skip", {
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
  }), !1) : n < t - b ? (s && _("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "expired-window",
    currentTime: t
  }), !1) : !e.isScrolling && n + x <= t ? (s && _("comment-eval-skip", {
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
}, en = function(e, t, i, s, n, a) {
  e.prepare(t, i, s, n);
  const r = this.resolveFinalPhaseVpos(e);
  if (R() && _("comment-prepared", {
    preview: X(e.text),
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
      const c = this.duration > 0 ? this.duration : this.finalPhaseStartTime + z, p = Math.max(
        this.finalPhaseStartTime + z,
        c
      ), S = e.width + i, C = S > 0 ? S / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + C > p) {
        const g = p - a, y = Math.max(0, g) * e.speedPixelsPerMs, T = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - d, i - y) : Math.min(e.virtualStartX + d, y - e.width);
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
    e.x = e.virtualStartX, e.y = u, e.lane = l === "ue" ? d : this.getGlobalLaneIndexForBottom(d), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0;
    const h = r + x;
    e.visibleDurationMs = Math.max(0, h - a), this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = h, this.reserveStaticLane(l, e, d, h), R() && _("comment-activate-static", {
      preview: X(e.text),
      lane: e.lane,
      position: l,
      displayEnd: h,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, tn = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = et(t), r = Math.max(1, a), l = Math.max(
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
}, sn = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = t.y, r = t.y + et(t);
  n.push({
    comment: t,
    releaseTime: s,
    yStart: a,
    yEnd: r,
    lane: i
  });
}, nn = function(e, t) {
  if (t < 0)
    return;
  const i = this.getStaticReservations(e), s = i.findIndex((n) => n.lane === t);
  s >= 0 && i.splice(s, 1);
}, an = (e) => {
  e.prototype.shouldActivateCommentAtTime = Qs, e.prototype.activateComment = en, e.prototype.assignStaticLane = tn, e.prototype.reserveStaticLane = sn, e.prototype.releaseStaticLane = nn;
}, rn = function(e) {
  const i = Array.from({ length: this.laneCount }, (r, l) => l).sort((r, l) => {
    const d = this.getLaneNextAvailableTime(r, e), u = this.getLaneNextAvailableTime(l, e);
    return Math.abs(d - u) <= E ? r - l : d - u;
  }), s = this.getStaticReservedLaneSet();
  if (s.size === 0)
    return i;
  const n = i.filter((r) => !s.has(r));
  if (n.length === 0)
    return i;
  const a = i.filter((r) => s.has(r));
  return [...n, ...a];
}, on = function(e, t) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return t;
  const s = this.findFirstValidReservationIndex(i, t), n = i[s];
  return n ? Math.max(t, n.endTime + $) : t;
}, ln = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, E), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + $, l = a + e.totalDurationMs + $;
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
}, hn = function(e, t, i) {
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
}, cn = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, un = function(e, t) {
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
    const d = this.computeForwardGap(e, t, l), u = this.computeForwardGap(t, e, l);
    if (d <= E && u <= E)
      return !0;
  }
  return !1;
}, dn = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, fn = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, pn = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < E)
    return null;
  const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, gn = (e) => {
  e.prototype.getLanePriorityOrder = rn, e.prototype.getLaneNextAvailableTime = on, e.prototype.createLaneReservation = ln, e.prototype.isLaneAvailable = hn, e.prototype.storeLaneReservation = cn, e.prototype.areReservationsConflicting = un, e.prototype.computeForwardGap = dn, e.prototype.getBufferedEdges = fn, e.prototype.solveLeftRightEqualityTime = pn;
}, vn = function() {
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
      return Math.abs(f) > E ? f : d.isScrolling !== u.isScrolling ? d.isScrolling ? 1 : -1 : d.creationIndex - u.creationIndex;
    }), r.forEach((d) => {
      const h = this.isPlaying && !d.isPaused ? d.x + d.getDirectionSign() * d.speed * l : d.x;
      d.draw(t, h);
    });
  }
  this.lastDrawTime = a;
}, Sn = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, d = this.buildPrepareOptions(r);
  this.activeComments.forEach((h) => {
    h.isActive = !1, h.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.getCommentsInTimeWindow(this.currentTime, b).forEach((h) => {
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
        d,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(h) < this.currentTime - b ? h.hasShown = !0 : h.hasShown = !1;
  });
}, Cn = (e) => {
  e.prototype.draw = vn, e.prototype.performInitialSync = Sn;
}, yn = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, _n = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, Mn = function(e, t) {
  this.videoFrameHandle = null;
  const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
}, In = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, En = function() {
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
}, Tn = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, Ln = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, mn = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, bn = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, Fn = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  if (!e || !t || !i)
    return;
  const s = L(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
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
  this.getCommentsInTimeWindow(this.currentTime, b).forEach((c) => {
    const p = R(), S = p ? X(c.text) : "";
    if (p && _("comment-evaluate", {
      stage: "seek",
      preview: S,
      vposMs: c.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(c),
      currentTime: this.currentTime,
      isActive: c.isActive,
      hasShown: c.hasShown
    }), this.isNGComment(c.text)) {
      p && _("comment-eval-skip", {
        preview: S,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "ng-runtime"
      }), c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
      return;
    }
    if (c.isInvisible) {
      p && _("comment-eval-skip", {
        preview: S,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "invisible"
      }), c.isActive = !1, this.activeComments.delete(c), c.hasShown = !0, c.clearActivation();
      return;
    }
    if (c.syncWithSettings(this._settings, this.settingsVersion), c.isActive = !1, this.activeComments.delete(c), c.lane = -1, c.hasShown = !1, c.clearActivation(), this.shouldActivateCommentAtTime(c, this.currentTime, S)) {
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
    this.getEffectiveCommentVpos(c) < this.currentTime - b ? c.hasShown = !0 : c.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, wn = (e) => {
  e.prototype.processFrame = yn, e.prototype.handleAnimationFrame = _n, e.prototype.handleVideoFrame = Mn, e.prototype.shouldUseVideoFrameCallback = In, e.prototype.scheduleNextFrame = En, e.prototype.cancelAnimationFrameRequest = Tn, e.prototype.cancelVideoFrameCallback = Ln, e.prototype.startAnimation = mn, e.prototype.stopAnimation = bn, e.prototype.onSeek = Fn;
}, xn = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, On = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, An = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, i = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(i ?? null, t);
    this.videoElement = t, this.containerElement = s, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? L(t.duration) : 0, this.currentTime = L(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.right = "0", n.style.bottom = "0", n.style.display = "block", n.style.pointerEvents = "none", n.style.zIndex = "2147483647";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, Rn = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Pn = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, Nn = (e) => {
  e.prototype.resolveContainer = xn, e.prototype.ensureContainerPositioning = On, e.prototype.initialize = An, e.prototype.destroy = Rn, e.prototype.destroyCanvasOnly = Pn;
}, Dn = function(e) {
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
}, Vn = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, Hn = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
  t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, kn = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = L(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, zn = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, Wn = function(e) {
  this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0, this.currentTime = L(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.lastDrawTime = this.timeSource.now();
}, Xn = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, Un = function(e, t) {
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
}, Bn = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, Gn = (e) => {
  e.prototype.setupVideoEventListeners = Dn, e.prototype.handleVideoMetadataLoaded = Vn, e.prototype.handleVideoStalled = Hn, e.prototype.handleVideoCanPlay = kn, e.prototype.handleVideoSourceChange = zn, e.prototype.syncVideoState = Wn, e.prototype.resetCommentActivity = Xn, e.prototype.setupVideoChangeDetection = Un, e.prototype.extractVideoElement = Bn;
}, Yn = function() {
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
}, $n = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  !e || !t || !i || (this.currentTime = L(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, qn = function(e) {
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
}, Kn = (e) => {
  e.prototype.setupVisibilityHandling = Yn, e.prototype.handleVisibilityRestore = $n, e.prototype.setCommentVisibility = qn;
}, jn = 2.525, Zn = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const r = (this.fullscreenActive && s.parentElement instanceof HTMLElement ? s.parentElement.getBoundingClientRect() : null) ?? i.getBoundingClientRect(), l = this.canvasDpr > 0 ? this.canvasDpr : 1, d = this.displayWidth > 0 ? this.displayWidth : s.width / l, u = this.displayHeight > 0 ? this.displayHeight : s.height / l, h = e ?? r.width ?? d, o = t ?? r.height ?? u;
  if (!Number.isFinite(h) || !Number.isFinite(o) || h <= 0 || o <= 0)
    return;
  const f = Math.max(1, Math.floor(h)), c = Math.max(1, Math.floor(o)), p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, S = Math.max(1, Math.round(f * p)), C = Math.max(1, Math.round(c * p));
  (this.displayWidth !== f || this.displayHeight !== c || Math.abs(this.canvasDpr - p) > Number.EPSILON || s.width !== S || s.height !== C) && (this.displayWidth = f, this.displayHeight = c, this.canvasDpr = p, s.width = S, s.height = C, s.style.width = `${f}px`, s.style.height = `${c}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p)), this.calculateLaneMetrics(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.performInitialSync(L(i.currentTime)), this.draw());
}, Jn = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, Qn = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(Nt, Math.floor(t * (27 / 665)));
  this.laneHeight = i * jn;
  const s = Math.floor(t / Math.max(this.laneHeight, 1));
  if (this._settings.useFixedLaneCount) {
    const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : Ue, a = Math.max(fe, Math.min(s, n));
    this.laneCount = a;
  } else
    this.laneCount = Math.max(fe, s);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, ea = function(e) {
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
        const { width: d, height: u } = l.contentRect;
        d > 0 && u > 0 ? this.resize(d, u) : this.resize();
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
}, ta = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, ia = (e) => {
  e.prototype.resize = Zn, e.prototype.resolveDevicePixelRatio = Jn, e.prototype.calculateLaneMetrics = Qn, e.prototype.setupResizeHandling = ea, e.prototype.cleanupResizeHandling = ta;
}, sa = function() {
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
}, ke = (e) => {
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
}, na = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, aa = async function() {
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
    this.resize(l.width, l.height), ke(this);
    return;
  }
  this.resize(), ke(this);
}, ra = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, oa = function(e, t, i) {
  return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
}, la = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, ha = (e) => {
  e.prototype.setupFullscreenHandling = sa, e.prototype.resolveResizeObserverTarget = na, e.prototype.handleFullscreenChange = aa, e.prototype.resolveFullscreenContainer = ra, e.prototype.resolveActiveOverlayContainer = oa, e.prototype.getFullscreenElement = la;
}, ca = function(e) {
  this.cleanupTasks.push(e);
}, ua = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, da = (e) => {
  e.prototype.addCleanup = ca, e.prototype.runCleanupTasks = ua;
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
  laneCount = Ue;
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
    Je.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (gs(t))
      s = G({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = G(us());
    }
    this._settings = G(s), this.timeSource = n.timeSource ?? Xe(), this.animationFrameProvider = n.animationFrameProvider ?? fs(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? ps(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = Be(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && Mi(n.debug);
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
Is(I);
xs(I);
Rs(I);
Vs(I);
Ws(I);
Zs(I);
an(I);
gn(I);
Cn(I);
wn(I);
Nn(I);
Gn(I);
Kn(I);
ia(I);
ha(I);
da(I);
const fa = (e) => ({
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
}), pa = (e) => {
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
}, Ca = (e, t, i = {}) => {
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
    canvas: pa(e),
    activeComments: Array.from(e.activeComments, fa),
    records: s
  };
};
export {
  Sa as COMMENT_OVERLAY_VERSION,
  hs as Comment,
  I as CommentRenderer,
  va as DEFAULT_RENDERER_SETTINGS,
  Ca as captureRendererCalibrationFrame,
  us as cloneDefaultSettings,
  Mi as configureDebugLogging,
  fs as createDefaultAnimationFrameProvider,
  Xe as createDefaultTimeSource,
  Be as createLogger,
  _ as debugLog,
  Ei as dumpRendererState,
  R as isDebugLoggingEnabled,
  Ti as logEpochChange,
  ga as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
