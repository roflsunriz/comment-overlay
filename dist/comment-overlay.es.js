const Ee = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, Le = {
  defont: '"MS PGothic","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic Pro","Yu Gothic UI","Yu Gothic","Meiryo","Segoe UI","Osaka","Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","IPAPGothic","TakaoPGothic","Roboto","Helvetica Neue","Helvetica","Arial","sans-serif"',
  gothic: '"Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","Yu Gothic","Yu Gothic Medium","Meiryo","MS PGothic","Hiragino Kaku Gothic ProN","Segoe UI","Helvetica","Arial","sans-serif"',
  mincho: '"MS PMincho","MS Mincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Times New Roman","serif"'
}, ve = {
  white: "#FFFFFC",
  red: "#FF8888",
  pink: "#FFA5CC",
  orange: "#FFBA66",
  yellow: "#FFFFAA",
  green: "#88FF88",
  cyan: "#88FFFF",
  blue: "#8899FF",
  purple: "#D9A5FF",
  black: "#444444",
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
}, se = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Fe = /^[,.:;]+/, Ae = /[,.:;]+$/, Re = (e) => {
  const t = e.trim();
  return t ? se.test(t) ? t : t.replace(Fe, "").replace(Ae, "") : "";
}, De = (e) => se.test(e) ? e.toUpperCase() : null, ge = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const s = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, i = Number.parseFloat(s);
  return Number.isFinite(i) ? i : null;
}, Ve = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const s = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(s) ? s / 100 : null;
  }
  return ge(t);
}, Oe = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, ke = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), He = (e) => e === "naka" || e === "ue" || e === "shita", Ne = (e) => e === "small" || e === "medium" || e === "big", _e = (e) => e === "defont" || e === "gothic" || e === "mincho", ze = (e) => e in ve, We = (e, t) => {
  let s = "naka", i = "medium", n = "defont", a = null, r = 1, l = null, c = !1, u = 0, d = 1;
  for (const p of e) {
    const v = Re(typeof p == "string" ? p : "");
    if (!v)
      continue;
    if (se.test(v)) {
      const S = De(v);
      if (S) {
        a = S;
        continue;
      }
    }
    const g = v.toLowerCase();
    if (He(g)) {
      s = g;
      continue;
    }
    if (Ne(g)) {
      i = g;
      continue;
    }
    if (_e(g)) {
      n = g;
      continue;
    }
    if (ze(g)) {
      a = ve[g].toUpperCase();
      continue;
    }
    if (g === "_live") {
      l = 0.5;
      continue;
    }
    if (g === "invisible") {
      r = 0, c = !0;
      continue;
    }
    if (g.startsWith("ls:") || g.startsWith("letterspacing:")) {
      const S = v.indexOf(":");
      if (S >= 0) {
        const C = ge(v.slice(S + 1));
        C !== null && (u = Oe(C));
      }
      continue;
    }
    if (g.startsWith("lh:") || g.startsWith("lineheight:")) {
      const S = v.indexOf(":");
      if (S >= 0) {
        const C = Ve(v.slice(S + 1));
        C !== null && (d = ke(C));
      }
      continue;
    }
  }
  const o = Math.max(0, Math.min(1, r)), f = (a ?? t.defaultColor).toUpperCase(), h = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: s,
    size: i,
    sizeScale: Ee[i],
    font: n,
    fontFamily: Le[n],
    resolvedColor: f,
    colorOverride: a,
    opacityMultiplier: o,
    opacityOverride: h,
    isInvisible: c,
    letterSpacing: u,
    lineHeight: d
  };
}, $e = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, U = (e) => e.length === 1 ? e.repeat(2) : e, R = (e) => Number.parseInt(e, 16), E = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, me = (e, t) => {
  const s = $e.exec(e);
  if (!s)
    return e;
  const i = s[1];
  let n, a, r, l = 1;
  i.length === 3 || i.length === 4 ? (n = R(U(i[0])), a = R(U(i[1])), r = R(U(i[2])), i.length === 4 && (l = R(U(i[3])) / 255)) : (n = R(i.slice(0, 2)), a = R(i.slice(2, 4)), r = R(i.slice(4, 6)), i.length === 8 && (l = R(i.slice(6, 8)) / 255));
  const c = E(l * E(t));
  return `rgba(${n}, ${a}, ${r}, ${c})`;
}, Be = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), Se = () => Be(), L = (e) => e * 1e3, Xe = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), ne = 4e3, le = 1800, Ge = 3, Ue = 0.25, Ye = 32, qe = 48, K = 120, Ke = 4e3, Q = 120, Je = 800, je = 2, z = 4e3, V = 4e3, O = V + ne, Ze = 1e3, ce = 1, ye = 12, Me = 24, w = 1e-3, D = 50, Qe = 0.05, et = 10, he = 8, tt = 12, it = 500, st = 3e3, ue = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, nt = (e, t, s) => {
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
}, be = (e, t = {}) => {
  const { level: s = "info", emitter: i = nt } = t, n = ue[s], a = (r, l) => {
    ue[r] < n || i(r, e, l);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, ae = be("CommentEngine:Comment"), de = /* @__PURE__ */ new WeakMap(), at = (e) => {
  let t = de.get(e);
  return t || (t = /* @__PURE__ */ new Map(), de.set(e, t)), t;
}, J = (e, t) => {
  if (!e)
    return 0;
  const i = `${e.font ?? ""}::${t}`, n = at(e), a = n.get(i);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(i, r), r;
}, rt = (e) => {
  if (e.includes(`
`)) {
    const t = e.split(/\r?\n/);
    return t.length > 0 ? t : [""];
  }
  return [e];
}, fe = (e) => Math.max(24, e), ee = (e, t) => {
  let s = 0;
  const i = e.letterSpacing;
  for (const r of e.lines) {
    const l = J(t, r), c = r.length > 1 ? i * (r.length - 1) : 0, u = Math.max(0, l + c);
    u > s && (s = u);
  }
  e.width = s;
  const n = Math.max(
    1,
    Math.floor(e.fontSize * e.lineHeightMultiplier)
  );
  e.lineHeightPx = n;
  const a = e.lines.length > 1 ? (e.lines.length - 1) * n : 0;
  e.height = e.fontSize + a;
}, ot = (e, t, s, i, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(s) || !Number.isFinite(i))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(s, 1), r = fe(Math.floor(i * 0.05)), l = fe(Math.floor(r * e.sizeScale));
    e.fontSize = l, t.font = `${e.fontSize}px ${e.fontFamily}`, e.lines = rt(e.text), ee(e, t);
    const c = !e.isScrolling && (e.layout === "ue" || e.layout === "shita");
    if (c) {
      const I = Math.max(1, a - he * 2);
      if (e.width > I) {
        const A = Math.max(
          tt,
          Math.min(e.fontSize, Math.floor(r * 0.6))
        ), Z = I / Math.max(e.width, 1), _ = Math.max(
          A,
          Math.floor(e.fontSize * Math.min(Z, 1))
        );
        _ < e.fontSize && (e.fontSize = _, t.font = `${e.fontSize}px ${e.fontFamily}`, ee(e, t));
        let re = 0;
        for (; e.width > I && e.fontSize > A && re < 5; ) {
          const Ie = I / Math.max(e.width, 1), oe = Math.max(
            A,
            Math.floor(e.fontSize * Math.max(Ie, 0.7))
          );
          oe >= e.fontSize ? e.fontSize = Math.max(A, e.fontSize - 1) : e.fontSize = oe, t.font = `${e.fontSize}px ${e.fontFamily}`, ee(e, t), re += 1;
        }
      }
    }
    if (!e.isScrolling) {
      e.bufferWidth = 0;
      const I = c ? he : 0, A = Math.max((a - e.width) / 2, I), Z = Math.max(I, a - e.width - I), _ = Math.min(A, Math.max(Z, I));
      e.virtualStartX = _, e.x = _, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = V, e.preCollisionDurationMs = V, e.totalDurationMs = V, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + V, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const u = J(t, "??".repeat(150)), d = e.width * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, d);
    const o = Math.max(n.entryBufferPx, e.bufferWidth), f = e.scrollDirection, h = f === "rtl" ? a + n.virtualExtension : -e.width - e.bufferWidth - n.virtualExtension, p = f === "rtl" ? -e.width - e.bufferWidth - o : a + o, v = f === "rtl" ? a + o : -o, g = f === "rtl" ? h + e.width + e.bufferWidth : h - e.bufferWidth;
    e.virtualStartX = h, e.x = h, e.exitThreshold = p;
    const S = a > 0 ? e.width / a : 0, C = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let y = n.maxVisibleDurationMs;
    if (!C && S > 1) {
      const I = Math.min(S, n.maxWidthRatio), A = n.maxVisibleDurationMs / Math.max(I, 1);
      y = Math.max(n.minVisibleDurationMs, Math.floor(A));
    }
    const x = a + e.width + e.bufferWidth + o, M = Math.max(y, 1), P = x / M, H = P * 1e3 / 60;
    e.baseSpeed = H, e.speed = e.baseSpeed, e.speedPixelsPerMs = P;
    const N = Math.abs(p - h), j = f === "rtl" ? Math.max(0, g - v) : Math.max(0, v - g), G = Math.max(P, Number.EPSILON);
    e.visibleDurationMs = y, e.preCollisionDurationMs = Math.max(0, Math.ceil(j / G)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(N / G)
    );
    const Pe = e.width + e.bufferWidth + o;
    e.reservationWidth = Math.min(u, Pe), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw ae.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: s,
      canvasHeight: i,
      hasContext: !!t
    }), a;
  }
}, te = 5, F = {
  enabled: !1,
  maxLogsPerCategory: te
}, W = /* @__PURE__ */ new Map(), lt = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return te;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, ct = (e) => {
  F.enabled = !!e.enabled, F.maxLogsPerCategory = lt(e.maxLogsPerCategory), F.enabled || W.clear();
}, Ms = () => {
  W.clear();
}, k = () => F.enabled, ht = (e) => {
  const t = W.get(e) ?? 0;
  return t >= F.maxLogsPerCategory ? (t === F.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), W.set(e, t + 1)), !1) : (W.set(e, t + 1), !0);
}, b = (e, ...t) => {
  F.enabled && ht(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, $ = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, ut = (e, t) => {
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
}, dt = (e, t, s) => {
  F.enabled && b("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${s})`);
}, m = {
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
  if (!k())
    return;
  const e = performance.now();
  if (e - m.lastReported <= 5e3)
    return;
  const t = m.hits + m.misses, s = t > 0 ? m.hits / t * 100 : 0, i = m.creates > 0 ? (m.totalCharactersDrawn / m.creates).toFixed(1) : "0", n = m.outlineCallsInCache + m.outlineCallsInFallback, a = m.fillCallsInCache + m.fillCallsInFallback;
  console.log(
    "[TextureCache Stats]",
    `
  Cache: Hits=${m.hits}, Misses=${m.misses}, Hit Rate=${s.toFixed(1)}%`,
    `
  Creates: ${m.creates}, Fallbacks: ${m.fallbacks}`,
    `
  Comments: Normal=${m.normalComments}, LetterSpacing=${m.letterSpacingComments}, MultiLine=${m.multiLineComments}`,
    `
  Draw Calls: Outline=${n}, Fill=${a}`,
    `
  Avg Characters/Comment: ${i}`
  ), m.lastReported = e;
}, ft = () => typeof OffscreenCanvas < "u", Ce = (e) => {
  const t = Math.max(1, Math.round(e * 0.08)), s = [
    [-t, 0],
    [t, 0],
    [0, -t],
    [0, t]
  ];
  if (t > 1) {
    const i = Math.max(1, Math.round(t * 0.7));
    s.push(
      [-i, -i],
      [-i, i],
      [i, -i],
      [i, i]
    );
  }
  return s;
}, Te = (e, t, s, i, n) => (a, r, l, c = 0) => {
  if (a.length === 0)
    return;
  const u = a.match(/^[\u3000\u00A0]+/), d = u ? u[0].length : 0, o = d > 0 ? J(s, u[0]) : 0, f = n + o + c, h = d > 0 ? a.substring(d) : a, p = () => {
    i === "cache" ? l === "outline" ? m.outlineCallsInCache++ : m.fillCallsInCache++ : l === "outline" ? m.outlineCallsInFallback++ : m.fillCallsInFallback++;
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    p(), t.fillText(h, f, r);
    return;
  }
  let v = f;
  for (let g = 0; g < h.length; g += 1) {
    const S = h[g];
    p(), t.fillText(S, v, r);
    const C = J(s, S);
    v += C, g < h.length - 1 && (v += e.letterSpacing);
  }
}, pt = (e) => `v2::${e.text}::${e.fontSize}::${e.fontFamily}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lines.length}`, vt = (e, t) => {
  if (!ft())
    return null;
  const s = Math.abs(e.letterSpacing) >= Number.EPSILON, i = e.lines.length > 1;
  s && m.letterSpacingComments++, i && m.multiLineComments++, !s && !i && m.normalComments++, m.totalCharactersDrawn += e.text.length;
  const n = Math.max(10, e.fontSize * 0.5), a = Math.ceil(e.width + n * 2), r = Math.ceil(e.height + n * 2), l = new OffscreenCanvas(a, r), c = l.getContext("2d");
  if (!c)
    return null;
  c.save(), c.font = `${e.fontSize}px ${e.fontFamily}`;
  const u = E(e.opacity), d = n, o = e.lines.length > 0 ? e.lines : [e.text], f = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, h = n + e.fontSize, p = Te(e, c, t, "cache", d), v = Ce(e.fontSize), g = () => {
    const y = E(u * 0.6);
    c.save(), c.fillStyle = `rgba(0, 0, 0, ${y})`;
    for (const [x, M] of v)
      o.forEach((P, H) => {
        const N = h + H * f + M;
        p(P, N, "outline", x);
      });
    c.restore();
  }, S = (y) => {
    c.save(), c.fillStyle = y, o.forEach((x, M) => {
      const P = h + M * f;
      p(x, P, "fill");
    }), c.restore();
  };
  if (g(), e.renderStyle === "classic") {
    const y = Math.max(1, e.fontSize * 0.04), x = e.fontSize * 0.18;
    [
      {
        offsetXMultiplier: 0.9,
        offsetYMultiplier: 1.1,
        blurMultiplier: 0.55,
        alpha: 0.52,
        rgb: "20, 28, 40"
      },
      {
        offsetXMultiplier: 2.4,
        offsetYMultiplier: 2.7,
        blurMultiplier: 1.45,
        alpha: 0.32,
        rgb: "0, 0, 0"
      },
      {
        offsetXMultiplier: -0.7,
        offsetYMultiplier: -0.6,
        blurMultiplier: 0.4,
        alpha: 0.42,
        rgb: "255, 255, 255"
      }
    ].forEach((P) => {
      const H = E(P.alpha * u);
      c.save(), c.shadowColor = `rgba(${P.rgb}, ${H})`, c.shadowBlur = x * P.blurMultiplier, c.shadowOffsetX = y * P.offsetXMultiplier, c.shadowOffsetY = y * P.offsetYMultiplier, c.fillStyle = "rgba(0, 0, 0, 0)", o.forEach((N, j) => {
        const G = h + j * f;
        p(N, G, "fill");
      }), c.restore();
    });
  }
  const C = me(e.color, u);
  return S(C), c.restore(), l;
}, gt = (e, t, s) => {
  m.fallbacks++, t.save(), t.font = `${e.fontSize}px ${e.fontFamily}`;
  const i = E(e.opacity), n = s ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, l = e.y + e.fontSize, c = Te(e, t, t, "fallback", n), u = Ce(e.fontSize), d = () => {
    const h = E(i * 0.6);
    t.save(), t.fillStyle = `rgba(0, 0, 0, ${h})`;
    for (const [p, v] of u)
      a.forEach((g, S) => {
        const C = l + S * r + v;
        c(g, C, "outline", p);
      });
    t.restore();
  }, o = (h) => {
    t.save(), t.fillStyle = h, a.forEach((p, v) => {
      const g = l + v * r;
      c(p, g, "fill");
    }), t.restore();
  };
  if (d(), e.renderStyle === "classic") {
    const h = Math.max(1, e.fontSize * 0.04), p = e.fontSize * 0.18;
    [
      {
        offsetXMultiplier: 0.9,
        offsetYMultiplier: 1.1,
        blurMultiplier: 0.55,
        alpha: 0.52,
        rgb: "20, 28, 40"
      },
      {
        offsetXMultiplier: 2.4,
        offsetYMultiplier: 2.7,
        blurMultiplier: 1.45,
        alpha: 0.32,
        rgb: "0, 0, 0"
      },
      {
        offsetXMultiplier: -0.7,
        offsetYMultiplier: -0.6,
        blurMultiplier: 0.4,
        alpha: 0.42,
        rgb: "255, 255, 255"
      }
    ].forEach((g) => {
      const S = E(g.alpha * i);
      t.save(), t.shadowColor = `rgba(${g.rgb}, ${S})`, t.shadowBlur = p * g.blurMultiplier, t.shadowOffsetX = h * g.offsetXMultiplier, t.shadowOffsetY = h * g.offsetYMultiplier, t.fillStyle = "rgba(0, 0, 0, 0)", a.forEach((C, y) => {
        const x = l + y * r;
        c(C, x, "fill");
      }), t.restore();
    });
  }
  const f = me(e.color, i);
  o(f), t.restore();
}, mt = (e, t, s) => {
  try {
    if (!e.isActive || !t)
      return;
    const i = pt(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== i || !n) {
      m.misses++, m.creates++;
      const r = vt(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(i);
    } else
      m.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = s ?? e.x, l = Math.max(10, e.fontSize * 0.5);
      t.drawImage(a, r - l, e.y - l), pe();
      return;
    }
    gt(e, t, s), pe();
  } catch (i) {
    ae.error("Comment.draw", i, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: s
    });
  }
}, St = (e) => e === "ltr" ? "ltr" : "rtl", yt = (e) => e === "ltr" ? 1 : -1;
class Mt {
  text;
  vposMs;
  commands;
  layout;
  isScrolling;
  sizeScale;
  opacityMultiplier;
  opacityOverride;
  colorOverride;
  isInvisible;
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
    const r = We(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.fontFamily = r.fontFamily, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = a.timeSource ?? Se(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, s, i, n) {
    ot(this, t, s, i, n);
  }
  draw(t, s = null) {
    mt(this, t, s);
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
    typeof s == "number" && s === this.lastSyncedSettingsVersion || (this.color = this.getEffectiveColor(t.commentColor), this.opacity = this.getEffectiveOpacity(t.commentOpacity), this.applyScrollDirection(t.scrollDirection), this.renderStyle = t.renderStyle, typeof s == "number" && (this.lastSyncedSettingsVersion = s));
  }
  getEffectiveColor(t) {
    const s = this.colorOverride ?? t;
    return typeof s != "string" || s.length === 0 ? t : s.toUpperCase();
  }
  getEffectiveOpacity(t) {
    if (typeof this.opacityOverride == "number")
      return E(this.opacityOverride);
    const s = t * this.opacityMultiplier;
    return Number.isFinite(s) ? E(s) : 0;
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
    const s = St(t);
    this.scrollDirection = s, this.directionSign = yt(s);
  }
}
const bt = 4e3, q = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: bt,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  enableAutoHardReset: !0
}, bs = q, Ct = () => ({
  ...q,
  ngWords: [...q.ngWords],
  ngRegexps: [...q.ngRegexps]
}), Cs = "v2.5.3", Tt = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, xe = (e) => Math.max(
  et,
  Math.floor(e * Qe)
), Y = (e) => {
  const t = e.scrollVisibleDurationMs, s = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: Tt(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: s,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling,
    enableAutoHardReset: e.enableAutoHardReset !== !1
  };
}, xt = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(t)
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, wt = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Pt = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, It = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const s of e) {
    const { text: i, vposMs: n, commands: a = [] } = s, r = $(i);
    if (this.isNGComment(i)) {
      b("comment-skip-ng", { preview: r, vposMs: n });
      continue;
    }
    const l = Xe(n);
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
    const u = new Mt(
      i,
      l,
      a,
      this._settings,
      this.commentDependencies
    );
    u.creationIndex = this.commentSequence++, u.epochId = this.epochId, t.push(u), b("comment-added", {
      preview: r,
      vposMs: l,
      commands: u.commands.length,
      layout: u.layout,
      isScrolling: u.isScrolling,
      invisible: u.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((s, i) => {
    const n = s.vposMs - i.vposMs;
    return Math.abs(n) > w ? n : s.creationIndex - i.creationIndex;
  }), t);
}, Et = function(e, t, s = []) {
  const [i] = this.addComments([{ text: e, vposMs: t, commands: s }]);
  return i ?? null;
}, Lt = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, s = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, s);
  }
}, Ft = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, we = function() {
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
}, At = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, Rt = (e) => {
  e.prototype.addComments = It, e.prototype.addComment = Et, e.prototype.clearComments = Lt, e.prototype.resetState = Ft, e.prototype.rebuildNgMatchers = we, e.prototype.isNGComment = At;
}, Dt = function() {
  const e = this.canvas, t = this.ctx, s = this.timeSource.now();
  if (this.lastHardResetAt = s, this.incrementEpoch("manual-reset"), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((i) => {
    i.isActive = !1, i.hasShown = !1, i.lane = -1, i.clearActivation(), i.epochId = this.epochId;
  }), e && t) {
    const i = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : e.width / i, a = this.displayHeight > 0 ? this.displayHeight : e.height / i;
    t.clearRect(0, 0, n, a);
  }
  this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.emitStateSnapshot("hardReset");
}, Vt = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, Ot = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, dt(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, kt = function(e) {
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
  if (ut(e, s), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(s);
    } catch (i) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", i);
    }
  this.lastSnapshotEmitTime = t;
}, Ht = function(e) {
  return this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.finalPhaseVposOverrides.get(e) ?? e.vposMs;
}, Nt = function(e) {
  if (!e.isScrolling)
    return V;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : ne;
}, _t = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), e.vposMs;
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const s = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, s), s;
}, zt = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + z, s = Math.max(e + z, t), i = this.comments.filter((u) => u.hasShown || u.isInvisible || this.isNGComment(u.text) ? !1 : u.vposMs >= e - O).sort((u, d) => {
    const o = u.vposMs - d.vposMs;
    return Math.abs(o) > w ? o : u.creationIndex - d.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), i.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(s - e, z) / Math.max(i.length, 1), r = Number.isFinite(a) ? a : Q, l = Math.max(Q, Math.min(r, Je));
  let c = e;
  i.forEach((u, d) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(u)), f = s - o;
    let h = Math.max(e, Math.min(c, f));
    Number.isFinite(h) || (h = e);
    const p = je * d;
    h + p <= f && (h += p), this.finalPhaseVposOverrides.set(u, h);
    const v = Math.max(Q, Math.min(o / 2, l));
    c = h + v;
  }), this.finalPhaseScheduleDirty = !1;
}, Wt = (e) => {
  e.prototype.hardReset = Dt, e.prototype.resetFinalPhaseState = Vt, e.prototype.incrementEpoch = Ot, e.prototype.emitStateSnapshot = kt, e.prototype.getEffectiveCommentVpos = Ht, e.prototype.getFinalPhaseDisplayDuration = Nt, e.prototype.resolveFinalPhaseVpos = _t, e.prototype.recomputeFinalPhaseTimeline = zt;
}, $t = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= D;
}, Bt = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > D) && (this.playbackHasBegun = !0);
}, Xt = (e) => {
  e.prototype.shouldSuppressRendering = $t, e.prototype.updatePlaybackProgressState = Bt;
}, Gt = function(e) {
  const t = this.videoElement, s = this.canvas, i = this.ctx;
  if (!t || !s || !i)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : s.width / a, l = this.displayHeight > 0 ? this.displayHeight : s.height / a, c = this.buildPrepareOptions(r), u = this.duration > 0 && this.duration - this.currentTime <= Ke;
  u && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, i.clearRect(0, 0, r, l), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !u && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  const d = this.getCommentsInTimeWindow(this.currentTime, O);
  for (const o of d) {
    const f = k(), h = f ? $(o.text) : "";
    if (f && b("comment-evaluate", {
      stage: "update",
      preview: h,
      vposMs: o.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(o),
      currentTime: this.currentTime,
      isActive: o.isActive,
      hasShown: o.hasShown
    }), this.isNGComment(o.text)) {
      f && b("comment-eval-skip", {
        preview: h,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "ng-runtime"
      });
      continue;
    }
    if (o.isInvisible) {
      f && b("comment-eval-skip", {
        preview: h,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "invisible"
      }), o.isActive = !1, this.activeComments.delete(o), o.hasShown = !0, o.clearActivation();
      continue;
    }
    if (o.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(o, this.currentTime, h) && this.activateComment(
      o,
      i,
      r,
      l,
      c,
      this.currentTime
    ), o.isActive) {
      if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
        continue;
      }
      if (o.layout === "naka" && this.getEffectiveCommentVpos(o) > this.currentTime + D) {
        o.x = o.virtualStartX, o.lastUpdateTime = this.timeSource.now();
        continue;
      }
      if (o.hasShown = !0, o.update(this.playbackRate, !this.isPlaying), !o.isScrolling && o.hasStaticExpired(this.currentTime)) {
        const p = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(p, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
      }
    }
  }
  if (this.isPlaying)
    for (const o of this.comments)
      o.isActive && o.isScrolling && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
}, Ut = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let s = ne, i = le;
  return t !== null && (s = t, i = Math.max(1, Math.min(t, le))), {
    visibleWidth: e,
    virtualExtension: Ze,
    maxVisibleDurationMs: s,
    minVisibleDurationMs: i,
    maxWidthRatio: Ge,
    bufferRatio: Ue,
    baseBufferPx: Ye,
    entryBufferPx: qe
  };
}, Yt = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const s = this.getLanePriorityOrder(t), i = this.createLaneReservation(e, t);
  for (const a of s)
    if (this.isLaneAvailable(a, i, t))
      return this.storeLaneReservation(a, i), a;
  const n = s[0] ?? 0;
  return this.storeLaneReservation(n, i), n;
}, qt = (e) => {
  e.prototype.updateComments = Gt, e.prototype.buildPrepareOptions = Ut, e.prototype.findAvailableLane = Yt;
}, Kt = function(e, t) {
  let s = 0, i = e.length;
  for (; s < i; ) {
    const n = Math.floor((s + i) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + K <= t ? s = n + 1 : i = n;
  }
  return s;
}, Jt = function(e) {
  for (const [t, s] of this.reservedLanes.entries()) {
    const i = this.findFirstValidReservationIndex(s, e);
    i >= s.length ? this.reservedLanes.delete(t) : i > 0 && this.reservedLanes.set(t, s.slice(i));
  }
}, jt = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), s = t(this.topStaticLaneReservations), i = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...s), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...i);
}, Zt = (e) => {
  e.prototype.findFirstValidReservationIndex = Kt, e.prototype.pruneLaneReservations = Jt, e.prototype.pruneStaticLaneReservations = jt;
}, Qt = function(e) {
  let t = 0, s = this.comments.length;
  for (; t < s; ) {
    const i = Math.floor((t + s) / 2), n = this.comments[i];
    n !== void 0 && n.vposMs < e ? t = i + 1 : s = i;
  }
  return t;
}, ei = function(e, t) {
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
}, ti = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, ii = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, si = function(e) {
  const t = e === "ue" ? "shita" : "ue", s = this.getStaticLaneDepth(t), i = this.laneCount - s;
  return i <= 0 ? -1 : i - 1;
}, ni = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, ai = function(e, t, s, i) {
  const n = Math.max(1, s), a = Math.max(i.height, i.fontSize), r = Math.max(1, Math.floor(i.fontSize * 0.05));
  if (e === "ue") {
    const u = t * this.laneHeight, d = r, o = Math.max(r, n - a - r);
    return Math.max(d, Math.min(u, o));
  }
  const c = n - t * this.laneHeight - a - r;
  return Math.max(r, c);
}, ri = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, oi = (e) => {
  e.prototype.findCommentIndexAtOrAfter = Qt, e.prototype.getCommentsInTimeWindow = ei, e.prototype.getStaticReservations = ti, e.prototype.getStaticLaneDepth = ii, e.prototype.getStaticLaneLimit = si, e.prototype.getGlobalLaneIndexForBottom = ni, e.prototype.resolveStaticCommentOffset = ai, e.prototype.getStaticReservedLaneSet = ri;
}, li = function(e, t, s = "") {
  const i = s.length > 0 && k(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - w ? (i && b("comment-eval-skip", {
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
  }), !1) : n > t + D ? (i && b("comment-eval-pending", {
    preview: s,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "future",
    currentTime: t
  }), !1) : n < t - O ? (i && b("comment-eval-skip", {
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
}, ci = function(e, t, s, i, n, a) {
  e.prepare(t, s, i, n);
  const r = this.resolveFinalPhaseVpos(e);
  if (k() && b("comment-prepared", {
    preview: $(e.text),
    layout: e.layout,
    isScrolling: e.isScrolling,
    width: e.width,
    height: e.height,
    bufferWidth: e.bufferWidth,
    visibleDurationMs: e.visibleDurationMs,
    effectiveVposMs: r
  }), e.layout === "naka") {
    const l = Math.max(0, a - r), c = e.speedPixelsPerMs * l;
    if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
      const h = this.duration > 0 ? this.duration : this.finalPhaseStartTime + z, p = Math.max(
        this.finalPhaseStartTime + z,
        h
      ), v = e.width + s, g = v > 0 ? v / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + g > p) {
        const C = p - a, y = Math.max(0, C) * e.speedPixelsPerMs, x = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - c, s - y) : Math.min(e.virtualStartX + c, y - e.width);
        e.x = x;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - c : e.virtualStartX + c;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - c : e.virtualStartX + c;
    const u = this.findAvailableLane(e);
    e.lane = u;
    const d = Math.max(1, this.laneHeight), o = Math.max(0, i - e.height), f = u * d;
    e.y = Math.max(0, Math.min(f, o));
  } else {
    const l = e.layout === "ue" ? "ue" : "shita", c = this.assignStaticLane(l, e, i, a), u = this.resolveStaticCommentOffset(
      l,
      c,
      i,
      e
    );
    e.x = Math.max(0, Math.min(s - e.width, e.virtualStartX)), e.y = u, e.lane = l === "ue" ? c : this.getGlobalLaneIndexForBottom(c), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = V;
    const d = a + e.visibleDurationMs;
    this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = d, this.reserveStaticLane(l, e, c, d), k() && b("comment-activate-static", {
      preview: $(e.text),
      lane: e.lane,
      position: l,
      displayEnd: d,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, hi = function(e, t, s, i) {
  const n = this.getStaticReservations(e), a = this.getStaticLaneLimit(e), r = a >= 0 ? a + 1 : 0, l = Array.from({ length: r }, (d, o) => o);
  for (const d of l) {
    const o = this.resolveStaticCommentOffset(e, d, s, t), f = Math.max(t.height, t.fontSize), h = xe(t.fontSize), p = o - h, v = o + f + h;
    if (!n.some((S) => S.releaseTime > i ? !(v <= S.yStart || p >= S.yEnd) : !1))
      return d;
  }
  let c = l[0] ?? 0, u = Number.POSITIVE_INFINITY;
  for (const d of n)
    d.releaseTime < u && (u = d.releaseTime, c = d.lane);
  return c;
}, ui = function(e, t, s, i) {
  const n = this.getStaticReservations(e), a = Math.max(t.height, t.fontSize), r = xe(t.fontSize), l = t.y - r, c = t.y + a + r;
  n.push({
    comment: t,
    releaseTime: i,
    yStart: l,
    yEnd: c,
    lane: s
  });
}, di = function(e, t) {
  if (t < 0)
    return;
  const s = this.getStaticReservations(e), i = s.findIndex((n) => n.lane === t);
  i >= 0 && s.splice(i, 1);
}, fi = (e) => {
  e.prototype.shouldActivateCommentAtTime = li, e.prototype.activateComment = ci, e.prototype.assignStaticLane = hi, e.prototype.reserveStaticLane = ui, e.prototype.releaseStaticLane = di;
}, pi = function(e) {
  const s = Array.from({ length: this.laneCount }, (r, l) => l).sort((r, l) => {
    const c = this.getLaneNextAvailableTime(r, e), u = this.getLaneNextAvailableTime(l, e);
    return Math.abs(c - u) <= w ? r - l : c - u;
  }), i = this.getStaticReservedLaneSet();
  if (i.size === 0)
    return s;
  const n = s.filter((r) => !i.has(r));
  if (n.length === 0)
    return s;
  const a = s.filter((r) => i.has(r));
  return [...n, ...a];
}, vi = function(e, t) {
  const s = this.reservedLanes.get(e);
  if (!s || s.length === 0)
    return t;
  const i = this.findFirstValidReservationIndex(s, t), n = s[i];
  return n ? Math.max(t, n.endTime + K) : t;
}, gi = function(e, t) {
  const s = Math.max(e.speedPixelsPerMs, w), i = this.getEffectiveCommentVpos(e), n = Number.isFinite(i) ? i : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + K, l = a + e.totalDurationMs + K;
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
}, mi = function(e, t, s) {
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
}, Si = function(e, t) {
  const i = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, i);
}, yi = function(e, t) {
  const s = Math.max(e.startTime, t.startTime), i = Math.min(e.endTime, t.endTime);
  if (s >= i)
    return !1;
  const n = /* @__PURE__ */ new Set([
    s,
    i,
    s + (i - s) / 2
  ]), a = this.solveLeftRightEqualityTime(e, t);
  a !== null && a >= s - w && a <= i + w && n.add(a);
  const r = this.solveLeftRightEqualityTime(t, e);
  r !== null && r >= s - w && r <= i + w && n.add(r);
  for (const l of n) {
    if (l < s - w || l > i + w)
      continue;
    const c = this.computeForwardGap(e, t, l), u = this.computeForwardGap(t, e, l);
    if (c <= w && u <= w)
      return !0;
  }
  return !1;
}, Mi = function(e, t, s) {
  const i = this.getBufferedEdges(e, s), n = this.getBufferedEdges(t, s);
  return i.left - n.right;
}, bi = function(e, t) {
  const s = Math.max(0, t - e.startTime), i = e.speed * s, n = e.startLeft + e.directionSign * i, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, Ci = function(e, t) {
  const s = e.directionSign, i = t.directionSign, n = i * t.speed - s * e.speed;
  if (Math.abs(n) < w)
    return null;
  const r = (t.startLeft + i * t.speed * t.startTime + t.width + t.buffer - e.startLeft - s * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, Ti = (e) => {
  e.prototype.getLanePriorityOrder = pi, e.prototype.getLaneNextAvailableTime = vi, e.prototype.createLaneReservation = gi, e.prototype.isLaneAvailable = mi, e.prototype.storeLaneReservation = Si, e.prototype.areReservationsConflicting = yi, e.prototype.computeForwardGap = Mi, e.prototype.getBufferedEdges = bi, e.prototype.solveLeftRightEqualityTime = Ci;
}, xi = function() {
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
    r.sort((c, u) => {
      const d = this.getEffectiveCommentVpos(c), o = this.getEffectiveCommentVpos(u), f = d - o;
      return Math.abs(f) > w ? f : c.isScrolling !== u.isScrolling ? c.isScrolling ? 1 : -1 : c.creationIndex - u.creationIndex;
    }), r.forEach((c) => {
      const d = this.isPlaying && !c.isPaused ? c.x + c.getDirectionSign() * c.speed * l : c.x;
      c.draw(t, d);
    });
  }
  this.lastDrawTime = a;
}, wi = function(e) {
  const t = this.videoElement, s = this.canvas, i = this.ctx;
  if (!t || !s || !i)
    return;
  const n = typeof e == "number" ? e : L(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : s.width / a, l = this.displayHeight > 0 ? this.displayHeight : s.height / a, c = this.buildPrepareOptions(r);
  this.getCommentsInTimeWindow(this.currentTime, O).forEach((d) => {
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
        c,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(d) < this.currentTime - O ? d.hasShown = !0 : d.hasShown = !1;
  });
}, Pi = (e) => {
  e.prototype.draw = xi, e.prototype.performInitialSync = wi;
}, Ii = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, Ei = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, Li = function(e, t) {
  this.videoFrameHandle = null;
  const s = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof s == "number" ? s : void 0), this.scheduleNextFrame();
}, Fi = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, Ai = function() {
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
}, Ri = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, Di = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, Vi = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, Oi = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, ki = function() {
  const e = this.canvas, t = this.ctx, s = this.videoElement;
  if (!e || !t || !s)
    return;
  const i = L(s.currentTime), n = Math.abs(i - this.currentTime), a = this.timeSource.now();
  if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
    this.currentTime = i, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
    return;
  }
  const l = n > D;
  if (this.currentTime = i, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !l) {
    this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
    return;
  }
  this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  const c = this.canvasDpr > 0 ? this.canvasDpr : 1, u = this.displayWidth > 0 ? this.displayWidth : e.width / c, d = this.displayHeight > 0 ? this.displayHeight : e.height / c, o = this.buildPrepareOptions(u);
  this.getCommentsInTimeWindow(this.currentTime, O).forEach((h) => {
    const p = k(), v = p ? $(h.text) : "";
    if (p && b("comment-evaluate", {
      stage: "seek",
      preview: v,
      vposMs: h.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(h),
      currentTime: this.currentTime,
      isActive: h.isActive,
      hasShown: h.hasShown
    }), this.isNGComment(h.text)) {
      p && b("comment-eval-skip", {
        preview: v,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        reason: "ng-runtime"
      }), h.isActive = !1, this.activeComments.delete(h), h.clearActivation();
      return;
    }
    if (h.isInvisible) {
      p && b("comment-eval-skip", {
        preview: v,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        reason: "invisible"
      }), h.isActive = !1, this.activeComments.delete(h), h.hasShown = !0, h.clearActivation();
      return;
    }
    if (h.syncWithSettings(this._settings, this.settingsVersion), h.isActive = !1, this.activeComments.delete(h), h.lane = -1, h.clearActivation(), this.shouldActivateCommentAtTime(h, this.currentTime, v)) {
      this.activateComment(
        h,
        t,
        u,
        d,
        o,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(h) < this.currentTime - O ? h.hasShown = !0 : h.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Hi = (e) => {
  e.prototype.processFrame = Ii, e.prototype.handleAnimationFrame = Ei, e.prototype.handleVideoFrame = Li, e.prototype.shouldUseVideoFrameCallback = Fi, e.prototype.scheduleNextFrame = Ai, e.prototype.cancelAnimationFrameRequest = Ri, e.prototype.cancelVideoFrameCallback = Di, e.prototype.startAnimation = Vi, e.prototype.stopAnimation = Oi, e.prototype.onSeek = ki;
}, ie = (e) => e._settings.enableAutoHardReset, B = (e, t) => {
  !ie(e) || e.timeSource.now() - e.lastHardResetAt < e.autoHardResetDedupWindowMs || e.hardReset();
}, Ni = (e) => {
  ie(e) && (e.initialPlaybackAutoResetTriggered || e.initialPlaybackAutoResetTimer === null && (e.initialPlaybackAutoResetTimer = globalThis.setTimeout(() => {
    e.initialPlaybackAutoResetTimer = null, ie(e) && (e.initialPlaybackAutoResetTriggered = !0, B(e));
  }, e.initialPlaybackAutoResetDelayMs)));
}, X = (e) => {
  e.initialPlaybackAutoResetTimer !== null && (globalThis.clearTimeout(e.initialPlaybackAutoResetTimer), e.initialPlaybackAutoResetTimer = null), e.initialPlaybackAutoResetTriggered = !1;
}, _i = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, zi = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, Wi = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, s = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, i = this.resolveContainer(s ?? null, t);
    this.videoElement = t, this.containerElement = i, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? L(t.duration) : 0, this.currentTime = L(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > D, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, i), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, $i = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), X(this), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Bi = function() {
  this.stopAnimation(), X(this), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, Xi = (e) => {
  e.prototype.resolveContainer = _i, e.prototype.ensureContainerPositioning = zi, e.prototype.initialize = Wi, e.prototype.destroy = $i, e.prototype.destroyCanvasOnly = Bi;
}, Gi = function(e) {
  try {
    const t = () => {
      const f = this.isPlaying;
      this.isPlaying = !0, this.playbackHasBegun = !0;
      const h = this.timeSource.now();
      this.lastDrawTime = h, this.lastPlayResumeTime = h, this.comments.forEach((p) => {
        p.lastUpdateTime = h, p.isPaused = !1;
      }), f || B(this, "play-resume"), Ni(this);
    }, s = () => {
      this.isPlaying = !1;
      const f = this.timeSource.now();
      this.comments.forEach((h) => {
        h.lastUpdateTime = f, h.isPaused = !0;
      });
    }, i = () => {
      this.onSeek();
    }, n = () => {
      this.onSeek(), B(this, "seeked");
    }, a = () => {
      this.playbackRate = e.playbackRate;
      const f = this.timeSource.now();
      this.comments.forEach((h) => {
        h.lastUpdateTime = f;
      });
    }, r = () => {
      this.handleVideoMetadataLoaded(e);
    }, l = () => {
      this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0;
    }, c = () => {
      this.handleVideoSourceChange();
    }, u = () => {
      this.handleVideoStalled();
    }, d = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", s), e.addEventListener("seeking", i), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", l), e.addEventListener("emptied", c), e.addEventListener("waiting", u), e.addEventListener("canplay", d), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", s)), this.addCleanup(() => e.removeEventListener("seeking", i)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", c)), this.addCleanup(() => e.removeEventListener("waiting", u)), this.addCleanup(() => e.removeEventListener("canplay", d)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, Ui = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.hardReset(), this.onSeek(), this.emitStateSnapshot("metadata-loaded"), X(this);
}, Yi = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const s = this.canvasDpr > 0 ? this.canvasDpr : 1, i = this.displayWidth > 0 ? this.displayWidth : e.width / s, n = this.displayHeight > 0 ? this.displayHeight : e.height / s;
  t.clearRect(0, 0, i, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, qi = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = L(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, Ki = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity(), X(this);
    return;
  }
  const s = this.getCurrentVideoSource();
  s !== this.lastVideoSource && (this.lastVideoSource = s, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"), X(this));
}, Ji = function(e) {
  this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0, this.currentTime = L(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > D, this.lastDrawTime = this.timeSource.now();
}, ji = function() {
  const e = this.timeSource.now(), t = this.canvas, s = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > D, t && s) {
    const i = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / i, a = this.displayHeight > 0 ? this.displayHeight : t.height / i;
    s.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((i) => {
    i.isActive = !1, i.isPaused = !this.isPlaying, i.hasShown = !1, i.lane = -1, i.x = i.virtualStartX, i.speed = i.baseSpeed, i.lastUpdateTime = e, i.clearActivation();
  }), this.activeComments.clear();
}, Zi = function(e, t) {
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
        let l = null, c = null;
        if ((r instanceof HTMLVideoElement || r instanceof HTMLSourceElement) && (l = typeof a.oldValue == "string" ? a.oldValue : null, c = r.getAttribute("src")), l === c)
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
}, Qi = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, es = (e) => {
  e.prototype.setupVideoEventListeners = Gi, e.prototype.handleVideoMetadataLoaded = Ui, e.prototype.handleVideoStalled = Yi, e.prototype.handleVideoCanPlay = qi, e.prototype.handleVideoSourceChange = Ki, e.prototype.syncVideoState = Ji, e.prototype.resetCommentActivity = ji, e.prototype.setupVideoChangeDetection = Zi, e.prototype.extractVideoElement = Qi;
}, ts = function() {
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
}, is = function() {
  const e = this.canvas, t = this.ctx, s = this.videoElement;
  !e || !t || !s || (this.currentTime = L(s.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !s.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), B(this), this.draw());
}, ss = (e) => {
  e.prototype.setupVisibilityHandling = ts, e.prototype.handleVisibilityRestore = is;
}, ns = function(e, t) {
  const s = this.videoElement, i = this.canvas, n = this.ctx;
  if (!s || !i)
    return;
  const a = s.getBoundingClientRect(), r = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : i.width / r, c = this.displayHeight > 0 ? this.displayHeight : i.height / r, u = e ?? a.width ?? l, d = t ?? a.height ?? c;
  if (!Number.isFinite(u) || !Number.isFinite(d) || u <= 0 || d <= 0)
    return;
  const o = Math.max(1, Math.floor(u)), f = Math.max(1, Math.floor(d)), h = this.displayWidth > 0 ? this.displayWidth : o, p = this.displayHeight > 0 ? this.displayHeight : f, v = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, g = Math.max(1, Math.round(o * v)), S = Math.max(1, Math.round(f * v));
  if (!(this.displayWidth !== o || this.displayHeight !== f || Math.abs(this.canvasDpr - v) > Number.EPSILON || i.width !== g || i.height !== S))
    return;
  this.displayWidth = o, this.displayHeight = f, this.canvasDpr = v, i.width = g, i.height = S, i.style.width = `${o}px`, i.style.height = `${f}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(v, v));
  const y = h > 0 ? o / h : 1, x = p > 0 ? f / p : 1;
  (y !== 1 || x !== 1) && this.comments.forEach((M) => {
    M.isActive && (M.x *= y, M.y *= x, M.width *= y, M.fontSize = Math.max(
      Me,
      Math.floor(Math.max(1, M.fontSize) * x)
    ), M.height = M.fontSize, M.virtualStartX *= y, M.exitThreshold *= y, M.baseSpeed *= y, M.speed *= y, M.speedPixelsPerMs *= y, M.bufferWidth *= y, M.reservationWidth *= y);
  }), this.calculateLaneMetrics(), B(this);
}, as = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, rs = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), s = Math.max(Me, Math.floor(t * 0.05));
  this.laneHeight = s * 1.2;
  const i = Math.floor(t / Math.max(this.laneHeight, 1));
  if (this._settings.useFixedLaneCount) {
    const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : ye, a = Math.max(ce, Math.min(i, n));
    this.laneCount = a;
  } else
    this.laneCount = Math.max(ce, i);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, os = function(e) {
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
}, ls = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, cs = (e) => {
  e.prototype.resize = ns, e.prototype.resolveDevicePixelRatio = as, e.prototype.calculateLaneMetrics = rs, e.prototype.setupResizeHandling = os, e.prototype.cleanupResizeHandling = ls;
}, hs = function() {
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
}, us = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, ds = async function() {
  const e = this.canvas, t = this.videoElement;
  if (!e || !t)
    return;
  const s = this.containerElement ?? t.parentElement ?? null, i = this.getFullscreenElement(), n = this.resolveActiveOverlayContainer(t, s, i);
  if (!(n instanceof HTMLElement))
    return;
  e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
  const r = (i instanceof HTMLElement && i.contains(t) ? i : null) !== null;
  this.fullscreenActive !== r && (this.fullscreenActive = r, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
}, fs = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, ps = function(e, t, s) {
  return s instanceof HTMLElement && s.contains(e) ? s instanceof HTMLVideoElement && t instanceof HTMLElement ? t : s : t ?? null;
}, vs = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, gs = (e) => {
  e.prototype.setupFullscreenHandling = hs, e.prototype.resolveResizeObserverTarget = us, e.prototype.handleFullscreenChange = ds, e.prototype.resolveFullscreenContainer = fs, e.prototype.resolveActiveOverlayContainer = ps, e.prototype.getFullscreenElement = vs;
}, ms = function(e) {
  this.cleanupTasks.push(e);
}, Ss = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, ys = (e) => {
  e.prototype.addCleanup = ms, e.prototype.runCleanupTasks = Ss;
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
  laneCount = ye;
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
  lastHardResetAt = 0;
  autoHardResetDedupWindowMs = it;
  initialPlaybackAutoResetDelayMs = st;
  initialPlaybackAutoResetTimer = null;
  initialPlaybackAutoResetTriggered = !1;
  rebuildNgMatchers() {
    we.call(this);
  }
  constructor(t = null, s = void 0) {
    let i, n;
    if (Pt(t))
      i = Y({ ...t }), n = s ?? {};
    else {
      const a = t ?? s ?? {};
      n = typeof a == "object" ? a : {}, i = Y(Ct());
    }
    this._settings = Y(i), this.timeSource = n.timeSource ?? Se(), this.animationFrameProvider = n.animationFrameProvider ?? xt(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? wt(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = be(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && ct(n.debug);
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
Rt(T);
Wt(T);
Xt(T);
qt(T);
Zt(T);
oi(T);
fi(T);
Ti(T);
Pi(T);
Hi(T);
Xi(T);
es(T);
ss(T);
cs(T);
gs(T);
ys(T);
export {
  Cs as COMMENT_OVERLAY_VERSION,
  Mt as Comment,
  T as CommentRenderer,
  bs as DEFAULT_RENDERER_SETTINGS,
  Ct as cloneDefaultSettings,
  ct as configureDebugLogging,
  xt as createDefaultAnimationFrameProvider,
  Se as createDefaultTimeSource,
  be as createLogger,
  b as debugLog,
  ut as dumpRendererState,
  k as isDebugLoggingEnabled,
  dt as logEpochChange,
  Ms as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
