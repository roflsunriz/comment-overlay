const Xe = {
  small: 0.6666666666666666,
  medium: 1,
  big: 1.4444444444444444
}, Be = {
  defont: 'Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  gothic: '"游ゴシック体","游ゴシック","Yu Gothic",YuGothic,yugothic,YuGo-Medium,"宋体",SimSun,Arial,"ＭＳ Ｐゴシック","MS PGothic",MSPGothic,MS-PGothic',
  mincho: '"MS PMincho","MS Mincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Times New Roman","serif"'
}, $e = {
  defont: "600",
  gothic: "",
  mincho: ""
}, be = {
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
}, ie = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Ue = /^[,.:;]+/, Ge = /[,.:;]+$/, Ye = (e) => {
  const t = e.trim();
  return t ? ie.test(t) ? t : t.replace(Ue, "").replace(Ge, "") : "";
}, qe = (e) => ie.test(e) ? e.toUpperCase() : null, Te = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const s = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, i = Number.parseFloat(s);
  return Number.isFinite(i) ? i : null;
}, Ke = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const s = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(s) ? s / 100 : null;
  }
  return Te(t);
}, Je = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, je = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), Ze = (e) => e === "naka" || e === "ue" || e === "shita", Qe = (e) => e === "small" || e === "medium" || e === "big", et = (e) => e === "defont" || e === "gothic" || e === "mincho", tt = (e) => e in be, it = (e, t) => {
  let s = "naka", i = "medium", n = "defont", a = null, r = 1, l = null, u = !1, h = !1, d = 0, o = 1;
  for (const g of e) {
    const y = Ye(typeof g == "string" ? g : "");
    if (!y)
      continue;
    if (ie.test(y)) {
      const M = qe(y);
      if (M) {
        a = M;
        continue;
      }
    }
    const v = y.toLowerCase();
    if (Ze(v)) {
      s = v;
      continue;
    }
    if (Qe(v)) {
      i = v;
      continue;
    }
    if (et(v)) {
      n = v;
      continue;
    }
    if (tt(v)) {
      a = be[v].toUpperCase();
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
      h = !0;
      continue;
    }
    if (v.startsWith("ls:") || v.startsWith("letterspacing:")) {
      const M = y.indexOf(":");
      if (M >= 0) {
        const C = Te(y.slice(M + 1));
        C !== null && (d = Je(C));
      }
      continue;
    }
    if (v.startsWith("lh:") || v.startsWith("lineheight:")) {
      const M = y.indexOf(":");
      if (M >= 0) {
        const C = Ke(y.slice(M + 1));
        C !== null && (o = je(C));
      }
      continue;
    }
  }
  const f = Math.max(0, Math.min(1, r)), c = (a ?? t.defaultColor).toUpperCase(), p = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: s,
    size: i,
    sizeScale: Xe[i],
    font: n,
    fontFamily: Be[n],
    fontWeight: $e[n],
    resolvedColor: c,
    colorOverride: a,
    opacityMultiplier: f,
    opacityOverride: p,
    isInvisible: u,
    isFull: h,
    letterSpacing: d,
    lineHeight: o
  };
}, st = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, W = (e) => e.length === 1 ? e.repeat(2) : e, P = (e) => Number.parseInt(e, 16), O = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, se = (e, t) => {
  const s = st.exec(e);
  if (!s)
    return e;
  const i = s[1];
  let n, a, r, l = 1;
  i.length === 3 || i.length === 4 ? (n = P(W(i[0])), a = P(W(i[1])), r = P(W(i[2])), i.length === 4 && (l = P(W(i[3])) / 255)) : (n = P(i.slice(0, 2)), a = P(i.slice(2, 4)), r = P(i.slice(4, 6)), i.length === 8 && (l = P(i.slice(6, 8)) / 255));
  const u = O(l * O(t));
  return `rgba(${n}, ${a}, ${r}, ${u})`;
}, nt = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), Ie = () => nt(), w = (e) => e * 1e3, at = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), ne = 6e3, ue = 2700, rt = 3, ot = 0.25, lt = 32, ht = 48, U = 120, ct = 6e3, Z = 120, ut = 800, dt = 2, H = 6e3, D = 4e3, L = D + ne, ft = 240, Ee = 2e3, de = 1, xe = 12, we = 24, I = 1e-3, R = 50, pt = 5, gt = 2, fe = 8, vt = 12, pe = {
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
}, Le = (e, t = {}) => {
  const { level: s = "info", emitter: i = St } = t, n = pe[s], a = (r, l) => {
    pe[r] < n || i(r, e, l);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, ae = Le("CommentEngine:Comment"), ge = /* @__PURE__ */ new WeakMap(), yt = (e) => {
  let t = ge.get(e);
  return t || (t = /* @__PURE__ */ new Map(), ge.set(e, t)), t;
}, re = (e, t) => {
  if (!e)
    return 0;
  const i = `${e.font ?? ""}::${t}`, n = yt(e), a = n.get(i);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(i, r), r;
}, N = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, Ct = 27 / 665, mt = 12, Mt = "  ", X = [366, 510, 1662], bt = 566, Tt = 806 / 665, It = 808 / 665, Et = 0.25, xt = 160, wt = 420, Lt = 80, _t = 0.18, Ft = 400, Pt = 0.2, Ot = 420, At = 250, Rt = 1.8, Dt = 420, Nt = 20, Vt = 0.045, Ht = (e) => e.replaceAll("	", Mt), kt = (e) => {
  const t = Ht(e);
  if (t.includes(`
`)) {
    const s = t.split(/\r?\n/);
    return s.length > 0 ? s : [""];
  }
  return [t];
}, ve = (e, t = mt) => Math.max(t, e), zt = (e) => {
  if (e.fontSize >= 35)
    return bt;
  const t = e.text.split(/\r?\n/);
  return Math.max(0, ...t.map((i) => (i.match(/\t/g) || []).length)) >= 12 || e.width >= 1200 ? X[2] : e.width >= 300 ? X[1] : X[0];
}, Wt = (e) => Math.min(
  wt,
  Math.max(xt, e.width * Et)
), Xt = (e) => Math.min(
  Ot,
  Lt + e.width * _t + Math.max(0, e.width - Ft) * Pt
), Bt = (e) => Math.min(
  Dt,
  Math.max(0, e.width - At) * Rt
), Q = (e, t) => {
  let s = 0;
  const i = e.letterSpacing;
  for (const r of e.lines) {
    const l = re(t, r), u = r.length > 1 ? i * (r.length - 1) : 0, h = Math.max(0, l + u);
    h > s && (s = h);
  }
  e.width = s;
  const n = Math.max(
    1,
    Math.floor(e.fontSize * e.lineHeightMultiplier)
  );
  e.lineHeightPx = n;
  const a = e.lines.length > 1 ? (e.lines.length - 1) * n : 0;
  e.height = e.fontSize + a;
}, $t = (e, t, s, i, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(s) || !Number.isFinite(i))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(s, 1), r = ve(Math.floor(i * Ct)), l = ve(Math.floor(r * e.sizeScale));
    if (e.fontSize = l, t.font = N(e), e.lines = kt(e.text), Q(e, t), e.isScrolling && e.isFull) {
      const E = e.fontSize >= 35 ? It : Tt;
      e.width = zt(e), e.height = Math.max(e.height, Math.round(i * E));
    }
    const u = !e.isScrolling && (e.layout === "ue" || e.layout === "shita");
    if (u) {
      const E = Math.max(1, a - fe * 2);
      if (e.width > E) {
        const F = Math.max(
          vt,
          Math.min(e.fontSize, Math.floor(r * 0.6))
        ), j = E / Math.max(e.width, 1), V = Math.max(
          F,
          Math.floor(e.fontSize * Math.min(j, 1))
        );
        V < e.fontSize && (e.fontSize = V, t.font = N(e), Q(e, t));
        let he = 0;
        for (; e.width > E && e.fontSize > F && he < 5; ) {
          const We = E / Math.max(e.width, 1), ce = Math.max(
            F,
            Math.floor(e.fontSize * Math.max(We, 0.7))
          );
          ce >= e.fontSize ? e.fontSize = Math.max(F, e.fontSize - 1) : e.fontSize = ce, t.font = N(e), Q(e, t), he += 1;
        }
      }
    }
    if (!e.isScrolling) {
      e.bufferWidth = 0;
      const E = u ? fe : 0, F = Math.max((a - e.width) / 2, E), j = Math.max(E, a - e.width - E), V = Math.min(F, Math.max(j, E));
      e.virtualStartX = V, e.x = V, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = D, e.preCollisionDurationMs = D, e.totalDurationMs = D, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + D, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const h = re(t, "??".repeat(150)), d = e.width * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, d);
    const o = Math.max(n.entryBufferPx, e.bufferWidth), f = e.scrollDirection, c = e.isFull ? Wt(e) : 0, p = e.isFull ? Nt + e.width * Vt : 0, g = e.isFull ? 0 : Xt(e), y = e.isFull ? 0 : Bt(e), v = f === "rtl" ? a + n.virtualExtension + c + g : -e.width - e.bufferWidth - n.virtualExtension - c - g, M = f === "rtl" ? -e.width - e.bufferWidth - o + c - g - y : a + o - c + g + y, C = f === "rtl" ? a + o : -o, x = f === "rtl" ? v + e.width + e.bufferWidth : v - e.bufferWidth;
    e.virtualStartX = v, e.x = v, e.exitThreshold = M;
    const m = a > 0 ? e.width / a : 0, Re = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let K = n.maxVisibleDurationMs;
    if (!Re && m > 1 && !e.isFull) {
      const E = Math.min(m, n.maxWidthRatio), F = n.maxVisibleDurationMs / Math.max(E, 1);
      K = Math.max(n.minVisibleDurationMs, Math.floor(F));
    }
    const De = a + e.width + e.bufferWidth + o + n.virtualExtension + p + g * 2 + y, Ne = Math.max(K, 1), J = De / Ne, Ve = J * 1e3 / 60;
    e.baseSpeed = Ve, e.speed = e.baseSpeed, e.speedPixelsPerMs = J;
    const He = Math.abs(M - v), ke = f === "rtl" ? Math.max(0, x - C) : Math.max(0, C - x), le = Math.max(J, Number.EPSILON);
    e.visibleDurationMs = K, e.preCollisionDurationMs = Math.max(0, Math.ceil(ke / le)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(He / le)
    );
    const ze = e.width + e.bufferWidth + o;
    e.reservationWidth = Math.min(h, ze), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw ae.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: s,
      canvasHeight: i,
      hasContext: !!t
    }), a;
  }
}, ee = 5, _ = {
  enabled: !1,
  maxLogsPerCategory: ee
}, k = /* @__PURE__ */ new Map(), Ut = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return ee;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, Gt = (e) => {
  _.enabled = !!e.enabled, _.maxLogsPerCategory = Ut(e.maxLogsPerCategory), _.enabled || k.clear();
}, Mn = () => {
  k.clear();
}, A = () => _.enabled, Yt = (e) => {
  const t = k.get(e) ?? 0;
  return t >= _.maxLogsPerCategory ? (t === _.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), k.set(e, t + 1)), !1) : (k.set(e, t + 1), !0);
}, b = (e, ...t) => {
  _.enabled && Yt(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, z = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, qt = (e, t) => {
  _.enabled && (console.group(`[CommentOverlay][state-dump] ${e}`), console.table({
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
}, Kt = (e, t, s) => {
  _.enabled && b("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${s})`);
}, Se = (e) => {
  if (typeof e == "string")
    return e;
  if (e != null)
    return String(e);
}, Jt = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), jt = (e) => {
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
}), te = (e, t, s, i) => {
  const n = globalThis.__COMMENT_OVERLAY_TRACE__;
  globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== !0 || typeof n != "function" || n({
    source: "comment-overlay",
    op: e,
    timestampMs: Jt(),
    font: t.font,
    fillStyle: Se(t.fillStyle),
    strokeStyle: Se(t.strokeStyle),
    lineWidth: t.lineWidth,
    lineJoin: t.lineJoin,
    globalAlpha: t.globalAlpha,
    shadowColor: t.shadowColor,
    shadowBlur: t.shadowBlur,
    shadowOffsetX: t.shadowOffsetX,
    shadowOffsetY: t.shadowOffsetY,
    transform: jt(t),
    ...Zt(t),
    comment: Qt(s),
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
}, ye = () => {
  if (!A())
    return;
  const e = performance.now();
  if (e - S.lastReported <= 5e3)
    return;
  const t = S.hits + S.misses, s = t > 0 ? S.hits / t * 100 : 0, i = S.creates > 0 ? (S.totalCharactersDrawn / S.creates).toFixed(1) : "0", n = S.outlineCallsInCache + S.outlineCallsInFallback, a = S.fillCallsInCache + S.fillCallsInFallback;
  console.log(
    "[TextureCache Stats]",
    `
  Cache: Hits=${S.hits}, Misses=${S.misses}, Hit Rate=${s.toFixed(1)}%`,
    `
  Creates: ${S.creates}, Fallbacks: ${S.fallbacks}`,
    `
  Comments: Normal=${S.normalComments}, LetterSpacing=${S.letterSpacingComments}, MultiLine=${S.multiLineComments}`,
    `
  Draw Calls: Outline=${n}, Fill=${a}`,
    `
  Avg Characters/Comment: ${i}`
  ), S.lastReported = e;
}, ei = () => typeof OffscreenCanvas < "u", oe = (e, t, s) => {
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
  }[e], a = Math.max(2, t * i), r = O(s * n);
  return { blur: a, alpha: r };
}, G = () => 2.8, _e = 566, Fe = 808, ti = 1098, ii = 1530, si = 20.9, Ce = 58.9, ni = 45.23908523908523 / 39, ai = 20, ri = 11.4, me = 31.4, Me = 23.87692307692307, oi = 2.4, li = (e) => {
  const t = e.trim().toLowerCase();
  if (t === "black")
    return !0;
  const s = t.match(/^#([0-9a-f]{3,8})$/i);
  if (!s)
    return !1;
  const i = s[1], n = i.length === 3 || i.length === 4, a = (h) => h.length === 1 ? `${h}${h}` : h, r = Number.parseInt(a(n ? i[0] : i.slice(0, 2)), 16), l = Number.parseInt(a(n ? i[1] : i.slice(2, 4)), 16), u = Number.parseInt(a(n ? i[2] : i.slice(4, 6)), 16);
  return r === 0 && l === 0 && u === 0;
}, Y = (e) => li(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", hi = (e, t) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${t}px ${e.fontFamily}`, ci = (e, t) => {
  if (!e.isScrolling)
    return t + e.fontSize;
  const s = e.fontSize <= 18 ? e.fontSize * 0.08 : 0;
  return e.fontSize * 1.5 + s;
}, Pe = (e) => {
  if (e.isScrolling && e.isFull)
    return {
      paddingX: Math.max(10, e.fontSize * 0.5),
      paddingY: (e.fontSize >= 35 ? e.fontSize * 0.5 : Math.max(18, e.fontSize)) + oi,
      textureWidth: Math.ceil(e.width),
      textureHeight: Math.ceil(e.height)
    };
  const s = e.isScrolling ? e.fontSize * 1.15 : Math.max(10, e.fontSize * 0.5), i = e.isScrolling ? Math.round(e.fontSize * (40 / 9)) : e.height + Math.max(10, e.fontSize * 0.5) * 2, n = Math.ceil(
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
}, q = (e, t, s, i, n) => (a, r, l, u = 0) => {
  if (a.length === 0)
    return;
  const h = n + u, d = () => {
    i === "cache" ? l === "outline" ? S.outlineCallsInCache++ : S.fillCallsInCache++ : l === "outline" ? S.outlineCallsInFallback++ : S.fillCallsInFallback++;
  }, o = (c, p, g) => {
    if (d(), l === "outline") {
      t.strokeText(c, p, r), te("strokeText", t, e, {
        text: c,
        x: p,
        y: r,
        meta: { statsTarget: i, mode: l, ...g }
      });
      return;
    }
    t.fillText(c, p, r), te("fillText", t, e, {
      text: c,
      x: p,
      y: r,
      meta: { statsTarget: i, mode: l, ...g }
    });
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    o(a, h);
    return;
  }
  let f = h;
  for (let c = 0; c < a.length; c += 1) {
    const p = a[c];
    o(p, f, { characterIndex: c });
    const g = re(s, p);
    f += g, c < a.length - 1 && (f += e.letterSpacing);
  }
}, ui = (e) => `v5::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.lines.length}`, di = (e, t, s) => e.isScrolling && e.isFull && e.fontSize >= 35 && t === _e && s === Fe, fi = (e, t) => {
  const s = new OffscreenCanvas(
    _e,
    Fe
  ), i = s.getContext("2d");
  if (!i)
    return null;
  const a = new OffscreenCanvas(
    ti,
    ii
  ).getContext("2d");
  if (!a)
    return null;
  a.save(), a.font = N(e);
  const r = O(e.opacity), l = se(e.color, r), u = e.renderStyle === "outline-only", h = u ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, e.fontSize, r);
  a.shadowColor = `rgba(0, 0, 0, ${h.alpha})`, a.shadowBlur = h.blur, a.shadowOffsetX = 0, a.shadowOffsetY = 0, a.lineJoin = "round", a.lineWidth = G(), a.strokeStyle = Y(e), a.fillStyle = l;
  const d = e.lines.length > 0 ? e.lines : [e.text], o = e.fontSize * ni, f = q(
    e,
    a,
    t,
    "cache",
    si
  );
  u && d.forEach((p, g) => {
    f(p, Ce + g * o, "outline");
  }), d.forEach((p, g) => {
    f(p, Ce + g * o, "fill");
  }), a.restore(), i.save(), i.font = hi(e, ai), i.shadowColor = `rgba(0, 0, 0, ${h.alpha})`, i.shadowBlur = h.blur, i.shadowOffsetX = 0, i.shadowOffsetY = 0, i.lineJoin = "round", i.lineWidth = G(), i.strokeStyle = Y(e), i.fillStyle = l;
  const c = q(
    e,
    i,
    t,
    "cache",
    ri
  );
  return u && d.forEach((p, g) => {
    c(
      p,
      me + g * Me,
      "outline"
    );
  }), d.forEach((p, g) => {
    c(
      p,
      me + g * Me,
      "fill"
    );
  }), i.restore(), s;
}, pi = (e, t) => {
  if (!ei())
    return null;
  const s = Math.abs(e.letterSpacing) >= Number.EPSILON, i = e.lines.length > 1;
  s && S.letterSpacingComments++, i && S.multiLineComments++, !s && !i && S.normalComments++, S.totalCharactersDrawn += e.text.length;
  const { paddingX: n, paddingY: a, textureWidth: r, textureHeight: l } = Pe(e);
  if (di(e, r, l))
    return fi(e, t);
  const u = new OffscreenCanvas(r, l), h = u.getContext("2d");
  if (!h)
    return null;
  h.save(), h.font = N(e);
  const d = O(e.opacity), o = n, f = e.lines.length > 0 ? e.lines : [e.text], c = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, p = ci(e, a), g = q(e, h, t, "cache", o), y = se(e.color, d), v = e.renderStyle === "outline-only", M = v ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, e.fontSize, d);
  return A() && console.log(
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
  ), h.save(), h.shadowColor = `rgba(0, 0, 0, ${M.alpha})`, h.shadowBlur = M.blur, h.shadowOffsetX = 0, h.shadowOffsetY = 0, h.lineJoin = "round", h.lineWidth = G(), h.strokeStyle = Y(e), h.fillStyle = y, v && f.forEach((C, x) => {
    const m = p + x * c;
    g(C, m, "outline");
  }), f.forEach((C, x) => {
    const m = p + x * c;
    g(C, m, "fill");
  }), h.restore(), h.restore(), u;
}, gi = (e, t, s) => {
  S.fallbacks++, t.save(), t.font = N(e);
  const i = O(e.opacity), n = s ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, l = e.y + e.fontSize, u = q(e, t, t, "fallback", n), h = se(e.color, i), d = e.renderStyle === "outline-only", o = d ? { blur: 0, alpha: 0 } : oe(e.shadowIntensity, e.fontSize, i);
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
  Fill style: ${h}`
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${o.alpha})`, t.shadowBlur = o.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = G(), t.strokeStyle = Y(e), t.fillStyle = h, d && a.forEach((f, c) => {
    const p = l + c * r;
    u(f, p, "outline");
  }), a.forEach((f, c) => {
    const p = l + c * r;
    u(f, p, "fill");
  }), t.restore(), t.restore();
}, vi = (e, t, s) => {
  try {
    if (!e.isActive || !t)
      return;
    const i = ui(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== i || !n) {
      S.misses++, S.creates++;
      const r = pi(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(i);
    } else
      S.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = s ?? e.x, { paddingX: l, paddingY: u } = Pe(e);
      t.drawImage(a, r - l, e.y - u), te("drawImage", t, e, {
        x: r - l,
        y: e.y - u,
        width: a.width,
        height: a.height,
        meta: { statsTarget: "cache", paddingX: l, paddingY: u }
      }), ye();
      return;
    }
    gi(e, t, s), ye();
  } catch (i) {
    ae.error("Comment.draw", i, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: s
    });
  }
}, Si = (e) => e === "ltr" ? "ltr" : "rtl", yi = (e) => e === "ltr" ? 1 : -1;
class Ci {
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
    const r = it(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.size = r.size, this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.isFull = r.isFull, this.fontFamily = r.fontFamily, this.fontWeight = r.fontWeight, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = a.timeSource ?? Ie(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, s, i, n) {
    $t(this, t, s, i, n);
  }
  draw(t, s = null) {
    vi(this, t, s);
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
      ae.error("Comment.update", i, {
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
      return O(this.opacityOverride);
    const s = t * this.opacityMultiplier;
    return Number.isFinite(s) ? O(s) : 0;
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
    const s = Si(t);
    this.scrollDirection = s, this.directionSign = yi(s);
  }
}
const mi = 6e3, $ = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: mi,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, bn = $, Mi = () => ({
  ...$,
  ngWords: [...$.ngWords],
  ngRegexps: [...$.ngRegexps]
}), Tn = "v3.1.2", bi = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, Oe = (e, t = 0) => t === 0 ? pt : gt, B = (e) => {
  const t = e.scrollVisibleDurationMs, s = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: bi(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: s,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, Ti = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(t)
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, Ii = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Ei = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, xi = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const s of e) {
    const { text: i, vposMs: n, commands: a = [] } = s, r = z(i);
    if (this.isNGComment(i)) {
      b("comment-skip-ng", { preview: r, vposMs: n });
      continue;
    }
    const l = at(n);
    if (l === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: i, vposMs: n }), b("comment-skip-invalid-vpos", { preview: r, vposMs: n });
      continue;
    }
    if (this.comments.some(
      (d) => d.text === i && d.vposMs === l
    ) || t.some((d) => d.text === i && d.vposMs === l)) {
      b("comment-skip-duplicate", { preview: r, vposMs: l });
      continue;
    }
    const h = new Ci(
      i,
      l,
      a,
      this._settings,
      this.commentDependencies
    );
    h.creationIndex = this.commentSequence++, h.epochId = this.epochId, t.push(h), b("comment-added", {
      preview: r,
      vposMs: l,
      commands: h.commands.length,
      layout: h.layout,
      isScrolling: h.isScrolling,
      invisible: h.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((s, i) => {
    const n = s.vposMs - i.vposMs;
    return Math.abs(n) > I ? n : s.creationIndex - i.creationIndex;
  }), t);
}, wi = function(e, t, s = []) {
  const [i] = this.addComments([{ text: e, vposMs: t, commands: s }]);
  return i ?? null;
}, Li = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, s = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, s);
  }
}, _i = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Ae = function() {
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
}, Fi = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, Pi = (e) => {
  e.prototype.addComments = xi, e.prototype.addComment = wi, e.prototype.clearComments = Li, e.prototype.resetState = _i, e.prototype.rebuildNgMatchers = Ae, e.prototype.isNGComment = Fi;
}, Oi = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, Ai = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, Kt(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, Ri = function(e) {
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
  if (qt(e, s), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(s);
    } catch (i) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", i);
    }
  this.lastSnapshotEmitTime = t;
}, Di = function(e) {
  this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  return t !== void 0 ? t : e.isScrolling ? Math.max(0, e.vposMs - Ee) : e.vposMs;
}, Ni = function(e) {
  if (!e.isScrolling)
    return D;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : ne;
}, Vi = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), e.isScrolling ? Math.max(0, e.vposMs - Ee) : e.vposMs;
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const s = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, s), s;
}, Hi = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + H, s = Math.max(e + H, t), i = this.comments.filter((h) => h.hasShown || h.isInvisible || this.isNGComment(h.text) ? !1 : h.vposMs >= e - L).sort((h, d) => {
    const o = h.vposMs - d.vposMs;
    return Math.abs(o) > I ? o : h.creationIndex - d.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), i.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(s - e, H) / Math.max(i.length, 1), r = Number.isFinite(a) ? a : Z, l = Math.max(Z, Math.min(r, ut));
  let u = e;
  i.forEach((h, d) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(h)), f = s - o;
    let c = Math.max(e, Math.min(u, f));
    Number.isFinite(c) || (c = e);
    const p = dt * d;
    c + p <= f && (c += p), this.finalPhaseVposOverrides.set(h, c);
    const g = Math.max(Z, Math.min(o / 2, l));
    u = c + g;
  }), this.finalPhaseScheduleDirty = !1;
}, ki = (e) => {
  e.prototype.resetFinalPhaseState = Oi, e.prototype.incrementEpoch = Ai, e.prototype.emitStateSnapshot = Ri, e.prototype.getEffectiveCommentVpos = Di, e.prototype.getFinalPhaseDisplayDuration = Ni, e.prototype.resolveFinalPhaseVpos = Vi, e.prototype.recomputeFinalPhaseTimeline = Hi;
}, zi = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= R;
}, Wi = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > R) && (this.playbackHasBegun = !0);
}, Xi = (e) => {
  e.prototype.shouldSuppressRendering = zi, e.prototype.updatePlaybackProgressState = Wi;
}, Bi = function(e) {
  const t = this.videoElement, s = this.canvas, i = this.ctx;
  if (!t || !s || !i)
    return;
  const n = typeof e == "number" ? e : w(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : s.width / a, l = this.displayHeight > 0 ? this.displayHeight : s.height / a, u = this.buildPrepareOptions(r), h = this.duration > 0 && this.duration - this.currentTime <= ct;
  h && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, i.clearRect(0, 0, r, l), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !h && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
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
    const f = A(), c = f ? z(o.text) : "";
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
      i,
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
}, $i = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let s = ne, i = ue;
  return t !== null && (s = t, i = Math.max(1, Math.min(t, ue))), {
    visibleWidth: e,
    virtualExtension: ft,
    maxVisibleDurationMs: s,
    minVisibleDurationMs: i,
    maxWidthRatio: rt,
    bufferRatio: ot,
    baseBufferPx: lt,
    entryBufferPx: ht
  };
}, Ui = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const s = this.getLanePriorityOrder(t), i = this.createLaneReservation(e, t);
  for (const a of s)
    if (this.isLaneAvailable(a, i, t))
      return this.storeLaneReservation(a, i), a;
  const n = s[0] ?? 0;
  return this.storeLaneReservation(n, i), n;
}, Gi = (e) => {
  e.prototype.updateComments = Bi, e.prototype.buildPrepareOptions = $i, e.prototype.findAvailableLane = Ui;
}, Yi = function(e, t) {
  let s = 0, i = e.length;
  for (; s < i; ) {
    const n = Math.floor((s + i) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + U <= t ? s = n + 1 : i = n;
  }
  return s;
}, qi = function(e) {
  for (const [t, s] of this.reservedLanes.entries()) {
    const i = this.findFirstValidReservationIndex(s, e);
    i >= s.length ? this.reservedLanes.delete(t) : i > 0 && this.reservedLanes.set(t, s.slice(i));
  }
}, Ki = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), s = t(this.topStaticLaneReservations), i = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...s), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...i);
}, Ji = (e) => {
  e.prototype.findFirstValidReservationIndex = Yi, e.prototype.pruneLaneReservations = qi, e.prototype.pruneStaticLaneReservations = Ki;
}, ji = function(e) {
  let t = 0, s = this.comments.length;
  for (; t < s; ) {
    const i = Math.floor((t + s) / 2), n = this.comments[i];
    n !== void 0 && n.vposMs < e ? t = i + 1 : s = i;
  }
  return t;
}, Zi = function(e, t) {
  if (this.comments.length === 0)
    return [];
  const s = e - t, i = e + t, n = this.findCommentIndexAtOrAfter(s), a = [];
  for (let r = n; r < this.comments.length; r++) {
    const l = this.comments[r];
    if (l) {
      if (l.vposMs > i)
        break;
      a.push(l);
    }
  }
  return a;
}, Qi = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, es = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, ts = function(e) {
  const t = e === "ue" ? "shita" : "ue", s = this.getStaticLaneDepth(t), i = this.laneCount - s;
  return i <= 0 ? -1 : i - 1;
}, is = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, ss = function(e, t, s, i) {
  const n = Math.max(1, s), a = Math.max(i.height, i.fontSize), r = 5, l = 2;
  if (e === "ue") {
    let f = r;
    const p = this.getStaticReservations(e).filter((y) => y.lane < t).sort((y, v) => y.lane - v.lane);
    for (const y of p) {
      const v = y.yEnd - y.yStart;
      f += v + l;
    }
    const g = Math.max(r, n - a - r);
    return Math.max(r, Math.min(f, g));
  }
  let u = n - r;
  const d = this.getStaticReservations(e).filter((f) => f.lane < t).sort((f, c) => f.lane - c.lane);
  for (const f of d) {
    const c = f.yEnd - f.yStart;
    u -= c + l;
  }
  const o = u - a;
  return Math.max(r, o);
}, ns = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, as = (e) => {
  e.prototype.findCommentIndexAtOrAfter = ji, e.prototype.getCommentsInTimeWindow = Zi, e.prototype.getStaticReservations = Qi, e.prototype.getStaticLaneDepth = es, e.prototype.getStaticLaneLimit = ts, e.prototype.getGlobalLaneIndexForBottom = is, e.prototype.resolveStaticCommentOffset = ss, e.prototype.getStaticReservedLaneSet = ns;
}, rs = function(e, t, s = "") {
  const i = s.length > 0 && A(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - I ? (i && b("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "final-phase-trimmed",
    finalPhaseStartTime: this.finalPhaseStartTime
  }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (i && b("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "invisible"
  }), !1) : e.isActive ? (i && b("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-active"
  }), !1) : e.hasShown && n <= t ? (i && b("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-shown",
    currentTime: t
  }), !1) : n > t + R ? (i && b("comment-eval-pending", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "future",
    currentTime: t
  }), !1) : n < t - L ? (i && b("comment-eval-skip", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "expired-window",
    currentTime: t
  }), !1) : (i && b("comment-eval-ready", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    currentTime: t
  }), !0);
}, os = function(e, t, s, i, n, a) {
  e.prepare(t, s, i, n);
  const r = this.resolveFinalPhaseVpos(e);
  if (A() && b("comment-prepared", {
    preview: z(e.text),
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
      const c = this.duration > 0 ? this.duration : this.finalPhaseStartTime + H, p = Math.max(
        this.finalPhaseStartTime + H,
        c
      ), g = e.width + s, y = g > 0 ? g / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + y > p) {
        const M = p - a, C = Math.max(0, M) * e.speedPixelsPerMs, x = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - u, s - C) : Math.min(e.virtualStartX + u, C - e.width);
        e.x = x;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - u : e.virtualStartX + u;
    const h = this.findAvailableLane(e);
    e.lane = h;
    const d = Math.max(1, this.laneHeight), o = Math.max(0, i - e.height), f = h * d;
    e.y = e.isFull ? 0 : Math.max(0, Math.min(f, o));
  } else {
    const l = e.layout === "ue" ? "ue" : "shita", u = this.assignStaticLane(l, e, i, a), h = this.resolveStaticCommentOffset(
      l,
      u,
      i,
      e
    );
    e.x = Math.max(0, Math.min(s - e.width, e.virtualStartX)), e.y = h, e.lane = l === "ue" ? u : this.getGlobalLaneIndexForBottom(u), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = D;
    const d = a + e.visibleDurationMs;
    this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = d, this.reserveStaticLane(l, e, u, d), A() && b("comment-activate-static", {
      preview: z(e.text),
      lane: e.lane,
      position: l,
      displayEnd: d,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, ls = function(e, t, s, i) {
  const n = this.getStaticReservations(e), a = this.getStaticLaneLimit(e), r = a >= 0 ? a + 1 : 0, l = Array.from({ length: r }, (d, o) => o);
  for (const d of l) {
    const o = this.resolveStaticCommentOffset(e, d, s, t), f = Math.max(t.height, t.fontSize), c = Oe(t.fontSize, d), p = o - c, g = o + f + c;
    if (!n.some((v) => v.releaseTime > i ? !(g <= v.yStart || p >= v.yEnd) : !1))
      return d;
  }
  let u = l[0] ?? 0, h = Number.POSITIVE_INFINITY;
  for (const d of n)
    d.releaseTime < h && (h = d.releaseTime, u = d.lane);
  return u;
}, hs = function(e, t, s, i) {
  const n = this.getStaticReservations(e), a = Math.max(t.height, t.fontSize), r = Oe(t.fontSize, s), l = t.y - r, u = t.y + a + r;
  n.push({
    comment: t,
    releaseTime: i,
    yStart: l,
    yEnd: u,
    lane: s
  });
}, cs = function(e, t) {
  if (t < 0)
    return;
  const s = this.getStaticReservations(e), i = s.findIndex((n) => n.lane === t);
  i >= 0 && s.splice(i, 1);
}, us = (e) => {
  e.prototype.shouldActivateCommentAtTime = rs, e.prototype.activateComment = os, e.prototype.assignStaticLane = ls, e.prototype.reserveStaticLane = hs, e.prototype.releaseStaticLane = cs;
}, ds = function(e) {
  const s = Array.from({ length: this.laneCount }, (r, l) => l).sort((r, l) => {
    const u = this.getLaneNextAvailableTime(r, e), h = this.getLaneNextAvailableTime(l, e);
    return Math.abs(u - h) <= I ? r - l : u - h;
  }), i = this.getStaticReservedLaneSet();
  if (i.size === 0)
    return s;
  const n = s.filter((r) => !i.has(r));
  if (n.length === 0)
    return s;
  const a = s.filter((r) => i.has(r));
  return [...n, ...a];
}, fs = function(e, t) {
  const s = this.reservedLanes.get(e);
  if (!s || s.length === 0)
    return t;
  const i = this.findFirstValidReservationIndex(s, t), n = s[i];
  return n ? Math.max(t, n.endTime + U) : t;
}, ps = function(e, t) {
  const s = Math.max(e.speedPixelsPerMs, I), i = this.getEffectiveCommentVpos(e), n = Number.isFinite(i) ? i : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + U, l = a + e.totalDurationMs + U;
  return {
    comment: e,
    startTime: a,
    endTime: Math.max(a, r),
    totalEndTime: Math.max(a, l),
    startLeft: e.virtualStartX,
    width: e.width,
    speed: s,
    buffer: e.bufferWidth,
    directionSign: e.getDirectionSign()
  };
}, gs = function(e, t, s) {
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
}, vs = function(e, t) {
  const i = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, i);
}, Ss = function(e, t) {
  const s = Math.max(e.startTime, t.startTime), i = Math.min(e.endTime, t.endTime);
  if (s >= i)
    return !1;
  const n = /* @__PURE__ */ new Set([
    s,
    i,
    s + (i - s) / 2
  ]), a = this.solveLeftRightEqualityTime(e, t);
  a !== null && a >= s - I && a <= i + I && n.add(a);
  const r = this.solveLeftRightEqualityTime(t, e);
  r !== null && r >= s - I && r <= i + I && n.add(r);
  for (const l of n) {
    if (l < s - I || l > i + I)
      continue;
    const u = this.computeForwardGap(e, t, l), h = this.computeForwardGap(t, e, l);
    if (u <= I && h <= I)
      return !0;
  }
  return !1;
}, ys = function(e, t, s) {
  const i = this.getBufferedEdges(e, s), n = this.getBufferedEdges(t, s);
  return i.left - n.right;
}, Cs = function(e, t) {
  const s = Math.max(0, t - e.startTime), i = e.speed * s, n = e.startLeft + e.directionSign * i, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, ms = function(e, t) {
  const s = e.directionSign, i = t.directionSign, n = i * t.speed - s * e.speed;
  if (Math.abs(n) < I)
    return null;
  const r = (t.startLeft + i * t.speed * t.startTime + t.width + t.buffer - e.startLeft - s * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, Ms = (e) => {
  e.prototype.getLanePriorityOrder = ds, e.prototype.getLaneNextAvailableTime = fs, e.prototype.createLaneReservation = ps, e.prototype.isLaneAvailable = gs, e.prototype.storeLaneReservation = vs, e.prototype.areReservationsConflicting = Ss, e.prototype.computeForwardGap = ys, e.prototype.getBufferedEdges = Cs, e.prototype.solveLeftRightEqualityTime = ms;
}, bs = function() {
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
    const l = (a - this.lastDrawTime) / 16.666666666666668;
    r.sort((u, h) => {
      const d = this.getEffectiveCommentVpos(u), o = this.getEffectiveCommentVpos(h), f = d - o;
      return Math.abs(f) > I ? f : u.isScrolling !== h.isScrolling ? u.isScrolling ? 1 : -1 : u.creationIndex - h.creationIndex;
    }), r.forEach((u) => {
      const d = this.isPlaying && !u.isPaused ? u.x + u.getDirectionSign() * u.speed * l : u.x;
      u.draw(t, d);
    });
  }
  this.lastDrawTime = a;
}, Ts = function(e) {
  const t = this.videoElement, s = this.canvas, i = this.ctx;
  if (!t || !s || !i)
    return;
  const n = typeof e == "number" ? e : w(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : s.width / a, l = this.displayHeight > 0 ? this.displayHeight : s.height / a, u = this.buildPrepareOptions(r);
  this.getCommentsInTimeWindow(this.currentTime, L).forEach((d) => {
    if (this.isNGComment(d.text) || d.isInvisible) {
      d.isActive = !1, this.activeComments.delete(d), d.clearActivation();
      return;
    }
    if (d.syncWithSettings(this._settings, this.settingsVersion), d.isActive = !1, this.activeComments.delete(d), d.lane = -1, d.clearActivation(), this.shouldActivateCommentAtTime(d, this.currentTime)) {
      this.activateComment(
        d,
        i,
        r,
        l,
        u,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(d) < this.currentTime - L ? d.hasShown = !0 : d.hasShown = !1;
  });
}, Is = (e) => {
  e.prototype.draw = bs, e.prototype.performInitialSync = Ts;
}, Es = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, xs = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, ws = function(e, t) {
  this.videoFrameHandle = null;
  const s = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof s == "number" ? s : void 0), this.scheduleNextFrame();
}, Ls = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, _s = function() {
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
}, Fs = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, Ps = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, Os = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, As = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, Rs = function() {
  const e = this.canvas, t = this.ctx, s = this.videoElement;
  if (!e || !t || !s)
    return;
  const i = w(s.currentTime), n = Math.abs(i - this.currentTime), a = this.timeSource.now();
  if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
    this.currentTime = i, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
    return;
  }
  const l = n > R;
  if (this.currentTime = i, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !l) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const u = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : e.width / u, d = this.displayHeight > 0 ? this.displayHeight : e.height / u, o = this.buildPrepareOptions(h);
  this.getCommentsInTimeWindow(this.currentTime, L).forEach((c) => {
    const p = A(), g = p ? z(c.text) : "";
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
        h,
        d,
        o,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(c) < this.currentTime - L ? c.hasShown = !0 : c.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Ds = (e) => {
  e.prototype.processFrame = Es, e.prototype.handleAnimationFrame = xs, e.prototype.handleVideoFrame = ws, e.prototype.shouldUseVideoFrameCallback = Ls, e.prototype.scheduleNextFrame = _s, e.prototype.cancelAnimationFrameRequest = Fs, e.prototype.cancelVideoFrameCallback = Ps, e.prototype.startAnimation = Os, e.prototype.stopAnimation = As, e.prototype.onSeek = Rs;
}, Ns = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, Vs = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, Hs = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, s = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, i = this.resolveContainer(s ?? null, t);
    this.videoElement = t, this.containerElement = i, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? w(t.duration) : 0, this.currentTime = w(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > R, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, i), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, ks = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, zs = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, Ws = (e) => {
  e.prototype.resolveContainer = Ns, e.prototype.ensureContainerPositioning = Vs, e.prototype.initialize = Hs, e.prototype.destroy = ks, e.prototype.destroyCanvasOnly = zs;
}, Xs = function(e) {
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
    }, l = () => {
      this.duration = Number.isFinite(e.duration) ? w(e.duration) : 0;
    }, u = () => {
      this.handleVideoSourceChange();
    }, h = () => {
      this.handleVideoStalled();
    }, d = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", s), e.addEventListener("seeking", i), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", l), e.addEventListener("emptied", u), e.addEventListener("waiting", h), e.addEventListener("canplay", d), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", s)), this.addCleanup(() => e.removeEventListener("seeking", i)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", u)), this.addCleanup(() => e.removeEventListener("waiting", h)), this.addCleanup(() => e.removeEventListener("canplay", d)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, Bs = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, $s = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const s = this.canvasDpr > 0 ? this.canvasDpr : 1, i = this.displayWidth > 0 ? this.displayWidth : e.width / s, n = this.displayHeight > 0 ? this.displayHeight : e.height / s;
  t.clearRect(0, 0, i, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, Us = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = w(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, Gs = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const s = this.getCurrentVideoSource();
  s !== this.lastVideoSource && (this.lastVideoSource = s, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, Ys = function(e) {
  this.duration = Number.isFinite(e.duration) ? w(e.duration) : 0, this.currentTime = w(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > R, this.lastDrawTime = this.timeSource.now();
}, qs = function() {
  const e = this.timeSource.now(), t = this.canvas, s = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > R, t && s) {
    const i = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / i, a = this.displayHeight > 0 ? this.displayHeight : t.height / i;
    s.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((i) => {
    i.isActive = !1, i.isPaused = !this.isPlaying, i.hasShown = !1, i.lane = -1, i.x = i.virtualStartX, i.speed = i.baseSpeed, i.lastUpdateTime = e, i.clearActivation();
  }), this.activeComments.clear();
}, Ks = function(e, t) {
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
  i.observe(t, { childList: !0, subtree: !0 }), this.addCleanup(() => i.disconnect());
}, Js = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, js = (e) => {
  e.prototype.setupVideoEventListeners = Xs, e.prototype.handleVideoMetadataLoaded = Bs, e.prototype.handleVideoStalled = $s, e.prototype.handleVideoCanPlay = Us, e.prototype.handleVideoSourceChange = Gs, e.prototype.syncVideoState = Ys, e.prototype.resetCommentActivity = qs, e.prototype.setupVideoChangeDetection = Ks, e.prototype.extractVideoElement = Js;
}, Zs = function() {
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
}, Qs = function() {
  const e = this.canvas, t = this.ctx, s = this.videoElement;
  !e || !t || !s || (this.currentTime = w(s.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !s.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, en = function(e) {
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
}, tn = (e) => {
  e.prototype.setupVisibilityHandling = Zs, e.prototype.handleVisibilityRestore = Qs, e.prototype.setCommentVisibility = en;
}, sn = function(e, t) {
  const s = this.videoElement, i = this.canvas, n = this.ctx;
  if (!s || !i)
    return;
  const a = s.getBoundingClientRect(), r = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : i.width / r, u = this.displayHeight > 0 ? this.displayHeight : i.height / r, h = e ?? a.width ?? l, d = t ?? a.height ?? u;
  if (!Number.isFinite(h) || !Number.isFinite(d) || h <= 0 || d <= 0)
    return;
  const o = Math.max(1, Math.floor(h)), f = Math.max(1, Math.floor(d)), c = this.displayWidth > 0 ? this.displayWidth : o, p = this.displayHeight > 0 ? this.displayHeight : f, g = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, y = Math.max(1, Math.round(o * g)), v = Math.max(1, Math.round(f * g));
  if (!(this.displayWidth !== o || this.displayHeight !== f || Math.abs(this.canvasDpr - g) > Number.EPSILON || i.width !== y || i.height !== v))
    return;
  this.displayWidth = o, this.displayHeight = f, this.canvasDpr = g, i.width = y, i.height = v, i.style.width = `${o}px`, i.style.height = `${f}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(g, g));
  const C = c > 0 ? o / c : 1, x = p > 0 ? f / p : 1;
  (C !== 1 || x !== 1) && this.comments.forEach((m) => {
    m.isActive && (m.x *= C, m.y *= x, m.width *= C, m.fontSize = Math.max(
      we,
      Math.floor(Math.max(1, m.fontSize) * x)
    ), m.height = m.fontSize, m.virtualStartX *= C, m.exitThreshold *= C, m.baseSpeed *= C, m.speed *= C, m.speedPixelsPerMs *= C, m.bufferWidth *= C, m.reservationWidth *= C);
  }), this.calculateLaneMetrics();
}, nn = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, an = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), s = Math.max(we, Math.floor(t * (27 / 665)));
  this.laneHeight = s * 2.2;
  const i = Math.floor(t / Math.max(this.laneHeight, 1));
  if (this._settings.useFixedLaneCount) {
    const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : xe, a = Math.max(de, Math.min(i, n));
    this.laneCount = a;
  } else
    this.laneCount = Math.max(de, i);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, rn = function(e) {
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
}, on = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, ln = (e) => {
  e.prototype.resize = sn, e.prototype.resolveDevicePixelRatio = nn, e.prototype.calculateLaneMetrics = an, e.prototype.setupResizeHandling = rn, e.prototype.cleanupResizeHandling = on;
}, hn = function() {
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
}, cn = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, un = async function() {
  const e = this.canvas, t = this.videoElement;
  if (!e || !t)
    return;
  const s = this.containerElement ?? t.parentElement ?? null, i = this.getFullscreenElement(), n = this.resolveActiveOverlayContainer(t, s, i);
  if (!(n instanceof HTMLElement))
    return;
  e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
  const r = (i instanceof HTMLElement && i.contains(t) ? i : null) !== null;
  this.fullscreenActive !== r && (this.fullscreenActive = r, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
}, dn = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, fn = function(e, t, s) {
  return s instanceof HTMLElement && s.contains(e) ? s instanceof HTMLVideoElement && t instanceof HTMLElement ? t : s : t ?? null;
}, pn = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, gn = (e) => {
  e.prototype.setupFullscreenHandling = hn, e.prototype.resolveResizeObserverTarget = cn, e.prototype.handleFullscreenChange = un, e.prototype.resolveFullscreenContainer = dn, e.prototype.resolveActiveOverlayContainer = fn, e.prototype.getFullscreenElement = pn;
}, vn = function(e) {
  this.cleanupTasks.push(e);
}, Sn = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, yn = (e) => {
  e.prototype.addCleanup = vn, e.prototype.runCleanupTasks = Sn;
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
  laneCount = xe;
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
    Ae.call(this);
  }
  constructor(t = null, s = void 0) {
    let i, n;
    if (Ei(t))
      i = B({ ...t }), n = s ?? {};
    else {
      const a = t ?? s ?? {};
      n = typeof a == "object" ? a : {}, i = B(Mi());
    }
    this._settings = B(i), this.timeSource = n.timeSource ?? Ie(), this.animationFrameProvider = n.animationFrameProvider ?? Ti(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? Ii(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = Le(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && Gt(n.debug);
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
Pi(T);
ki(T);
Xi(T);
Gi(T);
Ji(T);
as(T);
us(T);
Ms(T);
Is(T);
Ds(T);
Ws(T);
js(T);
tn(T);
ln(T);
gn(T);
yn(T);
const Cn = (e) => ({
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
}), mn = (e) => {
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
}, In = (e, t, s = {}) => {
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
    canvas: mn(e),
    activeComments: Array.from(e.activeComments, Cn),
    records: i
  };
};
export {
  Tn as COMMENT_OVERLAY_VERSION,
  Ci as Comment,
  T as CommentRenderer,
  bn as DEFAULT_RENDERER_SETTINGS,
  In as captureRendererCalibrationFrame,
  Mi as cloneDefaultSettings,
  Gt as configureDebugLogging,
  Ti as createDefaultAnimationFrameProvider,
  Ie as createDefaultTimeSource,
  Le as createLogger,
  b as debugLog,
  qt as dumpRendererState,
  A as isDebugLoggingEnabled,
  Kt as logEpochChange,
  Mn as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
