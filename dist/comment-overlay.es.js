const dt = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, ft = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"游明朝体","游明朝","Yu Mincho",YuMincho,yumincho,YuMin-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic'
}, pt = {
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
}, ie = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, gt = /^[,.:;]+/, vt = /[,.:;]+$/, St = (e) => {
  const t = e.trim();
  return t ? ie.test(t) ? t : t.replace(gt, "").replace(vt, "") : "";
}, Ct = (e) => ie.test(e) ? e.toUpperCase() : null, Xe = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const i = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, s = Number.parseFloat(i);
  return Number.isFinite(s) ? s : null;
}, yt = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return Xe(t);
}, _t = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, Mt = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), It = (e) => e === "naka" || e === "ue" || e === "shita", Et = (e) => e === "small" || e === "medium" || e === "big", Tt = (e) => e === "defont" || e === "gothic" || e === "mincho", Lt = (e) => e in ze, mt = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, r = 1, l = null, h = !1, d = !1, c = !1, o = 0, f = 1;
  for (const M of e) {
    const y = St(typeof M == "string" ? M : "");
    if (!y)
      continue;
    if (ie.test(y)) {
      const C = Ct(y);
      if (C) {
        a = C;
        continue;
      }
    }
    const g = y.toLowerCase();
    if (It(g)) {
      i = g;
      continue;
    }
    if (Et(g)) {
      s = g;
      continue;
    }
    if (Tt(g)) {
      n = g;
      continue;
    }
    if (Lt(g)) {
      a = ze[g].toUpperCase();
      continue;
    }
    if (g === "_live") {
      l = 0.5;
      continue;
    }
    if (g === "invisible") {
      r = 0, h = !0;
      continue;
    }
    if (g === "full") {
      d = !0;
      continue;
    }
    if (g === "ender") {
      c = !0;
      continue;
    }
    if (g.startsWith("ls:") || g.startsWith("letterspacing:")) {
      const C = y.indexOf(":");
      if (C >= 0) {
        const E = Xe(y.slice(C + 1));
        E !== null && (o = _t(E));
      }
      continue;
    }
    if (g.startsWith("lh:") || g.startsWith("lineheight:")) {
      const C = y.indexOf(":");
      if (C >= 0) {
        const E = yt(y.slice(C + 1));
        E !== null && (f = Mt(E));
      }
      continue;
    }
  }
  const u = Math.max(0, Math.min(1, r)), p = (a ?? t.defaultColor).toUpperCase(), S = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: i,
    size: s,
    sizeScale: dt[s],
    font: n,
    fontFamily: ft[n],
    fontWeight: pt[n],
    resolvedColor: p,
    colorOverride: a,
    opacityMultiplier: u,
    opacityOverride: S,
    isInvisible: h,
    isFull: d,
    isEnder: c,
    letterSpacing: o,
    lineHeight: f
  };
}, bt = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, U = (e) => e.length === 1 ? e.repeat(2) : e, w = (e) => Number.parseInt(e, 16), A = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, se = (e, t) => {
  const i = bt.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, r, l = 1;
  s.length === 3 || s.length === 4 ? (n = w(U(s[0])), a = w(U(s[1])), r = w(U(s[2])), s.length === 4 && (l = w(U(s[3])) / 255)) : (n = w(s.slice(0, 2)), a = w(s.slice(2, 4)), r = w(s.slice(4, 6)), s.length === 8 && (l = w(s.slice(6, 8)) / 255));
  const h = A(l * A(t));
  return `rgba(${n}, ${a}, ${r}, ${h})`;
}, Ft = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), Ue = () => Ft(), L = (e) => e * 1e3, wt = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), ne = 6e3, fe = 2700, xt = 3, Ot = 0.35, At = 48, Rt = 48, $ = 0, Pt = 6e3, Z = 120, Nt = 800, Dt = 2, W = 6e3, x = 3e3, b = x + ne, Vt = 240, Ht = 1800, pe = 1, Be = 12, kt = 24, T = 1e-3, P = 50, Wt = 2300, ge = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, zt = (e, t, i) => {
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
}, Ge = (e, t = {}) => {
  const { level: i = "info", emitter: s = zt } = t, n = ge[i], a = (r, l) => {
    ge[r] < n || s(r, e, l);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, ae = Ge("CommentEngine:Comment"), ve = /* @__PURE__ */ new WeakMap(), Xt = (e) => {
  let t = ve.get(e);
  return t || (t = /* @__PURE__ */ new Map(), ve.set(e, t)), t;
}, re = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = Xt(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(s, r), r;
}, q = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, Ut = 27 / 665, H = 665, Bt = 12, Gt = "  ", Yt = 1252 / 597.38330078125, k = [
  366 / H,
  510 / H,
  1662 / H
], $t = 566 / H, qt = 806 / 665, Kt = 808 / 665, Se = 1176 / 665, Ce = 900 / 665, jt = 1126 / 665, ye = 810 / 665, Zt = 1126 / 665, _e = 1046 / 665, Me = 1254 / 665, Jt = 1140 / 665, Qt = 878 / 665, ei = 0.25, ti = 160, ii = 420, si = 80, ni = 0.18, ai = 400, ri = 0.2, oi = 420, li = 250, hi = 1.8, ci = 420, ui = 20, di = 0.045, fi = 850 / 1182, pi = (e) => Math.max(0.01, e / H), O = (e, t) => e * pi(t), gi = (e) => e.replaceAll("	", Gt), Ye = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g, vi = (e) => {
  const t = gi(e);
  if (t.includes(`
`)) {
    const i = t.split(/\r?\n/);
    return i.length > 0 ? i : [""];
  }
  return [t];
}, Ie = (e, t = Bt) => Math.max(t, e), Si = (e, t) => {
  if (e.fontSize >= 35)
    return Math.round(t * $t);
  const i = e.text.split(/\r?\n/), s = Math.max(0, ...i.map((a) => a.length));
  return e.isEnder && s >= 25 || Math.max(0, ...i.map((a) => (a.match(/\t/g) || []).length)) >= 12 || e.width >= 1200 ? Math.round(t * k[2]) : e.width >= 300 ? Math.round(t * k[1]) : Math.round(t * k[0]);
}, Ci = (e, t) => Math.min(
  O(ii, t),
  Math.max(
    O(ti, t),
    e * ei
  )
), yi = (e, t) => {
  const i = O(
    ai,
    t
  );
  return Math.min(
    O(oi, t),
    O(si, t) + e.width * ni + Math.max(0, e.width - i) * ri
  );
}, _i = (e, t) => Math.min(
  O(ci, t),
  Math.max(
    0,
    e.width - O(li, t)
  ) * hi
), Mi = (e, t) => {
  if (e.isFull)
    return e.width;
  const i = Math.max(e.sizeScale, 1), n = e.width / i, a = t * fi;
  return Math.min(n, a);
}, Ii = (e) => e.lines.filter((t) => t.replace(Ye, "").length > 0).length, Ee = (e) => e.lines.length > 1 && Ii(e) === 1, Ei = (e) => e.lines.map((t) => t.replace(Ye, "")).filter((t) => t.length > 0), Te = (e) => {
  if (e.lines.length <= 1)
    return !1;
  const t = Ei(e);
  return t.length === 1 && /^[●○◉◎]+$/u.test(t[0]);
}, B = (e) => e.size === "big" || e.fontSize >= 35, Ti = (e, t) => {
  let i = 0;
  const s = e.letterSpacing;
  for (const r of e.lines) {
    const l = re(t, r), h = r.length > 1 ? s * (r.length - 1) : 0, d = Math.max(0, l + h);
    d > i && (i = d);
  }
  e.width = i;
  const n = Math.max(
    1,
    Math.floor(e.fontSize * e.lineHeightMultiplier)
  );
  e.lineHeightPx = n;
  const a = e.lines.length > 1 ? (e.lines.length - 1) * n : 0;
  e.height = e.fontSize + a;
}, Li = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1), r = Ie(Math.floor(s * Ut)), l = Ie(Math.floor(r * e.sizeScale));
    if (e.fontSize = l, t.font = q(e), e.lines = vi(e.text), Ti(e, t), e.isScrolling && e.isFull) {
      const m = e.lines.length > 1 && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("游明朝"));
      if (m && e.hasSameVposFullMinchoEnder && !e.isEnder && B(e))
        e.width = Math.round(
          s * (Te(e) ? _e : Zt)
        ), e.height = Math.max(
          e.height,
          Math.round(s * ye)
        );
      else if (m && e.hasSameVposFullMinchoEnder && e.isEnder && B(e))
        e.width = Math.round(
          s * (Ee(e) ? Me : Se)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Ce)
        );
      else if (m && e.hasSameVposFullMinchoEnder && e.isEnder)
        e.width = Math.round(
          s * (Ee(e) ? Me : Jt)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Qt)
        );
      else if (m && B(e))
        e.width = Math.round(
          s * (Te(e) ? _e : Se)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Ce)
        );
      else if (m)
        e.width = Math.round(s * jt), e.height = Math.max(
          e.height,
          Math.round(s * ye)
        );
      else {
        const V = B(e) ? Kt : qt;
        e.width = Si(e, s), e.height = Math.max(e.height, Math.round(s * V));
      }
    }
    if (!e.isScrolling) {
      const m = a + r * 2.6666666666666665;
      e.width >= m * 0.95 && e.fontSize >= 35 ? e.width = Math.round(s * Yt) : e.width = Math.min(e.width, m), e.bufferWidth = 0;
      const V = (a - e.width) / 2;
      e.virtualStartX = V, e.x = V, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = x, e.preCollisionDurationMs = x, e.totalDurationMs = x, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + x, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const h = re(t, "??".repeat(150)), d = e.width, c = d * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, c);
    const o = Math.max(n.entryBufferPx, e.bufferWidth), f = e.scrollDirection, u = Math.min(1, s / H), p = e.isFull ? n.virtualExtension * u : n.virtualExtension, S = e.isFull ? Ci(e.width, s) : 0, M = e.isFull ? O(ui, s) + e.width * di : 0, y = e.isFull ? 0 : yi(e, s), g = e.isFull ? 0 : _i(e, s), C = f === "rtl" ? a + p + S + y : -d - e.bufferWidth - p - S - y, E = f === "rtl" ? -d - e.bufferWidth - o + S - y - g : a + o - S + y + g, N = f === "rtl" ? a + o : -o;
    e.virtualStartX = C, e.x = C, e.exitThreshold = E;
    const D = a > 0 ? d / a : 0, nt = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let K = n.maxVisibleDurationMs;
    if (!nt && D > 1 && !e.isFull) {
      const m = Math.min(D, n.maxWidthRatio), V = n.maxVisibleDurationMs / Math.max(m, 1);
      K = Math.max(n.minVisibleDurationMs, Math.floor(V));
    }
    const at = a + d + e.bufferWidth + o + p + M + y * 2 + g, rt = Math.max(K, 1), j = at / rt, ot = j * 1e3 / 60;
    e.baseSpeed = ot, e.speed = e.baseSpeed, e.speedPixelsPerMs = j;
    const lt = Math.abs(E - C), ue = f === "rtl" ? C + d + e.bufferWidth : C - e.bufferWidth, ht = f === "rtl" ? Math.max(0, ue - N) : Math.max(0, N - ue), de = Math.max(j, Number.EPSILON);
    e.visibleDurationMs = K, e.preCollisionDurationMs = Math.max(0, Math.ceil(ht / de)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(lt / de)
    );
    const ct = d + e.bufferWidth + o, ut = Mi(e, a);
    e.reservationWidth = Math.min(
      h,
      Math.max(ct, ut)
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
}, z = /* @__PURE__ */ new Map(), mi = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return Q;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, bi = (e) => {
  F.enabled = !!e.enabled, F.maxLogsPerCategory = mi(e.maxLogsPerCategory), F.enabled || z.clear();
}, Ma = () => {
  z.clear();
}, R = () => F.enabled, Fi = (e) => {
  const t = z.get(e) ?? 0;
  return t >= F.maxLogsPerCategory ? (t === F.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), z.set(e, t + 1)), !1) : (z.set(e, t + 1), !0);
}, _ = (e, ...t) => {
  F.enabled && Fi(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, X = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, wi = (e, t) => {
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
}, xi = (e, t, i) => {
  F.enabled && _("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
}, Le = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, $e = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), Oi = (e) => {
  if (typeof e.getTransform != "function")
    return;
  const t = e.getTransform();
  return [t.a, t.b, t.c, t.d, t.e, t.f];
}, Ai = (e) => {
  const t = e.canvas;
  return t ? {
    canvasWidth: t.width,
    canvasHeight: t.height
  } : {};
}, qe = (e) => ({
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
    timestampMs: $e(),
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
    transform: Oi(t),
    ...Ai(t),
    comment: qe(i),
    ...s
  });
}, Ri = (e, t, i) => {
  const s = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof s != "function" || s({
    source: "comment-overlay",
    op: e,
    timestampMs: $e(),
    comment: qe(t),
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
}, me = () => {
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
}, Pi = () => typeof OffscreenCanvas < "u", oe = (e, t, i) => {
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
}, le = () => 2.8, Ke = 665, Ni = 566, te = 808, be = Ni / Ke, Fe = te / Ke, Di = 1098, Vi = 1530, we = 20.9, xe = 58.9, Oe = 45.23908523908523 / 39, Hi = 14.9, ki = 41.9, Wi = 28.92708257149126 / 27, Ae = 20, Re = 11.4, Pe = 31.4, Ne = 23.87692307692307, zi = 2.4, J = 2, De = 66.9, Ve = 55.6, Xi = 59, Ui = 810, Bi = 21.5, je = 878, Ze = 900, Gi = 10, Yi = 6.75, $i = 16.75, qi = 12.11423203055002, Ki = 0.5, ji = 1.42, Zi = 0.12, Ji = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const i = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!i)
    return !1;
  const s = i[1], n = s.length === 3 || s.length === 4, a = (d) => d.length === 1 ? `${d}${d}` : d, r = Number.parseInt(a(n ? s[0] : s.slice(0, 2)), 16), l = Number.parseInt(a(n ? s[1] : s.slice(2, 4)), 16), h = Number.parseInt(a(n ? s[2] : s.slice(4, 6)), 16);
  return r === 0 && l === 0 && h === 0;
}, he = (e) => Ji(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", Qi = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, es = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const i = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + i;
}, Je = (e) => {
  if (e.isScrolling && e.isFull) {
    if (e.hasSameVposFullMinchoEnder) {
      const h = Math.ceil(e.height);
      return {
        paddingX: Math.max(10, e.fontSize * 0.5),
        paddingY: h >= Ze ? De : h >= je ? Ve : Bi,
        textureWidth: Math.ceil(e.width),
        textureHeight: h
      };
    }
    const l = e.hasSameVposFullMinchoEnder && e.isEnder ? e.fontSize >= 35 ? De : Ve : null;
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: l ?? (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + zi,
      textureWidth: Math.ceil(e.width),
      textureHeight: Math.ceil(e.height)
    };
  }
  if (e.isScrolling && e.lines.length > 1) {
    const l = e.fontSize * 1.3333333333333333, h = e.fontSize;
    return {
      paddingX: l,
      paddingY: h,
      textureWidth: Math.ceil(e.width + l * 2),
      textureHeight: Math.ceil(e.height + e.fontSize * 6.1)
    };
  }
  if (!e.isScrolling) {
    const h = Math.ceil(
      e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
    );
    return {
      paddingX: 0,
      paddingY: Math.max(0, (h - e.height) / 2),
      textureWidth: Math.ceil(e.width + 0),
      textureHeight: h
    };
  }
  const i = e.isScrolling ? e.fontSize * 1.15 : Math.max(10, e.fontSize * 0.5), s = e.fontSize, n = e.isScrolling ? Math.round(s * (40 / 9)) : e.height + e.fontSize / 3, a = Math.ceil(
    Math.max(e.height + Math.max(10, e.fontSize), n)
  ), r = e.isScrolling ? e.fontSize : Math.max(0, (a - e.height) / 2);
  return {
    paddingX: i,
    paddingY: r,
    textureWidth: Math.ceil(
      e.isScrolling ? e.width * 2 + i * 2 : e.width + i * 2
    ),
    textureHeight: a
  };
}, ts = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35 ? 0.8 : 1, Qe = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, et = (e) => Qe(e) && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("YuMincho") || e.fontFamily.includes("游明朝")), is = (e, t) => et(e) ? ji : t, ss = (e) => Math.max(1, e.width + e.virtualStartX * 2), ns = (e) => e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder ? Xi * Math.min(1, e.height / Ui) : 0, as = (e, t, i, s, n) => {
  const a = is(e, n);
  if (et(e))
    return {
      x: ss(e) * Zi,
      scaleX: a,
      scaleY: n
    };
  const r = !e.isScrolling && a !== 1 ? t.width * (1 - a) * Ki : 0;
  return {
    x: i - s + r + ns(e),
    scaleX: a,
    scaleY: n
  };
}, ce = (e, t, i, s, n) => (a, r, l, h = 0) => {
  if (a.length === 0)
    return;
  const d = n + h, c = () => {
    s === "cache" ? l === "outline" ? v.outlineCallsInCache++ : v.fillCallsInCache++ : l === "outline" ? v.outlineCallsInFallback++ : v.fillCallsInFallback++;
  }, o = (u, p, S) => {
    if (c(), l === "outline") {
      t.strokeText(u, p, r), ee("strokeText", t, e, {
        text: u,
        x: p,
        y: r,
        meta: { statsTarget: s, mode: l, ...S }
      });
      return;
    }
    t.fillText(u, p, r), ee("fillText", t, e, {
      text: u,
      x: p,
      y: r,
      meta: { statsTarget: s, mode: l, ...S }
    });
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    o(a, d);
    return;
  }
  let f = d;
  for (let u = 0; u < a.length; u += 1) {
    const p = a[u];
    o(p, f, { characterIndex: u });
    const S = re(i, p);
    f += S, u < a.length - 1 && (f += e.letterSpacing);
  }
}, rs = (e) => `v8::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.width}::${e.height}::${e.lines.length}`, He = (e, t, i) => {
  const s = new OffscreenCanvas(i.width, i.height), n = s.getContext("2d");
  if (!n)
    return null;
  n.save(), n.font = i.sourceFont ? q(e) : Qi(e, i.fontSize);
  const a = A(e.opacity), r = se(e.color, a), l = e.renderStyle === "outline-only", h = l ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, i.fontSize, a);
  n.shadowColor = `rgba(0, 0, 0, ${h.alpha})`, n.shadowBlur = h.blur, n.shadowOffsetX = 0, n.shadowOffsetY = 0, n.lineJoin = "round", n.lineWidth = le(), n.strokeStyle = he(e), n.fillStyle = r, typeof i.canvasScale == "number" && n.scale(i.canvasScale, i.canvasScale);
  const d = e.lines.length > 0 ? e.lines : [e.text], c = ce(e, n, t, "cache", i.paddingX);
  return l && d.forEach((o, f) => {
    c(o, i.baselineY + f * i.lineHeight, "outline");
  }), d.forEach((o, f) => {
    c(o, i.baselineY + f * i.lineHeight, "fill");
  }), n.restore(), s;
}, os = (e, t, i) => {
  for (const s of i.traces ?? [])
    He(e, t, s);
  return He(e, t, i.output);
}, ls = (e, t, i) => {
  if (e.isScrolling && e.isFull && e.fontSize >= 35 && Math.abs(
    t - e.height * (be / Fe)
  ) <= 2 && Math.abs(
    i - t * (Fe / be)
  ) <= 3) {
    const n = i / te;
    return {
      traces: [
        {
          width: Math.round(Di * n),
          height: Math.round(Vi * n),
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
        baselineY: Pe * n,
        lineHeight: Ne * n
      }
    };
  }
  if (e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder) {
    if (i <= je - 1) {
      const n = i / te;
      return {
        output: {
          width: t,
          height: i,
          fontSize: Ae * n,
          paddingX: Re * n,
          baselineY: Pe * n,
          lineHeight: Ne * n,
          canvasScale: J
        }
      };
    }
    return i < Ze ? {
      output: {
        width: t,
        height: i,
        fontSize: e.fontSize,
        paddingX: Hi,
        baselineY: ki,
        lineHeight: e.fontSize * Wi,
        canvasScale: J,
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
        canvasScale: J,
        sourceFont: !0
      }
    };
  }
  return Qe(e) ? {
    output: {
      width: t,
      height: i,
      fontSize: Gi,
      paddingX: Yi,
      baselineY: $i,
      lineHeight: qi
    }
  } : null;
}, hs = (e, t) => {
  if (!Pi())
    return null;
  const i = Math.abs(e.letterSpacing) >= Number.EPSILON, s = e.lines.length > 1;
  i && v.letterSpacingComments++, s && v.multiLineComments++, !i && !s && v.normalComments++, v.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: l } = Je(e), h = ls(e, r, l);
  if (h)
    return os(e, t, h);
  const d = new OffscreenCanvas(r, l), c = d.getContext("2d");
  if (!c)
    return null;
  c.save(), c.font = q(e);
  const o = A(e.opacity), f = n, u = e.lines.length > 0 ? e.lines : [e.text], p = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, S = es(e, a), M = ce(e, c, t, "cache", f), y = se(e.color, o), g = e.renderStyle === "outline-only", C = g ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, e.fontSize, o);
  return R() && console.log(
    "[Shadow Debug - Cache]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${C.blur}px`,
    `
  Shadow alpha: ${C.alpha}`,
    `
  Fill style: ${y}`
  ), c.save(), c.shadowColor = `rgba(0, 0, 0, ${C.alpha})`, c.shadowBlur = C.blur, c.shadowOffsetX = 0, c.shadowOffsetY = 0, c.lineJoin = "round", c.lineWidth = le(), c.strokeStyle = he(e), c.fillStyle = y, g && u.forEach((E, N) => {
    const D = S + N * p;
    M(E, D, "outline");
  }), u.forEach((E, N) => {
    const D = S + N * p;
    M(E, D, "fill");
  }), c.restore(), c.restore(), d;
}, cs = (e, t, i) => {
  v.fallbacks++, t.save(), t.font = q(e);
  const s = A(e.opacity), n = i ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, l = e.y + e.fontSize, h = ce(e, t, t, "fallback", n), d = se(e.color, s), c = e.renderStyle === "outline-only", o = c ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, e.fontSize, s);
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
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${o.alpha})`, t.shadowBlur = o.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = le(), t.strokeStyle = he(e), t.fillStyle = d, c && a.forEach((f, u) => {
    const p = l + u * r;
    h(f, p, "outline");
  }), a.forEach((f, u) => {
    const p = l + u * r;
    h(f, p, "fill");
  }), t.restore(), t.restore();
}, us = (e, t, i) => {
  try {
    if (!e.isActive || !t)
      return;
    const s = rs(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== s || !n) {
      v.misses++, v.creates++;
      const r = hs(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(s);
    } else
      v.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = i ?? e.x, { paddingX: l, paddingY: h } = Je(e), d = ts(e), c = as(e, a, r, l, d), o = c.x, f = e.isScrolling ? e.y : e.y - h;
      c.scaleX === 1 && c.scaleY === 1 ? t.drawImage(a, o, f) : t.drawImage(
        a,
        o,
        f,
        a.width * c.scaleX,
        a.height * c.scaleY
      ), ee("drawImage", t, e, {
        x: o,
        y: f,
        width: a.width * c.scaleX,
        height: a.height * c.scaleY,
        sourceWidth: a.width,
        sourceHeight: a.height,
        meta: {
          statsTarget: "cache",
          paddingX: l,
          paddingY: h,
          drawScale: d,
          drawScaleX: c.scaleX,
          drawScaleY: c.scaleY
        }
      }), me();
      return;
    }
    cs(e, t, i), me();
  } catch (s) {
    ae.error("Comment.draw", s, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: i
    });
  }
}, ds = (e) => e === "ltr" ? "ltr" : "rtl", fs = (e) => e === "ltr" ? 1 : -1;
class ps {
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
    const r = mt(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.size = r.size, this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.isFull = r.isFull, this.isEnder = r.isEnder, this.fontFamily = r.fontFamily, this.fontWeight = r.fontWeight, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = a.timeSource ?? Ue(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, i, s, n) {
    Li(this, t, i, s, n);
  }
  draw(t, i = null) {
    us(this, t, i);
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
    const i = ds(t);
    this.scrollDirection = i, this.directionSign = fs(i);
  }
}
const gs = 6700, Y = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: gs,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, Ia = Y, vs = () => ({
  ...Y,
  ngWords: [...Y.ngWords],
  ngRegexps: [...Y.ngRegexps]
}), Ea = "v3.1.40", Ss = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, G = (e) => {
  const t = e.scrollVisibleDurationMs, i = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: Ss(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: i,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, Cs = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(Number(t))
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, ys = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), _s = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, ke = (e) => e.isScrolling && e.isFull && e.text.includes(`
`) && e.commands.some((t) => t.toLowerCase() === "mincho"), Ms = (e) => {
  const t = /* @__PURE__ */ new Set();
  e.forEach((i) => {
    i.isEnder && ke(i) && t.add(i.vposMs);
  }), e.forEach((i) => {
    i.hasSameVposFullMinchoEnder = t.has(i.vposMs) && ke(i);
  });
}, Is = function(e) {
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
    const l = wt(n);
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
    const d = new ps(
      s,
      l,
      a,
      this._settings,
      this.commentDependencies
    );
    d.creationIndex = this.commentSequence++, d.epochId = this.epochId, t.push(d), _("comment-added", {
      preview: r,
      vposMs: l,
      commands: d.commands.length,
      layout: d.layout,
      isScrolling: d.isScrolling,
      invisible: d.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), Ms(this.comments), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    return Math.abs(n) > T ? n : i.creationIndex - s.creationIndex;
  }), t);
}, Es = function(e, t, i = []) {
  const [s] = this.addComments([{ text: e, vposMs: t, commands: i }]);
  return s ?? null;
}, Ts = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, i);
  }
}, Ls = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, tt = function() {
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
}, ms = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, bs = (e) => {
  e.prototype.addComments = Is, e.prototype.addComment = Es, e.prototype.clearComments = Ts, e.prototype.resetState = Ls, e.prototype.rebuildNgMatchers = tt, e.prototype.isNGComment = ms;
}, Fs = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, ws = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, xi(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, xs = function(e) {
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
  if (wi(e, i), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(i);
    } catch (s) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
    }
  this.lastSnapshotEmitTime = t;
}, Os = function(e) {
  this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  return t !== void 0 ? t : it(e);
}, it = (e) => {
  if (!e.isScrolling)
    return e.vposMs;
  const t = e.isFull ? Wt : Ht;
  return Math.max(0, e.vposMs - t);
}, As = function(e) {
  if (!e.isScrolling)
    return x;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : ne;
}, Rs = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), it(e);
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const i = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, i), i;
}, Ps = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + W, i = Math.max(e + W, t), s = this.comments.filter((d) => d.hasShown || d.isInvisible || this.isNGComment(d.text) ? !1 : d.vposMs >= e - b).sort((d, c) => {
    const o = d.vposMs - c.vposMs;
    return Math.abs(o) > T ? o : d.creationIndex - c.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(i - e, W) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : Z, l = Math.max(Z, Math.min(r, Nt));
  let h = e;
  s.forEach((d, c) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(d)), f = i - o;
    let u = Math.max(e, Math.min(h, f));
    Number.isFinite(u) || (u = e);
    const p = Dt * c;
    u + p <= f && (u += p), this.finalPhaseVposOverrides.set(d, u);
    const S = Math.max(Z, Math.min(o / 2, l));
    h = u + S;
  }), this.finalPhaseScheduleDirty = !1;
}, Ns = (e) => {
  e.prototype.resetFinalPhaseState = Fs, e.prototype.incrementEpoch = ws, e.prototype.emitStateSnapshot = xs, e.prototype.getEffectiveCommentVpos = Os, e.prototype.getFinalPhaseDisplayDuration = As, e.prototype.resolveFinalPhaseVpos = Rs, e.prototype.recomputeFinalPhaseTimeline = Ps;
}, Ds = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= P;
}, Vs = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > P) && (this.playbackHasBegun = !0);
}, Hs = (e) => {
  e.prototype.shouldSuppressRendering = Ds, e.prototype.updatePlaybackProgressState = Vs;
}, ks = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, h = this.buildPrepareOptions(r), d = this.duration > 0 && this.duration - this.currentTime <= Pt;
  d && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, l), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !d && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const o of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(o), u = f < this.currentTime - b, p = f > this.currentTime + b;
    if (u || p) {
      o.isActive = !1, this.activeComments.delete(o), o.clearActivation(), o.lane >= 0 && (o.layout === "ue" ? this.releaseStaticLane("ue", o.lane) : o.layout === "shita" && this.releaseStaticLane("shita", o.lane));
      continue;
    }
    o.isScrolling && o.hasShown && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
  }
  const c = this.getCommentsInTimeWindow(this.currentTime, b);
  for (const o of c) {
    const f = R(), u = f ? X(o.text) : "";
    if (f && _("comment-evaluate", {
      stage: "update",
      preview: u,
      vposMs: o.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(o),
      currentTime: this.currentTime,
      isActive: o.isActive,
      hasShown: o.hasShown
    }), this.isNGComment(o.text)) {
      f && _("comment-eval-skip", {
        preview: u,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "ng-runtime"
      });
      continue;
    }
    if (o.isInvisible) {
      f && _("comment-eval-skip", {
        preview: u,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "invisible"
      }), o.isActive = !1, this.activeComments.delete(o), o.hasShown = !0, o.clearActivation();
      continue;
    }
    if (o.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(o, this.currentTime, u) && this.activateComment(
      o,
      s,
      r,
      l,
      h,
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
}, Ws = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = ne, s = fe;
  return t !== null && (i = t, s = Math.max(1, Math.min(t, fe))), {
    visibleWidth: e,
    virtualExtension: Vt,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: xt,
    bufferRatio: Ot,
    baseBufferPx: At,
    entryBufferPx: Rt
  };
}, zs = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t), n = i.map((h) => {
    const c = (this.reservedLanes.get(h) ?? []).find(
      (o) => this.areReservationsConflicting(o, s)
    );
    return {
      lane: h,
      available: c === void 0,
      nextAvailableTime: this.getLaneNextAvailableTime(h, t),
      blocker: c
    };
  }), a = n.find((h) => h.available), r = i[i.length - 1] ?? 0, l = a?.lane ?? r;
  return this.storeLaneReservation(l, s), Ri("laneDecision", e, {
    meta: {
      currentTimeMs: t,
      selectedLane: l,
      usedFallback: a === void 0,
      candidateLanes: n.map((h) => h.lane).join(","),
      availableLanes: n.filter((h) => h.available).map((h) => h.lane).join(","),
      nextAvailableTimes: n.map((h) => Math.round(h.nextAvailableTime)).join(","),
      blockedBy: n.map(
        (h) => h.blocker ? `${h.lane}:${h.blocker.comment.creationIndex}@${h.blocker.comment.vposMs}` : `${h.lane}:-`
      ).join(","),
      reservationStartTimeMs: Math.round(s.startTime),
      reservationEndTimeMs: Math.round(s.endTime),
      reservationTotalEndTimeMs: Math.round(s.totalEndTime),
      reservationWidth: Math.round(s.width)
    }
  }), l;
}, Xs = (e) => {
  e.prototype.updateComments = ks, e.prototype.buildPrepareOptions = Ws, e.prototype.findAvailableLane = zs;
}, Us = function(e, t) {
  let i = 0, s = e.length;
  for (; i < s; ) {
    const n = Math.floor((i + s) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + $ <= t ? i = n + 1 : s = n;
  }
  return i;
}, Bs = function(e) {
  for (const [t, i] of this.reservedLanes.entries()) {
    const s = this.findFirstValidReservationIndex(i, e);
    s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
  }
}, Gs = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
}, Ys = (e) => {
  e.prototype.findFirstValidReservationIndex = Us, e.prototype.pruneLaneReservations = Bs, e.prototype.pruneStaticLaneReservations = Gs;
}, $s = function(e) {
  let t = 0, i = this.comments.length;
  for (; t < i; ) {
    const s = Math.floor((t + i) / 2), n = this.comments[s];
    n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
  }
  return t;
}, qs = function(e, t) {
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
}, Ks = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, js = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, Zs = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, Js = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, Qs = (e) => {
  const t = Math.ceil(
    e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
  );
  return Math.max(0, (t - e.height) / 2);
}, en = function(e, t, i, s) {
  const n = Math.max(1, i), a = Math.max(s.height, s.fontSize), r = 5, l = 0, h = Qs(s);
  if (e === "ue") {
    const u = r + h;
    let p = u;
    const M = this.getStaticReservations(e).filter((g) => g.lane < t).sort((g, C) => g.lane - C.lane);
    for (const g of M) {
      const C = g.yEnd - g.yStart;
      p += C + l;
    }
    const y = Math.max(r, n * 2);
    return Math.max(u, Math.min(p, y));
  }
  let d = n - r;
  const o = this.getStaticReservations(e).filter((u) => u.lane < t).sort((u, p) => u.lane - p.lane);
  for (const u of o) {
    const p = u.yEnd - u.yStart;
    d -= p + l;
  }
  const f = d - a;
  return Math.max(r, f);
}, tn = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, sn = (e) => {
  e.prototype.findCommentIndexAtOrAfter = $s, e.prototype.getCommentsInTimeWindow = qs, e.prototype.getStaticReservations = Ks, e.prototype.getStaticLaneDepth = js, e.prototype.getStaticLaneLimit = Zs, e.prototype.getGlobalLaneIndexForBottom = Js, e.prototype.resolveStaticCommentOffset = en, e.prototype.getStaticReservedLaneSet = tn;
}, nn = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, st = (e) => Math.max(1, e.fontSize * (nn(e) ? 0.46 : 1)), an = function(e, t, i = "") {
  const s = i.length > 0 && R(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - T ? (s && _("comment-eval-skip", {
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
}, rn = function(e, t, i, s, n, a) {
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
    const l = Math.max(0, a - r), h = e.speedPixelsPerMs * l;
    if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
      const u = this.duration > 0 ? this.duration : this.finalPhaseStartTime + W, p = Math.max(
        this.finalPhaseStartTime + W,
        u
      ), S = e.width + i, M = S > 0 ? S / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + M > p) {
        const g = p - a, C = Math.max(0, g) * e.speedPixelsPerMs, E = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - h, i - C) : Math.min(e.virtualStartX + h, C - e.width);
        e.x = E;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - h : e.virtualStartX + h;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - h : e.virtualStartX + h;
    const d = this.findAvailableLane(e);
    e.lane = d;
    const c = Math.max(1, this.laneHeight), o = Math.max(0, s - e.height), f = d * c;
    e.y = e.isFull ? 0 : Math.max(0, Math.min(f, o));
  } else {
    const l = e.layout === "ue" ? "ue" : "shita", h = this.assignStaticLane(l, e, s, a), d = this.resolveStaticCommentOffset(
      l,
      h,
      s,
      e
    );
    e.x = e.virtualStartX, e.y = d, e.lane = l === "ue" ? h : this.getGlobalLaneIndexForBottom(h), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0;
    const c = r + x;
    e.visibleDurationMs = Math.max(0, c - a), this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = c, this.reserveStaticLane(l, e, h, c), R() && _("comment-activate-static", {
      preview: X(e.text),
      lane: e.lane,
      position: l,
      displayEnd: c,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, on = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = st(t), r = Math.max(1, a), l = Math.max(
    this.laneCount,
    Math.ceil(Math.max(1, i) / r) + n.length + 1
  ), h = Array.from({ length: l }, (o, f) => f);
  for (const o of h) {
    const f = this.resolveStaticCommentOffset(e, o, i, t), u = f, p = f + a;
    if (!n.some((M) => M.releaseTime > s ? !(p <= M.yStart || u >= M.yEnd) : !1))
      return o;
  }
  let d = h[0] ?? 0, c = Number.POSITIVE_INFINITY;
  for (const o of n)
    o.releaseTime < c && (c = o.releaseTime, d = o.lane);
  return d;
}, ln = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = t.y, r = t.y + st(t);
  n.push({
    comment: t,
    releaseTime: s,
    yStart: a,
    yEnd: r,
    lane: i
  });
}, hn = function(e, t) {
  if (t < 0)
    return;
  const i = this.getStaticReservations(e), s = i.findIndex((n) => n.lane === t);
  s >= 0 && i.splice(s, 1);
}, cn = (e) => {
  e.prototype.shouldActivateCommentAtTime = an, e.prototype.activateComment = rn, e.prototype.assignStaticLane = on, e.prototype.reserveStaticLane = ln, e.prototype.releaseStaticLane = hn;
}, un = 1, dn = function() {
  return Array.from({ length: this.laneCount }, (e, t) => t);
}, fn = function(e, t) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return t;
  const s = this.findFirstValidReservationIndex(i, t), n = i[s];
  if (!n)
    return t;
  const a = Math.max(0, n.totalEndTime - n.endTime);
  return Math.max(
    t,
    n.endTime + a * un + $
  );
}, pn = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, T), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + $, l = a + e.totalDurationMs + $, h = Number.isFinite(e.reservationWidth) && e.reservationWidth > 0 ? e.reservationWidth : e.width;
  return {
    comment: e,
    startTime: a,
    endTime: Math.max(a, r),
    totalEndTime: Math.max(a, l),
    startLeft: e.virtualStartX,
    width: h,
    speed: i,
    buffer: 0,
    directionSign: e.getDirectionSign()
  };
}, gn = function(e, t, i) {
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
}, vn = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, Sn = function(e, t) {
  const i = Math.max(e.startTime, t.startTime), s = Math.min(e.endTime, t.endTime);
  if (i >= s)
    return !1;
  const n = /* @__PURE__ */ new Set([
    i,
    s,
    i + (s - i) / 2
  ]), a = this.solveLeftRightEqualityTime(e, t);
  a !== null && a >= i - T && a <= s + T && n.add(a);
  const r = this.solveLeftRightEqualityTime(t, e);
  r !== null && r >= i - T && r <= s + T && n.add(r);
  for (const l of n) {
    if (l < i - T || l > s + T)
      continue;
    const h = this.computeForwardGap(e, t, l), d = this.computeForwardGap(t, e, l);
    if (h <= -24 && d <= -24)
      return !0;
  }
  return !1;
}, Cn = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, yn = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, _n = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < T)
    return null;
  const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, Mn = (e) => {
  e.prototype.getLanePriorityOrder = dn, e.prototype.getLaneNextAvailableTime = fn, e.prototype.createLaneReservation = pn, e.prototype.isLaneAvailable = gn, e.prototype.storeLaneReservation = vn, e.prototype.areReservationsConflicting = Sn, e.prototype.computeForwardGap = Cn, e.prototype.getBufferedEdges = yn, e.prototype.solveLeftRightEqualityTime = _n;
}, In = function() {
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
    r.sort((h, d) => {
      const c = this.getEffectiveCommentVpos(h), o = this.getEffectiveCommentVpos(d), f = c - o;
      return Math.abs(f) > T ? f : h.isScrolling !== d.isScrolling ? h.isScrolling ? 1 : -1 : h.creationIndex - d.creationIndex;
    }), r.forEach((h) => {
      const c = this.isPlaying && !h.isPaused ? h.x + h.getDirectionSign() * h.speed * l : h.x;
      h.draw(t, c);
    });
  }
  this.lastDrawTime = a;
}, En = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, h = this.buildPrepareOptions(r);
  this.activeComments.forEach((c) => {
    c.isActive = !1, c.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.getCommentsInTimeWindow(this.currentTime, b).forEach((c) => {
    if (this.isNGComment(c.text) || c.isInvisible) {
      c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
      return;
    }
    if (c.syncWithSettings(this._settings, this.settingsVersion), c.isActive = !1, this.activeComments.delete(c), c.lane = -1, c.hasShown = !1, c.clearActivation(), this.shouldActivateCommentAtTime(c, this.currentTime)) {
      this.activateComment(
        c,
        s,
        r,
        l,
        h,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(c) < this.currentTime - b ? c.hasShown = !0 : c.hasShown = !1;
  });
}, Tn = (e) => {
  e.prototype.draw = In, e.prototype.performInitialSync = En;
}, Ln = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, mn = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, bn = function(e, t) {
  this.videoFrameHandle = null;
  const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
}, Fn = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, wn = function() {
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
}, xn = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, On = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, An = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, Rn = function() {
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
  const l = n > P;
  if (this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !l) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const h = this.canvasDpr > 0 ? this.canvasDpr : 1, d = this.displayWidth > 0 ? this.displayWidth : e.width / h, c = this.displayHeight > 0 ? this.displayHeight : e.height / h, o = this.buildPrepareOptions(d);
  this.getCommentsInTimeWindow(this.currentTime, b).forEach((u) => {
    const p = R(), S = p ? X(u.text) : "";
    if (p && _("comment-evaluate", {
      stage: "seek",
      preview: S,
      vposMs: u.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(u),
      currentTime: this.currentTime,
      isActive: u.isActive,
      hasShown: u.hasShown
    }), this.isNGComment(u.text)) {
      p && _("comment-eval-skip", {
        preview: S,
        vposMs: u.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(u),
        reason: "ng-runtime"
      }), u.isActive = !1, this.activeComments.delete(u), u.clearActivation();
      return;
    }
    if (u.isInvisible) {
      p && _("comment-eval-skip", {
        preview: S,
        vposMs: u.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(u),
        reason: "invisible"
      }), u.isActive = !1, this.activeComments.delete(u), u.hasShown = !0, u.clearActivation();
      return;
    }
    if (u.syncWithSettings(this._settings, this.settingsVersion), u.isActive = !1, this.activeComments.delete(u), u.lane = -1, u.hasShown = !1, u.clearActivation(), this.shouldActivateCommentAtTime(u, this.currentTime, S)) {
      this.activateComment(
        u,
        t,
        d,
        c,
        o,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(u) < this.currentTime - b ? u.hasShown = !0 : u.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Nn = (e) => {
  e.prototype.processFrame = Ln, e.prototype.handleAnimationFrame = mn, e.prototype.handleVideoFrame = bn, e.prototype.shouldUseVideoFrameCallback = Fn, e.prototype.scheduleNextFrame = wn, e.prototype.cancelAnimationFrameRequest = xn, e.prototype.cancelVideoFrameCallback = On, e.prototype.startAnimation = An, e.prototype.stopAnimation = Rn, e.prototype.onSeek = Pn;
}, Dn = function(e, t) {
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
}, Hn = function(e) {
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
}, kn = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Wn = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, zn = (e) => {
  e.prototype.resolveContainer = Dn, e.prototype.ensureContainerPositioning = Vn, e.prototype.initialize = Hn, e.prototype.destroy = kn, e.prototype.destroyCanvasOnly = Wn;
}, Xn = function(e) {
  try {
    const t = () => {
      this.isPlaying = !0, this.playbackHasBegun = !0;
      const f = this.timeSource.now();
      this.lastDrawTime = f, this.lastPlayResumeTime = f, this.comments.forEach((u) => {
        u.lastUpdateTime = f, u.isPaused = !1;
      });
    }, i = () => {
      this.isPlaying = !1;
      const f = this.timeSource.now();
      this.comments.forEach((u) => {
        u.lastUpdateTime = f, u.isPaused = !0;
      });
    }, s = () => {
      this.onSeek();
    }, n = () => {
      this.onSeek();
    }, a = () => {
      this.playbackRate = e.playbackRate;
      const f = this.timeSource.now();
      this.comments.forEach((u) => {
        u.lastUpdateTime = f;
      });
    }, r = () => {
      this.handleVideoMetadataLoaded(e);
    }, l = () => {
      this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0;
    }, h = () => {
      this.handleVideoSourceChange();
    }, d = () => {
      this.handleVideoStalled();
    }, c = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", l), e.addEventListener("emptied", h), e.addEventListener("waiting", d), e.addEventListener("canplay", c), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", h)), this.addCleanup(() => e.removeEventListener("waiting", d)), this.addCleanup(() => e.removeEventListener("canplay", c)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, Un = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, Bn = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
  t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, Gn = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = L(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, Yn = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, $n = function(e) {
  this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0, this.currentTime = L(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.lastDrawTime = this.timeSource.now();
}, qn = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, Kn = function(e, t) {
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
        let l = null, h = null;
        if ((r instanceof HTMLVideoElement || r instanceof HTMLSourceElement) && (l = typeof a.oldValue == "string" ? a.oldValue : null, h = r.getAttribute("src")), l === h)
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
}, jn = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, Zn = (e) => {
  e.prototype.setupVideoEventListeners = Xn, e.prototype.handleVideoMetadataLoaded = Un, e.prototype.handleVideoStalled = Bn, e.prototype.handleVideoCanPlay = Gn, e.prototype.handleVideoSourceChange = Yn, e.prototype.syncVideoState = $n, e.prototype.resetCommentActivity = qn, e.prototype.setupVideoChangeDetection = Kn, e.prototype.extractVideoElement = jn;
}, Jn = function() {
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
}, Qn = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  !e || !t || !i || (this.currentTime = L(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, ea = function(e) {
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
}, ta = (e) => {
  e.prototype.setupVisibilityHandling = Jn, e.prototype.handleVisibilityRestore = Qn, e.prototype.setCommentVisibility = ea;
}, ia = 2.1, sa = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const r = (this.fullscreenActive && s.parentElement instanceof HTMLElement ? s.parentElement.getBoundingClientRect() : null) ?? i.getBoundingClientRect(), l = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : s.width / l, d = this.displayHeight > 0 ? this.displayHeight : s.height / l, c = e ?? r.width ?? h, o = t ?? r.height ?? d;
  if (!Number.isFinite(c) || !Number.isFinite(o) || c <= 0 || o <= 0)
    return;
  const f = Math.max(1, Math.floor(c)), u = Math.max(1, Math.floor(o)), p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, S = Math.max(1, Math.round(f * p)), M = Math.max(1, Math.round(u * p));
  (this.displayWidth !== f || this.displayHeight !== u || Math.abs(this.canvasDpr - p) > Number.EPSILON || s.width !== S || s.height !== M) && (this.displayWidth = f, this.displayHeight = u, this.canvasDpr = p, s.width = S, s.height = M, s.style.width = `${f}px`, s.style.height = `${u}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p)), this.calculateLaneMetrics(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.performInitialSync(L(i.currentTime)), this.draw());
}, na = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, aa = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(kt, Math.floor(t * (27 / 665)));
  this.laneHeight = i * ia;
  const s = Math.max(this.laneHeight, 1), a = Math.floor(Math.max(0, t - s) / s);
  if (this._settings.useFixedLaneCount) {
    const r = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : Be, l = Math.max(pe, Math.min(a, r));
    this.laneCount = l;
  } else
    this.laneCount = Math.max(pe, a);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, ra = function(e) {
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
        const { width: h, height: d } = l.contentRect;
        h > 0 && d > 0 ? this.resize(h, d) : this.resize();
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
}, oa = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, la = (e) => {
  e.prototype.resize = sa, e.prototype.resolveDevicePixelRatio = na, e.prototype.calculateLaneMetrics = aa, e.prototype.setupResizeHandling = ra, e.prototype.cleanupResizeHandling = oa;
}, ha = function() {
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
}, ca = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, ua = async function() {
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
}, da = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, fa = function(e, t, i) {
  return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
}, pa = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, ga = (e) => {
  e.prototype.setupFullscreenHandling = ha, e.prototype.resolveResizeObserverTarget = ca, e.prototype.handleFullscreenChange = ua, e.prototype.resolveFullscreenContainer = da, e.prototype.resolveActiveOverlayContainer = fa, e.prototype.getFullscreenElement = pa;
}, va = function(e) {
  this.cleanupTasks.push(e);
}, Sa = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, Ca = (e) => {
  e.prototype.addCleanup = va, e.prototype.runCleanupTasks = Sa;
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
  laneCount = Be;
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
    tt.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (_s(t))
      s = G({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = G(vs());
    }
    this._settings = G(s), this.timeSource = n.timeSource ?? Ue(), this.animationFrameProvider = n.animationFrameProvider ?? Cs(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? ys(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = Ge(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && bi(n.debug);
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
bs(I);
Ns(I);
Hs(I);
Xs(I);
Ys(I);
sn(I);
cn(I);
Mn(I);
Tn(I);
Nn(I);
zn(I);
Zn(I);
ta(I);
la(I);
ga(I);
Ca(I);
const ya = (e) => ({
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
  preCollisionDurationMs: e.preCollisionDurationMs,
  speedPixelsPerMs: e.speedPixelsPerMs,
  virtualStartX: e.virtualStartX,
  exitThreshold: e.exitThreshold,
  bufferWidth: e.bufferWidth,
  reservationWidth: e.reservationWidth,
  creationIndex: e.creationIndex
}), _a = (e) => {
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
}, Ta = (e, t, i = {}) => {
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
    canvas: _a(e),
    activeComments: Array.from(e.activeComments, ya),
    records: s
  };
};
export {
  Ea as COMMENT_OVERLAY_VERSION,
  ps as Comment,
  I as CommentRenderer,
  Ia as DEFAULT_RENDERER_SETTINGS,
  Ta as captureRendererCalibrationFrame,
  vs as cloneDefaultSettings,
  bi as configureDebugLogging,
  Cs as createDefaultAnimationFrameProvider,
  Ue as createDefaultTimeSource,
  Ge as createLogger,
  _ as debugLog,
  wi as dumpRendererState,
  R as isDebugLoggingEnabled,
  xi as logEpochChange,
  Ma as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
