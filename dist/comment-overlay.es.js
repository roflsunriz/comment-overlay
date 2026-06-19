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
}, _t = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return Ue(t);
}, Mt = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, It = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), Et = (e) => e === "naka" || e === "ue" || e === "shita", Tt = (e) => e === "small" || e === "medium" || e === "big", Lt = (e) => e === "defont" || e === "gothic" || e === "mincho", bt = (e) => e in Xe, mt = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, r = 1, o = null, h = !1, d = !1, u = !1, l = 0, f = 1;
  for (const M of e) {
    const y = Ct(typeof M == "string" ? M : "");
    if (!y)
      continue;
    if (ie.test(y)) {
      const C = yt(y);
      if (C) {
        a = C;
        continue;
      }
    }
    const g = y.toLowerCase();
    if (Et(g)) {
      i = g;
      continue;
    }
    if (Tt(g)) {
      s = g;
      continue;
    }
    if (Lt(g)) {
      n = g;
      continue;
    }
    if (bt(g)) {
      a = Xe[g].toUpperCase();
      continue;
    }
    if (g === "_live") {
      o = 0.5;
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
      u = !0;
      continue;
    }
    if (g.startsWith("ls:") || g.startsWith("letterspacing:")) {
      const C = y.indexOf(":");
      if (C >= 0) {
        const E = Ue(y.slice(C + 1));
        E !== null && (l = Mt(E));
      }
      continue;
    }
    if (g.startsWith("lh:") || g.startsWith("lineheight:")) {
      const C = y.indexOf(":");
      if (C >= 0) {
        const E = _t(y.slice(C + 1));
        E !== null && (f = It(E));
      }
      continue;
    }
  }
  const c = Math.max(0, Math.min(1, r)), p = (a ?? t.defaultColor).toUpperCase(), S = typeof o == "number" ? Math.max(0, Math.min(1, o)) : null;
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
    opacityOverride: S,
    isInvisible: h,
    isFull: d,
    isEnder: u,
    letterSpacing: l,
    lineHeight: f
  };
}, Ft = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, U = (e) => e.length === 1 ? e.repeat(2) : e, w = (e) => Number.parseInt(e, 16), A = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, se = (e, t) => {
  const i = Ft.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, r, o = 1;
  s.length === 3 || s.length === 4 ? (n = w(U(s[0])), a = w(U(s[1])), r = w(U(s[2])), s.length === 4 && (o = w(U(s[3])) / 255)) : (n = w(s.slice(0, 2)), a = w(s.slice(2, 4)), r = w(s.slice(4, 6)), s.length === 8 && (o = w(s.slice(6, 8)) / 255));
  const h = A(o * A(t));
  return `rgba(${n}, ${a}, ${r}, ${h})`;
}, wt = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), Be = () => wt(), L = (e) => e * 1e3, xt = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), ne = 6e3, fe = 2700, Ot = 3, At = 0.35, Rt = 48, Pt = 48, Y = 0, Nt = 6e3, Z = 120, Dt = 800, Vt = 2, W = 6e3, x = 3e3, m = x + ne, Ht = 240, kt = 1800, pe = 1, Ge = 12, Wt = 24, T = 1e-3, P = 50, zt = 2300, ge = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, Xt = (e, t, i) => {
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
  const { level: i = "info", emitter: s = Xt } = t, n = ge[i], a = (r, o) => {
    ge[r] < n || s(r, e, o);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, ae = $e("CommentEngine:Comment"), ve = /* @__PURE__ */ new WeakMap(), Ut = (e) => {
  let t = ve.get(e);
  return t || (t = /* @__PURE__ */ new Map(), ve.set(e, t)), t;
}, re = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = Ut(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(s, r), r;
}, q = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, Bt = 27 / 665, H = 665, Gt = 12, $t = "  ", Yt = 1252 / 597.38330078125, k = [
  366 / H,
  510 / H,
  1662 / H
], qt = 566 / H, Kt = 806 / 665, jt = 808 / 665, Se = 1176 / 665, Ce = 900 / 665, Zt = 1126 / 665, ye = 810 / 665, Jt = 1126 / 665, _e = 1046 / 665, Me = 1254 / 665, Qt = 1140 / 665, ei = 878 / 665, ti = 0.25, ii = 160, si = 420, ni = 80, ai = 0.18, ri = 400, oi = 0.2, li = 420, hi = 250, ci = 1.8, ui = 420, di = 20, fi = 0.045, pi = 850 / 1182, gi = (e) => Math.max(0.01, e / H), O = (e, t) => e * gi(t), vi = (e) => e.replaceAll("	", $t), Ye = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g, Si = (e) => {
  const t = vi(e);
  if (t.includes(`
`)) {
    const i = t.split(/\r?\n/);
    return i.length > 0 ? i : [""];
  }
  return [t];
}, Ie = (e, t = Gt) => Math.max(t, e), Ci = (e, t) => {
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
), _i = (e, t) => {
  const i = O(
    ri,
    t
  );
  return Math.min(
    O(li, t),
    O(ni, t) + e.width * ai + Math.max(0, e.width - i) * oi
  );
}, Mi = (e, t) => Math.min(
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
}, Ei = (e) => e.lines.filter((t) => t.replace(Ye, "").length > 0).length, Ee = (e) => e.lines.length > 1 && Ei(e) === 1, Ti = (e) => e.lines.map((t) => t.replace(Ye, "")).filter((t) => t.length > 0), Te = (e) => {
  if (e.lines.length <= 1)
    return !1;
  const t = Ti(e);
  return t.length === 1 && /^[●○◉◎]+$/u.test(t[0]);
}, B = (e) => e.size === "big" || e.fontSize >= 35, Li = (e, t) => {
  let i = 0;
  const s = e.letterSpacing;
  for (const r of e.lines) {
    const o = re(t, r), h = r.length > 1 ? s * (r.length - 1) : 0, d = Math.max(0, o + h);
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
}, bi = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1), r = Ie(Math.floor(s * Bt)), o = Ie(Math.floor(r * e.sizeScale));
    if (e.fontSize = o, t.font = q(e), e.lines = Si(e.text), Li(e, t), e.isScrolling && e.isFull) {
      const b = e.lines.length > 1 && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("游明朝"));
      if (b && e.hasSameVposFullMinchoEnder && !e.isEnder && B(e))
        e.width = Math.round(
          s * (Te(e) ? _e : Jt)
        ), e.height = Math.max(
          e.height,
          Math.round(s * ye)
        );
      else if (b && e.hasSameVposFullMinchoEnder && e.isEnder && B(e))
        e.width = Math.round(
          s * (Ee(e) ? Me : Se)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Ce)
        );
      else if (b && e.hasSameVposFullMinchoEnder && e.isEnder)
        e.width = Math.round(
          s * (Ee(e) ? Me : Qt)
        ), e.height = Math.max(
          e.height,
          Math.round(s * ei)
        );
      else if (b && B(e))
        e.width = Math.round(
          s * (Te(e) ? _e : Se)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Ce)
        );
      else if (b)
        e.width = Math.round(s * Zt), e.height = Math.max(
          e.height,
          Math.round(s * ye)
        );
      else {
        const V = B(e) ? jt : Kt;
        e.width = Ci(e, s), e.height = Math.max(e.height, Math.round(s * V));
      }
    }
    if (!e.isScrolling) {
      const b = a + r * 2.6666666666666665;
      e.width >= b * 0.95 && e.fontSize >= 35 ? e.width = Math.round(s * Yt) : e.width = Math.min(e.width, b), e.bufferWidth = 0;
      const V = (a - e.width) / 2;
      e.virtualStartX = V, e.x = V, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = x, e.preCollisionDurationMs = x, e.totalDurationMs = x, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + x, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const h = re(t, "??".repeat(150)), d = e.width, u = d * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, u);
    const l = Math.max(n.entryBufferPx, e.bufferWidth), f = e.scrollDirection, c = Math.min(1, s / H), p = e.isFull ? n.virtualExtension * c : n.virtualExtension, S = e.isFull ? yi(e.width, s) : 0, M = e.isFull ? O(di, s) + e.width * fi : 0, y = e.isFull ? 0 : _i(e, s), g = e.isFull ? 0 : Mi(e, s), C = f === "rtl" ? a + p + S + y : -d - e.bufferWidth - p - S - y, E = f === "rtl" ? -d - e.bufferWidth - l + S - y - g : a + l - S + y + g, N = f === "rtl" ? a + l : -l;
    e.virtualStartX = C, e.x = C, e.exitThreshold = E;
    const D = a > 0 ? d / a : 0, at = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let K = n.maxVisibleDurationMs;
    if (!at && D > 1 && !e.isFull) {
      const b = Math.min(D, n.maxWidthRatio), V = n.maxVisibleDurationMs / Math.max(b, 1);
      K = Math.max(n.minVisibleDurationMs, Math.floor(V));
    }
    const rt = a + d + e.bufferWidth + l + p + M + y * 2 + g, ot = Math.max(K, 1), j = rt / ot, lt = j * 1e3 / 60;
    e.baseSpeed = lt, e.speed = e.baseSpeed, e.speedPixelsPerMs = j;
    const ht = Math.abs(E - C), ue = f === "rtl" ? C + d + e.bufferWidth : C - e.bufferWidth, ct = f === "rtl" ? Math.max(0, ue - N) : Math.max(0, N - ue), de = Math.max(j, Number.EPSILON);
    e.visibleDurationMs = K, e.preCollisionDurationMs = Math.max(0, Math.ceil(ct / de)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(ht / de)
    );
    const ut = d + e.bufferWidth + l, dt = Ii(e, a);
    e.reservationWidth = Math.min(
      h,
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
}, z = /* @__PURE__ */ new Map(), mi = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return Q;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, Fi = (e) => {
  F.enabled = !!e.enabled, F.maxLogsPerCategory = mi(e.maxLogsPerCategory), F.enabled || z.clear();
}, Ea = () => {
  z.clear();
}, R = () => F.enabled, wi = (e) => {
  const t = z.get(e) ?? 0;
  return t >= F.maxLogsPerCategory ? (t === F.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), z.set(e, t + 1)), !1) : (z.set(e, t + 1), !0);
}, _ = (e, ...t) => {
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
  F.enabled && _("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
}, Le = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, qe = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), Ai = (e) => {
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
}, Pi = (e) => e ? {
  ...e.no !== void 0 ? { no: e.no } : {},
  ...e.fork !== void 0 ? { fork: e.fork } : {},
  ...e.source !== void 0 ? { source: e.source } : {},
  ...e.threadId !== void 0 ? { threadId: e.threadId } : {},
  ...e.date !== void 0 ? { date: e.date } : {},
  ...e.userIdHash !== void 0 ? { userIdHash: e.userIdHash } : {}
} : {}, Ke = (e) => ({
  text: e.text,
  vposMs: e.vposMs,
  ...Pi(e.meta),
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
    timestampMs: qe(),
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
    comment: Ke(i),
    ...s
  });
}, Ni = (e, t, i) => {
  const s = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof s != "function" || s({
    source: "comment-overlay",
    op: e,
    timestampMs: qe(),
    comment: Ke(t),
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
}, Di = () => typeof OffscreenCanvas < "u", oe = (e, t, i) => {
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
}, le = () => 2.8, je = 665, Vi = 566, te = 808, me = Vi / je, Fe = te / je, Hi = 1098, ki = 1530, we = 20.9, xe = 58.9, Oe = 45.23908523908523 / 39, Wi = 14.9, zi = 41.9, Xi = 28.92708257149126 / 27, Ae = 20, Re = 11.4, Pe = 31.4, Ne = 23.87692307692307, Ui = 2.4, J = 2, De = 66.9, Ve = 55.6, Bi = 59, Gi = 810, $i = 21.5, Ze = 878, Je = 900, Yi = 10, qi = 6.75, Ki = 16.75, ji = 12.11423203055002, Zi = 0.5, Ji = 1.42, Qi = 0.12, es = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const i = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!i)
    return !1;
  const s = i[1], n = s.length === 3 || s.length === 4, a = (d) => d.length === 1 ? `${d}${d}` : d, r = Number.parseInt(a(n ? s[0] : s.slice(0, 2)), 16), o = Number.parseInt(a(n ? s[1] : s.slice(2, 4)), 16), h = Number.parseInt(a(n ? s[2] : s.slice(4, 6)), 16);
  return r === 0 && o === 0 && h === 0;
}, he = (e) => es(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", ts = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, is = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const i = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + i;
}, Qe = (e) => {
  if (e.isScrolling && e.isFull) {
    if (e.hasSameVposFullMinchoEnder) {
      const h = Math.ceil(e.height);
      return {
        paddingX: Math.max(10, e.fontSize * 0.5),
        paddingY: h >= Je ? De : h >= Ze ? Ve : $i,
        textureWidth: Math.ceil(e.width),
        textureHeight: h
      };
    }
    const o = e.hasSameVposFullMinchoEnder && e.isEnder ? e.fontSize >= 35 ? De : Ve : null;
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: o ?? (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + Ui,
      textureWidth: Math.ceil(e.width),
      textureHeight: Math.ceil(e.height)
    };
  }
  if (e.isScrolling && e.lines.length > 1) {
    const o = e.fontSize * 1.3333333333333333, h = e.fontSize;
    return {
      paddingX: o,
      paddingY: h,
      textureWidth: Math.ceil(e.width + o * 2),
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
}, ss = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35 ? 0.8 : 1, et = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, tt = (e) => et(e) && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("YuMincho") || e.fontFamily.includes("游明朝")), ns = (e, t) => tt(e) ? Ji : t, as = (e) => Math.max(1, e.width + e.virtualStartX * 2), rs = (e) => e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder ? Bi * Math.min(1, e.height / Gi) : 0, os = (e, t, i, s, n) => {
  const a = ns(e, n);
  if (tt(e))
    return {
      x: as(e) * Qi,
      scaleX: a,
      scaleY: n
    };
  const r = !e.isScrolling && a !== 1 ? t.width * (1 - a) * Zi : 0;
  return {
    x: i - s + r + rs(e),
    scaleX: a,
    scaleY: n
  };
}, ce = (e, t, i, s, n) => (a, r, o, h = 0) => {
  if (a.length === 0)
    return;
  const d = n + h, u = () => {
    s === "cache" ? o === "outline" ? v.outlineCallsInCache++ : v.fillCallsInCache++ : o === "outline" ? v.outlineCallsInFallback++ : v.fillCallsInFallback++;
  }, l = (c, p, S) => {
    if (u(), o === "outline") {
      t.strokeText(c, p, r), ee("strokeText", t, e, {
        text: c,
        x: p,
        y: r,
        meta: { statsTarget: s, mode: o, ...S }
      });
      return;
    }
    t.fillText(c, p, r), ee("fillText", t, e, {
      text: c,
      x: p,
      y: r,
      meta: { statsTarget: s, mode: o, ...S }
    });
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    l(a, d);
    return;
  }
  let f = d;
  for (let c = 0; c < a.length; c += 1) {
    const p = a[c];
    l(p, f, { characterIndex: c });
    const S = re(i, p);
    f += S, c < a.length - 1 && (f += e.letterSpacing);
  }
}, ls = (e) => `v8::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.width}::${e.height}::${e.lines.length}`, He = (e, t, i) => {
  const s = new OffscreenCanvas(i.width, i.height), n = s.getContext("2d");
  if (!n)
    return null;
  n.save(), n.font = i.sourceFont ? q(e) : ts(e, i.fontSize);
  const a = A(e.opacity), r = se(e.color, a), o = e.renderStyle === "outline-only", h = o ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, i.fontSize, a);
  n.shadowColor = `rgba(0, 0, 0, ${h.alpha})`, n.shadowBlur = h.blur, n.shadowOffsetX = 0, n.shadowOffsetY = 0, n.lineJoin = "round", n.lineWidth = le(), n.strokeStyle = he(e), n.fillStyle = r, typeof i.canvasScale == "number" && n.scale(i.canvasScale, i.canvasScale);
  const d = e.lines.length > 0 ? e.lines : [e.text], u = ce(e, n, t, "cache", i.paddingX);
  return o && d.forEach((l, f) => {
    u(l, i.baselineY + f * i.lineHeight, "outline");
  }), d.forEach((l, f) => {
    u(l, i.baselineY + f * i.lineHeight, "fill");
  }), n.restore(), s;
}, hs = (e, t, i) => {
  for (const s of i.traces ?? [])
    He(e, t, s);
  return He(e, t, i.output);
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
          width: Math.round(Hi * n),
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
        baselineY: Pe * n,
        lineHeight: Ne * n
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
          baselineY: Pe * n,
          lineHeight: Ne * n,
          canvasScale: J
        }
      };
    }
    return i < Je ? {
      output: {
        width: t,
        height: i,
        fontSize: e.fontSize,
        paddingX: Wi,
        baselineY: zi,
        lineHeight: e.fontSize * Xi,
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
  return et(e) ? {
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
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: o } = Qe(e), h = cs(e, r, o);
  if (h)
    return hs(e, t, h);
  const d = new OffscreenCanvas(r, o), u = d.getContext("2d");
  if (!u)
    return null;
  u.save(), u.font = q(e);
  const l = A(e.opacity), f = n, c = e.lines.length > 0 ? e.lines : [e.text], p = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, S = is(e, a), M = ce(e, u, t, "cache", f), y = se(e.color, l), g = e.renderStyle === "outline-only", C = g ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, e.fontSize, l);
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
  ), u.save(), u.shadowColor = `rgba(0, 0, 0, ${C.alpha})`, u.shadowBlur = C.blur, u.shadowOffsetX = 0, u.shadowOffsetY = 0, u.lineJoin = "round", u.lineWidth = le(), u.strokeStyle = he(e), u.fillStyle = y, g && c.forEach((E, N) => {
    const D = S + N * p;
    M(E, D, "outline");
  }), c.forEach((E, N) => {
    const D = S + N * p;
    M(E, D, "fill");
  }), u.restore(), u.restore(), d;
}, ds = (e, t, i) => {
  v.fallbacks++, t.save(), t.font = q(e);
  const s = A(e.opacity), n = i ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, o = e.y + e.fontSize, h = ce(e, t, t, "fallback", n), d = se(e.color, s), u = e.renderStyle === "outline-only", l = u ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, e.fontSize, s);
  R() && console.log(
    "[Shadow Debug - Fallback]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${l.blur}px`,
    `
  Shadow alpha: ${l.alpha}`,
    `
  Fill style: ${d}`
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${l.alpha})`, t.shadowBlur = l.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = le(), t.strokeStyle = he(e), t.fillStyle = d, u && a.forEach((f, c) => {
    const p = o + c * r;
    h(f, p, "outline");
  }), a.forEach((f, c) => {
    const p = o + c * r;
    h(f, p, "fill");
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
      const r = i ?? e.x, { paddingX: o, paddingY: h } = Qe(e), d = ss(e), u = os(e, a, r, o, d), l = u.x, f = e.isScrolling ? e.y : e.y - h;
      u.scaleX === 1 && u.scaleY === 1 ? t.drawImage(a, l, f) : t.drawImage(
        a,
        l,
        f,
        a.width * u.scaleX,
        a.height * u.scaleY
      ), ee("drawImage", t, e, {
        x: l,
        y: f,
        width: a.width * u.scaleX,
        height: a.height * u.scaleY,
        sourceWidth: a.width,
        sourceHeight: a.height,
        meta: {
          statsTarget: "cache",
          paddingX: o,
          paddingY: h,
          drawScale: d,
          drawScaleX: u.scaleX,
          drawScaleY: u.scaleY
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
    const o = mt(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = o.layout, this.isScrolling = this.layout === "naka", this.size = o.size, this.sizeScale = o.sizeScale, this.opacityMultiplier = o.opacityMultiplier, this.opacityOverride = o.opacityOverride, this.colorOverride = o.colorOverride, this.isInvisible = o.isInvisible, this.isFull = o.isFull, this.isEnder = o.isEnder, this.fontFamily = o.fontFamily, this.fontWeight = o.fontWeight, this.color = o.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = o.letterSpacing, this.lineHeightMultiplier = o.lineHeight, this.timeSource = a.timeSource ?? Be(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
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
}), La = "v4.0.0", ys = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, G = (e) => {
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
}, _s = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(Number(t))
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, Ms = () => typeof document > "u" ? () => {
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
}, We = (e) => {
  const t = e.meta?.no;
  return typeof t == "number" && Number.isFinite(t) ? t : null;
}, Ts = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const i of e) {
    const { text: s, vposMs: n, commands: a = [], meta: r = null } = i, o = X(s);
    if (this.isNGComment(s)) {
      _("comment-skip-ng", { preview: o, vposMs: n });
      continue;
    }
    const h = xt(n);
    if (h === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), _("comment-skip-invalid-vpos", { preview: o, vposMs: n });
      continue;
    }
    const d = r?.no !== void 0 ? `no:${r.source ?? ""}:${r.fork ?? ""}:${r.threadId ?? ""}:${r.no}` : `fallback:${s}\0${h}`, u = (c) => c.meta?.no !== void 0 ? `no:${c.meta.source ?? ""}:${c.meta.fork ?? ""}:${c.meta.threadId ?? ""}:${c.meta.no}` : `fallback:${c.text}\0${c.vposMs}`;
    if (this.comments.some((c) => u(c) === d) || t.some((c) => u(c) === d)) {
      _("comment-skip-duplicate", { preview: o, vposMs: h });
      continue;
    }
    const f = new vs(
      s,
      h,
      a,
      this._settings,
      this.commentDependencies,
      r
    );
    f.creationIndex = this.commentSequence++, f.epochId = this.epochId, t.push(f), _("comment-added", {
      preview: o,
      vposMs: h,
      commands: f.commands.length,
      layout: f.layout,
      isScrolling: f.isScrolling,
      invisible: f.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), Es(this.comments), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    if (Math.abs(n) > T)
      return n;
    const a = We(i), r = We(s);
    return a !== null && r !== null && Math.abs(a - r) > T ? a - r : i.creationIndex - s.creationIndex;
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
}, it = function() {
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
  e.prototype.addComments = Ts, e.prototype.addComment = Ls, e.prototype.clearComments = bs, e.prototype.resetState = ms, e.prototype.rebuildNgMatchers = it, e.prototype.isNGComment = Fs;
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
  return t !== void 0 ? t : st(e);
}, st = (e) => {
  if (!e.isScrolling)
    return e.vposMs;
  const t = e.isFull ? zt : kt;
  return Math.max(0, e.vposMs - t);
}, Ps = function(e) {
  if (!e.isScrolling)
    return x;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : ne;
}, Ns = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), st(e);
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
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + W, i = Math.max(e + W, t), s = this.comments.filter((d) => d.hasShown || d.isInvisible || this.isNGComment(d.text) ? !1 : d.vposMs >= e - m).sort((d, u) => {
    const l = d.vposMs - u.vposMs;
    return Math.abs(l) > T ? l : d.creationIndex - u.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(i - e, W) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : Z, o = Math.max(Z, Math.min(r, Dt));
  let h = e;
  s.forEach((d, u) => {
    const l = Math.max(1, this.getFinalPhaseDisplayDuration(d)), f = i - l;
    let c = Math.max(e, Math.min(h, f));
    Number.isFinite(c) || (c = e);
    const p = Vt * u;
    c + p <= f && (c += p), this.finalPhaseVposOverrides.set(d, c);
    const S = Math.max(Z, Math.min(l / 2, o));
    h = c + S;
  }), this.finalPhaseScheduleDirty = !1;
}, Vs = (e) => {
  e.prototype.resetFinalPhaseState = xs, e.prototype.incrementEpoch = Os, e.prototype.emitStateSnapshot = As, e.prototype.getEffectiveCommentVpos = Rs, e.prototype.getFinalPhaseDisplayDuration = Ps, e.prototype.resolveFinalPhaseVpos = Ns, e.prototype.recomputeFinalPhaseTimeline = Ds;
}, Hs = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= P;
}, ks = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > P) && (this.playbackHasBegun = !0);
}, Ws = (e) => {
  e.prototype.shouldSuppressRendering = Hs, e.prototype.updatePlaybackProgressState = ks;
}, zs = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, o = this.displayHeight > 0 ? this.displayHeight : i.height / a, h = this.buildPrepareOptions(r), d = this.duration > 0 && this.duration - this.currentTime <= Nt;
  d && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, o), this.comments.forEach((l) => {
    l.isActive = !1, l.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !d && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const l of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(l), c = f < this.currentTime - m, p = f > this.currentTime + m;
    if (c || p) {
      l.isActive = !1, this.activeComments.delete(l), l.clearActivation(), l.lane >= 0 && (l.layout === "ue" ? this.releaseStaticLane("ue", l.lane) : l.layout === "shita" && this.releaseStaticLane("shita", l.lane));
      continue;
    }
    l.isScrolling && l.hasShown && (l.scrollDirection === "rtl" && l.x <= l.exitThreshold || l.scrollDirection === "ltr" && l.x >= l.exitThreshold) && (l.isActive = !1, this.activeComments.delete(l), l.clearActivation());
  }
  const u = this.getCommentsInTimeWindow(this.currentTime, m);
  for (const l of u) {
    const f = R(), c = f ? X(l.text) : "";
    if (f && _("comment-evaluate", {
      stage: "update",
      preview: c,
      vposMs: l.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(l),
      currentTime: this.currentTime,
      isActive: l.isActive,
      hasShown: l.hasShown
    }), this.isNGComment(l.text)) {
      f && _("comment-eval-skip", {
        preview: c,
        vposMs: l.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(l),
        reason: "ng-runtime"
      });
      continue;
    }
    if (l.isInvisible) {
      f && _("comment-eval-skip", {
        preview: c,
        vposMs: l.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(l),
        reason: "invisible"
      }), l.isActive = !1, this.activeComments.delete(l), l.hasShown = !0, l.clearActivation();
      continue;
    }
    if (l.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(l, this.currentTime, c) && this.activateComment(
      l,
      s,
      r,
      o,
      h,
      this.currentTime
    ), l.isActive) {
      if (l.layout !== "naka" && l.hasStaticExpired(this.currentTime)) {
        const p = l.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
        continue;
      }
      if (l.layout === "naka" && this.getEffectiveCommentVpos(l) > this.currentTime + P) {
        l.x = l.virtualStartX, l.lastUpdateTime = this.timeSource.now();
        continue;
      }
      if (l.hasShown = !0, l.update(this.playbackRate, !this.isPlaying), !l.isScrolling && l.hasStaticExpired(this.currentTime)) {
        const p = l.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
      }
    }
  }
}, Xs = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = ne, s = fe;
  return t !== null && (i = t, s = Math.max(1, Math.min(t, fe))), {
    visibleWidth: e,
    virtualExtension: Ht,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: Ot,
    bufferRatio: At,
    baseBufferPx: Rt,
    entryBufferPx: Pt
  };
}, Us = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t), n = i.map((h) => {
    const u = (this.reservedLanes.get(h) ?? []).find(
      (l) => this.areReservationsConflicting(l, s)
    );
    return {
      lane: h,
      available: u === void 0,
      nextAvailableTime: this.getLaneNextAvailableTime(h, t),
      blocker: u
    };
  }), a = n.find((h) => h.available), r = i[i.length - 1] ?? 0, o = a?.lane ?? r;
  return this.storeLaneReservation(o, s), Ni("laneDecision", e, {
    meta: {
      currentTimeMs: t,
      selectedLane: o,
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
  }), o;
}, Bs = (e) => {
  e.prototype.updateComments = zs, e.prototype.buildPrepareOptions = Xs, e.prototype.findAvailableLane = Us;
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
    const o = this.comments[r];
    if (o) {
      if (o.vposMs > s)
        break;
      a.push(o);
    }
  }
  return a;
}, Zs = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, Js = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, Qs = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, en = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, tn = (e) => {
  const t = Math.ceil(
    e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
  );
  return Math.max(0, (t - e.height) / 2);
}, sn = function(e, t, i, s) {
  const n = Math.max(1, i), a = Math.max(s.height, s.fontSize), r = 5, o = 0, h = tn(s);
  if (e === "ue") {
    const c = r + h;
    let p = c;
    const M = this.getStaticReservations(e).filter((g) => g.lane < t).sort((g, C) => g.lane - C.lane);
    for (const g of M) {
      const C = g.yEnd - g.yStart;
      p += C + o;
    }
    const y = Math.max(r, n * 2);
    return Math.max(c, Math.min(p, y));
  }
  let d = n - r;
  const l = this.getStaticReservations(e).filter((c) => c.lane < t).sort((c, p) => c.lane - p.lane);
  for (const c of l) {
    const p = c.yEnd - c.yStart;
    d -= p + o;
  }
  const f = d - a;
  return Math.max(r, f);
}, nn = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, an = (e) => {
  e.prototype.findCommentIndexAtOrAfter = Ks, e.prototype.getCommentsInTimeWindow = js, e.prototype.getStaticReservations = Zs, e.prototype.getStaticLaneDepth = Js, e.prototype.getStaticLaneLimit = Qs, e.prototype.getGlobalLaneIndexForBottom = en, e.prototype.resolveStaticCommentOffset = sn, e.prototype.getStaticReservedLaneSet = nn;
}, rn = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, nt = (e) => Math.max(1, e.fontSize * (rn(e) ? 0.46 : 1)), on = function(e, t, i = "") {
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
  }), !1) : n < t - m ? (s && _("comment-eval-skip", {
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
}, ln = function(e, t, i, s, n, a) {
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
    const o = Math.max(0, a - r), h = e.speedPixelsPerMs * o;
    if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
      const c = this.duration > 0 ? this.duration : this.finalPhaseStartTime + W, p = Math.max(
        this.finalPhaseStartTime + W,
        c
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
    const u = Math.max(1, this.laneHeight), l = Math.max(0, s - e.height), f = d * u;
    e.y = e.isFull ? 0 : Math.max(0, Math.min(f, l));
  } else {
    const o = e.layout === "ue" ? "ue" : "shita", h = this.assignStaticLane(o, e, s, a), d = this.resolveStaticCommentOffset(
      o,
      h,
      s,
      e
    );
    e.x = e.virtualStartX, e.y = d, e.lane = o === "ue" ? h : this.getGlobalLaneIndexForBottom(h), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0;
    const u = r + x;
    e.visibleDurationMs = Math.max(0, u - a), this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = u, this.reserveStaticLane(o, e, h, u), R() && _("comment-activate-static", {
      preview: X(e.text),
      lane: e.lane,
      position: o,
      displayEnd: u,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, hn = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = nt(t), r = Math.max(1, a), o = Math.max(
    this.laneCount,
    Math.ceil(Math.max(1, i) / r) + n.length + 1
  ), h = Array.from({ length: o }, (l, f) => f);
  for (const l of h) {
    const f = this.resolveStaticCommentOffset(e, l, i, t), c = f, p = f + a;
    if (!n.some((M) => M.releaseTime > s ? !(p <= M.yStart || c >= M.yEnd) : !1))
      return l;
  }
  let d = h[0] ?? 0, u = Number.POSITIVE_INFINITY;
  for (const l of n)
    l.releaseTime < u && (u = l.releaseTime, d = l.lane);
  return d;
}, cn = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = t.y, r = t.y + nt(t);
  n.push({
    comment: t,
    releaseTime: s,
    yStart: a,
    yEnd: r,
    lane: i
  });
}, un = function(e, t) {
  if (t < 0)
    return;
  const i = this.getStaticReservations(e), s = i.findIndex((n) => n.lane === t);
  s >= 0 && i.splice(s, 1);
}, dn = (e) => {
  e.prototype.shouldActivateCommentAtTime = on, e.prototype.activateComment = ln, e.prototype.assignStaticLane = hn, e.prototype.reserveStaticLane = cn, e.prototype.releaseStaticLane = un;
}, fn = 1e-3, pn = function() {
  return Array.from({ length: this.laneCount }, (e, t) => t);
}, gn = function(e, t) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return t;
  const s = this.findFirstValidReservationIndex(i, t), n = i[s];
  return n ? Math.max(t, n.endTime + Y) : t;
}, vn = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, T), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = Number.isFinite(e.width) && e.width > 0 ? e.width : e.reservationWidth, o = i > 0 ? Math.max(r, 0) / i : e.preCollisionDurationMs, h = a + o + Y, d = a + e.totalDurationMs + Y;
  return {
    comment: e,
    startTime: a,
    endTime: Math.max(a, h),
    totalEndTime: Math.max(a, d),
    startLeft: e.virtualStartX,
    width: r,
    speed: i,
    buffer: 0,
    directionSign: e.getDirectionSign()
  };
}, Sn = function(e, t, i) {
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
}, Cn = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, yn = function(e, t) {
  if (e.directionSign === t.directionSign) {
    const o = e.speed > 0 ? Math.max(e.width, 0) / e.speed : 0, h = t.speed > 0 ? Math.max(t.width, 0) / t.speed : 0, d = Math.max(o, h);
    return Math.abs(t.startTime - e.startTime) + fn < d;
  }
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
  for (const o of n) {
    if (o < i - T || o > s + T)
      continue;
    const h = this.computeForwardGap(e, t, o), d = this.computeForwardGap(t, e, o);
    if (h <= -24 && d <= -24)
      return !0;
  }
  return !1;
}, _n = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, Mn = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, In = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < T)
    return null;
  const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, En = (e) => {
  e.prototype.getLanePriorityOrder = pn, e.prototype.getLaneNextAvailableTime = gn, e.prototype.createLaneReservation = vn, e.prototype.isLaneAvailable = Sn, e.prototype.storeLaneReservation = Cn, e.prototype.areReservationsConflicting = yn, e.prototype.computeForwardGap = _n, e.prototype.getBufferedEdges = Mn, e.prototype.solveLeftRightEqualityTime = In;
}, Tn = function() {
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
    const o = (a - this.lastDrawTime) / 16.666666666666668;
    r.sort((h, d) => {
      const u = this.getEffectiveCommentVpos(h), l = this.getEffectiveCommentVpos(d), f = u - l;
      return Math.abs(f) > T ? f : h.isScrolling !== d.isScrolling ? h.isScrolling ? 1 : -1 : h.creationIndex - d.creationIndex;
    }), r.forEach((h) => {
      const u = this.isPlaying && !h.isPaused ? h.x + h.getDirectionSign() * h.speed * o : h.x;
      h.draw(t, u);
    });
  }
  this.lastDrawTime = a;
}, Ln = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, o = this.displayHeight > 0 ? this.displayHeight : i.height / a, h = this.buildPrepareOptions(r);
  this.activeComments.forEach((u) => {
    u.isActive = !1, u.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.getCommentsInTimeWindow(this.currentTime, m).forEach((u) => {
    if (this.isNGComment(u.text) || u.isInvisible) {
      u.isActive = !1, this.activeComments.delete(u), u.clearActivation();
      return;
    }
    if (u.syncWithSettings(this._settings, this.settingsVersion), u.isActive = !1, this.activeComments.delete(u), u.lane = -1, u.hasShown = !1, u.clearActivation(), this.shouldActivateCommentAtTime(u, this.currentTime)) {
      this.activateComment(
        u,
        s,
        r,
        o,
        h,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(u) < this.currentTime - m ? u.hasShown = !0 : u.hasShown = !1;
  });
}, bn = (e) => {
  e.prototype.draw = Tn, e.prototype.performInitialSync = Ln;
}, mn = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, Fn = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, wn = function(e, t) {
  this.videoFrameHandle = null;
  const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
}, xn = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, On = function() {
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
}, An = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, Rn = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, Pn = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, Nn = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, Dn = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  if (!e || !t || !i)
    return;
  const s = L(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
  if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
    this.currentTime = s, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
    return;
  }
  const o = n > P;
  if (this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !o) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const h = this.canvasDpr > 0 ? this.canvasDpr : 1, d = this.displayWidth > 0 ? this.displayWidth : e.width / h, u = this.displayHeight > 0 ? this.displayHeight : e.height / h, l = this.buildPrepareOptions(d);
  this.getCommentsInTimeWindow(this.currentTime, m).forEach((c) => {
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
        d,
        u,
        l,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(c) < this.currentTime - m ? c.hasShown = !0 : c.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Vn = (e) => {
  e.prototype.processFrame = mn, e.prototype.handleAnimationFrame = Fn, e.prototype.handleVideoFrame = wn, e.prototype.shouldUseVideoFrameCallback = xn, e.prototype.scheduleNextFrame = On, e.prototype.cancelAnimationFrameRequest = An, e.prototype.cancelVideoFrameCallback = Rn, e.prototype.startAnimation = Pn, e.prototype.stopAnimation = Nn, e.prototype.onSeek = Dn;
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
}, kn = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, Wn = function(e) {
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
}, zn = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Xn = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, Un = (e) => {
  e.prototype.resolveContainer = Hn, e.prototype.ensureContainerPositioning = kn, e.prototype.initialize = Wn, e.prototype.destroy = zn, e.prototype.destroyCanvasOnly = Xn;
}, Bn = function(e) {
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
    }, o = () => {
      this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0;
    }, h = () => {
      this.handleVideoSourceChange();
    }, d = () => {
      this.handleVideoStalled();
    }, u = () => {
      this.handleVideoCanPlay();
    }, l = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", o), e.addEventListener("emptied", h), e.addEventListener("waiting", d), e.addEventListener("canplay", u), e.addEventListener("playing", l), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", o)), this.addCleanup(() => e.removeEventListener("emptied", h)), this.addCleanup(() => e.removeEventListener("waiting", d)), this.addCleanup(() => e.removeEventListener("canplay", u)), this.addCleanup(() => e.removeEventListener("playing", l));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, Gn = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, $n = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
  t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, Yn = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = L(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, qn = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, Kn = function(e) {
  this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0, this.currentTime = L(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.lastDrawTime = this.timeSource.now();
}, jn = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, Zn = function(e, t) {
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
        let o = null, h = null;
        if ((r instanceof HTMLVideoElement || r instanceof HTMLSourceElement) && (o = typeof a.oldValue == "string" ? a.oldValue : null, h = r.getAttribute("src")), o === h)
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
          const o = this.extractVideoElement(r);
          if (o && o !== this.videoElement) {
            this.initialize(o);
            return;
          }
        }
        for (const r of a.removedNodes) {
          if (r === this.videoElement) {
            this.videoElement = null, this.handleVideoSourceChange(null);
            return;
          }
          if (r instanceof Element) {
            const o = r.querySelector("video");
            if (o && o === this.videoElement) {
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
}, Qn = (e) => {
  e.prototype.setupVideoEventListeners = Bn, e.prototype.handleVideoMetadataLoaded = Gn, e.prototype.handleVideoStalled = $n, e.prototype.handleVideoCanPlay = Yn, e.prototype.handleVideoSourceChange = qn, e.prototype.syncVideoState = Kn, e.prototype.resetCommentActivity = jn, e.prototype.setupVideoChangeDetection = Zn, e.prototype.extractVideoElement = Jn;
}, ea = function() {
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
}, ta = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  !e || !t || !i || (this.currentTime = L(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, ia = function(e) {
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
}, sa = (e) => {
  e.prototype.setupVisibilityHandling = ea, e.prototype.handleVisibilityRestore = ta, e.prototype.setCommentVisibility = ia;
}, na = 2.1, aa = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const r = (this.fullscreenActive && s.parentElement instanceof HTMLElement ? s.parentElement.getBoundingClientRect() : null) ?? i.getBoundingClientRect(), o = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : s.width / o, d = this.displayHeight > 0 ? this.displayHeight : s.height / o, u = e ?? r.width ?? h, l = t ?? r.height ?? d;
  if (!Number.isFinite(u) || !Number.isFinite(l) || u <= 0 || l <= 0)
    return;
  const f = Math.max(1, Math.floor(u)), c = Math.max(1, Math.floor(l)), p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, S = Math.max(1, Math.round(f * p)), M = Math.max(1, Math.round(c * p));
  (this.displayWidth !== f || this.displayHeight !== c || Math.abs(this.canvasDpr - p) > Number.EPSILON || s.width !== S || s.height !== M) && (this.displayWidth = f, this.displayHeight = c, this.canvasDpr = p, s.width = S, s.height = M, s.style.width = `${f}px`, s.style.height = `${c}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p)), this.calculateLaneMetrics(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.performInitialSync(L(i.currentTime)), this.draw());
}, ra = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, oa = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(Wt, Math.floor(t * (27 / 665)));
  this.laneHeight = i * na;
  const s = Math.max(this.laneHeight, 1), a = Math.floor(Math.max(0, t - s) / s);
  if (this._settings.useFixedLaneCount) {
    const r = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : Ge, o = Math.max(pe, Math.min(a, r));
    this.laneCount = o;
  } else
    this.laneCount = Math.max(pe, a);
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
      for (const o of r) {
        const { width: h, height: d } = o.contentRect;
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
}, ze = (e) => {
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
    const o = a.getBoundingClientRect();
    this.resize(o.width, o.height), ze(this);
    return;
  }
  this.resize(), ze(this);
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
}, _a = (e) => {
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
    it.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (Is(t))
      s = G({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = G(Cs());
    }
    this._settings = G(s), this.timeSource = n.timeSource ?? Be(), this.animationFrameProvider = n.animationFrameProvider ?? _s(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? Ms(), this.commentDependencies = {
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
Vs(I);
Ws(I);
Bs(I);
qs(I);
an(I);
dn(I);
En(I);
bn(I);
Vn(I);
Un(I);
Qn(I);
sa(I);
ca(I);
Sa(I);
_a(I);
const Ma = (e) => ({
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
    globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = !0, globalThis.__COMMENT_OVERLAY_TRACE__ = ((o) => {
      r && !r.has(o.op) || s.push(o);
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
    activeComments: Array.from(e.activeComments, Ma),
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
  _s as createDefaultAnimationFrameProvider,
  Be as createDefaultTimeSource,
  $e as createLogger,
  _ as debugLog,
  xi as dumpRendererState,
  R as isDebugLoggingEnabled,
  Oi as logEpochChange,
  Ea as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
