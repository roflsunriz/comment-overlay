const Be = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, Ue = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"游明朝体","游明朝","Yu Mincho",YuMincho,yumincho,YuMin-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic'
}, $e = {
  defont: "600",
  gothic: "",
  mincho: ""
}, _e = {
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
}, ne = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Ye = /^[,.:;]+/, qe = /[,.:;]+$/, Ke = (e) => {
  const t = e.trim();
  return t ? ne.test(t) ? t : t.replace(Ye, "").replace(qe, "") : "";
}, je = (e) => ne.test(e) ? e.toUpperCase() : null, Te = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const s = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, i = Number.parseFloat(s);
  return Number.isFinite(i) ? i : null;
}, Je = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const s = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(s) ? s / 100 : null;
  }
  return Te(t);
}, Ze = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, Qe = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), et = (e) => e === "naka" || e === "ue" || e === "shita", tt = (e) => e === "small" || e === "medium" || e === "big", it = (e) => e === "defont" || e === "gothic" || e === "mincho", st = (e) => e in _e, nt = (e, t) => {
  let s = "naka", i = "medium", n = "defont", a = null, r = 1, h = null, u = !1, l = !1, d = !1, o = 0, f = 1;
  for (const C of e) {
    const M = Ke(typeof C == "string" ? C : "");
    if (!M)
      continue;
    if (ne.test(M)) {
      const S = je(M);
      if (S) {
        a = S;
        continue;
      }
    }
    const v = M.toLowerCase();
    if (et(v)) {
      s = v;
      continue;
    }
    if (tt(v)) {
      i = v;
      continue;
    }
    if (it(v)) {
      n = v;
      continue;
    }
    if (st(v)) {
      a = _e[v].toUpperCase();
      continue;
    }
    if (v === "_live") {
      h = 0.5;
      continue;
    }
    if (v === "invisible") {
      r = 0, u = !0;
      continue;
    }
    if (v === "full") {
      l = !0;
      continue;
    }
    if (v === "ender") {
      d = !0;
      continue;
    }
    if (v.startsWith("ls:") || v.startsWith("letterspacing:")) {
      const S = M.indexOf(":");
      if (S >= 0) {
        const _ = Te(M.slice(S + 1));
        _ !== null && (o = Ze(_));
      }
      continue;
    }
    if (v.startsWith("lh:") || v.startsWith("lineheight:")) {
      const S = M.indexOf(":");
      if (S >= 0) {
        const _ = Je(M.slice(S + 1));
        _ !== null && (f = Qe(_));
      }
      continue;
    }
  }
  const c = Math.max(0, Math.min(1, r)), p = (a ?? t.defaultColor).toUpperCase(), g = typeof h == "number" ? Math.max(0, Math.min(1, h)) : null;
  return {
    layout: s,
    size: i,
    sizeScale: Be[i],
    font: n,
    fontFamily: Ue[n],
    fontWeight: $e[n],
    resolvedColor: p,
    colorOverride: a,
    opacityMultiplier: c,
    opacityOverride: g,
    isInvisible: u,
    isFull: l,
    isEnder: d,
    letterSpacing: o,
    lineHeight: f
  };
}, at = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, X = (e) => e.length === 1 ? e.repeat(2) : e, O = (e) => Number.parseInt(e, 16), F = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, j = (e, t) => {
  const s = at.exec(e);
  if (!s)
    return e;
  const i = s[1];
  let n, a, r, h = 1;
  i.length === 3 || i.length === 4 ? (n = O(X(i[0])), a = O(X(i[1])), r = O(X(i[2])), i.length === 4 && (h = O(X(i[3])) / 255)) : (n = O(i.slice(0, 2)), a = O(i.slice(2, 4)), r = O(i.slice(4, 6)), i.length === 8 && (h = O(i.slice(6, 8)) / 255));
  const u = F(h * F(t));
  return `rgba(${n}, ${a}, ${r}, ${u})`;
}, rt = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), be = () => rt(), w = (e) => e * 1e3, ot = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), ae = 6e3, he = 2700, lt = 3, ht = 0.25, ct = 32, ut = 48, $ = 120, dt = 6e3, te = 120, ft = 800, pt = 2, N = 6e3, R = 3e3, x = R + ae, gt = 240, vt = 2e3, ce = 1, me = 12, we = 24, b = 1e-3, A = 50, ue = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, St = (e, t, s) => {
  const n = [`[${t}]`, ...s];
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
  const { level: s = "info", emitter: i = St } = t, n = ue[s], a = (r, h) => {
    ue[r] < n || i(r, e, h);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, re = xe("CommentEngine:Comment"), de = /* @__PURE__ */ new WeakMap(), yt = (e) => {
  let t = de.get(e);
  return t || (t = /* @__PURE__ */ new Map(), de.set(e, t)), t;
}, oe = (e, t) => {
  if (!e)
    return 0;
  const i = `${e.font ?? ""}::${t}`, n = yt(e), a = n.get(i);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(i, r), r;
}, J = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, Ct = 27 / 665, Mt = 12, It = "  ", Et = 2300 / 665, G = [366, 510, 1662], _t = 566, Tt = 806 / 665, bt = 808 / 665, fe = 1176 / 665, pe = 900 / 665, mt = 1126 / 665, ge = 810 / 665, wt = 1254 / 665, xt = 1126 / 665, Lt = 1046 / 665, Ft = 1140 / 665, Ot = 878 / 665, Pt = 0.25, At = 160, Rt = 420, Dt = 80, Nt = 0.18, Vt = 400, Ht = 0.2, kt = 420, Wt = 250, zt = 1.8, Xt = 420, Gt = 20, Bt = 0.045, Ut = (e) => e.replaceAll("	", It), Le = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g, $t = (e) => {
  const t = Ut(e);
  if (t.includes(`
`)) {
    const s = t.split(/\r?\n/);
    return s.length > 0 ? s : [""];
  }
  return [t];
}, ve = (e, t = Mt) => Math.max(t, e), Yt = (e) => {
  if (e.fontSize >= 35)
    return _t;
  const t = e.text.split(/\r?\n/);
  return Math.max(0, ...t.map((i) => (i.match(/\t/g) || []).length)) >= 12 || e.width >= 1200 ? G[2] : e.width >= 300 ? G[1] : G[0];
}, qt = (e) => Math.min(
  Rt,
  Math.max(At, e.width * Pt)
), Kt = (e) => Math.min(
  kt,
  Dt + e.width * Nt + Math.max(0, e.width - Vt) * Ht
), jt = (e) => Math.min(
  Xt,
  Math.max(0, e.width - Wt) * zt
), Jt = (e) => e.lines.filter((t) => t.replace(Le, "").length > 0).length, Se = (e) => {
  if (Jt(e) !== 1)
    return !1;
  const t = e.text.replace(Le, "");
  return t === "●" || t.includes("●●") || t.includes("○○") || t.includes("◉");
}, Zt = (e, t) => {
  let s = 0;
  const i = e.letterSpacing;
  for (const r of e.lines) {
    const h = oe(t, r), u = r.length > 1 ? i * (r.length - 1) : 0, l = Math.max(0, h + u);
    l > s && (s = l);
  }
  e.width = s;
  const n = Math.max(
    1,
    Math.floor(e.fontSize * e.lineHeightMultiplier)
  );
  e.lineHeightPx = n;
  const a = e.lines.length > 1 ? (e.lines.length - 1) * n : 0;
  e.height = e.fontSize + a;
}, Qt = (e, t, s, i, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(s) || !Number.isFinite(i))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(s, 1), r = ve(Math.floor(i * Ct)), h = ve(Math.floor(r * e.sizeScale));
    if (e.fontSize = h, t.font = J(e), e.lines = $t(e.text), Zt(e, t), e.isScrolling && e.isFull) {
      const m = e.lines.length > 1 && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("游明朝"));
      if (m && e.isEnderGroup && !e.isEnder && e.fontSize >= 35)
        e.width = Math.round(
          i * (Se(e) ? Lt : xt)
        ), e.height = Math.max(
          e.height,
          Math.round(i * ge)
        );
      else if (m && e.isEnderGroup && e.isEnder && e.fontSize >= 35)
        e.width = Math.round(
          i * (Se(e) ? wt : fe)
        ), e.height = Math.max(
          e.height,
          Math.round(i * pe)
        );
      else if (m && e.isEnderGroup && e.isEnder)
        e.width = Math.round(i * Ft), e.height = Math.max(
          e.height,
          Math.round(i * Ot)
        );
      else if (m && e.fontSize >= 35)
        e.width = Math.round(i * fe), e.height = Math.max(
          e.height,
          Math.round(i * pe)
        );
      else if (m)
        e.width = Math.round(i * mt), e.height = Math.max(
          e.height,
          Math.round(i * ge)
        );
      else {
        const D = e.fontSize >= 35 ? bt : Tt;
        e.width = Yt(e), e.height = Math.max(e.height, Math.round(i * D));
      }
    }
    if (!e.isScrolling) {
      const m = a + r * 2.6666666666666665;
      e.width >= m * 0.95 && e.fontSize >= 35 ? e.width = Math.round(i * Et) : e.width = Math.min(e.width, m), e.bufferWidth = 0;
      const D = (a - e.width) / 2;
      e.virtualStartX = D, e.x = D, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = R, e.preCollisionDurationMs = R, e.totalDurationMs = R, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + R, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const u = oe(t, "??".repeat(150)), l = e.width * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, l);
    const d = Math.max(n.entryBufferPx, e.bufferWidth), o = e.scrollDirection, f = e.isFull ? qt(e) : 0, c = e.isFull ? Gt + e.width * Bt : 0, p = e.isFull ? 0 : Kt(e), g = e.isFull ? 0 : jt(e), C = o === "rtl" ? a + n.virtualExtension + f + p : -e.width - e.bufferWidth - n.virtualExtension - f - p, M = o === "rtl" ? -e.width - e.bufferWidth - d + f - p - g : a + d - f + p + g, v = o === "rtl" ? a + d : -d, S = o === "rtl" ? C + e.width + e.bufferWidth : C - e.bufferWidth;
    e.virtualStartX = C, e.x = C, e.exitThreshold = M;
    const _ = a > 0 ? e.width / a : 0, I = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let Q = n.maxVisibleDurationMs;
    if (!I && _ > 1 && !e.isFull) {
      const m = Math.min(_, n.maxWidthRatio), D = n.maxVisibleDurationMs / Math.max(m, 1);
      Q = Math.max(n.minVisibleDurationMs, Math.floor(D));
    }
    const He = a + e.width + e.bufferWidth + d + n.virtualExtension + c + p * 2 + g, ke = Math.max(Q, 1), ee = He / ke, We = ee * 1e3 / 60;
    e.baseSpeed = We, e.speed = e.baseSpeed, e.speedPixelsPerMs = ee;
    const ze = Math.abs(M - C), Xe = o === "rtl" ? Math.max(0, S - v) : Math.max(0, v - S), le = Math.max(ee, Number.EPSILON);
    e.visibleDurationMs = Q, e.preCollisionDurationMs = Math.max(0, Math.ceil(Xe / le)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(ze / le)
    );
    const Ge = e.width + e.bufferWidth + d;
    e.reservationWidth = Math.min(u, Ge), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw re.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: s,
      canvasHeight: i,
      hasContext: !!t
    }), a;
  }
}, ie = 5, L = {
  enabled: !1,
  maxLogsPerCategory: ie
}, V = /* @__PURE__ */ new Map(), ei = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return ie;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, ti = (e) => {
  L.enabled = !!e.enabled, L.maxLogsPerCategory = ei(e.maxLogsPerCategory), L.enabled || V.clear();
}, kn = () => {
  V.clear();
}, P = () => L.enabled, ii = (e) => {
  const t = V.get(e) ?? 0;
  return t >= L.maxLogsPerCategory ? (t === L.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), V.set(e, t + 1)), !1) : (V.set(e, t + 1), !0);
}, E = (e, ...t) => {
  L.enabled && ii(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, H = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, si = (e, t) => {
  L.enabled && (console.group(`[CommentOverlay][state-dump] ${e}`), console.table({
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
}, ni = (e, t, s) => {
  L.enabled && E("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${s})`);
}, ye = (e) => {
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
}), se = (e, t, s, i) => {
  const n = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof n != "function" || n({
    source: "comment-overlay",
    op: e,
    timestampMs: ai(),
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
    transform: ri(t),
    ...oi(t),
    comment: li(s),
    ...i
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
  if (!P())
    return;
  const e = performance.now();
  if (e - y.lastReported <= 5e3)
    return;
  const t = y.hits + y.misses, s = t > 0 ? y.hits / t * 100 : 0, i = y.creates > 0 ? (y.totalCharactersDrawn / y.creates).toFixed(1) : "0", n = y.outlineCallsInCache + y.outlineCallsInFallback, a = y.fillCallsInCache + y.fillCallsInFallback;
  console.log(
    "[TextureCache Stats]",
    `
  Cache: Hits=${y.hits}, Misses=${y.misses}, Hit Rate=${s.toFixed(1)}%`,
    `
  Creates: ${y.creates}, Fallbacks: ${y.fallbacks}`,
    `
  Comments: Normal=${y.normalComments}, LetterSpacing=${y.letterSpacingComments}, MultiLine=${y.multiLineComments}`,
    `
  Draw Calls: Outline=${n}, Fill=${a}`,
    `
  Avg Characters/Comment: ${i}`
  ), y.lastReported = e;
}, hi = () => typeof OffscreenCanvas < "u", Z = (e, t, s) => {
  if (e === "none")
    return { blur: 0, alpha: 0 };
  const i = {
    light: 0.06,
    medium: 0.1,
    strong: 0.15
  }[e], n = {
    light: 0.6,
    medium: 0.8,
    strong: 0.95
  }[e], a = Math.max(2, t * i), r = F(s * n);
  return { blur: a, alpha: r };
}, k = () => 2.8, Fe = 566, Oe = 808, ci = 1098, ui = 1530, di = 20.9, Me = 58.9, fi = 45.23908523908523 / 39, pi = 20, Pe = 11.4, Y = 31.4, q = 23.87692307692307, gi = 2.4, Ie = 20, K = 2, vi = 66.9, Si = 55.6, yi = 46, Ci = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const s = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!s)
    return !1;
  const i = s[1], n = i.length === 3 || i.length === 4, a = (l) => l.length === 1 ? `${l}${l}` : l, r = Number.parseInt(a(n ? i[0] : i.slice(0, 2)), 16), h = Number.parseInt(a(n ? i[1] : i.slice(2, 4)), 16), u = Number.parseInt(a(n ? i[2] : i.slice(4, 6)), 16);
  return r === 0 && h === 0 && u === 0;
}, W = (e) => Ci(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", Ae = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, Mi = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const s = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + s;
}, Re = (e) => {
  if (e.isScrolling && e.isFull) {
    const r = e.isEnderGroup && e.isEnder ? e.fontSize >= 35 ? vi : Si : null;
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: r ?? (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + gi,
      textureWidth: Math.ceil(e.width),
      textureHeight: Math.ceil(e.height)
    };
  }
  if (e.isScrolling && e.lines.length > 1) {
    const r = e.fontSize * 1.3333333333333333, h = e.fontSize;
    return {
      paddingX: r,
      paddingY: h,
      textureWidth: Math.ceil(e.width + r * 2),
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
  const s = e.isScrolling ? e.fontSize * 1.15 : Math.max(10, e.fontSize * 0.5), i = e.isScrolling ? Math.round(e.fontSize * (40 / 9)) : e.height + e.fontSize / 3, n = Math.ceil(
    Math.max(e.height + Math.max(10, e.fontSize), i)
  ), a = e.isScrolling ? e.fontSize : Math.max(0, (n - e.height) / 2);
  return {
    paddingX: s,
    paddingY: a,
    textureWidth: Math.ceil(
      e.isScrolling ? e.width * 2 + s * 2 : e.width + s * 2
    ),
    textureHeight: n
  };
}, Ii = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35 ? 0.355 : 1, Ei = (e) => e.isScrolling && e.isFull && e.isEnderGroup ? yi : 0, z = (e, t, s, i, n) => (a, r, h, u = 0) => {
  if (a.length === 0)
    return;
  const l = n + u, d = () => {
    i === "cache" ? h === "outline" ? y.outlineCallsInCache++ : y.fillCallsInCache++ : h === "outline" ? y.outlineCallsInFallback++ : y.fillCallsInFallback++;
  }, o = (c, p, g) => {
    if (d(), h === "outline") {
      t.strokeText(c, p, r), se("strokeText", t, e, {
        text: c,
        x: p,
        y: r,
        meta: { statsTarget: i, mode: h, ...g }
      });
      return;
    }
    t.fillText(c, p, r), se("fillText", t, e, {
      text: c,
      x: p,
      y: r,
      meta: { statsTarget: i, mode: h, ...g }
    });
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    o(a, l);
    return;
  }
  let f = l;
  for (let c = 0; c < a.length; c += 1) {
    const p = a[c];
    o(p, f, { characterIndex: c });
    const g = oe(s, p);
    f += g, c < a.length - 1 && (f += e.letterSpacing);
  }
}, _i = (e) => `v5::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.lines.length}`, Ti = (e, t, s) => e.isScrolling && e.isFull && e.fontSize >= 35 && t === Fe && s === Oe, bi = (e, t, s) => e.isScrolling && e.isFull && e.isEnderGroup && !e.isEnder && t >= 1e3 && s >= 800, mi = (e, t, s, i) => {
  const n = new OffscreenCanvas(s, i), a = n.getContext("2d");
  if (!a)
    return null;
  a.save(), a.font = Ae(e, Ie);
  const r = F(e.opacity), h = j(e.color, r), u = e.renderStyle === "outline-only", l = u ? { blur: 0, alpha: 0 } : Z(e.shadowIntensity, Ie, r);
  a.shadowColor = `rgba(0, 0, 0, ${l.alpha})`, a.shadowBlur = l.blur, a.shadowOffsetX = 0, a.shadowOffsetY = 0, a.lineJoin = "round", a.lineWidth = k(), a.strokeStyle = W(e), a.fillStyle = h, a.scale(K, K);
  const d = e.lines.length > 0 ? e.lines : [e.text], o = z(
    e,
    a,
    t,
    "cache",
    Pe
  );
  return u && d.forEach((f, c) => {
    o(
      f,
      Y + c * q,
      "outline"
    );
  }), d.forEach((f, c) => {
    o(
      f,
      Y + c * q,
      "fill"
    );
  }), a.restore(), n;
}, wi = (e, t) => {
  const s = new OffscreenCanvas(
    Fe,
    Oe
  ), i = s.getContext("2d");
  if (!i)
    return null;
  const a = new OffscreenCanvas(
    ci,
    ui
  ).getContext("2d");
  if (!a)
    return null;
  a.save(), a.font = J(e);
  const r = F(e.opacity), h = j(e.color, r), u = e.renderStyle === "outline-only", l = u ? { blur: 0, alpha: 0 } : Z(e.shadowIntensity, e.fontSize, r);
  a.shadowColor = `rgba(0, 0, 0, ${l.alpha})`, a.shadowBlur = l.blur, a.shadowOffsetX = 0, a.shadowOffsetY = 0, a.lineJoin = "round", a.lineWidth = k(), a.strokeStyle = W(e), a.fillStyle = h;
  const d = e.lines.length > 0 ? e.lines : [e.text], o = e.fontSize * fi, f = z(
    e,
    a,
    t,
    "cache",
    di
  );
  u && d.forEach((p, g) => {
    f(p, Me + g * o, "outline");
  }), d.forEach((p, g) => {
    f(p, Me + g * o, "fill");
  }), a.restore(), i.save(), i.font = Ae(e, pi), i.shadowColor = `rgba(0, 0, 0, ${l.alpha})`, i.shadowBlur = l.blur, i.shadowOffsetX = 0, i.shadowOffsetY = 0, i.lineJoin = "round", i.lineWidth = k(), i.strokeStyle = W(e), i.fillStyle = h;
  const c = z(
    e,
    i,
    t,
    "cache",
    Pe
  );
  return u && d.forEach((p, g) => {
    c(
      p,
      Y + g * q,
      "outline"
    );
  }), d.forEach((p, g) => {
    c(
      p,
      Y + g * q,
      "fill"
    );
  }), i.restore(), s;
}, xi = (e, t) => {
  if (!hi())
    return null;
  const s = Math.abs(e.letterSpacing) >= Number.EPSILON, i = e.lines.length > 1;
  s && y.letterSpacingComments++, i && y.multiLineComments++, !s && !i && y.normalComments++, y.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: h } = Re(e);
  if (Ti(e, r, h))
    return wi(e, t);
  if (bi(e, r, h))
    return mi(e, t, r, h);
  const u = new OffscreenCanvas(r, h), l = u.getContext("2d");
  if (!l)
    return null;
  l.save(), l.font = J(e);
  const d = F(e.opacity), o = n, f = e.lines.length > 0 ? e.lines : [e.text], c = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, p = Mi(e, a), g = z(e, l, t, "cache", o), C = j(e.color, d), M = e.renderStyle === "outline-only", v = M ? { blur: 0, alpha: 0 } : Z(e.shadowIntensity, e.fontSize, d);
  return P() && console.log(
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
  ), l.save(), l.shadowColor = `rgba(0, 0, 0, ${v.alpha})`, l.shadowBlur = v.blur, l.shadowOffsetX = 0, l.shadowOffsetY = 0, l.lineJoin = "round", l.lineWidth = k(), l.strokeStyle = W(e), l.fillStyle = C, e.isScrolling && e.isFull && e.isEnderGroup && l.scale(K, K), M && f.forEach((S, _) => {
    const I = p + _ * c;
    g(S, I, "outline");
  }), f.forEach((S, _) => {
    const I = p + _ * c;
    g(S, I, "fill");
  }), l.restore(), l.restore(), u;
}, Li = (e, t, s) => {
  y.fallbacks++, t.save(), t.font = J(e);
  const i = F(e.opacity), n = s ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, h = e.y + e.fontSize, u = z(e, t, t, "fallback", n), l = j(e.color, i), d = e.renderStyle === "outline-only", o = d ? { blur: 0, alpha: 0 } : Z(e.shadowIntensity, e.fontSize, i);
  P() && console.log(
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
  Fill style: ${l}`
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${o.alpha})`, t.shadowBlur = o.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = k(), t.strokeStyle = W(e), t.fillStyle = l, d && a.forEach((f, c) => {
    const p = h + c * r;
    u(f, p, "outline");
  }), a.forEach((f, c) => {
    const p = h + c * r;
    u(f, p, "fill");
  }), t.restore(), t.restore();
}, Fi = (e, t, s) => {
  try {
    if (!e.isActive || !t)
      return;
    const i = _i(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== i || !n) {
      y.misses++, y.creates++;
      const r = xi(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(i);
    } else
      y.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = s ?? e.x, { paddingX: h, paddingY: u } = Re(e), l = Ii(e), d = !e.isScrolling && l !== 1 ? a.width * (1 - l) * 0.455 : 0, o = r - h + d + Ei(e), f = e.y - u;
      l === 1 ? t.drawImage(a, o, f) : t.drawImage(
        a,
        o,
        f,
        a.width * l,
        a.height * l
      ), se("drawImage", t, e, {
        x: o,
        y: f,
        width: a.width * l,
        height: a.height * l,
        meta: { statsTarget: "cache", paddingX: h, paddingY: u, drawScale: l }
      }), Ce();
      return;
    }
    Li(e, t, s), Ce();
  } catch (i) {
    re.error("Comment.draw", i, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: s
    });
  }
}, Oi = (e) => e === "ltr" ? "ltr" : "rtl", Pi = (e) => e === "ltr" ? 1 : -1;
class Ai {
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
  isEnderGroup = !1;
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
  constructor(t, s, i, n, a = {}) {
    if (typeof t != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(s) || s < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = t, this.vposMs = s, this.commands = Array.isArray(i) ? [...i] : [];
    const r = nt(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.size = r.size, this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.isFull = r.isFull, this.isEnder = r.isEnder, this.fontFamily = r.fontFamily, this.fontWeight = r.fontWeight, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = a.timeSource ?? be(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, s, i, n) {
    Qt(this, t, s, i, n);
  }
  draw(t, s = null) {
    Fi(this, t, s);
  }
  update(t = 1, s = !1) {
    try {
      if (!this.isActive) {
        this.isPaused = s;
        return;
      }
      const i = this.timeSource.now();
      if (!this.isScrolling) {
        this.isPaused = s, this.lastUpdateTime = i;
        return;
      }
      if (s) {
        this.isPaused = !0, this.lastUpdateTime = i;
        return;
      }
      const n = (i - this.lastUpdateTime) / (1e3 / 60);
      this.speed = this.baseSpeed * t, this.x += this.speed * n * this.directionSign, (this.scrollDirection === "rtl" && this.x <= this.exitThreshold || this.scrollDirection === "ltr" && this.x >= this.exitThreshold) && (this.isActive = !1), this.lastUpdateTime = i, this.isPaused = !1;
    } catch (i) {
      re.error("Comment.update", i, {
        text: this.text,
        playbackRate: t,
        isPaused: s,
        isActive: this.isActive
      });
    }
  }
  syncWithSettings(t, s) {
    typeof s == "number" && s === this.lastSyncedSettingsVersion || (this.color = this.getEffectiveColor(t.commentColor), this.opacity = this.getEffectiveOpacity(t.commentOpacity), this.applyScrollDirection(t.scrollDirection), this.renderStyle = t.renderStyle, this.shadowIntensity = t.shadowIntensity, typeof s == "number" && (this.lastSyncedSettingsVersion = s));
  }
  getEffectiveColor(t) {
    const s = this.colorOverride ?? t;
    return typeof s != "string" || s.length === 0 ? t : s.toUpperCase();
  }
  getEffectiveOpacity(t) {
    if (typeof this.opacityOverride == "number")
      return F(this.opacityOverride);
    const s = t * this.opacityMultiplier;
    return Number.isFinite(s) ? F(s) : 0;
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
    const s = Oi(t);
    this.scrollDirection = s, this.directionSign = Pi(s);
  }
}
const Ri = 6e3, U = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: Ri,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, Wn = U, Di = () => ({
  ...U,
  ngWords: [...U.ngWords],
  ngRegexps: [...U.ngRegexps]
}), zn = "v3.1.4", Ni = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, B = (e) => {
  const t = e.scrollVisibleDurationMs, s = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: Ni(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: s,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, Vi = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(t)
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, Hi = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), ki = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, Ee = (e) => e.isScrolling && e.isFull && e.text.includes(`
`) && e.commands.some((t) => t.toLowerCase() === "mincho"), Wi = (e) => {
  const t = /* @__PURE__ */ new Set();
  e.forEach((s) => {
    s.isEnder && Ee(s) && t.add(s.vposMs);
  }), e.forEach((s) => {
    s.isEnderGroup = t.has(s.vposMs) && Ee(s);
  });
}, zi = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const s of e) {
    const { text: i, vposMs: n, commands: a = [] } = s, r = H(i);
    if (this.isNGComment(i)) {
      E("comment-skip-ng", { preview: r, vposMs: n });
      continue;
    }
    const h = ot(n);
    if (h === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: i, vposMs: n }), E("comment-skip-invalid-vpos", { preview: r, vposMs: n });
      continue;
    }
    if (this.comments.some(
      (d) => d.text === i && d.vposMs === h
    ) || t.some((d) => d.text === i && d.vposMs === h)) {
      E("comment-skip-duplicate", { preview: r, vposMs: h });
      continue;
    }
    const l = new Ai(
      i,
      h,
      a,
      this._settings,
      this.commentDependencies
    );
    l.creationIndex = this.commentSequence++, l.epochId = this.epochId, t.push(l), E("comment-added", {
      preview: r,
      vposMs: h,
      commands: l.commands.length,
      layout: l.layout,
      isScrolling: l.isScrolling,
      invisible: l.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), Wi(this.comments), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((s, i) => {
    const n = s.vposMs - i.vposMs;
    return Math.abs(n) > b ? n : s.creationIndex - i.creationIndex;
  }), t);
}, Xi = function(e, t, s = []) {
  const [i] = this.addComments([{ text: e, vposMs: t, commands: s }]);
  return i ?? null;
}, Gi = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, s = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, s);
  }
}, Bi = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, De = function() {
  const e = this._settings, t = Array.isArray(e.ngWords) ? e.ngWords : [];
  this.normalizedNgWords = t.filter((i) => typeof i == "string");
  const s = Array.isArray(e.ngRegexps) ? e.ngRegexps : [];
  this.compiledNgRegexps = s.map((i) => {
    if (typeof i != "string")
      return null;
    try {
      return new RegExp(i, "i");
    } catch (n) {
      return this.log.warn("CommentRenderer.invalidNgRegexp", n, { entry: i }), null;
    }
  }).filter((i) => !!i);
}, Ui = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, $i = (e) => {
  e.prototype.addComments = zi, e.prototype.addComment = Xi, e.prototype.clearComments = Gi, e.prototype.resetState = Bi, e.prototype.rebuildNgMatchers = De, e.prototype.isNGComment = Ui;
}, Yi = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, qi = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, ni(t, this.epochId, e), this.eventHooks.onEpochChange) {
    const s = {
      previousEpochId: t,
      newEpochId: this.epochId,
      reason: e,
      timestamp: this.timeSource.now()
    };
    try {
      this.eventHooks.onEpochChange(s);
    } catch (i) {
      this.log.error("CommentRenderer.incrementEpoch.callback", i, { info: s });
    }
  }
  this.comments.forEach((s) => {
    s.epochId = this.epochId;
  });
}, Ki = function(e) {
  const t = this.timeSource.now();
  if (t - this.lastSnapshotEmitTime < this.snapshotEmitThrottleMs)
    return;
  const s = {
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
  if (si(e, s), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(s);
    } catch (i) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", i);
    }
  this.lastSnapshotEmitTime = t;
}, ji = function(e) {
  this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  return t !== void 0 ? t : Ne(e);
}, Ne = (e) => e.isScrolling ? Math.max(0, e.vposMs - vt) : e.vposMs, Ji = function(e) {
  if (!e.isScrolling)
    return R;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : ae;
}, Zi = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), Ne(e);
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const s = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, s), s;
}, Qi = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + N, s = Math.max(e + N, t), i = this.comments.filter((l) => l.hasShown || l.isInvisible || this.isNGComment(l.text) ? !1 : l.vposMs >= e - x).sort((l, d) => {
    const o = l.vposMs - d.vposMs;
    return Math.abs(o) > b ? o : l.creationIndex - d.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), i.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(s - e, N) / Math.max(i.length, 1), r = Number.isFinite(a) ? a : te, h = Math.max(te, Math.min(r, ft));
  let u = e;
  i.forEach((l, d) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(l)), f = s - o;
    let c = Math.max(e, Math.min(u, f));
    Number.isFinite(c) || (c = e);
    const p = pt * d;
    c + p <= f && (c += p), this.finalPhaseVposOverrides.set(l, c);
    const g = Math.max(te, Math.min(o / 2, h));
    u = c + g;
  }), this.finalPhaseScheduleDirty = !1;
}, es = (e) => {
  e.prototype.resetFinalPhaseState = Yi, e.prototype.incrementEpoch = qi, e.prototype.emitStateSnapshot = Ki, e.prototype.getEffectiveCommentVpos = ji, e.prototype.getFinalPhaseDisplayDuration = Ji, e.prototype.resolveFinalPhaseVpos = Zi, e.prototype.recomputeFinalPhaseTimeline = Qi;
}, ts = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= A;
}, is = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > A) && (this.playbackHasBegun = !0);
}, ss = (e) => {
  e.prototype.shouldSuppressRendering = ts, e.prototype.updatePlaybackProgressState = is;
}, ns = function(e) {
  const t = this.videoElement, s = this.canvas, i = this.ctx;
  if (!t || !s || !i)
    return;
  const n = typeof e == "number" ? e : w(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : s.width / a, h = this.displayHeight > 0 ? this.displayHeight : s.height / a, u = this.buildPrepareOptions(r), l = this.duration > 0 && this.duration - this.currentTime <= dt;
  l && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, i.clearRect(0, 0, r, h), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !l && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const o of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(o), c = f < this.currentTime - x, p = f > this.currentTime + x;
    if (c || p) {
      o.isActive = !1, this.activeComments.delete(o), o.clearActivation(), o.lane >= 0 && (o.layout === "ue" ? this.releaseStaticLane("ue", o.lane) : o.layout === "shita" && this.releaseStaticLane("shita", o.lane));
      continue;
    }
    o.isScrolling && o.hasShown && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
  }
  const d = this.getCommentsInTimeWindow(this.currentTime, x);
  for (const o of d) {
    const f = P(), c = f ? H(o.text) : "";
    if (f && E("comment-evaluate", {
      stage: "update",
      preview: c,
      vposMs: o.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(o),
      currentTime: this.currentTime,
      isActive: o.isActive,
      hasShown: o.hasShown
    }), this.isNGComment(o.text)) {
      f && E("comment-eval-skip", {
        preview: c,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "ng-runtime"
      });
      continue;
    }
    if (o.isInvisible) {
      f && E("comment-eval-skip", {
        preview: c,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "invisible"
      }), o.isActive = !1, this.activeComments.delete(o), o.hasShown = !0, o.clearActivation();
      continue;
    }
    if (o.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(o, this.currentTime, c) && this.activateComment(
      o,
      i,
      r,
      h,
      u,
      this.currentTime
    ), o.isActive) {
      if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
        continue;
      }
      if (o.layout === "naka" && this.getEffectiveCommentVpos(o) > this.currentTime + A) {
        o.x = o.virtualStartX, o.lastUpdateTime = this.timeSource.now();
        continue;
      }
      if (o.hasShown = !0, o.update(this.playbackRate, !this.isPlaying), !o.isScrolling && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
      }
    }
  }
}, as = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let s = ae, i = he;
  return t !== null && (s = t, i = Math.max(1, Math.min(t, he))), {
    visibleWidth: e,
    virtualExtension: gt,
    maxVisibleDurationMs: s,
    minVisibleDurationMs: i,
    maxWidthRatio: lt,
    bufferRatio: ht,
    baseBufferPx: ct,
    entryBufferPx: ut
  };
}, rs = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const s = this.getLanePriorityOrder(t), i = this.createLaneReservation(e, t);
  for (const a of s)
    if (this.isLaneAvailable(a, i, t))
      return this.storeLaneReservation(a, i), a;
  const n = s[0] ?? 0;
  return this.storeLaneReservation(n, i), n;
}, os = (e) => {
  e.prototype.updateComments = ns, e.prototype.buildPrepareOptions = as, e.prototype.findAvailableLane = rs;
}, ls = function(e, t) {
  let s = 0, i = e.length;
  for (; s < i; ) {
    const n = Math.floor((s + i) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + $ <= t ? s = n + 1 : i = n;
  }
  return s;
}, hs = function(e) {
  for (const [t, s] of this.reservedLanes.entries()) {
    const i = this.findFirstValidReservationIndex(s, e);
    i >= s.length ? this.reservedLanes.delete(t) : i > 0 && this.reservedLanes.set(t, s.slice(i));
  }
}, cs = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), s = t(this.topStaticLaneReservations), i = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...s), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...i);
}, us = (e) => {
  e.prototype.findFirstValidReservationIndex = ls, e.prototype.pruneLaneReservations = hs, e.prototype.pruneStaticLaneReservations = cs;
}, ds = function(e) {
  let t = 0, s = this.comments.length;
  for (; t < s; ) {
    const i = Math.floor((t + s) / 2), n = this.comments[i];
    n !== void 0 && n.vposMs < e ? t = i + 1 : s = i;
  }
  return t;
}, fs = function(e, t) {
  if (this.comments.length === 0)
    return [];
  const s = e - t, i = e + t, n = this.findCommentIndexAtOrAfter(s), a = [];
  for (let r = n; r < this.comments.length; r++) {
    const h = this.comments[r];
    if (h) {
      if (h.vposMs > i)
        break;
      a.push(h);
    }
  }
  return a;
}, ps = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, gs = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, vs = function(e) {
  const t = e === "ue" ? "shita" : "ue", s = this.getStaticLaneDepth(t), i = this.laneCount - s;
  return i <= 0 ? -1 : i - 1;
}, Ss = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, ys = (e) => {
  const t = Math.ceil(
    e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
  );
  return Math.max(0, (t - e.height) / 2);
}, Cs = function(e, t, s, i) {
  const n = Math.max(1, s), a = Math.max(i.height, i.fontSize), r = 5, h = 0, u = ys(i);
  if (e === "ue") {
    const c = r + u;
    let p = c;
    const C = this.getStaticReservations(e).filter((v) => v.lane < t).sort((v, S) => v.lane - S.lane);
    for (const v of C) {
      const S = v.yEnd - v.yStart;
      p += S + h;
    }
    const M = Math.max(r, n * 2);
    return Math.max(c, Math.min(p, M));
  }
  let l = n - r;
  const o = this.getStaticReservations(e).filter((c) => c.lane < t).sort((c, p) => c.lane - p.lane);
  for (const c of o) {
    const p = c.yEnd - c.yStart;
    l -= p + h;
  }
  const f = l - a;
  return Math.max(r, f);
}, Ms = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, Is = (e) => {
  e.prototype.findCommentIndexAtOrAfter = ds, e.prototype.getCommentsInTimeWindow = fs, e.prototype.getStaticReservations = ps, e.prototype.getStaticLaneDepth = gs, e.prototype.getStaticLaneLimit = vs, e.prototype.getGlobalLaneIndexForBottom = Ss, e.prototype.resolveStaticCommentOffset = Cs, e.prototype.getStaticReservedLaneSet = Ms;
}, Es = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, Ve = (e) => Math.max(1, e.fontSize * (Es(e) ? 0.46 : 5 / 9)), _s = function(e, t, s = "") {
  const i = s.length > 0 && P(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - b ? (i && E("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "final-phase-trimmed",
    finalPhaseStartTime: this.finalPhaseStartTime
  }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (i && E("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "invisible"
  }), !1) : e.isActive ? (i && E("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-active"
  }), !1) : e.hasShown && n <= t ? (i && E("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-shown",
    currentTime: t
  }), !1) : n > t + A ? (i && E("comment-eval-pending", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "future",
    currentTime: t
  }), !1) : n < t - x ? (i && E("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "expired-window",
    currentTime: t
  }), !1) : (i && E("comment-eval-ready", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    currentTime: t
  }), !0);
}, Ts = function(e, t, s, i, n, a) {
  e.prepare(t, s, i, n);
  const r = this.resolveFinalPhaseVpos(e);
  if (P() && E("comment-prepared", {
    preview: H(e.text),
    layout: e.layout,
    isScrolling: e.isScrolling,
    width: e.width,
    height: e.height,
    bufferWidth: e.bufferWidth,
    visibleDurationMs: e.visibleDurationMs,
    effectiveVposMs: r
  }), e.layout === "naka") {
    const h = Math.max(0, a - r), u = e.speedPixelsPerMs * h;
    if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
      const c = this.duration > 0 ? this.duration : this.finalPhaseStartTime + N, p = Math.max(
        this.finalPhaseStartTime + N,
        c
      ), g = e.width + s, C = g > 0 ? g / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + C > p) {
        const v = p - a, S = Math.max(0, v) * e.speedPixelsPerMs, _ = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - u, s - S) : Math.min(e.virtualStartX + u, S - e.width);
        e.x = _;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    const l = this.findAvailableLane(e);
    e.lane = l;
    const d = Math.max(1, this.laneHeight), o = Math.max(0, i - e.height), f = l * d;
    e.y = e.isFull ? 0 : Math.max(0, Math.min(f, o));
  } else {
    const h = e.layout === "ue" ? "ue" : "shita", u = this.assignStaticLane(h, e, i, a), l = this.resolveStaticCommentOffset(
      h,
      u,
      i,
      e
    );
    e.x = e.virtualStartX, e.y = l, e.lane = h === "ue" ? u : this.getGlobalLaneIndexForBottom(u), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = R;
    const d = a + e.visibleDurationMs;
    this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = d, this.reserveStaticLane(h, e, u, d), P() && E("comment-activate-static", {
      preview: H(e.text),
      lane: e.lane,
      position: h,
      displayEnd: d,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, bs = function(e, t, s, i) {
  const n = this.getStaticReservations(e), a = Ve(t), r = Math.max(1, a), h = Math.max(
    this.laneCount,
    Math.ceil(Math.max(1, s) / r) + n.length + 1
  ), u = Array.from({ length: h }, (o, f) => f);
  for (const o of u) {
    const f = this.resolveStaticCommentOffset(e, o, s, t), c = f, p = f + a;
    if (!n.some((C) => C.releaseTime > i ? !(p <= C.yStart || c >= C.yEnd) : !1))
      return o;
  }
  let l = u[0] ?? 0, d = Number.POSITIVE_INFINITY;
  for (const o of n)
    o.releaseTime < d && (d = o.releaseTime, l = o.lane);
  return l;
}, ms = function(e, t, s, i) {
  const n = this.getStaticReservations(e), a = t.y, r = t.y + Ve(t);
  n.push({
    comment: t,
    releaseTime: i,
    yStart: a,
    yEnd: r,
    lane: s
  });
}, ws = function(e, t) {
  if (t < 0)
    return;
  const s = this.getStaticReservations(e), i = s.findIndex((n) => n.lane === t);
  i >= 0 && s.splice(i, 1);
}, xs = (e) => {
  e.prototype.shouldActivateCommentAtTime = _s, e.prototype.activateComment = Ts, e.prototype.assignStaticLane = bs, e.prototype.reserveStaticLane = ms, e.prototype.releaseStaticLane = ws;
}, Ls = function(e) {
  const s = Array.from({ length: this.laneCount }, (r, h) => h).sort((r, h) => {
    const u = this.getLaneNextAvailableTime(r, e), l = this.getLaneNextAvailableTime(h, e);
    return Math.abs(u - l) <= b ? r - h : u - l;
  }), i = this.getStaticReservedLaneSet();
  if (i.size === 0)
    return s;
  const n = s.filter((r) => !i.has(r));
  if (n.length === 0)
    return s;
  const a = s.filter((r) => i.has(r));
  return [...n, ...a];
}, Fs = function(e, t) {
  const s = this.reservedLanes.get(e);
  if (!s || s.length === 0)
    return t;
  const i = this.findFirstValidReservationIndex(s, t), n = s[i];
  return n ? Math.max(t, n.endTime + $) : t;
}, Os = function(e, t) {
  const s = Math.max(e.speedPixelsPerMs, b), i = this.getEffectiveCommentVpos(e), n = Number.isFinite(i) ? i : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + $, h = a + e.totalDurationMs + $;
  return {
    comment: e,
    startTime: a,
    endTime: Math.max(a, r),
    totalEndTime: Math.max(a, h),
    startLeft: e.virtualStartX,
    width: e.width,
    speed: s,
    buffer: e.bufferWidth,
    directionSign: e.getDirectionSign()
  };
}, Ps = function(e, t, s) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return !0;
  const n = this.findFirstValidReservationIndex(i, s);
  for (let a = n; a < i.length; a += 1) {
    const r = i[a];
    if (r && this.areReservationsConflicting(r, t))
      return !1;
  }
  return !0;
}, As = function(e, t) {
  const i = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, i);
}, Rs = function(e, t) {
  const s = Math.max(e.startTime, t.startTime), i = Math.min(e.endTime, t.endTime);
  if (s >= i)
    return !1;
  const n = /* @__PURE__ */ new Set([
    s,
    i,
    s + (i - s) / 2
  ]), a = this.solveLeftRightEqualityTime(e, t);
  a !== null && a >= s - b && a <= i + b && n.add(a);
  const r = this.solveLeftRightEqualityTime(t, e);
  r !== null && r >= s - b && r <= i + b && n.add(r);
  for (const h of n) {
    if (h < s - b || h > i + b)
      continue;
    const u = this.computeForwardGap(e, t, h), l = this.computeForwardGap(t, e, h);
    if (u <= b && l <= b)
      return !0;
  }
  return !1;
}, Ds = function(e, t, s) {
  const i = this.getBufferedEdges(e, s), n = this.getBufferedEdges(t, s);
  return i.left - n.right;
}, Ns = function(e, t) {
  const s = Math.max(0, t - e.startTime), i = e.speed * s, n = e.startLeft + e.directionSign * i, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, Vs = function(e, t) {
  const s = e.directionSign, i = t.directionSign, n = i * t.speed - s * e.speed;
  if (Math.abs(n) < b)
    return null;
  const r = (t.startLeft + i * t.speed * t.startTime + t.width + t.buffer - e.startLeft - s * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, Hs = (e) => {
  e.prototype.getLanePriorityOrder = Ls, e.prototype.getLaneNextAvailableTime = Fs, e.prototype.createLaneReservation = Os, e.prototype.isLaneAvailable = Ps, e.prototype.storeLaneReservation = As, e.prototype.areReservationsConflicting = Rs, e.prototype.computeForwardGap = Ds, e.prototype.getBufferedEdges = Ns, e.prototype.solveLeftRightEqualityTime = Vs;
}, ks = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  const s = this.canvasDpr > 0 ? this.canvasDpr : 1, i = this.displayWidth > 0 ? this.displayWidth : e.width / s, n = this.displayHeight > 0 ? this.displayHeight : e.height / s, a = this.timeSource.now();
  if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering() || this.isStalled) {
    t.clearRect(0, 0, i, n), this.lastDrawTime = a;
    return;
  }
  t.clearRect(0, 0, i, n);
  const r = Array.from(this.activeComments);
  if (this._settings.isCommentVisible) {
    const h = (a - this.lastDrawTime) / 16.666666666666668;
    r.sort((u, l) => {
      const d = this.getEffectiveCommentVpos(u), o = this.getEffectiveCommentVpos(l), f = d - o;
      return Math.abs(f) > b ? f : u.isScrolling !== l.isScrolling ? u.isScrolling ? 1 : -1 : u.creationIndex - l.creationIndex;
    }), r.forEach((u) => {
      const d = this.isPlaying && !u.isPaused ? u.x + u.getDirectionSign() * u.speed * h : u.x;
      u.draw(t, d);
    });
  }
  this.lastDrawTime = a;
}, Ws = function(e) {
  const t = this.videoElement, s = this.canvas, i = this.ctx;
  if (!t || !s || !i)
    return;
  const n = typeof e == "number" ? e : w(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : s.width / a, h = this.displayHeight > 0 ? this.displayHeight : s.height / a, u = this.buildPrepareOptions(r);
  this.getCommentsInTimeWindow(this.currentTime, x).forEach((d) => {
    if (this.isNGComment(d.text) || d.isInvisible) {
      d.isActive = !1, this.activeComments.delete(d), d.clearActivation();
      return;
    }
    if (d.syncWithSettings(this._settings, this.settingsVersion), d.isActive = !1, this.activeComments.delete(d), d.lane = -1, d.clearActivation(), this.shouldActivateCommentAtTime(d, this.currentTime)) {
      this.activateComment(
        d,
        i,
        r,
        h,
        u,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(d) < this.currentTime - x ? d.hasShown = !0 : d.hasShown = !1;
  });
}, zs = (e) => {
  e.prototype.draw = ks, e.prototype.performInitialSync = Ws;
}, Xs = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, Gs = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, Bs = function(e, t) {
  this.videoFrameHandle = null;
  const s = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof s == "number" ? s : void 0), this.scheduleNextFrame();
}, Us = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, $s = function() {
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
}, Ys = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, qs = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, Ks = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, js = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, Js = function() {
  const e = this.canvas, t = this.ctx, s = this.videoElement;
  if (!e || !t || !s)
    return;
  const i = w(s.currentTime), n = Math.abs(i - this.currentTime), a = this.timeSource.now();
  if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
    this.currentTime = i, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
    return;
  }
  const h = n > A;
  if (this.currentTime = i, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !h) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const u = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : e.width / u, d = this.displayHeight > 0 ? this.displayHeight : e.height / u, o = this.buildPrepareOptions(l);
  this.getCommentsInTimeWindow(this.currentTime, x).forEach((c) => {
    const p = P(), g = p ? H(c.text) : "";
    if (p && E("comment-evaluate", {
      stage: "seek",
      preview: g,
      vposMs: c.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(c),
      currentTime: this.currentTime,
      isActive: c.isActive,
      hasShown: c.hasShown
    }), this.isNGComment(c.text)) {
      p && E("comment-eval-skip", {
        preview: g,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "ng-runtime"
      }), c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
      return;
    }
    if (c.isInvisible) {
      p && E("comment-eval-skip", {
        preview: g,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "invisible"
      }), c.isActive = !1, this.activeComments.delete(c), c.hasShown = !0, c.clearActivation();
      return;
    }
    if (c.syncWithSettings(this._settings, this.settingsVersion), c.isActive = !1, this.activeComments.delete(c), c.lane = -1, c.clearActivation(), this.shouldActivateCommentAtTime(c, this.currentTime, g)) {
      this.activateComment(
        c,
        t,
        l,
        d,
        o,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(c) < this.currentTime - x ? c.hasShown = !0 : c.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Zs = (e) => {
  e.prototype.processFrame = Xs, e.prototype.handleAnimationFrame = Gs, e.prototype.handleVideoFrame = Bs, e.prototype.shouldUseVideoFrameCallback = Us, e.prototype.scheduleNextFrame = $s, e.prototype.cancelAnimationFrameRequest = Ys, e.prototype.cancelVideoFrameCallback = qs, e.prototype.startAnimation = Ks, e.prototype.stopAnimation = js, e.prototype.onSeek = Js;
}, Qs = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, en = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, tn = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, s = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, i = this.resolveContainer(s ?? null, t);
    this.videoElement = t, this.containerElement = i, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? w(t.duration) : 0, this.currentTime = w(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > A, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, i), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, sn = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, nn = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, an = (e) => {
  e.prototype.resolveContainer = Qs, e.prototype.ensureContainerPositioning = en, e.prototype.initialize = tn, e.prototype.destroy = sn, e.prototype.destroyCanvasOnly = nn;
}, rn = function(e) {
  try {
    const t = () => {
      this.isPlaying = !0, this.playbackHasBegun = !0;
      const f = this.timeSource.now();
      this.lastDrawTime = f, this.lastPlayResumeTime = f, this.comments.forEach((c) => {
        c.lastUpdateTime = f, c.isPaused = !1;
      });
    }, s = () => {
      this.isPlaying = !1;
      const f = this.timeSource.now();
      this.comments.forEach((c) => {
        c.lastUpdateTime = f, c.isPaused = !0;
      });
    }, i = () => {
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
    }, h = () => {
      this.duration = Number.isFinite(e.duration) ? w(e.duration) : 0;
    }, u = () => {
      this.handleVideoSourceChange();
    }, l = () => {
      this.handleVideoStalled();
    }, d = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", s), e.addEventListener("seeking", i), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", h), e.addEventListener("emptied", u), e.addEventListener("waiting", l), e.addEventListener("canplay", d), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", s)), this.addCleanup(() => e.removeEventListener("seeking", i)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", h)), this.addCleanup(() => e.removeEventListener("emptied", u)), this.addCleanup(() => e.removeEventListener("waiting", l)), this.addCleanup(() => e.removeEventListener("canplay", d)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, on = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, ln = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const s = this.canvasDpr > 0 ? this.canvasDpr : 1, i = this.displayWidth > 0 ? this.displayWidth : e.width / s, n = this.displayHeight > 0 ? this.displayHeight : e.height / s;
  t.clearRect(0, 0, i, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, hn = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = w(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, cn = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const s = this.getCurrentVideoSource();
  s !== this.lastVideoSource && (this.lastVideoSource = s, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, un = function(e) {
  this.duration = Number.isFinite(e.duration) ? w(e.duration) : 0, this.currentTime = w(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > A, this.lastDrawTime = this.timeSource.now();
}, dn = function() {
  const e = this.timeSource.now(), t = this.canvas, s = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > A, t && s) {
    const i = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / i, a = this.displayHeight > 0 ? this.displayHeight : t.height / i;
    s.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((i) => {
    i.isActive = !1, i.isPaused = !this.isPlaying, i.hasShown = !1, i.lane = -1, i.x = i.virtualStartX, i.speed = i.baseSpeed, i.lastUpdateTime = e, i.clearActivation();
  }), this.activeComments.clear();
}, fn = function(e, t) {
  if (typeof MutationObserver > "u") {
    this.log.debug(
      "MutationObserver is not available in this environment. Video change detection is disabled."
    );
    return;
  }
  const s = new MutationObserver((n) => {
    for (const a of n) {
      if (a.type === "attributes" && a.attributeName === "src") {
        const r = a.target;
        let h = null, u = null;
        if ((r instanceof HTMLVideoElement || r instanceof HTMLSourceElement) && (h = typeof a.oldValue == "string" ? a.oldValue : null, u = r.getAttribute("src")), h === u)
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
  s.observe(e, {
    attributes: !0,
    attributeFilter: ["src"],
    attributeOldValue: !0,
    childList: !0,
    subtree: !0
  }), this.addCleanup(() => s.disconnect());
  const i = new MutationObserver((n) => {
    for (const a of n)
      if (a.type === "childList") {
        for (const r of a.addedNodes) {
          const h = this.extractVideoElement(r);
          if (h && h !== this.videoElement) {
            this.initialize(h);
            return;
          }
        }
        for (const r of a.removedNodes) {
          if (r === this.videoElement) {
            this.videoElement = null, this.handleVideoSourceChange(null);
            return;
          }
          if (r instanceof Element) {
            const h = r.querySelector("video");
            if (h && h === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
          }
        }
      }
  });
  i.observe(t, { childList: !0, subtree: !0 }), this.addCleanup(() => i.disconnect());
}, pn = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, gn = (e) => {
  e.prototype.setupVideoEventListeners = rn, e.prototype.handleVideoMetadataLoaded = on, e.prototype.handleVideoStalled = ln, e.prototype.handleVideoCanPlay = hn, e.prototype.handleVideoSourceChange = cn, e.prototype.syncVideoState = un, e.prototype.resetCommentActivity = dn, e.prototype.setupVideoChangeDetection = fn, e.prototype.extractVideoElement = pn;
}, vn = function() {
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
}, Sn = function() {
  const e = this.canvas, t = this.ctx, s = this.videoElement;
  !e || !t || !s || (this.currentTime = w(s.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !s.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, yn = function(e) {
  const t = this._settings.isCommentVisible;
  if (this._settings.isCommentVisible = e, t === e)
    return;
  this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion;
  const s = this.canvas, i = this.ctx;
  if (!(!s || !i))
    if (e)
      this.lastDrawTime = this.timeSource.now(), this.pendingInitialSync = !0, this.scheduleNextFrame();
    else {
      const n = this.canvasDpr > 0 ? this.canvasDpr : 1, a = this.displayWidth > 0 ? this.displayWidth : s.width / n, r = this.displayHeight > 0 ? this.displayHeight : s.height / n;
      i.clearRect(0, 0, a, r);
    }
}, Cn = (e) => {
  e.prototype.setupVisibilityHandling = vn, e.prototype.handleVisibilityRestore = Sn, e.prototype.setCommentVisibility = yn;
}, Mn = 2.525, In = function(e, t) {
  const s = this.videoElement, i = this.canvas, n = this.ctx;
  if (!s || !i)
    return;
  const a = s.getBoundingClientRect(), r = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : i.width / r, u = this.displayHeight > 0 ? this.displayHeight : i.height / r, l = e ?? a.width ?? h, d = t ?? a.height ?? u;
  if (!Number.isFinite(l) || !Number.isFinite(d) || l <= 0 || d <= 0)
    return;
  const o = Math.max(1, Math.floor(l)), f = Math.max(1, Math.floor(d)), c = this.displayWidth > 0 ? this.displayWidth : o, p = this.displayHeight > 0 ? this.displayHeight : f, g = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, C = Math.max(1, Math.round(o * g)), M = Math.max(1, Math.round(f * g));
  if (!(this.displayWidth !== o || this.displayHeight !== f || Math.abs(this.canvasDpr - g) > Number.EPSILON || i.width !== C || i.height !== M))
    return;
  this.displayWidth = o, this.displayHeight = f, this.canvasDpr = g, i.width = C, i.height = M, i.style.width = `${o}px`, i.style.height = `${f}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(g, g));
  const S = c > 0 ? o / c : 1, _ = p > 0 ? f / p : 1;
  (S !== 1 || _ !== 1) && this.comments.forEach((I) => {
    I.isActive && (I.x *= S, I.y *= _, I.width *= S, I.fontSize = Math.max(
      we,
      Math.floor(Math.max(1, I.fontSize) * _)
    ), I.height = I.fontSize, I.virtualStartX *= S, I.exitThreshold *= S, I.baseSpeed *= S, I.speed *= S, I.speedPixelsPerMs *= S, I.bufferWidth *= S, I.reservationWidth *= S);
  }), this.calculateLaneMetrics();
}, En = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, _n = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), s = Math.max(we, Math.floor(t * (27 / 665)));
  this.laneHeight = s * Mn;
  const i = Math.floor(t / Math.max(this.laneHeight, 1));
  if (this._settings.useFixedLaneCount) {
    const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : me, a = Math.max(ce, Math.min(i, n));
    this.laneCount = a;
  } else
    this.laneCount = Math.max(ce, i);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, Tn = function(e) {
  if (this.cleanupResizeHandling(), this._settings.useContainerResizeObserver && this.isResizeObserverAvailable) {
    const t = this.resolveResizeObserverTarget(e), s = new ResizeObserver((i) => {
      for (const n of i) {
        const { width: a, height: r } = n.contentRect;
        a > 0 && r > 0 ? this.resize(a, r) : this.resize();
      }
    });
    s.observe(t), this.resizeObserver = s, this.resizeObserverTarget = t;
  } else if (typeof window < "u" && typeof window.addEventListener == "function") {
    const t = () => {
      this.resize();
    };
    window.addEventListener("resize", t), this.addCleanup(() => window.removeEventListener("resize", t));
  } else
    this.log.debug(
      "Resize handling is disabled because neither ResizeObserver nor window APIs are available."
    );
}, bn = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, mn = (e) => {
  e.prototype.resize = In, e.prototype.resolveDevicePixelRatio = En, e.prototype.calculateLaneMetrics = _n, e.prototype.setupResizeHandling = Tn, e.prototype.cleanupResizeHandling = bn;
}, wn = function() {
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
  ].forEach((s) => {
    document.addEventListener(s, e), this.addCleanup(() => document.removeEventListener(s, e));
  }), this.handleFullscreenChange();
}, xn = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, Ln = async function() {
  const e = this.canvas, t = this.videoElement;
  if (!e || !t)
    return;
  const s = this.containerElement ?? t.parentElement ?? null, i = this.getFullscreenElement(), n = this.resolveActiveOverlayContainer(t, s, i);
  if (!(n instanceof HTMLElement))
    return;
  e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
  const r = (i instanceof HTMLElement && i.contains(t) ? i : null) !== null;
  this.fullscreenActive !== r && (this.fullscreenActive = r, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
}, Fn = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, On = function(e, t, s) {
  return s instanceof HTMLElement && s.contains(e) ? s instanceof HTMLVideoElement && t instanceof HTMLElement ? t : s : t ?? null;
}, Pn = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, An = (e) => {
  e.prototype.setupFullscreenHandling = wn, e.prototype.resolveResizeObserverTarget = xn, e.prototype.handleFullscreenChange = Ln, e.prototype.resolveFullscreenContainer = Fn, e.prototype.resolveActiveOverlayContainer = On, e.prototype.getFullscreenElement = Pn;
}, Rn = function(e) {
  this.cleanupTasks.push(e);
}, Dn = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, Nn = (e) => {
  e.prototype.addCleanup = Rn, e.prototype.runCleanupTasks = Dn;
};
class T {
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
    De.call(this);
  }
  constructor(t = null, s = void 0) {
    let i, n;
    if (ki(t))
      i = B({ ...t }), n = s ?? {};
    else {
      const a = t ?? s ?? {};
      n = typeof a == "object" ? a : {}, i = B(Di());
    }
    this._settings = B(i), this.timeSource = n.timeSource ?? be(), this.animationFrameProvider = n.animationFrameProvider ?? Vi(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? Hi(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = xe(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && ti(n.debug);
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
    const s = t.getAttribute("src");
    if (s && s.length > 0)
      return s;
    const i = t.querySelector("source[src]");
    return i && typeof i.src == "string" ? i.src : null;
  }
  getCommentsSnapshot() {
    return [...this.comments];
  }
}
$i(T);
es(T);
ss(T);
os(T);
us(T);
Is(T);
xs(T);
Hs(T);
zs(T);
Zs(T);
an(T);
gn(T);
Cn(T);
mn(T);
An(T);
Nn(T);
const Vn = (e) => ({
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
}), Hn = (e) => {
  const t = e.canvas;
  if (!t)
    return null;
  const s = e.canvasDpr > 0 ? e.canvasDpr : 1;
  return {
    width: t.width,
    height: t.height,
    cssWidth: e.displayWidth > 0 ? e.displayWidth : t.width / s,
    cssHeight: e.displayHeight > 0 ? e.displayHeight : t.height / s,
    dpr: s
  };
}, Xn = (e, t, s = {}) => {
  const i = [], n = globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__, a = globalThis.__COMMENT_OVERLAY_TRACE__;
  s.collectTrace === !0 && (globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = !0, globalThis.__COMMENT_OVERLAY_TRACE__ = ((r) => {
    i.push(r);
  }));
  try {
    e.processFrame(t);
  } finally {
    s.collectTrace === !0 && (globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = n, globalThis.__COMMENT_OVERLAY_TRACE__ = a);
  }
  return {
    frameTimeMs: t,
    canvas: Hn(e),
    activeComments: Array.from(e.activeComments, Vn),
    records: i
  };
};
export {
  zn as COMMENT_OVERLAY_VERSION,
  Ai as Comment,
  T as CommentRenderer,
  Wn as DEFAULT_RENDERER_SETTINGS,
  Xn as captureRendererCalibrationFrame,
  Di as cloneDefaultSettings,
  ti as configureDebugLogging,
  Vi as createDefaultAnimationFrameProvider,
  be as createDefaultTimeSource,
  xe as createLogger,
  E as debugLog,
  si as dumpRendererState,
  P as isDebugLoggingEnabled,
  ni as logEpochChange,
  kn as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
