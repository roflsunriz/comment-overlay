const Ct = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, yt = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"游明朝体","游明朝","Yu Mincho",YuMincho,yumincho,YuMin-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic'
}, Mt = {
  defont: "600",
  gothic: "",
  mincho: ""
}, qe = {
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
}, re = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, _t = /^[,.:;]+/, Et = /[,.:;]+$/, It = (e) => {
  const t = e.trim();
  return t ? re.test(t) ? t : t.replace(_t, "").replace(Et, "") : "";
}, Tt = (e) => re.test(e) ? e.toUpperCase() : null, Ke = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const i = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, s = Number.parseFloat(i);
  return Number.isFinite(s) ? s : null;
}, Lt = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return Ke(t);
}, bt = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, mt = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), Ft = (e) => e === "naka" || e === "ue" || e === "shita", wt = (e) => e === "small" || e === "medium" || e === "big", xt = (e) => e === "defont" || e === "gothic" || e === "mincho", Ot = (e) => e in qe, At = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, r = 1, l = null, u = !1, d = !1, c = !1, o = 0, f = 1;
  for (const C of e) {
    const y = It(typeof C == "string" ? C : "");
    if (!y)
      continue;
    if (re.test(y)) {
      const M = Tt(y);
      if (M) {
        a = M;
        continue;
      }
    }
    const v = y.toLowerCase();
    if (Ft(v)) {
      i = v;
      continue;
    }
    if (wt(v)) {
      s = v;
      continue;
    }
    if (xt(v)) {
      n = v;
      continue;
    }
    if (Ot(v)) {
      a = qe[v].toUpperCase();
      continue;
    }
    if (v === "_live") {
      l = 0.5;
      continue;
    }
    if (v === "invisible") {
      r = 0, u = !0;
      continue;
    }
    if (v === "full") {
      d = !0;
      continue;
    }
    if (v === "ender") {
      c = !0;
      continue;
    }
    if (v.startsWith("ls:") || v.startsWith("letterspacing:")) {
      const M = y.indexOf(":");
      if (M >= 0) {
        const T = Ke(y.slice(M + 1));
        T !== null && (o = bt(T));
      }
      continue;
    }
    if (v.startsWith("lh:") || v.startsWith("lineheight:")) {
      const M = y.indexOf(":");
      if (M >= 0) {
        const T = Lt(y.slice(M + 1));
        T !== null && (f = mt(T));
      }
      continue;
    }
  }
  const h = Math.max(0, Math.min(1, r)), p = (a ?? t.defaultColor).toUpperCase(), g = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: i,
    size: s,
    sizeScale: Ct[s],
    font: n,
    fontFamily: yt[n],
    fontWeight: Mt[n],
    resolvedColor: p,
    colorOverride: a,
    opacityMultiplier: h,
    opacityOverride: g,
    isInvisible: u,
    isFull: d,
    isEnder: c,
    letterSpacing: o,
    lineHeight: f
  };
}, Rt = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, $ = (e) => e.length === 1 ? e.repeat(2) : e, w = (e) => Number.parseInt(e, 16), A = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, oe = (e, t) => {
  const i = Rt.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, r, l = 1;
  s.length === 3 || s.length === 4 ? (n = w($(s[0])), a = w($(s[1])), r = w($(s[2])), s.length === 4 && (l = w($(s[3])) / 255)) : (n = w(s.slice(0, 2)), a = w(s.slice(2, 4)), r = w(s.slice(4, 6)), s.length === 8 && (l = w(s.slice(6, 8)) / 255));
  const u = A(l * A(t));
  return `rgba(${n}, ${a}, ${r}, ${u})`;
}, Pt = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), je = () => Pt(), b = (e) => e * 1e3, Nt = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), le = 6e3, Se = 2700, Dt = 3, Ht = 0.35, Vt = 48, kt = 48, K = 0, zt = 6e3, te = 120, Wt = 800, Xt = 2, W = 6e3, x = 3e3, m = x + le, Ut = 240, Bt = 1800, Ce = 1, Je = 12, I = 1e-3, P = 50, $t = 2300, ye = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, Gt = (e, t, i) => {
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
}, Ze = (e, t = {}) => {
  const { level: i = "info", emitter: s = Gt } = t, n = ye[i], a = (r, l) => {
    ye[r] < n || s(r, e, l);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, he = Ze("CommentEngine:Comment"), Me = /* @__PURE__ */ new WeakMap(), Yt = (e) => {
  let t = Me.get(e);
  return t || (t = /* @__PURE__ */ new Map(), Me.set(e, t)), t;
}, j = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = Yt(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(s, r), r;
}, Qe = 768, qt = 0.1, J = (e) => qt * (Math.max(1, e) / Qe), Kt = {
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
}, _e = ({
  canvasHeight: e,
  size: t,
  lineCount: i,
  isEnder: s,
  lineHeightMultiplier: n
}) => {
  const a = Math.max(1, e), r = Math.max(1, Math.floor(i)), l = Kt[t], u = !s && r >= l.resizeAtLineCount, d = u ? l.resized : l.normal, c = a / Qe, o = Math.max(1, d.fontSize * c), f = Math.abs(n - 1) > Number.EPSILON, h = f ? Math.max(1, o * n) : Math.max(1, d.lineAdvance * c), p = o + (r - 1) * h, g = (d.blockHeight + (r - 1) * d.lineAdvance) * c, C = f ? p : Math.max(1, g - J(a));
  return { fontSize: o, lineAdvance: h, textHeight: p, slotHeight: C, wasResizedForLineCount: u };
}, jt = 768, Jt = 0.75, Zt = 10, Ee = 2, Qt = (e, t) => Math.floor((e + Number.EPSILON) / t) * t, ei = ({
  visibleWidth: e,
  canvasHeight: t,
  isFull: i,
  isEnder: s,
  lineCount: n,
  verticalFontSize: a,
  verticalTextWidth: r,
  originalFontSize: l,
  originalTextWidth: u
}) => {
  const d = Math.max(0.01, t / jt), c = Ee * d, o = Zt * Ee * d, f = Math.max(1, e * (i ? 1 : Jt)), h = !s && n > 1 && r > f, p = h ? l : a, g = h ? u : r, C = h ? f * 2 : f;
  let y = p;
  g > C && (y = Qt(p * (C / g), c)), h && !i && (y -= c), y = Math.max(o, Math.min(p, y));
  const v = p > 0 ? g * (y / p) : 0;
  let M = 1;
  return v > C && y <= o + Number.EPSILON && (M = Math.max(0.1, Math.floor(C / v * 10) / 10)), { fontSize: y, drawScale: M, useOriginalMetrics: h, targetWidth: C };
}, U = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, H = 665, ti = "  ", z = [
  366 / H,
  510 / H,
  1662 / H
], ii = 566 / H, si = 806 / 665, ni = 808 / 665, Ie = 1176 / 665, Te = 900 / 665, ai = 1126 / 665, Le = 810 / 665, ri = 1126 / 665, be = 1046 / 665, me = 1254 / 665, oi = 1140 / 665, li = 878 / 665, hi = 0.25, ci = 160, ui = 420, di = 80, fi = 0.18, pi = 400, gi = 0.2, vi = 420, Si = 250, Ci = 1.8, yi = 420, Mi = 20, _i = 0.045, Ei = 850 / 1182, Ii = (e) => Math.max(0.01, e / H), O = (e, t) => e * Ii(t), Ti = (e) => e.replaceAll("	", ti), et = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g, Li = (e) => {
  const t = Ti(e);
  if (t.includes(`
`)) {
    const i = t.split(/\r?\n/);
    return i.length > 0 ? i : [""];
  }
  return [t];
}, bi = (e, t) => {
  if (e.fontSize >= 35)
    return Math.round(t * ii);
  const i = e.text.split(/\r?\n/), s = Math.max(0, ...i.map((a) => a.length));
  return e.isEnder && s >= 25 || Math.max(0, ...i.map((a) => (a.match(/\t/g) || []).length)) >= 12 || e.width >= 1200 ? Math.round(t * z[2]) : e.width >= 300 ? Math.round(t * z[1]) : Math.round(t * z[0]);
}, mi = (e, t) => Math.min(
  O(ui, t),
  Math.max(
    O(ci, t),
    e * hi
  )
), Fi = (e, t) => {
  const i = O(
    pi,
    t
  );
  return Math.min(
    O(vi, t),
    O(di, t) + e.width * fi + Math.max(0, e.width - i) * gi
  );
}, wi = (e, t) => Math.min(
  O(yi, t),
  Math.max(
    0,
    e.width - O(Si, t)
  ) * Ci
), xi = (e, t) => {
  if (e.isFull)
    return e.width;
  const i = Math.max(e.sizeScale, 1), n = e.width / i, a = t * Ei;
  return Math.min(n, a);
}, Oi = (e) => e.lines.filter((t) => t.replace(et, "").length > 0).length, Fe = (e) => e.lines.length > 1 && Oi(e) === 1, Ai = (e) => e.lines.map((t) => t.replace(et, "")).filter((t) => t.length > 0), we = (e) => {
  if (e.lines.length <= 1)
    return !1;
  const t = Ai(e);
  return t.length === 1 && /^[●○◉◎]+$/u.test(t[0]);
}, G = (e) => e.size === "big" || e.fontSize >= 35, xe = (e, t, i = Math.max(1, e.fontSize * e.lineHeightMultiplier)) => {
  let s = 0;
  const n = e.letterSpacing;
  for (const r of e.lines) {
    const l = j(t, r), u = r.length > 1 ? n * (r.length - 1) : 0, d = Math.max(0, l + u);
    d > s && (s = d);
  }
  e.width = s, e.lineHeightPx = Math.max(1, i);
  const a = e.lines.length > 1 ? (e.lines.length - 1) * e.lineHeightPx : 0;
  e.height = e.fontSize + a;
}, Ri = (e, t, i) => (t.font = `${e.fontWeight ? `${e.fontWeight} ` : ""}${i}px ${e.fontFamily}`, Math.max(
  0,
  ...e.lines.map((s) => {
    const n = s.length > 1 ? e.letterSpacing * (s.length - 1) : 0;
    return Math.max(0, j(t, s) + n);
  })
)), Pi = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1);
    e.lines = Li(e.text);
    const r = _e({
      canvasHeight: s,
      size: e.size,
      lineCount: e.lines.length,
      isEnder: e.isEnder,
      lineHeightMultiplier: e.lineHeightMultiplier
    });
    if (e.fontSize = r.fontSize, e.slotHeight = r.slotHeight, e.staticWidthScale = 1, t.font = U(e), xe(e, t, r.lineAdvance), !e.isScrolling) {
      const L = e.width, N = _e({
        canvasHeight: s,
        size: e.size,
        lineCount: e.lines.length,
        isEnder: !0,
        lineHeightMultiplier: e.lineHeightMultiplier
      }), St = Ri(e, t, N.fontSize), k = ei({
        visibleWidth: a,
        canvasHeight: s,
        isFull: e.isFull,
        isEnder: e.isEnder,
        lineCount: e.lines.length,
        verticalFontSize: r.fontSize,
        verticalTextWidth: L,
        originalFontSize: N.fontSize,
        originalTextWidth: St
      }), ee = k.useOriginalMetrics ? N : r, ve = k.fontSize / Math.max(1, ee.fontSize);
      e.fontSize = k.fontSize, e.staticWidthScale = k.drawScale, t.font = U(e), xe(e, t, ee.lineAdvance * ve), e.slotHeight = Math.max(1, ee.slotHeight * ve * k.drawScale);
    }
    if (e.isScrolling && e.isFull) {
      const L = e.lines.length > 1 && (e.fontFamily.includes("Yu Mincho") || e.fontFamily.includes("游明朝"));
      if (L && e.hasSameVposFullMinchoEnder && !e.isEnder && G(e))
        e.width = Math.round(
          s * (we(e) ? be : ri)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Le)
        );
      else if (L && e.hasSameVposFullMinchoEnder && e.isEnder && G(e))
        e.width = Math.round(
          s * (Fe(e) ? me : Ie)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Te)
        );
      else if (L && e.hasSameVposFullMinchoEnder && e.isEnder)
        e.width = Math.round(
          s * (Fe(e) ? me : oi)
        ), e.height = Math.max(
          e.height,
          Math.round(s * li)
        );
      else if (L && G(e))
        e.width = Math.round(
          s * (we(e) ? be : Ie)
        ), e.height = Math.max(
          e.height,
          Math.round(s * Te)
        );
      else if (L)
        e.width = Math.round(s * ai), e.height = Math.max(
          e.height,
          Math.round(s * Le)
        );
      else {
        const N = G(e) ? ni : si;
        e.width = bi(e, s), e.height = Math.max(e.height, Math.round(s * N));
      }
      e.slotHeight = Math.max(e.slotHeight, e.height);
    }
    if (!e.isScrolling) {
      e.bufferWidth = 0;
      const L = (a - e.width) / 2;
      e.virtualStartX = L, e.x = L, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = x, e.preCollisionDurationMs = x, e.totalDurationMs = x, e.reservationWidth = e.width * e.staticWidthScale, e.staticExpiryTimeMs = e.vposMs + x, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const l = j(t, "??".repeat(150)), u = e.width, d = u * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, d);
    const c = Math.max(n.entryBufferPx, e.bufferWidth), o = e.scrollDirection, f = Math.min(1, s / H), h = e.isFull ? n.virtualExtension * f : n.virtualExtension, p = e.isFull ? mi(e.width, s) : 0, g = e.isFull ? O(Mi, s) + e.width * _i : 0, C = e.isFull ? 0 : Fi(e, s), y = e.isFull ? 0 : wi(e, s), v = o === "rtl" ? a + h + p + C : -u - e.bufferWidth - h - p - C, M = o === "rtl" ? -u - e.bufferWidth - c + p - C - y : a + c - p + C + y, T = o === "rtl" ? a + c : -c;
    e.virtualStartX = v, e.x = v, e.exitThreshold = M;
    const D = a > 0 ? u / a : 0, V = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let Z = n.maxVisibleDurationMs;
    if (!V && D > 1 && !e.isFull) {
      const L = Math.min(D, n.maxWidthRatio), N = n.maxVisibleDurationMs / Math.max(L, 1);
      Z = Math.max(n.minVisibleDurationMs, Math.floor(N));
    }
    const ct = a + u + e.bufferWidth + c + h + g + C * 2 + y, ut = Math.max(Z, 1), Q = ct / ut, dt = Q * 1e3 / 60;
    e.baseSpeed = dt, e.speed = e.baseSpeed, e.speedPixelsPerMs = Q;
    const ft = Math.abs(M - v), pe = o === "rtl" ? v + u + e.bufferWidth : v - e.bufferWidth, pt = o === "rtl" ? Math.max(0, pe - T) : Math.max(0, T - pe), ge = Math.max(Q, Number.EPSILON);
    e.visibleDurationMs = Z, e.preCollisionDurationMs = Math.max(0, Math.ceil(pt / ge)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(ft / ge)
    );
    const gt = u + e.bufferWidth + c, vt = xi(e, a);
    e.reservationWidth = Math.min(
      l,
      Math.max(gt, vt)
    ), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw he.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: i,
      canvasHeight: s,
      hasContext: !!t
    }), a;
  }
}, se = 5, F = {
  enabled: !1,
  maxLogsPerCategory: se
}, X = /* @__PURE__ */ new Map(), Ni = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return se;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, Di = (e) => {
  F.enabled = !!e.enabled, F.maxLogsPerCategory = Ni(e.maxLogsPerCategory), F.enabled || X.clear();
}, Ta = () => {
  X.clear();
}, R = () => F.enabled, Hi = (e) => {
  const t = X.get(e) ?? 0;
  return t >= F.maxLogsPerCategory ? (t === F.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), X.set(e, t + 1)), !1) : (X.set(e, t + 1), !0);
}, _ = (e, ...t) => {
  F.enabled && Hi(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, B = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, Vi = (e, t) => {
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
}, ki = (e, t, i) => {
  F.enabled && _("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
}, Oe = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, tt = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), zi = (e) => {
  if (typeof e.getTransform != "function")
    return;
  const t = e.getTransform();
  return [t.a, t.b, t.c, t.d, t.e, t.f];
}, Wi = (e) => {
  const t = e.canvas;
  return t ? {
    canvasWidth: t.width,
    canvasHeight: t.height
  } : {};
}, Xi = (e) => e ? {
  ...e.no !== void 0 ? { no: e.no } : {},
  ...e.fork !== void 0 ? { fork: e.fork } : {},
  ...e.source !== void 0 ? { source: e.source } : {},
  ...e.threadId !== void 0 ? { threadId: e.threadId } : {},
  ...e.date !== void 0 ? { date: e.date } : {},
  ...e.userIdHash !== void 0 ? { userIdHash: e.userIdHash } : {}
} : {}, it = (e) => ({
  text: e.text,
  vposMs: e.vposMs,
  ...Xi(e.meta),
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
}), ne = (e, t, i, s) => {
  const n = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof n != "function" || n({
    source: "comment-overlay",
    op: e,
    timestampMs: tt(),
    font: t.font,
    fillStyle: Oe(t.fillStyle),
    strokeStyle: Oe(t.strokeStyle),
    lineWidth: t.lineWidth,
    lineJoin: t.lineJoin,
    globalAlpha: t.globalAlpha,
    shadowColor: t.shadowColor,
    shadowBlur: t.shadowBlur,
    shadowOffsetX: t.shadowOffsetX,
    shadowOffsetY: t.shadowOffsetY,
    transform: zi(t),
    ...Wi(t),
    comment: it(i),
    ...s
  });
}, Ui = (e, t, i) => {
  const s = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof s != "function" || s({
    source: "comment-overlay",
    op: e,
    timestampMs: tt(),
    comment: it(t),
    ...i
  });
}, S = {
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
}, Ae = () => {
  if (!R())
    return;
  const e = performance.now();
  if (e - S.lastReported <= 5e3)
    return;
  const t = S.hits + S.misses, i = t > 0 ? S.hits / t * 100 : 0, s = S.creates > 0 ? (S.totalCharactersDrawn / S.creates).toFixed(1) : "0", n = S.outlineCallsInCache + S.outlineCallsInFallback, a = S.fillCallsInCache + S.fillCallsInFallback;
  console.log(
    "[TextureCache Stats]",
    `
  Cache: Hits=${S.hits}, Misses=${S.misses}, Hit Rate=${i.toFixed(1)}%`,
    `
  Creates: ${S.creates}, Fallbacks: ${S.fallbacks}`,
    `
  Comments: Normal=${S.normalComments}, LetterSpacing=${S.letterSpacingComments}, MultiLine=${S.multiLineComments}`,
    `
  Draw Calls: Outline=${n}, Fill=${a}`,
    `
  Avg Characters/Comment: ${s}`
  ), S.lastReported = e;
}, Bi = () => typeof OffscreenCanvas < "u", ce = (e, t, i) => {
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
}, ue = () => 2.8, st = 665, $i = 566, ae = 808, Re = $i / st, Pe = ae / st, Gi = 1098, Yi = 1530, Ne = 20.9, De = 58.9, He = 45.23908523908523 / 39, qi = 14.9, Ki = 41.9, ji = 28.92708257149126 / 27, Ve = 20, ke = 11.4, ze = 31.4, We = 23.87692307692307, Ji = 2.4, ie = 2, Xe = 66.9, Ue = 55.6, Zi = 59, Qi = 810, es = 21.5, nt = 878, at = 900, ts = 0.5, is = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const i = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!i)
    return !1;
  const s = i[1], n = s.length === 3 || s.length === 4, a = (d) => d.length === 1 ? `${d}${d}` : d, r = Number.parseInt(a(n ? s[0] : s.slice(0, 2)), 16), l = Number.parseInt(a(n ? s[1] : s.slice(2, 4)), 16), u = Number.parseInt(a(n ? s[2] : s.slice(4, 6)), 16);
  return r === 0 && l === 0 && u === 0;
}, de = (e) => is(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", ss = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, ns = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const i = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + i;
}, rt = (e) => {
  if (e.isScrolling && e.isFull) {
    if (e.hasSameVposFullMinchoEnder) {
      const u = Math.ceil(e.height);
      return {
        paddingX: Math.max(10, e.fontSize * 0.5),
        paddingY: u >= at ? Xe : u >= nt ? Ue : es,
        textureWidth: Math.ceil(e.width),
        textureHeight: u
      };
    }
    const l = e.hasSameVposFullMinchoEnder && e.isEnder ? e.fontSize >= 35 ? Xe : Ue : null;
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: l ?? (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + Ji,
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
}, as = (e) => e.isScrolling ? 1 : e.staticWidthScale, rs = (e, t) => e.isScrolling ? 1 : t, os = (e) => e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder ? Zi * Math.min(1, e.height / Qi) : 0, ls = (e, t, i, s, n) => {
  const a = rs(e, n), r = !e.isScrolling && a !== 1 ? t.width * (1 - a) * ts : 0;
  return {
    x: i - s + r + os(e),
    scaleX: a,
    scaleY: n
  };
}, fe = (e, t, i, s, n) => (a, r, l, u = 0) => {
  if (a.length === 0)
    return;
  const d = n + u, c = () => {
    s === "cache" ? l === "outline" ? S.outlineCallsInCache++ : S.fillCallsInCache++ : l === "outline" ? S.outlineCallsInFallback++ : S.fillCallsInFallback++;
  }, o = (h, p, g) => {
    if (c(), l === "outline") {
      t.strokeText(h, p, r), ne("strokeText", t, e, {
        text: h,
        x: p,
        y: r,
        meta: { statsTarget: s, mode: l, ...g }
      });
      return;
    }
    t.fillText(h, p, r), ne("fillText", t, e, {
      text: h,
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
  for (let h = 0; h < a.length; h += 1) {
    const p = a[h];
    o(p, f, { characterIndex: h });
    const g = j(i, p);
    f += g, h < a.length - 1 && (f += e.letterSpacing);
  }
}, hs = (e) => `v9::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.width}::${e.height}::${e.staticWidthScale}::${e.lines.length}`, Be = (e, t, i) => {
  const s = new OffscreenCanvas(i.width, i.height), n = s.getContext("2d");
  if (!n)
    return null;
  n.save(), n.font = i.sourceFont ? U(e) : ss(e, i.fontSize);
  const a = A(e.opacity), r = oe(e.color, a), l = e.renderStyle === "outline-only", u = l ? { blur: 0, alpha: 0 } : ce(e.shadowIntensity, i.fontSize, a);
  n.shadowColor = `rgba(0, 0, 0, ${u.alpha})`, n.shadowBlur = u.blur, n.shadowOffsetX = 0, n.shadowOffsetY = 0, n.lineJoin = "round", n.lineWidth = ue(), n.strokeStyle = de(e), n.fillStyle = r, typeof i.canvasScale == "number" && n.scale(i.canvasScale, i.canvasScale);
  const d = e.lines.length > 0 ? e.lines : [e.text], c = fe(e, n, t, "cache", i.paddingX);
  return l && d.forEach((o, f) => {
    c(o, i.baselineY + f * i.lineHeight, "outline");
  }), d.forEach((o, f) => {
    c(o, i.baselineY + f * i.lineHeight, "fill");
  }), n.restore(), s;
}, cs = (e, t, i) => {
  for (const s of i.traces ?? [])
    Be(e, t, s);
  return Be(e, t, i.output);
}, us = (e, t, i) => {
  if (e.isScrolling && e.isFull && e.fontSize >= 35 && Math.abs(
    t - e.height * (Re / Pe)
  ) <= 2 && Math.abs(
    i - t * (Pe / Re)
  ) <= 3) {
    const n = i / ae;
    return {
      traces: [
        {
          width: Math.round(Gi * n),
          height: Math.round(Yi * n),
          fontSize: e.fontSize,
          paddingX: Ne * n,
          baselineY: De * n,
          lineHeight: e.fontSize * He,
          sourceFont: !0
        }
      ],
      output: {
        width: t,
        height: i,
        fontSize: Ve * n,
        paddingX: ke * n,
        baselineY: ze * n,
        lineHeight: We * n
      }
    };
  }
  if (e.isScrolling && e.isFull && e.hasSameVposFullMinchoEnder) {
    if (i <= nt - 1) {
      const n = i / ae;
      return {
        output: {
          width: t,
          height: i,
          fontSize: Ve * n,
          paddingX: ke * n,
          baselineY: ze * n,
          lineHeight: We * n,
          canvasScale: ie
        }
      };
    }
    return i < at ? {
      output: {
        width: t,
        height: i,
        fontSize: e.fontSize,
        paddingX: qi,
        baselineY: Ki,
        lineHeight: e.fontSize * ji,
        canvasScale: ie,
        sourceFont: !0
      }
    } : {
      output: {
        width: t,
        height: i,
        fontSize: e.fontSize,
        paddingX: Ne,
        baselineY: De,
        lineHeight: e.fontSize * He,
        canvasScale: ie,
        sourceFont: !0
      }
    };
  }
  return null;
}, ds = (e, t) => {
  if (!Bi())
    return null;
  const i = Math.abs(e.letterSpacing) >= Number.EPSILON, s = e.lines.length > 1;
  i && S.letterSpacingComments++, s && S.multiLineComments++, !i && !s && S.normalComments++, S.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: l } = rt(e), u = us(e, r, l);
  if (u)
    return cs(e, t, u);
  const d = new OffscreenCanvas(r, l), c = d.getContext("2d");
  if (!c)
    return null;
  c.save(), c.font = U(e);
  const o = A(e.opacity), f = n, h = e.lines.length > 0 ? e.lines : [e.text], p = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, g = ns(e, a), C = fe(e, c, t, "cache", f), y = oe(e.color, o), v = e.renderStyle === "outline-only", M = v ? { blur: 0, alpha: 0 } : ce(e.shadowIntensity, e.fontSize, o);
  return R() && console.log(
    "[Shadow Debug - Cache]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${M.blur}px`,
    `
  Shadow alpha: ${M.alpha}`,
    `
  Fill style: ${y}`
  ), c.save(), c.shadowColor = `rgba(0, 0, 0, ${M.alpha})`, c.shadowBlur = M.blur, c.shadowOffsetX = 0, c.shadowOffsetY = 0, c.lineJoin = "round", c.lineWidth = ue(), c.strokeStyle = de(e), c.fillStyle = y, v && h.forEach((T, D) => {
    const V = g + D * p;
    C(T, V, "outline");
  }), h.forEach((T, D) => {
    const V = g + D * p;
    C(T, V, "fill");
  }), c.restore(), c.restore(), d;
}, fs = (e, t, i) => {
  S.fallbacks++, t.save(), t.font = U(e);
  const s = A(e.opacity);
  let n = i ?? e.x;
  const a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize;
  let l = e.y + e.fontSize;
  if (!e.isScrolling && e.staticWidthScale !== 1) {
    const f = n + e.width / 2;
    t.translate(f, e.y), t.scale(e.staticWidthScale, e.staticWidthScale), n = -e.width / 2, l = e.fontSize;
  }
  const u = fe(e, t, t, "fallback", n), d = oe(e.color, s), c = e.renderStyle === "outline-only", o = c ? { blur: 0, alpha: 0 } : ce(e.shadowIntensity, e.fontSize, s);
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
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${o.alpha})`, t.shadowBlur = o.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = ue(), t.strokeStyle = de(e), t.fillStyle = d, c && a.forEach((f, h) => {
    const p = l + h * r;
    u(f, p, "outline");
  }), a.forEach((f, h) => {
    const p = l + h * r;
    u(f, p, "fill");
  }), t.restore(), t.restore();
}, ps = (e, t, i) => {
  try {
    if (!e.isActive || !t)
      return;
    const s = hs(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== s || !n) {
      S.misses++, S.creates++;
      const r = ds(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(s);
    } else
      S.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = i ?? e.x, { paddingX: l, paddingY: u } = rt(e), d = as(e), c = ls(e, a, r, l, d), o = c.x, f = e.y - u;
      c.scaleX === 1 && c.scaleY === 1 ? t.drawImage(a, o, f) : t.drawImage(
        a,
        o,
        f,
        a.width * c.scaleX,
        a.height * c.scaleY
      ), ne("drawImage", t, e, {
        x: o,
        y: f,
        width: a.width * c.scaleX,
        height: a.height * c.scaleY,
        sourceWidth: a.width,
        sourceHeight: a.height,
        meta: {
          statsTarget: "cache",
          paddingX: l,
          paddingY: u,
          drawScale: d,
          drawScaleX: c.scaleX,
          drawScaleY: c.scaleY
        }
      }), Ae();
      return;
    }
    fs(e, t, i), Ae();
  } catch (s) {
    he.error("Comment.draw", s, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: i
    });
  }
}, gs = (e) => e === "ltr" ? "ltr" : "rtl", vs = (e) => e === "ltr" ? 1 : -1;
class Ss {
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
  staticWidthScale = 1;
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
    const l = At(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = l.layout, this.isScrolling = this.layout === "naka", this.size = l.size, this.sizeScale = l.sizeScale, this.opacityMultiplier = l.opacityMultiplier, this.opacityOverride = l.opacityOverride, this.colorOverride = l.colorOverride, this.isInvisible = l.isInvisible, this.isFull = l.isFull, this.isEnder = l.isEnder, this.fontFamily = l.fontFamily, this.fontWeight = l.fontWeight, this.color = l.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = l.letterSpacing, this.lineHeightMultiplier = l.lineHeight, this.timeSource = a.timeSource ?? je(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, i, s, n) {
    Pi(this, t, i, s, n);
  }
  draw(t, i = null) {
    ps(this, t, i);
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
      he.error("Comment.update", s, {
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
    const i = gs(t);
    this.scrollDirection = i, this.directionSign = vs(i);
  }
}
const Cs = 6700, q = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: Cs,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, La = q, ys = () => ({
  ...q,
  ngWords: [...q.ngWords],
  ngRegexps: [...q.ngRegexps]
}), ba = "v4.1.2", Ms = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, Y = (e) => {
  const t = e.scrollVisibleDurationMs, i = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: Ms(e.commentOpacity),
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
}, Es = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Is = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, $e = (e) => e.isScrolling && e.isFull && e.text.includes(`
`) && e.commands.some((t) => t.toLowerCase() === "mincho"), Ts = (e) => {
  const t = /* @__PURE__ */ new Set();
  e.forEach((i) => {
    i.isEnder && $e(i) && t.add(i.vposMs);
  }), e.forEach((i) => {
    i.hasSameVposFullMinchoEnder = t.has(i.vposMs) && $e(i);
  });
}, Ge = (e) => {
  const t = e.meta?.no;
  return typeof t == "number" && Number.isFinite(t) ? t : null;
}, Ls = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const i of e) {
    const { text: s, vposMs: n, commands: a = [], meta: r = null } = i, l = B(s);
    if (this.isNGComment(s)) {
      _("comment-skip-ng", { preview: l, vposMs: n });
      continue;
    }
    const u = Nt(n);
    if (u === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), _("comment-skip-invalid-vpos", { preview: l, vposMs: n });
      continue;
    }
    const d = r?.no !== void 0 ? `no:${r.source ?? ""}:${r.fork ?? ""}:${r.threadId ?? ""}:${r.no}` : `fallback:${s}\0${u}`, c = (h) => h.meta?.no !== void 0 ? `no:${h.meta.source ?? ""}:${h.meta.fork ?? ""}:${h.meta.threadId ?? ""}:${h.meta.no}` : `fallback:${h.text}\0${h.vposMs}`;
    if (this.comments.some((h) => c(h) === d) || t.some((h) => c(h) === d)) {
      _("comment-skip-duplicate", { preview: l, vposMs: u });
      continue;
    }
    const f = new Ss(
      s,
      u,
      a,
      this._settings,
      this.commentDependencies,
      r
    );
    f.creationIndex = this.commentSequence++, f.epochId = this.epochId, t.push(f), _("comment-added", {
      preview: l,
      vposMs: u,
      commands: f.commands.length,
      layout: f.layout,
      isScrolling: f.isScrolling,
      invisible: f.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), Ts(this.comments), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    if (Math.abs(n) > I)
      return n;
    const a = Ge(i), r = Ge(s);
    return a !== null && r !== null && Math.abs(a - r) > I ? a - r : i.creationIndex - s.creationIndex;
  }), t);
}, bs = function(e, t, i = [], s = null) {
  const [n] = this.addComments([{ text: e, vposMs: t, commands: i, meta: s }]);
  return n ?? null;
}, ms = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, i);
  }
}, Fs = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, ot = function() {
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
}, ws = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, xs = (e) => {
  e.prototype.addComments = Ls, e.prototype.addComment = bs, e.prototype.clearComments = ms, e.prototype.resetState = Fs, e.prototype.rebuildNgMatchers = ot, e.prototype.isNGComment = ws;
}, Os = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, As = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, ki(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, Rs = function(e) {
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
  if (Vi(e, i), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(i);
    } catch (s) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
    }
  this.lastSnapshotEmitTime = t;
}, Ps = function(e) {
  this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  return t !== void 0 ? t : lt(e);
}, lt = (e) => {
  if (!e.isScrolling)
    return e.vposMs;
  const t = e.isFull ? $t : Bt;
  return Math.max(0, e.vposMs - t);
}, Ns = function(e) {
  if (!e.isScrolling)
    return x;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : le;
}, Ds = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), lt(e);
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const i = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, i), i;
}, Hs = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + W, i = Math.max(e + W, t), s = this.comments.filter((d) => d.hasShown || d.isInvisible || this.isNGComment(d.text) ? !1 : d.vposMs >= e - m).sort((d, c) => {
    const o = d.vposMs - c.vposMs;
    return Math.abs(o) > I ? o : d.creationIndex - c.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(i - e, W) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : te, l = Math.max(te, Math.min(r, Wt));
  let u = e;
  s.forEach((d, c) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(d)), f = i - o;
    let h = Math.max(e, Math.min(u, f));
    Number.isFinite(h) || (h = e);
    const p = Xt * c;
    h + p <= f && (h += p), this.finalPhaseVposOverrides.set(d, h);
    const g = Math.max(te, Math.min(o / 2, l));
    u = h + g;
  }), this.finalPhaseScheduleDirty = !1;
}, Vs = (e) => {
  e.prototype.resetFinalPhaseState = Os, e.prototype.incrementEpoch = As, e.prototype.emitStateSnapshot = Rs, e.prototype.getEffectiveCommentVpos = Ps, e.prototype.getFinalPhaseDisplayDuration = Ns, e.prototype.resolveFinalPhaseVpos = Ds, e.prototype.recomputeFinalPhaseTimeline = Hs;
}, ks = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= P;
}, zs = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > P) && (this.playbackHasBegun = !0);
}, Ws = (e) => {
  e.prototype.shouldSuppressRendering = ks, e.prototype.updatePlaybackProgressState = zs;
}, Xs = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : b(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(r), d = this.duration > 0 && this.duration - this.currentTime <= zt;
  d && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, l), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !d && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const o of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(o), h = f < this.currentTime - m, p = f > this.currentTime + m;
    if (h || p) {
      o.isActive = !1, this.activeComments.delete(o), o.clearActivation(), o.lane >= 0 && (o.layout === "ue" ? this.releaseStaticLane("ue", o.lane) : o.layout === "shita" && this.releaseStaticLane("shita", o.lane));
      continue;
    }
    o.isScrolling && o.hasShown && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
  }
  const c = this.getCommentsInTimeWindow(this.currentTime, m);
  for (const o of c) {
    const f = R(), h = f ? B(o.text) : "";
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
}, Us = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = le, s = Se;
  return t !== null && (i = t, s = Math.max(1, Math.min(t, Se))), {
    visibleWidth: e,
    virtualExtension: Ut,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: Dt,
    bufferRatio: Ht,
    baseBufferPx: Vt,
    entryBufferPx: kt
  };
}, Bs = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.createLaneReservation(e, t), s = [...this.reservedLanes.values()].flat().filter((f) => this.areReservationsConflicting(f, i)).sort((f, h) => f.verticalStart - h.verticalStart), n = Math.max(1, e.slotHeight || e.height), a = Math.max(1, this.displayHeight || this.canvas?.height || n), r = this._settings.useFixedLaneCount ? Math.min(a, Math.max(n, this.laneCount * this.laneHeight)) : a, l = J(a), u = [], d = [];
  let c = 0, o = !1;
  for (; ; ) {
    u.push(c);
    const f = c + n, h = s.find(
      (p) => !(p.verticalEnd < c || f < p.verticalStart)
    );
    if (!h)
      break;
    if (d.push(
      `${h.comment.creationIndex}@${h.comment.vposMs}:${h.verticalStart.toFixed(3)}-${h.verticalEnd.toFixed(3)}`
    ), c = h.verticalEnd + l, c + n >= r) {
      o = !0, c = Math.random() * (r - n);
      break;
    }
  }
  return i.verticalStart = c, i.verticalEnd = c + n, this.storeLaneReservation(c, i), Ui("laneDecision", e, {
    meta: {
      currentTimeMs: t,
      selectedLane: c,
      selectedTop: c,
      selectedBottom: c + n,
      slotHeight: n,
      usedFallback: o,
      candidateLanes: u.map((f) => f.toFixed(3)).join(","),
      availableLanes: c.toFixed(3),
      nextAvailableTimes: "",
      blockedBy: d.join(","),
      reservationStartTimeMs: Math.round(i.startTime),
      reservationEndTimeMs: Math.round(i.endTime),
      reservationTotalEndTimeMs: Math.round(i.totalEndTime),
      reservationWidth: Math.round(i.width)
    }
  }), c;
}, $s = (e) => {
  e.prototype.updateComments = Xs, e.prototype.buildPrepareOptions = Us, e.prototype.findAvailableLane = Bs;
}, Gs = function(e, t) {
  let i = 0, s = e.length;
  for (; i < s; ) {
    const n = Math.floor((i + s) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + K <= t ? i = n + 1 : s = n;
  }
  return i;
}, Ys = function(e) {
  for (const [t, i] of this.reservedLanes.entries()) {
    const s = this.findFirstValidReservationIndex(i, e);
    s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
  }
}, qs = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
}, Ks = (e) => {
  e.prototype.findFirstValidReservationIndex = Gs, e.prototype.pruneLaneReservations = Ys, e.prototype.pruneStaticLaneReservations = qs;
}, js = function(e) {
  let t = 0, i = this.comments.length;
  for (; t < i; ) {
    const s = Math.floor((t + i) / 2), n = this.comments[s];
    n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
  }
  return t;
}, Js = function(e, t) {
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
}, Zs = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, Qs = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, en = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, tn = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, sn = function(e, t, i, s) {
  const n = this.pendingStaticPlacementOffsets.get(s);
  if (n !== void 0)
    return this.pendingStaticPlacementOffsets.delete(s), n;
  const a = Math.max(1, i), r = Math.max(1, s.slotHeight || s.height), l = J(a);
  if (e === "ue") {
    let f = 0;
    const p = this.getStaticReservations(e).filter((g) => g.lane < t).sort((g, C) => g.lane - C.lane);
    for (const g of p) {
      const C = g.yEnd - g.yStart;
      f += C + l;
    }
    return f;
  }
  let u = a;
  const c = this.getStaticReservations(e).filter((f) => f.lane < t).sort((f, h) => f.lane - h.lane);
  for (const f of c) {
    const h = f.yEnd - f.yStart;
    u -= h + l;
  }
  const o = u - r;
  return Math.max(0, o);
}, nn = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, an = (e) => {
  e.prototype.findCommentIndexAtOrAfter = js, e.prototype.getCommentsInTimeWindow = Js, e.prototype.getStaticReservations = Zs, e.prototype.getStaticLaneDepth = Qs, e.prototype.getStaticLaneLimit = en, e.prototype.getGlobalLaneIndexForBottom = tn, e.prototype.resolveStaticCommentOffset = sn, e.prototype.getStaticReservedLaneSet = nn;
}, ht = (e) => Math.max(1, e.slotHeight || e.height), rn = ({
  position: e,
  reservationHeight: t,
  displayHeight: i,
  reservations: s,
  currentTime: n,
  random: a = Math.random
}) => {
  const r = Math.max(1, i), l = Math.max(1, t), u = J(r), d = s.filter((o) => o.releaseTime > n), c = e === "ue" ? [0, ...d.sort((o, f) => o.yEnd - f.yEnd).map((o) => o.yEnd + u)] : [
    r - l,
    ...d.sort((o, f) => f.yStart - o.yStart).map((o) => o.yStart - u - l)
  ];
  if (l < r) {
    for (const o of c) {
      if (o < 0 || o + l > r) continue;
      if (!d.some(
        (h) => !(o + l <= h.yStart || o >= h.yEnd)
      )) return { y: o, usedFallback: !1 };
    }
    return {
      y: a() * (r - l),
      usedFallback: !0
    };
  }
  return {
    y: e === "ue" ? 0 : r - l,
    usedFallback: d.length > 0
  };
}, on = function(e, t, i = "") {
  const s = i.length > 0 && R(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - I ? (s && _("comment-eval-skip", {
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
    preview: B(e.text),
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
      const f = this.duration > 0 ? this.duration : this.finalPhaseStartTime + W, h = Math.max(
        this.finalPhaseStartTime + W,
        f
      ), p = e.width + i, g = p > 0 ? p / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + g > h) {
        const y = h - a, v = Math.max(0, y) * e.speedPixelsPerMs, M = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - u, i - v) : Math.min(e.virtualStartX + u, v - e.width);
        e.x = M;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    const d = this.findAvailableLane(e), c = Math.max(1, this.laneHeight);
    e.lane = Math.max(0, Math.round(d / c));
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
    const c = r + x;
    e.visibleDurationMs = Math.max(0, c - a), this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = c, this.reserveStaticLane(l, e, u, c), R() && _("comment-activate-static", {
      preview: B(e.text),
      lane: e.lane,
      position: l,
      displayEnd: c,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, hn = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = ht(t), r = rn({
    position: e,
    reservationHeight: a,
    displayHeight: i,
    reservations: n,
    currentTime: s
  });
  this.pendingStaticPlacementOffsets.set(t, r.y);
  const l = new Set(n.map((d) => d.lane));
  let u = 0;
  for (; l.has(u); ) u++;
  return u;
}, cn = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = t.y, r = t.y + ht(t);
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
  const i = this.getStaticReservations(e), s = i.findIndex(
    (n) => e === "shita" ? this.getGlobalLaneIndexForBottom(n.lane) === t : n.lane === t
  );
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
  return n ? Math.max(t, n.endTime + K) : t;
}, vn = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, I), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = Number.isFinite(e.width) && e.width > 0 ? e.width : e.reservationWidth, l = i > 0 ? Math.max(r, 0) / i : e.preCollisionDurationMs, u = a + l + K, d = a + e.totalDurationMs + K;
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
}, Sn = function(e, t, i) {
  const s = Math.max(1, t.verticalEnd - t.verticalStart);
  return t.verticalStart = e, t.verticalEnd = e + s, [...this.reservedLanes.values()].flat().every((n) => n.totalEndTime <= i ? !0 : n.verticalEnd < t.verticalStart || t.verticalEnd < n.verticalStart || !this.areReservationsConflicting(n, t));
}, Cn = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, yn = function(e, t) {
  if (e.directionSign === t.directionSign) {
    const l = e.speed > 0 ? Math.max(e.width, 0) / e.speed : 0, u = t.speed > 0 ? Math.max(t.width, 0) / t.speed : 0, d = Math.max(l, u);
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
  a !== null && a >= i - I && a <= s + I && n.add(a);
  const r = this.solveLeftRightEqualityTime(t, e);
  r !== null && r >= i - I && r <= s + I && n.add(r);
  for (const l of n) {
    if (l < i - I || l > s + I)
      continue;
    const u = this.computeForwardGap(e, t, l), d = this.computeForwardGap(t, e, l);
    if (u <= -24 && d <= -24)
      return !0;
  }
  return !1;
}, Mn = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, _n = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, En = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < I)
    return null;
  const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, In = (e) => {
  e.prototype.getLanePriorityOrder = pn, e.prototype.getLaneNextAvailableTime = gn, e.prototype.createLaneReservation = vn, e.prototype.isLaneAvailable = Sn, e.prototype.storeLaneReservation = Cn, e.prototype.areReservationsConflicting = yn, e.prototype.computeForwardGap = Mn, e.prototype.getBufferedEdges = _n, e.prototype.solveLeftRightEqualityTime = En;
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
    const l = (a - this.lastDrawTime) / 16.666666666666668;
    r.sort((u, d) => {
      const c = this.getEffectiveCommentVpos(u), o = this.getEffectiveCommentVpos(d), f = c - o;
      return Math.abs(f) > I ? f : u.isScrolling !== d.isScrolling ? u.isScrolling ? 1 : -1 : u.creationIndex - d.creationIndex;
    }), r.forEach((u) => {
      const c = this.isPlaying && !u.isPaused ? u.x + u.getDirectionSign() * u.speed * l : u.x;
      u.draw(t, c);
    });
  }
  this.lastDrawTime = a;
}, Ln = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : b(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(r);
  this.activeComments.forEach((c) => {
    c.isActive = !1, c.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.getCommentsInTimeWindow(this.currentTime, m).forEach((c) => {
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
        u,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(c) < this.currentTime - m ? c.hasShown = !0 : c.hasShown = !1;
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
  const s = b(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
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
  const u = this.canvasDpr > 0 ? this.canvasDpr : 1, d = this.displayWidth > 0 ? this.displayWidth : e.width / u, c = this.displayHeight > 0 ? this.displayHeight : e.height / u, o = this.buildPrepareOptions(d);
  this.getCommentsInTimeWindow(this.currentTime, m).forEach((h) => {
    const p = R(), g = p ? B(h.text) : "";
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
    if (h.syncWithSettings(this._settings, this.settingsVersion), h.isActive = !1, this.activeComments.delete(h), h.lane = -1, h.hasShown = !1, h.clearActivation(), this.shouldActivateCommentAtTime(h, this.currentTime, g)) {
      this.activateComment(
        h,
        t,
        d,
        c,
        o,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(h) < this.currentTime - m ? h.hasShown = !0 : h.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Hn = (e) => {
  e.prototype.processFrame = mn, e.prototype.handleAnimationFrame = Fn, e.prototype.handleVideoFrame = wn, e.prototype.shouldUseVideoFrameCallback = xn, e.prototype.scheduleNextFrame = On, e.prototype.cancelAnimationFrameRequest = An, e.prototype.cancelVideoFrameCallback = Rn, e.prototype.startAnimation = Pn, e.prototype.stopAnimation = Nn, e.prototype.onSeek = Dn;
}, Vn = function(e, t) {
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
}, zn = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, i = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(i ?? null, t);
    this.videoElement = t, this.containerElement = s, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? b(t.duration) : 0, this.currentTime = b(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.right = "0", n.style.bottom = "0", n.style.display = "block", n.style.pointerEvents = "none", n.style.zIndex = "2147483647";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, Wn = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Xn = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, Un = (e) => {
  e.prototype.resolveContainer = Vn, e.prototype.ensureContainerPositioning = kn, e.prototype.initialize = zn, e.prototype.destroy = Wn, e.prototype.destroyCanvasOnly = Xn;
}, Bn = function(e) {
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
      this.duration = Number.isFinite(e.duration) ? b(e.duration) : 0;
    }, u = () => {
      this.handleVideoSourceChange();
    }, d = () => {
      this.handleVideoStalled();
    }, c = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", l), e.addEventListener("emptied", u), e.addEventListener("waiting", d), e.addEventListener("canplay", c), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", u)), this.addCleanup(() => e.removeEventListener("waiting", d)), this.addCleanup(() => e.removeEventListener("canplay", c)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, $n = function(e) {
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
}, Yn = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = b(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, qn = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, Kn = function(e) {
  this.duration = Number.isFinite(e.duration) ? b(e.duration) : 0, this.currentTime = b(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, this.lastDrawTime = this.timeSource.now();
}, jn = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > P, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, Jn = function(e, t) {
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
}, Zn = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, Qn = (e) => {
  e.prototype.setupVideoEventListeners = Bn, e.prototype.handleVideoMetadataLoaded = $n, e.prototype.handleVideoStalled = Gn, e.prototype.handleVideoCanPlay = Yn, e.prototype.handleVideoSourceChange = qn, e.prototype.syncVideoState = Kn, e.prototype.resetCommentActivity = jn, e.prototype.setupVideoChangeDetection = Jn, e.prototype.extractVideoElement = Zn;
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
  !e || !t || !i || (this.currentTime = b(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
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
}, na = 768, aa = 68.1645984649658, ra = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const r = (this.fullscreenActive && s.parentElement instanceof HTMLElement ? s.parentElement.getBoundingClientRect() : null) ?? i.getBoundingClientRect(), l = this.canvasDpr > 0 ? this.canvasDpr : 1, u = this.displayWidth > 0 ? this.displayWidth : s.width / l, d = this.displayHeight > 0 ? this.displayHeight : s.height / l, c = e ?? r.width ?? u, o = t ?? r.height ?? d;
  if (!Number.isFinite(c) || !Number.isFinite(o) || c <= 0 || o <= 0)
    return;
  const f = Math.max(1, Math.floor(c)), h = Math.max(1, Math.floor(o)), p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, g = Math.max(1, Math.round(f * p)), C = Math.max(1, Math.round(h * p));
  (this.displayWidth !== f || this.displayHeight !== h || Math.abs(this.canvasDpr - p) > Number.EPSILON || s.width !== g || s.height !== C) && (this.displayWidth = f, this.displayHeight = h, this.canvasDpr = p, s.width = g, s.height = C, s.style.width = `${f}px`, s.style.height = `${h}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p)), this.calculateLaneMetrics(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.performInitialSync(b(i.currentTime)), this.draw());
}, oa = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, la = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1);
  this.laneHeight = t * (aa / na);
  const i = Math.max(this.laneHeight, 1), n = Math.floor(Math.max(0, t - i) / i);
  if (this._settings.useFixedLaneCount) {
    const a = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : Je, r = Math.max(Ce, Math.min(n, a));
    this.laneCount = r;
  } else
    this.laneCount = Math.max(Ce, n);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, ha = function(e) {
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
}, ca = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, ua = (e) => {
  e.prototype.resize = ra, e.prototype.resolveDevicePixelRatio = oa, e.prototype.calculateLaneMetrics = la, e.prototype.setupResizeHandling = ha, e.prototype.cleanupResizeHandling = ca;
}, da = function() {
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
}, Ye = (e) => {
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
}, fa = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, pa = async function() {
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
    this.resize(l.width, l.height), Ye(this);
    return;
  }
  this.resize(), Ye(this);
}, ga = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, va = function(e, t, i) {
  return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
}, Sa = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, Ca = (e) => {
  e.prototype.setupFullscreenHandling = da, e.prototype.resolveResizeObserverTarget = fa, e.prototype.handleFullscreenChange = pa, e.prototype.resolveFullscreenContainer = ga, e.prototype.resolveActiveOverlayContainer = va, e.prototype.getFullscreenElement = Sa;
}, ya = function(e) {
  this.cleanupTasks.push(e);
}, Ma = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, _a = (e) => {
  e.prototype.addCleanup = ya, e.prototype.runCleanupTasks = Ma;
};
class E {
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
  laneCount = Je;
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
    ot.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (Is(t))
      s = Y({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = Y(ys());
    }
    this._settings = Y(s), this.timeSource = n.timeSource ?? je(), this.animationFrameProvider = n.animationFrameProvider ?? _s(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? Es(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = Ze(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && Di(n.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(t) {
    this._settings = Y(t), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
xs(E);
Vs(E);
Ws(E);
$s(E);
Ks(E);
an(E);
dn(E);
In(E);
bn(E);
Hn(E);
Un(E);
Qn(E);
sa(E);
ua(E);
Ca(E);
_a(E);
const Ea = (e) => ({
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
}, ma = (e, t, i = {}) => {
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
    activeComments: Array.from(e.activeComments, Ea),
    records: s
  };
};
export {
  ba as COMMENT_OVERLAY_VERSION,
  Ss as Comment,
  E as CommentRenderer,
  La as DEFAULT_RENDERER_SETTINGS,
  ma as captureRendererCalibrationFrame,
  ys as cloneDefaultSettings,
  Di as configureDebugLogging,
  _s as createDefaultAnimationFrameProvider,
  je as createDefaultTimeSource,
  Ze as createLogger,
  _ as debugLog,
  Vi as dumpRendererState,
  R as isDebugLoggingEnabled,
  ki as logEpochChange,
  Ta as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
