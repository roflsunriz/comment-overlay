const He = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, ke = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"游明朝体","游明朝","Yu Mincho",YuMincho,yumincho,YuMin-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic'
}, We = {
  defont: "600",
  gothic: "",
  mincho: ""
}, ye = {
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
}, se = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, ze = /^[,.:;]+/, Xe = /[,.:;]+$/, Be = (e) => {
  const t = e.trim();
  return t ? se.test(t) ? t : t.replace(ze, "").replace(Xe, "") : "";
}, Ue = (e) => se.test(e) ? e.toUpperCase() : null, Ce = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const i = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, s = Number.parseFloat(i);
  return Number.isFinite(s) ? s : null;
}, Ge = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return Ce(t);
}, $e = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, Ye = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), qe = (e) => e === "naka" || e === "ue" || e === "shita", Ke = (e) => e === "small" || e === "medium" || e === "big", je = (e) => e === "defont" || e === "gothic" || e === "mincho", Je = (e) => e in ye, Ze = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, r = 1, h = null, u = !1, l = !1, d = !1, o = 0, f = 1;
  for (const C of e) {
    const M = Be(typeof C == "string" ? C : "");
    if (!M)
      continue;
    if (se.test(M)) {
      const S = Ue(M);
      if (S) {
        a = S;
        continue;
      }
    }
    const v = M.toLowerCase();
    if (qe(v)) {
      i = v;
      continue;
    }
    if (Ke(v)) {
      s = v;
      continue;
    }
    if (je(v)) {
      n = v;
      continue;
    }
    if (Je(v)) {
      a = ye[v].toUpperCase();
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
        const I = Ce(M.slice(S + 1));
        I !== null && (o = $e(I));
      }
      continue;
    }
    if (v.startsWith("lh:") || v.startsWith("lineheight:")) {
      const S = M.indexOf(":");
      if (S >= 0) {
        const I = Ge(M.slice(S + 1));
        I !== null && (f = Ye(I));
      }
      continue;
    }
  }
  const c = Math.max(0, Math.min(1, r)), p = (a ?? t.defaultColor).toUpperCase(), g = typeof h == "number" ? Math.max(0, Math.min(1, h)) : null;
  return {
    layout: i,
    size: s,
    sizeScale: He[s],
    font: n,
    fontFamily: ke[n],
    fontWeight: We[n],
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
}, Qe = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, X = (e) => e.length === 1 ? e.repeat(2) : e, F = (e) => Number.parseInt(e, 16), x = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, K = (e, t) => {
  const i = Qe.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, r, h = 1;
  s.length === 3 || s.length === 4 ? (n = F(X(s[0])), a = F(X(s[1])), r = F(X(s[2])), s.length === 4 && (h = F(X(s[3])) / 255)) : (n = F(s.slice(0, 2)), a = F(s.slice(2, 4)), r = F(s.slice(4, 6)), s.length === 8 && (h = F(s.slice(6, 8)) / 255));
  const u = x(h * x(t));
  return `rgba(${n}, ${a}, ${r}, ${u})`;
}, et = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), Me = () => et(), _ = (e) => e * 1e3, tt = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), ne = 6e3, le = 2700, it = 3, st = 0.25, nt = 32, at = 48, $ = 120, rt = 6e3, ee = 120, ot = 800, lt = 2, N = 6e3, R = 3e3, L = R + ne, ht = 240, ct = 2e3, he = 1, me = 12, be = 24, E = 1e-3, P = 50, ce = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, ut = (e, t, i) => {
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
}, Ie = (e, t = {}) => {
  const { level: i = "info", emitter: s = ut } = t, n = ce[i], a = (r, h) => {
    ce[r] < n || s(r, e, h);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, ae = Ie("CommentEngine:Comment"), ue = /* @__PURE__ */ new WeakMap(), dt = (e) => {
  let t = ue.get(e);
  return t || (t = /* @__PURE__ */ new Map(), ue.set(e, t)), t;
}, re = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = dt(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(s, r), r;
}, j = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, ft = 27 / 665, pt = 12, gt = "  ", vt = 2300 / 665, B = [366, 510, 1662], St = 566, yt = 806 / 665, Ct = 808 / 665, Mt = 1176 / 665, mt = 900 / 665, bt = 1126 / 665, It = 810 / 665, Tt = 0.25, Et = 160, _t = 420, Lt = 80, wt = 0.18, xt = 400, Ft = 0.2, Ot = 420, Pt = 250, At = 1.8, Rt = 420, Dt = 20, Nt = 0.045, Vt = (e) => e.replaceAll("	", gt), Ht = (e) => {
  const t = Vt(e);
  if (t.includes(`
`)) {
    const i = t.split(/\r?\n/);
    return i.length > 0 ? i : [""];
  }
  return [t];
}, de = (e, t = pt) => Math.max(t, e), kt = (e) => {
  if (e.fontSize >= 35)
    return St;
  const t = e.text.split(/\r?\n/);
  return Math.max(0, ...t.map((s) => (s.match(/\t/g) || []).length)) >= 12 || e.width >= 1200 ? B[2] : e.width >= 300 ? B[1] : B[0];
}, Wt = (e) => Math.min(
  _t,
  Math.max(Et, e.width * Tt)
), zt = (e) => Math.min(
  Ot,
  Lt + e.width * wt + Math.max(0, e.width - xt) * Ft
), Xt = (e) => Math.min(
  Rt,
  Math.max(0, e.width - Pt) * At
), Bt = (e, t) => {
  let i = 0;
  const s = e.letterSpacing;
  for (const r of e.lines) {
    const h = re(t, r), u = r.length > 1 ? s * (r.length - 1) : 0, l = Math.max(0, h + u);
    l > i && (i = l);
  }
  e.width = i;
  const n = Math.max(
    1,
    Math.floor(e.fontSize * e.lineHeightMultiplier)
  );
  e.lineHeightPx = n;
  const a = e.lines.length > 1 ? (e.lines.length - 1) * n : 0;
  e.height = e.fontSize + a;
}, Ut = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1), r = de(Math.floor(s * ft)), h = de(Math.floor(r * e.sizeScale));
    if (e.fontSize = h, t.font = j(e), e.lines = Ht(e.text), Bt(e, t), e.isScrolling && e.isFull) {
      const A = e.lines.length > 1 && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("游明朝"));
      if (A && e.fontSize >= 35)
        e.width = Math.round(s * Mt), e.height = Math.max(
          e.height,
          Math.round(s * mt)
        );
      else if (A)
        e.width = Math.round(s * bt), e.height = Math.max(
          e.height,
          Math.round(s * It)
        );
      else {
        const D = e.fontSize >= 35 ? Ct : yt;
        e.width = kt(e), e.height = Math.max(e.height, Math.round(s * D));
      }
    }
    if (!e.isScrolling) {
      const A = a + r * 2.6666666666666665;
      e.width >= A * 0.95 && e.fontSize >= 35 ? e.width = Math.round(s * vt) : e.width = Math.min(e.width, A), e.bufferWidth = 0;
      const D = (a - e.width) / 2;
      e.virtualStartX = D, e.x = D, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = R, e.preCollisionDurationMs = R, e.totalDurationMs = R, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + R, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const u = re(t, "??".repeat(150)), l = e.width * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, l);
    const d = Math.max(n.entryBufferPx, e.bufferWidth), o = e.scrollDirection, f = e.isFull ? Wt(e) : 0, c = e.isFull ? Dt + e.width * Nt : 0, p = e.isFull ? 0 : zt(e), g = e.isFull ? 0 : Xt(e), C = o === "rtl" ? a + n.virtualExtension + f + p : -e.width - e.bufferWidth - n.virtualExtension - f - p, M = o === "rtl" ? -e.width - e.bufferWidth - d + f - p - g : a + d - f + p + g, v = o === "rtl" ? a + d : -d, S = o === "rtl" ? C + e.width + e.bufferWidth : C - e.bufferWidth;
    e.virtualStartX = C, e.x = C, e.exitThreshold = M;
    const I = a > 0 ? e.width / a : 0, m = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let Z = n.maxVisibleDurationMs;
    if (!m && I > 1 && !e.isFull) {
      const A = Math.min(I, n.maxWidthRatio), D = n.maxVisibleDurationMs / Math.max(A, 1);
      Z = Math.max(n.minVisibleDurationMs, Math.floor(D));
    }
    const Pe = a + e.width + e.bufferWidth + d + n.virtualExtension + c + p * 2 + g, Ae = Math.max(Z, 1), Q = Pe / Ae, Re = Q * 1e3 / 60;
    e.baseSpeed = Re, e.speed = e.baseSpeed, e.speedPixelsPerMs = Q;
    const De = Math.abs(M - C), Ne = o === "rtl" ? Math.max(0, S - v) : Math.max(0, v - S), oe = Math.max(Q, Number.EPSILON);
    e.visibleDurationMs = Z, e.preCollisionDurationMs = Math.max(0, Math.ceil(Ne / oe)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(De / oe)
    );
    const Ve = e.width + e.bufferWidth + d;
    e.reservationWidth = Math.min(u, Ve), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw ae.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: i,
      canvasHeight: s,
      hasContext: !!t
    }), a;
  }
}, te = 5, w = {
  enabled: !1,
  maxLogsPerCategory: te
}, V = /* @__PURE__ */ new Map(), Gt = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return te;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, $t = (e) => {
  w.enabled = !!e.enabled, w.maxLogsPerCategory = Gt(e.maxLogsPerCategory), w.enabled || V.clear();
}, xn = () => {
  V.clear();
}, O = () => w.enabled, Yt = (e) => {
  const t = V.get(e) ?? 0;
  return t >= w.maxLogsPerCategory ? (t === w.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), V.set(e, t + 1)), !1) : (V.set(e, t + 1), !0);
}, b = (e, ...t) => {
  w.enabled && Yt(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, H = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, qt = (e, t) => {
  w.enabled && (console.group(`[CommentOverlay][state-dump] ${e}`), console.table({
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
}, Kt = (e, t, i) => {
  w.enabled && b("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
}, fe = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, jt = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), Jt = (e) => {
  if (typeof e.getTransform != "function")
    return;
  const t = e.getTransform();
  return [t.a, t.b, t.c, t.d, t.e, t.f];
}, Zt = (e) => {
  const t = e.canvas;
  return t ? {
    canvasWidth: t.width,
    canvasHeight: t.height
  } : {};
}, Qt = (e) => ({
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
}), ie = (e, t, i, s) => {
  const n = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof n != "function" || n({
    source: "comment-overlay",
    op: e,
    timestampMs: jt(),
    font: t.font,
    fillStyle: fe(t.fillStyle),
    strokeStyle: fe(t.strokeStyle),
    lineWidth: t.lineWidth,
    lineJoin: t.lineJoin,
    globalAlpha: t.globalAlpha,
    shadowColor: t.shadowColor,
    shadowBlur: t.shadowBlur,
    shadowOffsetX: t.shadowOffsetX,
    shadowOffsetY: t.shadowOffsetY,
    transform: Jt(t),
    ...Zt(t),
    comment: Qt(i),
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
}, pe = () => {
  if (!O())
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
}, ei = () => typeof OffscreenCanvas < "u", J = (e, t, i) => {
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
  }[e], a = Math.max(2, t * s), r = x(i * n);
  return { blur: a, alpha: r };
}, k = () => 2.8, Te = 566, Ee = 808, ti = 1098, ii = 1530, si = 20.9, ge = 58.9, ni = 45.23908523908523 / 39, _e = 20, Le = 11.4, Y = 31.4, q = 23.87692307692307, ai = 2.4, ri = '600 20px Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic', oi = 0.4, li = 0.9, ve = 24, hi = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const i = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!i)
    return !1;
  const s = i[1], n = s.length === 3 || s.length === 4, a = (l) => l.length === 1 ? `${l}${l}` : l, r = Number.parseInt(a(n ? s[0] : s.slice(0, 2)), 16), h = Number.parseInt(a(n ? s[1] : s.slice(2, 4)), 16), u = Number.parseInt(a(n ? s[2] : s.slice(4, 6)), 16);
  return r === 0 && h === 0 && u === 0;
}, W = (e) => hi(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", ci = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, ui = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const i = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + i;
}, we = (e) => {
  if (e.isScrolling && e.isFull)
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + ai,
      textureWidth: Math.ceil(e.width),
      textureHeight: Math.ceil(e.height)
    };
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
}, di = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35 ? 0.355 : 1, z = (e, t, i, s, n) => (a, r, h, u = 0) => {
  if (a.length === 0)
    return;
  const l = n + u, d = () => {
    s === "cache" ? h === "outline" ? y.outlineCallsInCache++ : y.fillCallsInCache++ : h === "outline" ? y.outlineCallsInFallback++ : y.fillCallsInFallback++;
  }, o = (c, p, g) => {
    if (d(), h === "outline") {
      t.strokeText(c, p, r), ie("strokeText", t, e, {
        text: c,
        x: p,
        y: r,
        meta: { statsTarget: s, mode: h, ...g }
      });
      return;
    }
    t.fillText(c, p, r), ie("fillText", t, e, {
      text: c,
      x: p,
      y: r,
      meta: { statsTarget: s, mode: h, ...g }
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
    const g = re(i, p);
    f += g, c < a.length - 1 && (f += e.letterSpacing);
  }
}, fi = (e) => `v5::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.lines.length}`, pi = (e, t, i) => e.isScrolling && e.isFull && e.fontSize >= 35 && t === Te && i === Ee, gi = (e, t, i) => e.isScrolling && e.isFull && e.isEnderGroup && t >= 1100 && i >= 800, vi = (e, t, i, s) => {
  const n = new OffscreenCanvas(i, s), a = n.getContext("2d");
  if (!a)
    return null;
  a.save(), a.font = ri;
  const r = x(e.opacity), h = K(e.color, r), u = e.renderStyle === "outline-only", l = u ? { blur: 0, alpha: 0 } : J(e.shadowIntensity, _e, r);
  a.shadowColor = `rgba(0, 0, 0, ${l.alpha})`, a.shadowBlur = l.blur, a.shadowOffsetX = 0, a.shadowOffsetY = 0, a.lineJoin = "round", a.lineWidth = k(), a.strokeStyle = W(e), a.fillStyle = h, a.scale(oi, li);
  const d = e.lines.length > 0 ? e.lines : [e.text], o = z(
    e,
    a,
    t,
    "cache",
    Le
  );
  return u && d.forEach((f, c) => {
    o(
      f,
      ve + Y + c * q,
      "outline"
    );
  }), d.forEach((f, c) => {
    o(
      f,
      ve + Y + c * q,
      "fill"
    );
  }), a.restore(), n;
}, Si = (e, t) => {
  const i = new OffscreenCanvas(
    Te,
    Ee
  ), s = i.getContext("2d");
  if (!s)
    return null;
  const a = new OffscreenCanvas(
    ti,
    ii
  ).getContext("2d");
  if (!a)
    return null;
  a.save(), a.font = j(e);
  const r = x(e.opacity), h = K(e.color, r), u = e.renderStyle === "outline-only", l = u ? { blur: 0, alpha: 0 } : J(e.shadowIntensity, e.fontSize, r);
  a.shadowColor = `rgba(0, 0, 0, ${l.alpha})`, a.shadowBlur = l.blur, a.shadowOffsetX = 0, a.shadowOffsetY = 0, a.lineJoin = "round", a.lineWidth = k(), a.strokeStyle = W(e), a.fillStyle = h;
  const d = e.lines.length > 0 ? e.lines : [e.text], o = e.fontSize * ni, f = z(
    e,
    a,
    t,
    "cache",
    si
  );
  u && d.forEach((p, g) => {
    f(p, ge + g * o, "outline");
  }), d.forEach((p, g) => {
    f(p, ge + g * o, "fill");
  }), a.restore(), s.save(), s.font = ci(e, _e), s.shadowColor = `rgba(0, 0, 0, ${l.alpha})`, s.shadowBlur = l.blur, s.shadowOffsetX = 0, s.shadowOffsetY = 0, s.lineJoin = "round", s.lineWidth = k(), s.strokeStyle = W(e), s.fillStyle = h;
  const c = z(
    e,
    s,
    t,
    "cache",
    Le
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
  }), s.restore(), i;
}, yi = (e, t) => {
  if (!ei())
    return null;
  const i = Math.abs(e.letterSpacing) >= Number.EPSILON, s = e.lines.length > 1;
  i && y.letterSpacingComments++, s && y.multiLineComments++, !i && !s && y.normalComments++, y.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: h } = we(e);
  if (pi(e, r, h))
    return Si(e, t);
  if (gi(e, r, h))
    return vi(e, t, r, h);
  const u = new OffscreenCanvas(r, h), l = u.getContext("2d");
  if (!l)
    return null;
  l.save(), l.font = j(e);
  const d = x(e.opacity), o = n, f = e.lines.length > 0 ? e.lines : [e.text], c = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, p = ui(e, a), g = z(e, l, t, "cache", o), C = K(e.color, d), M = e.renderStyle === "outline-only", v = M ? { blur: 0, alpha: 0 } : J(e.shadowIntensity, e.fontSize, d);
  return O() && console.log(
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
  ), l.save(), l.shadowColor = `rgba(0, 0, 0, ${v.alpha})`, l.shadowBlur = v.blur, l.shadowOffsetX = 0, l.shadowOffsetY = 0, l.lineJoin = "round", l.lineWidth = k(), l.strokeStyle = W(e), l.fillStyle = C, M && f.forEach((S, I) => {
    const m = p + I * c;
    g(S, m, "outline");
  }), f.forEach((S, I) => {
    const m = p + I * c;
    g(S, m, "fill");
  }), l.restore(), l.restore(), u;
}, Ci = (e, t, i) => {
  y.fallbacks++, t.save(), t.font = j(e);
  const s = x(e.opacity), n = i ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, h = e.y + e.fontSize, u = z(e, t, t, "fallback", n), l = K(e.color, s), d = e.renderStyle === "outline-only", o = d ? { blur: 0, alpha: 0 } : J(e.shadowIntensity, e.fontSize, s);
  O() && console.log(
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
}, Mi = (e, t, i) => {
  try {
    if (!e.isActive || !t)
      return;
    const s = fi(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== s || !n) {
      y.misses++, y.creates++;
      const r = yi(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(s);
    } else
      y.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = i ?? e.x, { paddingX: h, paddingY: u } = we(e), l = di(e), d = !e.isScrolling && l !== 1 ? a.width * (1 - l) * 0.455 : 0, o = r - h + d, f = e.y - u;
      l === 1 ? t.drawImage(a, o, f) : t.drawImage(
        a,
        o,
        f,
        a.width * l,
        a.height * l
      ), ie("drawImage", t, e, {
        x: o,
        y: f,
        width: a.width * l,
        height: a.height * l,
        meta: { statsTarget: "cache", paddingX: h, paddingY: u, drawScale: l }
      }), pe();
      return;
    }
    Ci(e, t, i), pe();
  } catch (s) {
    ae.error("Comment.draw", s, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: i
    });
  }
}, mi = (e) => e === "ltr" ? "ltr" : "rtl", bi = (e) => e === "ltr" ? 1 : -1;
class Ii {
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
  constructor(t, i, s, n, a = {}) {
    if (typeof t != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(i) || i < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = t, this.vposMs = i, this.commands = Array.isArray(s) ? [...s] : [];
    const r = Ze(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.size = r.size, this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.isFull = r.isFull, this.isEnder = r.isEnder, this.fontFamily = r.fontFamily, this.fontWeight = r.fontWeight, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = a.timeSource ?? Me(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, i, s, n) {
    Ut(this, t, i, s, n);
  }
  draw(t, i = null) {
    Mi(this, t, i);
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
      return x(this.opacityOverride);
    const i = t * this.opacityMultiplier;
    return Number.isFinite(i) ? x(i) : 0;
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
    const i = mi(t);
    this.scrollDirection = i, this.directionSign = bi(i);
  }
}
const Ti = 6e3, G = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: Ti,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, Fn = G, Ei = () => ({
  ...G,
  ngWords: [...G.ngWords],
  ngRegexps: [...G.ngRegexps]
}), On = "v3.1.3", _i = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, U = (e) => {
  const t = e.scrollVisibleDurationMs, i = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: _i(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: i,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, Li = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(t)
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, wi = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), xi = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, Se = (e) => e.isScrolling && e.isFull && e.text.includes(`
`) && e.commands.some((t) => t.toLowerCase() === "mincho"), Fi = (e) => {
  const t = /* @__PURE__ */ new Set();
  e.forEach((i) => {
    i.isEnder && Se(i) && t.add(i.vposMs);
  }), e.forEach((i) => {
    i.isEnderGroup = t.has(i.vposMs) && Se(i);
  });
}, Oi = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const i of e) {
    const { text: s, vposMs: n, commands: a = [] } = i, r = H(s);
    if (this.isNGComment(s)) {
      b("comment-skip-ng", { preview: r, vposMs: n });
      continue;
    }
    const h = tt(n);
    if (h === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), b("comment-skip-invalid-vpos", { preview: r, vposMs: n });
      continue;
    }
    if (this.comments.some(
      (d) => d.text === s && d.vposMs === h
    ) || t.some((d) => d.text === s && d.vposMs === h)) {
      b("comment-skip-duplicate", { preview: r, vposMs: h });
      continue;
    }
    const l = new Ii(
      s,
      h,
      a,
      this._settings,
      this.commentDependencies
    );
    l.creationIndex = this.commentSequence++, l.epochId = this.epochId, t.push(l), b("comment-added", {
      preview: r,
      vposMs: h,
      commands: l.commands.length,
      layout: l.layout,
      isScrolling: l.isScrolling,
      invisible: l.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), Fi(this.comments), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    return Math.abs(n) > E ? n : i.creationIndex - s.creationIndex;
  }), t);
}, Pi = function(e, t, i = []) {
  const [s] = this.addComments([{ text: e, vposMs: t, commands: i }]);
  return s ?? null;
}, Ai = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, i);
  }
}, Ri = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, xe = function() {
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
}, Di = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, Ni = (e) => {
  e.prototype.addComments = Oi, e.prototype.addComment = Pi, e.prototype.clearComments = Ai, e.prototype.resetState = Ri, e.prototype.rebuildNgMatchers = xe, e.prototype.isNGComment = Di;
}, Vi = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, Hi = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, Kt(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, ki = function(e) {
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
  if (qt(e, i), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(i);
    } catch (s) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
    }
  this.lastSnapshotEmitTime = t;
}, Wi = function(e) {
  this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  return t !== void 0 ? t : Fe(e);
}, Fe = (e) => e.isScrolling ? Math.max(0, e.vposMs - ct) : e.vposMs, zi = function(e) {
  if (!e.isScrolling)
    return R;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : ne;
}, Xi = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), Fe(e);
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const i = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, i), i;
}, Bi = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + N, i = Math.max(e + N, t), s = this.comments.filter((l) => l.hasShown || l.isInvisible || this.isNGComment(l.text) ? !1 : l.vposMs >= e - L).sort((l, d) => {
    const o = l.vposMs - d.vposMs;
    return Math.abs(o) > E ? o : l.creationIndex - d.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(i - e, N) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : ee, h = Math.max(ee, Math.min(r, ot));
  let u = e;
  s.forEach((l, d) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(l)), f = i - o;
    let c = Math.max(e, Math.min(u, f));
    Number.isFinite(c) || (c = e);
    const p = lt * d;
    c + p <= f && (c += p), this.finalPhaseVposOverrides.set(l, c);
    const g = Math.max(ee, Math.min(o / 2, h));
    u = c + g;
  }), this.finalPhaseScheduleDirty = !1;
}, Ui = (e) => {
  e.prototype.resetFinalPhaseState = Vi, e.prototype.incrementEpoch = Hi, e.prototype.emitStateSnapshot = ki, e.prototype.getEffectiveCommentVpos = Wi, e.prototype.getFinalPhaseDisplayDuration = zi, e.prototype.resolveFinalPhaseVpos = Xi, e.prototype.recomputeFinalPhaseTimeline = Bi;
}, Gi = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= P;
}, $i = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > P) && (this.playbackHasBegun = !0);
}, Yi = (e) => {
  e.prototype.shouldSuppressRendering = Gi, e.prototype.updatePlaybackProgressState = $i;
}, qi = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : _(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, h = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(r), l = this.duration > 0 && this.duration - this.currentTime <= rt;
  l && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, h), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !l && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const o of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(o), c = f < this.currentTime - L, p = f > this.currentTime + L;
    if (c || p) {
      o.isActive = !1, this.activeComments.delete(o), o.clearActivation(), o.lane >= 0 && (o.layout === "ue" ? this.releaseStaticLane("ue", o.lane) : o.layout === "shita" && this.releaseStaticLane("shita", o.lane));
      continue;
    }
    o.isScrolling && o.hasShown && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
  }
  const d = this.getCommentsInTimeWindow(this.currentTime, L);
  for (const o of d) {
    const f = O(), c = f ? H(o.text) : "";
    if (f && b("comment-evaluate", {
      stage: "update",
      preview: c,
      vposMs: o.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(o),
      currentTime: this.currentTime,
      isActive: o.isActive,
      hasShown: o.hasShown
    }), this.isNGComment(o.text)) {
      f && b("comment-eval-skip", {
        preview: c,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "ng-runtime"
      });
      continue;
    }
    if (o.isInvisible) {
      f && b("comment-eval-skip", {
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
      h,
      u,
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
}, Ki = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = ne, s = le;
  return t !== null && (i = t, s = Math.max(1, Math.min(t, le))), {
    visibleWidth: e,
    virtualExtension: ht,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: it,
    bufferRatio: st,
    baseBufferPx: nt,
    entryBufferPx: at
  };
}, ji = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t);
  for (const a of i)
    if (this.isLaneAvailable(a, s, t))
      return this.storeLaneReservation(a, s), a;
  const n = i[0] ?? 0;
  return this.storeLaneReservation(n, s), n;
}, Ji = (e) => {
  e.prototype.updateComments = qi, e.prototype.buildPrepareOptions = Ki, e.prototype.findAvailableLane = ji;
}, Zi = function(e, t) {
  let i = 0, s = e.length;
  for (; i < s; ) {
    const n = Math.floor((i + s) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + $ <= t ? i = n + 1 : s = n;
  }
  return i;
}, Qi = function(e) {
  for (const [t, i] of this.reservedLanes.entries()) {
    const s = this.findFirstValidReservationIndex(i, e);
    s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
  }
}, es = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
}, ts = (e) => {
  e.prototype.findFirstValidReservationIndex = Zi, e.prototype.pruneLaneReservations = Qi, e.prototype.pruneStaticLaneReservations = es;
}, is = function(e) {
  let t = 0, i = this.comments.length;
  for (; t < i; ) {
    const s = Math.floor((t + i) / 2), n = this.comments[s];
    n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
  }
  return t;
}, ss = function(e, t) {
  if (this.comments.length === 0)
    return [];
  const i = e - t, s = e + t, n = this.findCommentIndexAtOrAfter(i), a = [];
  for (let r = n; r < this.comments.length; r++) {
    const h = this.comments[r];
    if (h) {
      if (h.vposMs > s)
        break;
      a.push(h);
    }
  }
  return a;
}, ns = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, as = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, rs = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, os = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, ls = (e) => {
  const t = Math.ceil(
    e.lines.length > 1 ? e.height : e.height + e.fontSize / 3
  );
  return Math.max(0, (t - e.height) / 2);
}, hs = function(e, t, i, s) {
  const n = Math.max(1, i), a = Math.max(s.height, s.fontSize), r = 5, h = 0, u = ls(s);
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
}, cs = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, us = (e) => {
  e.prototype.findCommentIndexAtOrAfter = is, e.prototype.getCommentsInTimeWindow = ss, e.prototype.getStaticReservations = ns, e.prototype.getStaticLaneDepth = as, e.prototype.getStaticLaneLimit = rs, e.prototype.getGlobalLaneIndexForBottom = os, e.prototype.resolveStaticCommentOffset = hs, e.prototype.getStaticReservedLaneSet = cs;
}, ds = (e) => !e.isScrolling && e.width >= 1200 && e.fontSize >= 35, Oe = (e) => Math.max(1, e.fontSize * (ds(e) ? 0.46 : 5 / 9)), fs = function(e, t, i = "") {
  const s = i.length > 0 && O(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - E ? (s && b("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "final-phase-trimmed",
    finalPhaseStartTime: this.finalPhaseStartTime
  }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (s && b("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "invisible"
  }), !1) : e.isActive ? (s && b("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-active"
  }), !1) : e.hasShown && n <= t ? (s && b("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-shown",
    currentTime: t
  }), !1) : n > t + P ? (s && b("comment-eval-pending", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "future",
    currentTime: t
  }), !1) : n < t - L ? (s && b("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "expired-window",
    currentTime: t
  }), !1) : (s && b("comment-eval-ready", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    currentTime: t
  }), !0);
}, ps = function(e, t, i, s, n, a) {
  e.prepare(t, i, s, n);
  const r = this.resolveFinalPhaseVpos(e);
  if (O() && b("comment-prepared", {
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
      ), g = e.width + i, C = g > 0 ? g / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + C > p) {
        const v = p - a, S = Math.max(0, v) * e.speedPixelsPerMs, I = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - u, i - S) : Math.min(e.virtualStartX + u, S - e.width);
        e.x = I;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    const l = this.findAvailableLane(e);
    e.lane = l;
    const d = Math.max(1, this.laneHeight), o = Math.max(0, s - e.height), f = l * d;
    e.y = e.isFull ? 0 : Math.max(0, Math.min(f, o));
  } else {
    const h = e.layout === "ue" ? "ue" : "shita", u = this.assignStaticLane(h, e, s, a), l = this.resolveStaticCommentOffset(
      h,
      u,
      s,
      e
    );
    e.x = e.virtualStartX, e.y = l, e.lane = h === "ue" ? u : this.getGlobalLaneIndexForBottom(u), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = R;
    const d = a + e.visibleDurationMs;
    this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = d, this.reserveStaticLane(h, e, u, d), O() && b("comment-activate-static", {
      preview: H(e.text),
      lane: e.lane,
      position: h,
      displayEnd: d,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, gs = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = Oe(t), r = Math.max(1, a), h = Math.max(
    this.laneCount,
    Math.ceil(Math.max(1, i) / r) + n.length + 1
  ), u = Array.from({ length: h }, (o, f) => f);
  for (const o of u) {
    const f = this.resolveStaticCommentOffset(e, o, i, t), c = f, p = f + a;
    if (!n.some((C) => C.releaseTime > s ? !(p <= C.yStart || c >= C.yEnd) : !1))
      return o;
  }
  let l = u[0] ?? 0, d = Number.POSITIVE_INFINITY;
  for (const o of n)
    o.releaseTime < d && (d = o.releaseTime, l = o.lane);
  return l;
}, vs = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = t.y, r = t.y + Oe(t);
  n.push({
    comment: t,
    releaseTime: s,
    yStart: a,
    yEnd: r,
    lane: i
  });
}, Ss = function(e, t) {
  if (t < 0)
    return;
  const i = this.getStaticReservations(e), s = i.findIndex((n) => n.lane === t);
  s >= 0 && i.splice(s, 1);
}, ys = (e) => {
  e.prototype.shouldActivateCommentAtTime = fs, e.prototype.activateComment = ps, e.prototype.assignStaticLane = gs, e.prototype.reserveStaticLane = vs, e.prototype.releaseStaticLane = Ss;
}, Cs = function(e) {
  const i = Array.from({ length: this.laneCount }, (r, h) => h).sort((r, h) => {
    const u = this.getLaneNextAvailableTime(r, e), l = this.getLaneNextAvailableTime(h, e);
    return Math.abs(u - l) <= E ? r - h : u - l;
  }), s = this.getStaticReservedLaneSet();
  if (s.size === 0)
    return i;
  const n = i.filter((r) => !s.has(r));
  if (n.length === 0)
    return i;
  const a = i.filter((r) => s.has(r));
  return [...n, ...a];
}, Ms = function(e, t) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return t;
  const s = this.findFirstValidReservationIndex(i, t), n = i[s];
  return n ? Math.max(t, n.endTime + $) : t;
}, ms = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, E), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + $, h = a + e.totalDurationMs + $;
  return {
    comment: e,
    startTime: a,
    endTime: Math.max(a, r),
    totalEndTime: Math.max(a, h),
    startLeft: e.virtualStartX,
    width: e.width,
    speed: i,
    buffer: e.bufferWidth,
    directionSign: e.getDirectionSign()
  };
}, bs = function(e, t, i) {
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
}, Is = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, Ts = function(e, t) {
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
  for (const h of n) {
    if (h < i - E || h > s + E)
      continue;
    const u = this.computeForwardGap(e, t, h), l = this.computeForwardGap(t, e, h);
    if (u <= E && l <= E)
      return !0;
  }
  return !1;
}, Es = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, _s = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, Ls = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < E)
    return null;
  const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, ws = (e) => {
  e.prototype.getLanePriorityOrder = Cs, e.prototype.getLaneNextAvailableTime = Ms, e.prototype.createLaneReservation = ms, e.prototype.isLaneAvailable = bs, e.prototype.storeLaneReservation = Is, e.prototype.areReservationsConflicting = Ts, e.prototype.computeForwardGap = Es, e.prototype.getBufferedEdges = _s, e.prototype.solveLeftRightEqualityTime = Ls;
}, xs = function() {
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
    const h = (a - this.lastDrawTime) / 16.666666666666668;
    r.sort((u, l) => {
      const d = this.getEffectiveCommentVpos(u), o = this.getEffectiveCommentVpos(l), f = d - o;
      return Math.abs(f) > E ? f : u.isScrolling !== l.isScrolling ? u.isScrolling ? 1 : -1 : u.creationIndex - l.creationIndex;
    }), r.forEach((u) => {
      const d = this.isPlaying && !u.isPaused ? u.x + u.getDirectionSign() * u.speed * h : u.x;
      u.draw(t, d);
    });
  }
  this.lastDrawTime = a;
}, Fs = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : _(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, h = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(r);
  this.getCommentsInTimeWindow(this.currentTime, L).forEach((d) => {
    if (this.isNGComment(d.text) || d.isInvisible) {
      d.isActive = !1, this.activeComments.delete(d), d.clearActivation();
      return;
    }
    if (d.syncWithSettings(this._settings, this.settingsVersion), d.isActive = !1, this.activeComments.delete(d), d.lane = -1, d.clearActivation(), this.shouldActivateCommentAtTime(d, this.currentTime)) {
      this.activateComment(
        d,
        s,
        r,
        h,
        u,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(d) < this.currentTime - L ? d.hasShown = !0 : d.hasShown = !1;
  });
}, Os = (e) => {
  e.prototype.draw = xs, e.prototype.performInitialSync = Fs;
}, Ps = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, As = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, Rs = function(e, t) {
  this.videoFrameHandle = null;
  const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
}, Ds = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, Ns = function() {
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
}, Vs = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, Hs = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, ks = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, Ws = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, zs = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  if (!e || !t || !i)
    return;
  const s = _(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
  if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
    this.currentTime = s, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
    return;
  }
  const h = n > P;
  if (this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !h) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const u = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : e.width / u, d = this.displayHeight > 0 ? this.displayHeight : e.height / u, o = this.buildPrepareOptions(l);
  this.getCommentsInTimeWindow(this.currentTime, L).forEach((c) => {
    const p = O(), g = p ? H(c.text) : "";
    if (p && b("comment-evaluate", {
      stage: "seek",
      preview: g,
      vposMs: c.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(c),
      currentTime: this.currentTime,
      isActive: c.isActive,
      hasShown: c.hasShown
    }), this.isNGComment(c.text)) {
      p && b("comment-eval-skip", {
        preview: g,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        reason: "ng-runtime"
      }), c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
      return;
    }
    if (c.isInvisible) {
      p && b("comment-eval-skip", {
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
    this.getEffectiveCommentVpos(c) < this.currentTime - L ? c.hasShown = !0 : c.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Xs = (e) => {
  e.prototype.processFrame = Ps, e.prototype.handleAnimationFrame = As, e.prototype.handleVideoFrame = Rs, e.prototype.shouldUseVideoFrameCallback = Ds, e.prototype.scheduleNextFrame = Ns, e.prototype.cancelAnimationFrameRequest = Vs, e.prototype.cancelVideoFrameCallback = Hs, e.prototype.startAnimation = ks, e.prototype.stopAnimation = Ws, e.prototype.onSeek = zs;
}, Bs = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, Us = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, Gs = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, i = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(i ?? null, t);
    this.videoElement = t, this.containerElement = s, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? _(t.duration) : 0, this.currentTime = _(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, $s = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Ys = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, qs = (e) => {
  e.prototype.resolveContainer = Bs, e.prototype.ensureContainerPositioning = Us, e.prototype.initialize = Gs, e.prototype.destroy = $s, e.prototype.destroyCanvasOnly = Ys;
}, Ks = function(e) {
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
    }, h = () => {
      this.duration = Number.isFinite(e.duration) ? _(e.duration) : 0;
    }, u = () => {
      this.handleVideoSourceChange();
    }, l = () => {
      this.handleVideoStalled();
    }, d = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", h), e.addEventListener("emptied", u), e.addEventListener("waiting", l), e.addEventListener("canplay", d), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", h)), this.addCleanup(() => e.removeEventListener("emptied", u)), this.addCleanup(() => e.removeEventListener("waiting", l)), this.addCleanup(() => e.removeEventListener("canplay", d)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, js = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, Js = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
  t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, Zs = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = _(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, Qs = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, en = function(e) {
  this.duration = Number.isFinite(e.duration) ? _(e.duration) : 0, this.currentTime = _(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.lastDrawTime = this.timeSource.now();
}, tn = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, sn = function(e, t) {
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
  s.observe(t, { childList: !0, subtree: !0 }), this.addCleanup(() => s.disconnect());
}, nn = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, an = (e) => {
  e.prototype.setupVideoEventListeners = Ks, e.prototype.handleVideoMetadataLoaded = js, e.prototype.handleVideoStalled = Js, e.prototype.handleVideoCanPlay = Zs, e.prototype.handleVideoSourceChange = Qs, e.prototype.syncVideoState = en, e.prototype.resetCommentActivity = tn, e.prototype.setupVideoChangeDetection = sn, e.prototype.extractVideoElement = nn;
}, rn = function() {
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
}, on = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  !e || !t || !i || (this.currentTime = _(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, ln = function(e) {
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
}, hn = (e) => {
  e.prototype.setupVisibilityHandling = rn, e.prototype.handleVisibilityRestore = on, e.prototype.setCommentVisibility = ln;
}, cn = 2.525, un = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const a = i.getBoundingClientRect(), r = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : s.width / r, u = this.displayHeight > 0 ? this.displayHeight : s.height / r, l = e ?? a.width ?? h, d = t ?? a.height ?? u;
  if (!Number.isFinite(l) || !Number.isFinite(d) || l <= 0 || d <= 0)
    return;
  const o = Math.max(1, Math.floor(l)), f = Math.max(1, Math.floor(d)), c = this.displayWidth > 0 ? this.displayWidth : o, p = this.displayHeight > 0 ? this.displayHeight : f, g = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, C = Math.max(1, Math.round(o * g)), M = Math.max(1, Math.round(f * g));
  if (!(this.displayWidth !== o || this.displayHeight !== f || Math.abs(this.canvasDpr - g) > Number.EPSILON || s.width !== C || s.height !== M))
    return;
  this.displayWidth = o, this.displayHeight = f, this.canvasDpr = g, s.width = C, s.height = M, s.style.width = `${o}px`, s.style.height = `${f}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(g, g));
  const S = c > 0 ? o / c : 1, I = p > 0 ? f / p : 1;
  (S !== 1 || I !== 1) && this.comments.forEach((m) => {
    m.isActive && (m.x *= S, m.y *= I, m.width *= S, m.fontSize = Math.max(
      be,
      Math.floor(Math.max(1, m.fontSize) * I)
    ), m.height = m.fontSize, m.virtualStartX *= S, m.exitThreshold *= S, m.baseSpeed *= S, m.speed *= S, m.speedPixelsPerMs *= S, m.bufferWidth *= S, m.reservationWidth *= S);
  }), this.calculateLaneMetrics();
}, dn = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, fn = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(be, Math.floor(t * (27 / 665)));
  this.laneHeight = i * cn;
  const s = Math.floor(t / Math.max(this.laneHeight, 1));
  if (this._settings.useFixedLaneCount) {
    const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : me, a = Math.max(he, Math.min(s, n));
    this.laneCount = a;
  } else
    this.laneCount = Math.max(he, s);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, pn = function(e) {
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
}, gn = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, vn = (e) => {
  e.prototype.resize = un, e.prototype.resolveDevicePixelRatio = dn, e.prototype.calculateLaneMetrics = fn, e.prototype.setupResizeHandling = pn, e.prototype.cleanupResizeHandling = gn;
}, Sn = function() {
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
}, yn = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, Cn = async function() {
  const e = this.canvas, t = this.videoElement;
  if (!e || !t)
    return;
  const i = this.containerElement ?? t.parentElement ?? null, s = this.getFullscreenElement(), n = this.resolveActiveOverlayContainer(t, i, s);
  if (!(n instanceof HTMLElement))
    return;
  e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
  const r = (s instanceof HTMLElement && s.contains(t) ? s : null) !== null;
  this.fullscreenActive !== r && (this.fullscreenActive = r, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
}, Mn = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, mn = function(e, t, i) {
  return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
}, bn = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, In = (e) => {
  e.prototype.setupFullscreenHandling = Sn, e.prototype.resolveResizeObserverTarget = yn, e.prototype.handleFullscreenChange = Cn, e.prototype.resolveFullscreenContainer = Mn, e.prototype.resolveActiveOverlayContainer = mn, e.prototype.getFullscreenElement = bn;
}, Tn = function(e) {
  this.cleanupTasks.push(e);
}, En = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, _n = (e) => {
  e.prototype.addCleanup = Tn, e.prototype.runCleanupTasks = En;
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
    xe.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (xi(t))
      s = U({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = U(Ei());
    }
    this._settings = U(s), this.timeSource = n.timeSource ?? Me(), this.animationFrameProvider = n.animationFrameProvider ?? Li(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? wi(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = Ie(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && $t(n.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(t) {
    this._settings = U(t), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
Ni(T);
Ui(T);
Yi(T);
Ji(T);
ts(T);
us(T);
ys(T);
ws(T);
Os(T);
Xs(T);
qs(T);
an(T);
hn(T);
vn(T);
In(T);
_n(T);
const Ln = (e) => ({
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
}), wn = (e) => {
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
}, Pn = (e, t, i = {}) => {
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
    canvas: wn(e),
    activeComments: Array.from(e.activeComments, Ln),
    records: s
  };
};
export {
  On as COMMENT_OVERLAY_VERSION,
  Ii as Comment,
  T as CommentRenderer,
  Fn as DEFAULT_RENDERER_SETTINGS,
  Pn as captureRendererCalibrationFrame,
  Ei as cloneDefaultSettings,
  $t as configureDebugLogging,
  Li as createDefaultAnimationFrameProvider,
  Me as createDefaultTimeSource,
  Ie as createLogger,
  b as debugLog,
  qt as dumpRendererState,
  O as isDebugLoggingEnabled,
  Kt as logEpochChange,
  xn as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
