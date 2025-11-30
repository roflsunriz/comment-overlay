const we = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, Ie = {
  defont: '"MS PGothic","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic Pro","Yu Gothic UI","Yu Gothic","Meiryo","Segoe UI","Osaka","Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","IPAPGothic","TakaoPGothic","Roboto","Helvetica Neue","Helvetica","Arial","sans-serif"',
  gothic: '"Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","Yu Gothic","Yu Gothic Medium","Meiryo","MS PGothic","Hiragino Kaku Gothic ProN","Segoe UI","Helvetica","Arial","sans-serif"',
  mincho: '"MS PMincho","MS Mincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Times New Roman","serif"'
}, ce = {
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
}, Y = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Pe = /^[,.:;]+/, Fe = /[,.:;]+$/, Ee = (e) => {
  const t = e.trim();
  return t ? Y.test(t) ? t : t.replace(Pe, "").replace(Fe, "") : "";
}, Le = (e) => Y.test(e) ? e.toUpperCase() : null, he = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  const i = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, s = Number.parseFloat(i);
  return Number.isFinite(s) ? s : null;
}, Ae = (e) => {
  const t = e.trim();
  if (!t)
    return null;
  if (t.endsWith("%")) {
    const i = Number.parseFloat(t.slice(0, -1));
    return Number.isFinite(i) ? i / 100 : null;
  }
  return he(t);
}, Re = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, De = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(0.25, e)), Ve = (e) => e === "naka" || e === "ue" || e === "shita", Oe = (e) => e === "small" || e === "medium" || e === "big", ke = (e) => e === "defont" || e === "gothic" || e === "mincho", Ne = (e) => e in ce, He = (e, t) => {
  let i = "naka", s = "medium", n = "defont", a = null, r = 1, l = null, c = !1, d = 0, u = 1;
  for (const g of e) {
    const p = Ee(typeof g == "string" ? g : "");
    if (!p)
      continue;
    if (Y.test(p)) {
      const S = Le(p);
      if (S) {
        a = S;
        continue;
      }
    }
    const v = p.toLowerCase();
    if (Ve(v)) {
      i = v;
      continue;
    }
    if (Oe(v)) {
      s = v;
      continue;
    }
    if (ke(v)) {
      n = v;
      continue;
    }
    if (Ne(v)) {
      a = ce[v].toUpperCase();
      continue;
    }
    if (v === "_live") {
      l = 0.5;
      continue;
    }
    if (v === "invisible") {
      r = 0, c = !0;
      continue;
    }
    if (v.startsWith("ls:") || v.startsWith("letterspacing:")) {
      const S = p.indexOf(":");
      if (S >= 0) {
        const T = he(p.slice(S + 1));
        T !== null && (d = Re(T));
      }
      continue;
    }
    if (v.startsWith("lh:") || v.startsWith("lineheight:")) {
      const S = p.indexOf(":");
      if (S >= 0) {
        const T = Ae(p.slice(S + 1));
        T !== null && (u = De(T));
      }
      continue;
    }
  }
  const o = Math.max(0, Math.min(1, r)), f = (a ?? t.defaultColor).toUpperCase(), h = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: i,
    size: s,
    sizeScale: we[s],
    font: n,
    fontFamily: Ie[n],
    resolvedColor: f,
    colorOverride: a,
    opacityMultiplier: o,
    opacityOverride: h,
    isInvisible: c,
    letterSpacing: d,
    lineHeight: u
  };
}, _e = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, z = (e) => e.length === 1 ? e.repeat(2) : e, L = (e) => Number.parseInt(e, 16), O = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, ue = (e, t) => {
  const i = _e.exec(e);
  if (!i)
    return e;
  const s = i[1];
  let n, a, r, l = 1;
  s.length === 3 || s.length === 4 ? (n = L(z(s[0])), a = L(z(s[1])), r = L(z(s[2])), s.length === 4 && (l = L(z(s[3])) / 255)) : (n = L(s.slice(0, 2)), a = L(s.slice(2, 4)), r = L(s.slice(4, 6)), s.length === 8 && (l = L(s.slice(6, 8)) / 255));
  const c = O(l * O(t));
  return `rgba(${n}, ${a}, ${r}, ${c})`;
}, ze = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), de = () => ze(), I = (e) => e * 1e3, We = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), J = 4e3, ie = 1800, $e = 3, Be = 0.25, Ge = 32, Xe = 48, B = 120, Ue = 4e3, U = 120, qe = 800, Ke = 2, N = 4e3, V = 4e3, P = V + J, Ye = 1e3, se = 1, fe = 12, pe = 24, x = 1e-3, R = 50, Je = 5, je = 2, ne = 8, Ze = 12, ae = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, Qe = (e, t, i) => {
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
}, ve = (e, t = {}) => {
  const { level: i = "info", emitter: s = Qe } = t, n = ae[i], a = (r, l) => {
    ae[r] < n || s(r, e, l);
  };
  return {
    debug: (...r) => a("debug", r),
    info: (...r) => a("info", r),
    warn: (...r) => a("warn", r),
    error: (...r) => a("error", r)
  };
}, j = ve("CommentEngine:Comment"), re = /* @__PURE__ */ new WeakMap(), et = (e) => {
  let t = re.get(e);
  return t || (t = /* @__PURE__ */ new Map(), re.set(e, t)), t;
}, Z = (e, t) => {
  if (!e)
    return 0;
  const s = `${e.font ?? ""}::${t}`, n = et(e), a = n.get(s);
  if (a !== void 0)
    return a;
  const r = e.measureText(t).width;
  return n.set(s, r), r;
}, tt = (e) => {
  if (e.includes(`
`)) {
    const t = e.split(/\r?\n/);
    return t.length > 0 ? t : [""];
  }
  return [e];
}, oe = (e) => Math.max(24, e), q = (e, t) => {
  let i = 0;
  const s = e.letterSpacing;
  for (const r of e.lines) {
    const l = Z(t, r), c = r.length > 1 ? s * (r.length - 1) : 0, d = Math.max(0, l + c);
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
}, it = (e, t, i, s, n) => {
  try {
    if (!t)
      throw new Error("Canvas context is required");
    if (!Number.isFinite(i) || !Number.isFinite(s))
      throw new Error("Canvas dimensions must be numbers");
    if (!n)
      throw new Error("Prepare options are required");
    const a = Math.max(i, 1), r = oe(Math.floor(s * 0.05)), l = oe(Math.floor(r * e.sizeScale));
    e.fontSize = l, t.font = `${e.fontSize}px ${e.fontFamily}`, e.lines = tt(e.text), q(e, t);
    const c = !e.isScrolling && (e.layout === "ue" || e.layout === "shita");
    if (c) {
      const w = Math.max(1, a - ne * 2);
      if (e.width > w) {
        const E = Math.max(
          Ze,
          Math.min(e.fontSize, Math.floor(r * 0.6))
        ), X = w / Math.max(e.width, 1), k = Math.max(
          E,
          Math.floor(e.fontSize * Math.min(X, 1))
        );
        k < e.fontSize && (e.fontSize = k, t.font = `${e.fontSize}px ${e.fontFamily}`, q(e, t));
        let ee = 0;
        for (; e.width > w && e.fontSize > E && ee < 5; ) {
          const Te = w / Math.max(e.width, 1), te = Math.max(
            E,
            Math.floor(e.fontSize * Math.max(Te, 0.7))
          );
          te >= e.fontSize ? e.fontSize = Math.max(E, e.fontSize - 1) : e.fontSize = te, t.font = `${e.fontSize}px ${e.fontFamily}`, q(e, t), ee += 1;
        }
      }
    }
    if (!e.isScrolling) {
      e.bufferWidth = 0;
      const w = c ? ne : 0, E = Math.max((a - e.width) / 2, w), X = Math.max(w, a - e.width - w), k = Math.min(E, Math.max(X, w));
      e.virtualStartX = k, e.x = k, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = V, e.preCollisionDurationMs = V, e.totalDurationMs = V, e.reservationWidth = e.width, e.staticExpiryTimeMs = e.vposMs + V, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
      return;
    }
    e.staticExpiryTimeMs = null;
    const d = Z(t, "??".repeat(150)), u = e.width * Math.max(n.bufferRatio, 0);
    e.bufferWidth = Math.max(n.baseBufferPx, u);
    const o = Math.max(n.entryBufferPx, e.bufferWidth), f = e.scrollDirection, h = f === "rtl" ? a + n.virtualExtension : -e.width - e.bufferWidth - n.virtualExtension, g = f === "rtl" ? -e.width - e.bufferWidth - o : a + o, p = f === "rtl" ? a + o : -o, v = f === "rtl" ? h + e.width + e.bufferWidth : h - e.bufferWidth;
    e.virtualStartX = h, e.x = h, e.exitThreshold = g;
    const S = a > 0 ? e.width / a : 0, T = n.maxVisibleDurationMs === n.minVisibleDurationMs;
    let y = n.maxVisibleDurationMs;
    if (!T && S > 1) {
      const w = Math.min(S, n.maxWidthRatio), E = n.maxVisibleDurationMs / Math.max(w, 1);
      y = Math.max(n.minVisibleDurationMs, Math.floor(E));
    }
    const D = a + e.width + e.bufferWidth + o, M = Math.max(y, 1), G = D / M, Ce = G * 1e3 / 60;
    e.baseSpeed = Ce, e.speed = e.baseSpeed, e.speedPixelsPerMs = G;
    const Me = Math.abs(g - h), be = f === "rtl" ? Math.max(0, v - p) : Math.max(0, p - v), Q = Math.max(G, Number.EPSILON);
    e.visibleDurationMs = y, e.preCollisionDurationMs = Math.max(0, Math.ceil(be / Q)), e.totalDurationMs = Math.max(
      e.preCollisionDurationMs,
      Math.ceil(Me / Q)
    );
    const xe = e.width + e.bufferWidth + o;
    e.reservationWidth = Math.min(d, xe), e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
  } catch (a) {
    throw j.error("Comment.prepare", a, {
      text: e.text,
      visibleWidth: i,
      canvasHeight: s,
      hasContext: !!t
    }), a;
  }
}, K = 5, F = {
  enabled: !1,
  maxLogsPerCategory: K
}, H = /* @__PURE__ */ new Map(), st = (e) => {
  if (e === void 0 || !Number.isFinite(e))
    return K;
  const t = Math.max(1, Math.floor(e));
  return Math.min(1e4, t);
}, nt = (e) => {
  F.enabled = !!e.enabled, F.maxLogsPerCategory = st(e.maxLogsPerCategory), F.enabled || H.clear();
}, fs = () => {
  H.clear();
}, A = () => F.enabled, at = (e) => {
  const t = H.get(e) ?? 0;
  return t >= F.maxLogsPerCategory ? (t === F.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), H.set(e, t + 1)), !1) : (H.set(e, t + 1), !0);
}, C = (e, ...t) => {
  F.enabled && at(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, _ = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, rt = (e, t) => {
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
}, ot = (e, t, i) => {
  F.enabled && C("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${i})`);
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
}, le = () => {
  if (!A())
    return;
  const e = performance.now();
  if (e - m.lastReported <= 5e3)
    return;
  const t = m.hits + m.misses, i = t > 0 ? m.hits / t * 100 : 0, s = m.creates > 0 ? (m.totalCharactersDrawn / m.creates).toFixed(1) : "0", n = m.outlineCallsInCache + m.outlineCallsInFallback, a = m.fillCallsInCache + m.fillCallsInFallback;
  console.log(
    "[TextureCache Stats]",
    `
  Cache: Hits=${m.hits}, Misses=${m.misses}, Hit Rate=${i.toFixed(1)}%`,
    `
  Creates: ${m.creates}, Fallbacks: ${m.fallbacks}`,
    `
  Comments: Normal=${m.normalComments}, LetterSpacing=${m.letterSpacingComments}, MultiLine=${m.multiLineComments}`,
    `
  Draw Calls: Outline=${n}, Fill=${a}`,
    `
  Avg Characters/Comment: ${s}`
  ), m.lastReported = e;
}, lt = () => typeof OffscreenCanvas < "u", ge = (e, t, i) => {
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
}, me = (e, t, i, s, n) => (a, r, l, c = 0) => {
  if (a.length === 0)
    return;
  const d = n + c, u = () => {
    s === "cache" ? l === "outline" ? m.outlineCallsInCache++ : m.fillCallsInCache++ : l === "outline" ? m.outlineCallsInFallback++ : m.fillCallsInFallback++;
  };
  if (Math.abs(e.letterSpacing) < Number.EPSILON) {
    u(), t.fillText(a, d, r);
    return;
  }
  let o = d;
  for (let f = 0; f < a.length; f += 1) {
    const h = a[f];
    u(), t.fillText(h, o, r);
    const g = Z(i, h);
    o += g, f < a.length - 1 && (o += e.letterSpacing);
  }
}, ct = (e) => `v2::${e.text}::${e.fontSize}::${e.fontFamily}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lines.length}`, ht = (e, t) => {
  if (!lt())
    return null;
  const i = Math.abs(e.letterSpacing) >= Number.EPSILON, s = e.lines.length > 1;
  i && m.letterSpacingComments++, s && m.multiLineComments++, !i && !s && m.normalComments++, m.totalCharactersDrawn += e.text.length;
  const n = Math.max(10, e.fontSize * 0.5), a = Math.ceil(e.width + n * 2), r = Math.ceil(e.height + n * 2), l = new OffscreenCanvas(a, r), c = l.getContext("2d");
  if (!c)
    return null;
  c.save(), c.font = `${e.fontSize}px ${e.fontFamily}`;
  const d = O(e.opacity), u = n, o = e.lines.length > 0 ? e.lines : [e.text], f = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, h = n + e.fontSize, g = me(e, c, t, "cache", u), p = ue(e.color, d), v = ge(e.shadowIntensity, e.fontSize, d);
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
  Fill style: ${p}`
  ), c.save(), c.shadowColor = `rgba(0, 0, 0, ${v.alpha})`, c.shadowBlur = v.blur, c.shadowOffsetX = 0, c.shadowOffsetY = 0, c.fillStyle = p, o.forEach((S, T) => {
    const y = h + T * f;
    g(S, y, "fill");
  }), c.restore(), c.restore(), l;
}, ut = (e, t, i) => {
  m.fallbacks++, t.save(), t.font = `${e.fontSize}px ${e.fontFamily}`;
  const s = O(e.opacity), n = i ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], r = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, l = e.y + e.fontSize, c = me(e, t, t, "fallback", n), d = ue(e.color, s), u = ge(e.shadowIntensity, e.fontSize, s);
  A() && console.log(
    "[Shadow Debug - Fallback]",
    `
  Text: "${e.text}"`,
    `
  FontSize: ${e.fontSize}`,
    `
  Shadow intensity: ${e.shadowIntensity}`,
    `
  Shadow blur: ${u.blur}px`,
    `
  Shadow alpha: ${u.alpha}`,
    `
  Fill style: ${d}`
  ), t.save(), t.shadowColor = `rgba(0, 0, 0, ${u.alpha})`, t.shadowBlur = u.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.fillStyle = d, a.forEach((o, f) => {
    const h = l + f * r;
    c(o, h, "fill");
  }), t.restore(), t.restore();
}, dt = (e, t, i) => {
  try {
    if (!e.isActive || !t)
      return;
    const s = ct(e), n = e.getCachedTexture();
    if (e.getTextureCacheKey() !== s || !n) {
      m.misses++, m.creates++;
      const r = ht(e, t);
      e.setCachedTexture(r), e.setTextureCacheKey(s);
    } else
      m.hits++;
    const a = e.getCachedTexture();
    if (a) {
      const r = i ?? e.x, l = Math.max(10, e.fontSize * 0.5);
      t.drawImage(a, r - l, e.y - l), le();
      return;
    }
    ut(e, t, i), le();
  } catch (s) {
    j.error("Comment.draw", s, {
      text: e.text,
      isActive: e.isActive,
      hasContext: !!t,
      interpolatedX: i
    });
  }
}, ft = (e) => e === "ltr" ? "ltr" : "rtl", pt = (e) => e === "ltr" ? 1 : -1;
class vt {
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
    const r = He(this.commands, {
      defaultColor: n.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.fontFamily = r.fontFamily, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(n.commentOpacity), this.renderStyle = n.renderStyle, this.shadowIntensity = n.shadowIntensity, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = a.timeSource ?? de(), this.applyScrollDirection(n.scrollDirection), this.syncWithSettings(n, a.settingsVersion);
  }
  prepare(t, i, s, n) {
    it(this, t, i, s, n);
  }
  draw(t, i = null) {
    dt(this, t, i);
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
      j.error("Comment.update", s, {
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
    const i = ft(t);
    this.scrollDirection = i, this.directionSign = pt(i);
  }
}
const gt = 4e3, $ = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: gt,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  shadowIntensity: "medium"
}, ps = $, mt = () => ({
  ...$,
  ngWords: [...$.ngWords],
  ngRegexps: [...$.ngRegexps]
}), vs = "v2.8.1", St = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, Se = (e, t = 0) => t === 0 ? Je : je, W = (e) => {
  const t = e.scrollVisibleDurationMs, i = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
  return {
    ...e,
    scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: St(e.commentOpacity),
    renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: i,
    syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!e.useDprScaling
  };
}, yt = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (t) => window.requestAnimationFrame(t),
  cancel: (t) => window.cancelAnimationFrame(t)
} : {
  request: (t) => globalThis.setTimeout(() => {
    t(e.now());
  }, 16),
  cancel: (t) => {
    globalThis.clearTimeout(t);
  }
}, Ct = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Mt = (e) => {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, bt = function(e) {
  if (!Array.isArray(e) || e.length === 0)
    return [];
  const t = [];
  this.commentDependencies.settingsVersion = this.settingsVersion;
  for (const i of e) {
    const { text: s, vposMs: n, commands: a = [] } = i, r = _(s);
    if (this.isNGComment(s)) {
      C("comment-skip-ng", { preview: r, vposMs: n });
      continue;
    }
    const l = We(n);
    if (l === null) {
      this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), C("comment-skip-invalid-vpos", { preview: r, vposMs: n });
      continue;
    }
    if (this.comments.some(
      (u) => u.text === s && u.vposMs === l
    ) || t.some((u) => u.text === s && u.vposMs === l)) {
      C("comment-skip-duplicate", { preview: r, vposMs: l });
      continue;
    }
    const d = new vt(
      s,
      l,
      a,
      this._settings,
      this.commentDependencies
    );
    d.creationIndex = this.commentSequence++, d.epochId = this.epochId, t.push(d), C("comment-added", {
      preview: r,
      vposMs: l,
      commands: d.commands.length,
      layout: d.layout,
      isScrolling: d.isScrolling,
      invisible: d.isInvisible
    });
  }
  return t.length === 0 ? [] : (this.comments.push(...t), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
    const n = i.vposMs - s.vposMs;
    return Math.abs(n) > x ? n : i.creationIndex - s.creationIndex;
  }), t);
}, xt = function(e, t, i = []) {
  const [s] = this.addComments([{ text: e, vposMs: t, commands: i }]);
  return s ?? null;
}, Tt = function() {
  if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
    const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
    this.ctx.clearRect(0, 0, t, i);
  }
}, wt = function() {
  this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, ye = function() {
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
}, It = function(e) {
  return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, Pt = (e) => {
  e.prototype.addComments = bt, e.prototype.addComment = xt, e.prototype.clearComments = Tt, e.prototype.resetState = wt, e.prototype.rebuildNgMatchers = ye, e.prototype.isNGComment = It;
}, Ft = function() {
  this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, Et = function(e) {
  const t = this.epochId;
  if (this.epochId += 1, ot(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
}, Lt = function(e) {
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
  if (rt(e, i), this.eventHooks.onStateSnapshot)
    try {
      this.eventHooks.onStateSnapshot(i);
    } catch (s) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
    }
  this.lastSnapshotEmitTime = t;
}, At = function(e) {
  return this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.finalPhaseVposOverrides.get(e) ?? e.vposMs;
}, Rt = function(e) {
  if (!e.isScrolling)
    return V;
  const t = [];
  return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : J;
}, Dt = function(e) {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
    return this.finalPhaseVposOverrides.delete(e), e.vposMs;
  this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
  const t = this.finalPhaseVposOverrides.get(e);
  if (t !== void 0)
    return t;
  const i = Math.max(e.vposMs, this.finalPhaseStartTime);
  return this.finalPhaseVposOverrides.set(e, i), i;
}, Vt = function() {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
    return;
  }
  const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + N, i = Math.max(e + N, t), s = this.comments.filter((d) => d.hasShown || d.isInvisible || this.isNGComment(d.text) ? !1 : d.vposMs >= e - P).sort((d, u) => {
    const o = d.vposMs - u.vposMs;
    return Math.abs(o) > x ? o : d.creationIndex - u.creationIndex;
  });
  if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
    this.finalPhaseScheduleDirty = !1;
    return;
  }
  const a = Math.max(i - e, N) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : U, l = Math.max(U, Math.min(r, qe));
  let c = e;
  s.forEach((d, u) => {
    const o = Math.max(1, this.getFinalPhaseDisplayDuration(d)), f = i - o;
    let h = Math.max(e, Math.min(c, f));
    Number.isFinite(h) || (h = e);
    const g = Ke * u;
    h + g <= f && (h += g), this.finalPhaseVposOverrides.set(d, h);
    const p = Math.max(U, Math.min(o / 2, l));
    c = h + p;
  }), this.finalPhaseScheduleDirty = !1;
}, Ot = (e) => {
  e.prototype.resetFinalPhaseState = Ft, e.prototype.incrementEpoch = Et, e.prototype.emitStateSnapshot = Lt, e.prototype.getEffectiveCommentVpos = At, e.prototype.getFinalPhaseDisplayDuration = Rt, e.prototype.resolveFinalPhaseVpos = Dt, e.prototype.recomputeFinalPhaseTimeline = Vt;
}, kt = function() {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= R;
}, Nt = function() {
  this.playbackHasBegun || (this.isPlaying || this.currentTime > R) && (this.playbackHasBegun = !0);
}, Ht = (e) => {
  e.prototype.shouldSuppressRendering = kt, e.prototype.updatePlaybackProgressState = Nt;
}, _t = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : I(t.currentTime);
  if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
    return;
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, c = this.buildPrepareOptions(r), d = this.duration > 0 && this.duration - this.currentTime <= Ue;
  d && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, l), this.comments.forEach((o) => {
    o.isActive = !1, o.clearActivation();
  }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !d && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
  for (const o of Array.from(this.activeComments)) {
    const f = this.getEffectiveCommentVpos(o), h = f < this.currentTime - P, g = f > this.currentTime + P;
    if (h || g) {
      o.isActive = !1, this.activeComments.delete(o), o.clearActivation(), o.lane >= 0 && (o.layout === "ue" ? this.releaseStaticLane("ue", o.lane) : o.layout === "shita" && this.releaseStaticLane("shita", o.lane));
      continue;
    }
    o.isScrolling && o.hasShown && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, this.activeComments.delete(o), o.clearActivation());
  }
  const u = this.getCommentsInTimeWindow(this.currentTime, P);
  for (const o of u) {
    const f = A(), h = f ? _(o.text) : "";
    if (f && C("comment-evaluate", {
      stage: "update",
      preview: h,
      vposMs: o.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(o),
      currentTime: this.currentTime,
      isActive: o.isActive,
      hasShown: o.hasShown
    }), this.isNGComment(o.text)) {
      f && C("comment-eval-skip", {
        preview: h,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        reason: "ng-runtime"
      });
      continue;
    }
    if (o.isInvisible) {
      f && C("comment-eval-skip", {
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
      c,
      this.currentTime
    ), o.isActive) {
      if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
        const g = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(g, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
        continue;
      }
      if (o.layout === "naka" && this.getEffectiveCommentVpos(o) > this.currentTime + R) {
        o.x = o.virtualStartX, o.lastUpdateTime = this.timeSource.now();
        continue;
      }
      if (o.hasShown = !0, o.update(this.playbackRate, !this.isPlaying), !o.isScrolling && o.hasStaticExpired(this.currentTime)) {
        const g = o.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(g, o.lane), o.isActive = !1, this.activeComments.delete(o), o.clearActivation();
      }
    }
  }
}, zt = function(e) {
  const t = this._settings.scrollVisibleDurationMs;
  let i = J, s = ie;
  return t !== null && (i = t, s = Math.max(1, Math.min(t, ie))), {
    visibleWidth: e,
    virtualExtension: Ye,
    maxVisibleDurationMs: i,
    minVisibleDurationMs: s,
    maxWidthRatio: $e,
    bufferRatio: Be,
    baseBufferPx: Ge,
    entryBufferPx: Xe
  };
}, Wt = function(e) {
  const t = this.currentTime;
  this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
  const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t);
  for (const a of i)
    if (this.isLaneAvailable(a, s, t))
      return this.storeLaneReservation(a, s), a;
  const n = i[0] ?? 0;
  return this.storeLaneReservation(n, s), n;
}, $t = (e) => {
  e.prototype.updateComments = _t, e.prototype.buildPrepareOptions = zt, e.prototype.findAvailableLane = Wt;
}, Bt = function(e, t) {
  let i = 0, s = e.length;
  for (; i < s; ) {
    const n = Math.floor((i + s) / 2), a = e[n];
    a !== void 0 && a.totalEndTime + B <= t ? i = n + 1 : s = n;
  }
  return i;
}, Gt = function(e) {
  for (const [t, i] of this.reservedLanes.entries()) {
    const s = this.findFirstValidReservationIndex(i, e);
    s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
  }
}, Xt = function(e) {
  const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
  this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
}, Ut = (e) => {
  e.prototype.findFirstValidReservationIndex = Bt, e.prototype.pruneLaneReservations = Gt, e.prototype.pruneStaticLaneReservations = Xt;
}, qt = function(e) {
  let t = 0, i = this.comments.length;
  for (; t < i; ) {
    const s = Math.floor((t + i) / 2), n = this.comments[s];
    n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
  }
  return t;
}, Kt = function(e, t) {
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
}, Yt = function(e) {
  return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, Jt = function(e) {
  return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, jt = function(e) {
  const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
  return s <= 0 ? -1 : s - 1;
}, Zt = function(e) {
  return Math.max(0, this.laneCount - 1 - e);
}, Qt = function(e, t, i, s) {
  const n = Math.max(1, i), a = Math.max(s.height, s.fontSize), r = 5, l = 2;
  if (e === "ue") {
    let f = r;
    const g = this.getStaticReservations(e).filter((v) => v.lane < t).sort((v, S) => v.lane - S.lane);
    for (const v of g) {
      const S = v.yEnd - v.yStart;
      f += S + l;
    }
    const p = Math.max(r, n - a - r);
    return Math.max(r, Math.min(f, p));
  }
  let c = n - r;
  const u = this.getStaticReservations(e).filter((f) => f.lane < t).sort((f, h) => f.lane - h.lane);
  for (const f of u) {
    const h = f.yEnd - f.yStart;
    c -= h + l;
  }
  const o = c - a;
  return Math.max(r, o);
}, ei = function() {
  const e = /* @__PURE__ */ new Set();
  for (const t of this.topStaticLaneReservations)
    e.add(t.lane);
  for (const t of this.bottomStaticLaneReservations)
    e.add(this.getGlobalLaneIndexForBottom(t.lane));
  return e;
}, ti = (e) => {
  e.prototype.findCommentIndexAtOrAfter = qt, e.prototype.getCommentsInTimeWindow = Kt, e.prototype.getStaticReservations = Yt, e.prototype.getStaticLaneDepth = Jt, e.prototype.getStaticLaneLimit = jt, e.prototype.getGlobalLaneIndexForBottom = Zt, e.prototype.resolveStaticCommentOffset = Qt, e.prototype.getStaticReservedLaneSet = ei;
}, ii = function(e, t, i = "") {
  const s = i.length > 0 && A(), n = this.resolveFinalPhaseVpos(e);
  return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - x ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "final-phase-trimmed",
    finalPhaseStartTime: this.finalPhaseStartTime
  }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "invisible"
  }), !1) : e.isActive ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-active"
  }), !1) : e.hasShown && n <= t ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "already-shown",
    currentTime: t
  }), !1) : n > t + R ? (s && C("comment-eval-pending", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "future",
    currentTime: t
  }), !1) : n < t - P ? (s && C("comment-eval-skip", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    reason: "expired-window",
    currentTime: t
  }), !1) : (s && C("comment-eval-ready", {
    preview: i,
    vposMs: e.vposMs,
    effectiveVposMs: n,
    currentTime: t
  }), !0);
}, si = function(e, t, i, s, n, a) {
  e.prepare(t, i, s, n);
  const r = this.resolveFinalPhaseVpos(e);
  if (A() && C("comment-prepared", {
    preview: _(e.text),
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
      const h = this.duration > 0 ? this.duration : this.finalPhaseStartTime + N, g = Math.max(
        this.finalPhaseStartTime + N,
        h
      ), p = e.width + i, v = p > 0 ? p / Math.max(e.speedPixelsPerMs, 1) : 0;
      if (r + v > g) {
        const T = g - a, y = Math.max(0, T) * e.speedPixelsPerMs, D = e.scrollDirection === "rtl" ? Math.max(e.virtualStartX - c, i - y) : Math.min(e.virtualStartX + c, y - e.width);
        e.x = D;
      } else
        e.x = e.scrollDirection === "rtl" ? e.virtualStartX - c : e.virtualStartX + c;
    } else
      e.x = e.scrollDirection === "rtl" ? e.virtualStartX - c : e.virtualStartX + c;
    const d = this.findAvailableLane(e);
    e.lane = d;
    const u = Math.max(1, this.laneHeight), o = Math.max(0, s - e.height), f = d * u;
    e.y = Math.max(0, Math.min(f, o));
  } else {
    const l = e.layout === "ue" ? "ue" : "shita", c = this.assignStaticLane(l, e, s, a), d = this.resolveStaticCommentOffset(
      l,
      c,
      s,
      e
    );
    e.x = Math.max(0, Math.min(i - e.width, e.virtualStartX)), e.y = d, e.lane = l === "ue" ? c : this.getGlobalLaneIndexForBottom(c), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = V;
    const u = a + e.visibleDurationMs;
    this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = u, this.reserveStaticLane(l, e, c, u), A() && C("comment-activate-static", {
      preview: _(e.text),
      lane: e.lane,
      position: l,
      displayEnd: u,
      effectiveVposMs: r
    });
    return;
  }
  this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, ni = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = this.getStaticLaneLimit(e), r = a >= 0 ? a + 1 : 0, l = Array.from({ length: r }, (u, o) => o);
  for (const u of l) {
    const o = this.resolveStaticCommentOffset(e, u, i, t), f = Math.max(t.height, t.fontSize), h = Se(t.fontSize, u), g = o - h, p = o + f + h;
    if (!n.some((S) => S.releaseTime > s ? !(p <= S.yStart || g >= S.yEnd) : !1))
      return u;
  }
  let c = l[0] ?? 0, d = Number.POSITIVE_INFINITY;
  for (const u of n)
    u.releaseTime < d && (d = u.releaseTime, c = u.lane);
  return c;
}, ai = function(e, t, i, s) {
  const n = this.getStaticReservations(e), a = Math.max(t.height, t.fontSize), r = Se(t.fontSize, i), l = t.y - r, c = t.y + a + r;
  n.push({
    comment: t,
    releaseTime: s,
    yStart: l,
    yEnd: c,
    lane: i
  });
}, ri = function(e, t) {
  if (t < 0)
    return;
  const i = this.getStaticReservations(e), s = i.findIndex((n) => n.lane === t);
  s >= 0 && i.splice(s, 1);
}, oi = (e) => {
  e.prototype.shouldActivateCommentAtTime = ii, e.prototype.activateComment = si, e.prototype.assignStaticLane = ni, e.prototype.reserveStaticLane = ai, e.prototype.releaseStaticLane = ri;
}, li = function(e) {
  const i = Array.from({ length: this.laneCount }, (r, l) => l).sort((r, l) => {
    const c = this.getLaneNextAvailableTime(r, e), d = this.getLaneNextAvailableTime(l, e);
    return Math.abs(c - d) <= x ? r - l : c - d;
  }), s = this.getStaticReservedLaneSet();
  if (s.size === 0)
    return i;
  const n = i.filter((r) => !s.has(r));
  if (n.length === 0)
    return i;
  const a = i.filter((r) => s.has(r));
  return [...n, ...a];
}, ci = function(e, t) {
  const i = this.reservedLanes.get(e);
  if (!i || i.length === 0)
    return t;
  const s = this.findFirstValidReservationIndex(i, t), n = i[s];
  return n ? Math.max(t, n.endTime + B) : t;
}, hi = function(e, t) {
  const i = Math.max(e.speedPixelsPerMs, x), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + B, l = a + e.totalDurationMs + B;
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
}, ui = function(e, t, i) {
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
}, di = function(e, t) {
  const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
  this.reservedLanes.set(e, s);
}, fi = function(e, t) {
  const i = Math.max(e.startTime, t.startTime), s = Math.min(e.endTime, t.endTime);
  if (i >= s)
    return !1;
  const n = /* @__PURE__ */ new Set([
    i,
    s,
    i + (s - i) / 2
  ]), a = this.solveLeftRightEqualityTime(e, t);
  a !== null && a >= i - x && a <= s + x && n.add(a);
  const r = this.solveLeftRightEqualityTime(t, e);
  r !== null && r >= i - x && r <= s + x && n.add(r);
  for (const l of n) {
    if (l < i - x || l > s + x)
      continue;
    const c = this.computeForwardGap(e, t, l), d = this.computeForwardGap(t, e, l);
    if (c <= x && d <= x)
      return !0;
  }
  return !1;
}, pi = function(e, t, i) {
  const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
  return s.left - n.right;
}, vi = function(e, t) {
  const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
  return { left: a, right: r };
}, gi = function(e, t) {
  const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
  if (Math.abs(n) < x)
    return null;
  const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
  return Number.isFinite(r) ? r : null;
}, mi = (e) => {
  e.prototype.getLanePriorityOrder = li, e.prototype.getLaneNextAvailableTime = ci, e.prototype.createLaneReservation = hi, e.prototype.isLaneAvailable = ui, e.prototype.storeLaneReservation = di, e.prototype.areReservationsConflicting = fi, e.prototype.computeForwardGap = pi, e.prototype.getBufferedEdges = vi, e.prototype.solveLeftRightEqualityTime = gi;
}, Si = function() {
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
    r.sort((c, d) => {
      const u = this.getEffectiveCommentVpos(c), o = this.getEffectiveCommentVpos(d), f = u - o;
      return Math.abs(f) > x ? f : c.isScrolling !== d.isScrolling ? c.isScrolling ? 1 : -1 : c.creationIndex - d.creationIndex;
    }), r.forEach((c) => {
      const u = this.isPlaying && !c.isPaused ? c.x + c.getDirectionSign() * c.speed * l : c.x;
      c.draw(t, u);
    });
  }
  this.lastDrawTime = a;
}, yi = function(e) {
  const t = this.videoElement, i = this.canvas, s = this.ctx;
  if (!t || !i || !s)
    return;
  const n = typeof e == "number" ? e : I(t.currentTime);
  this.currentTime = n, this.lastDrawTime = this.timeSource.now();
  const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, l = this.displayHeight > 0 ? this.displayHeight : i.height / a, c = this.buildPrepareOptions(r);
  this.getCommentsInTimeWindow(this.currentTime, P).forEach((u) => {
    if (this.isNGComment(u.text) || u.isInvisible) {
      u.isActive = !1, this.activeComments.delete(u), u.clearActivation();
      return;
    }
    if (u.syncWithSettings(this._settings, this.settingsVersion), u.isActive = !1, this.activeComments.delete(u), u.lane = -1, u.clearActivation(), this.shouldActivateCommentAtTime(u, this.currentTime)) {
      this.activateComment(
        u,
        s,
        r,
        l,
        c,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(u) < this.currentTime - P ? u.hasShown = !0 : u.hasShown = !1;
  });
}, Ci = (e) => {
  e.prototype.draw = Si, e.prototype.performInitialSync = yi;
}, Mi = function(e) {
  this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
}, bi = function() {
  const e = this.frameId;
  this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, xi = function(e, t) {
  this.videoFrameHandle = null;
  const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
  this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
}, Ti = function() {
  if (this._settings.syncMode !== "video-frame")
    return !1;
  const e = this.videoElement;
  return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, wi = function() {
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
}, Ii = function() {
  this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, Pi = function() {
  if (this.videoFrameHandle === null)
    return;
  const e = this.videoElement;
  e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, Fi = function() {
  this.stopAnimation(), this.scheduleNextFrame();
}, Ei = function() {
  this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, Li = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  if (!e || !t || !i)
    return;
  const s = I(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
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
  const c = this.canvasDpr > 0 ? this.canvasDpr : 1, d = this.displayWidth > 0 ? this.displayWidth : e.width / c, u = this.displayHeight > 0 ? this.displayHeight : e.height / c, o = this.buildPrepareOptions(d);
  this.getCommentsInTimeWindow(this.currentTime, P).forEach((h) => {
    const g = A(), p = g ? _(h.text) : "";
    if (g && C("comment-evaluate", {
      stage: "seek",
      preview: p,
      vposMs: h.vposMs,
      effectiveVposMs: this.getEffectiveCommentVpos(h),
      currentTime: this.currentTime,
      isActive: h.isActive,
      hasShown: h.hasShown
    }), this.isNGComment(h.text)) {
      g && C("comment-eval-skip", {
        preview: p,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        reason: "ng-runtime"
      }), h.isActive = !1, this.activeComments.delete(h), h.clearActivation();
      return;
    }
    if (h.isInvisible) {
      g && C("comment-eval-skip", {
        preview: p,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        reason: "invisible"
      }), h.isActive = !1, this.activeComments.delete(h), h.hasShown = !0, h.clearActivation();
      return;
    }
    if (h.syncWithSettings(this._settings, this.settingsVersion), h.isActive = !1, this.activeComments.delete(h), h.lane = -1, h.clearActivation(), this.shouldActivateCommentAtTime(h, this.currentTime, p)) {
      this.activateComment(
        h,
        t,
        d,
        u,
        o,
        this.currentTime
      );
      return;
    }
    this.getEffectiveCommentVpos(h) < this.currentTime - P ? h.hasShown = !0 : h.hasShown = !1;
  }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Ai = (e) => {
  e.prototype.processFrame = Mi, e.prototype.handleAnimationFrame = bi, e.prototype.handleVideoFrame = xi, e.prototype.shouldUseVideoFrameCallback = Ti, e.prototype.scheduleNextFrame = wi, e.prototype.cancelAnimationFrameRequest = Ii, e.prototype.cancelVideoFrameCallback = Pi, e.prototype.startAnimation = Fi, e.prototype.stopAnimation = Ei, e.prototype.onSeek = Li;
}, Ri = function(e, t) {
  if (e)
    return e;
  if (t.parentElement)
    return t.parentElement;
  if (typeof document < "u" && document.body)
    return document.body;
  throw new Error(
    "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
  );
}, Di = function(e) {
  if (typeof getComputedStyle == "function") {
    getComputedStyle(e).position === "static" && (e.style.position = "relative");
    return;
  }
  e.style.position || (e.style.position = "relative");
}, Vi = function(e) {
  try {
    this.destroyCanvasOnly();
    const t = e instanceof HTMLVideoElement ? e : e.video, i = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(i ?? null, t);
    this.videoElement = t, this.containerElement = s, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? I(t.duration) : 0, this.currentTime = I(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > R, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    const n = this.createCanvasElement(), a = n.getContext("2d");
    if (!a)
      throw new Error("Failed to acquire 2D canvas context");
    n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
    const r = this.containerElement;
    r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
  } catch (t) {
    throw this.log.error("CommentRenderer.initialize", t), t;
  }
}, Oi = function() {
  this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, ki = function() {
  this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, Ni = (e) => {
  e.prototype.resolveContainer = Ri, e.prototype.ensureContainerPositioning = Di, e.prototype.initialize = Vi, e.prototype.destroy = Oi, e.prototype.destroyCanvasOnly = ki;
}, Hi = function(e) {
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
      this.duration = Number.isFinite(e.duration) ? I(e.duration) : 0;
    }, c = () => {
      this.handleVideoSourceChange();
    }, d = () => {
      this.handleVideoStalled();
    }, u = () => {
      this.handleVideoCanPlay();
    }, o = () => {
      this.handleVideoCanPlay();
    };
    e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", l), e.addEventListener("emptied", c), e.addEventListener("waiting", d), e.addEventListener("canplay", u), e.addEventListener("playing", o), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", c)), this.addCleanup(() => e.removeEventListener("waiting", d)), this.addCleanup(() => e.removeEventListener("canplay", u)), this.addCleanup(() => e.removeEventListener("playing", o));
  } catch (t) {
    throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
  }
}, _i = function(e) {
  this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, zi = function() {
  const e = this.canvas, t = this.ctx;
  if (!e || !t)
    return;
  this.isStalled = !0;
  const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
  t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
    a.isActive && (a.lastUpdateTime = this.timeSource.now());
  });
}, Wi = function() {
  this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = I(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, $i = function(e) {
  const t = e ?? this.videoElement;
  if (!t) {
    this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
    return;
  }
  const i = this.getCurrentVideoSource();
  i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, Bi = function(e) {
  this.duration = Number.isFinite(e.duration) ? I(e.duration) : 0, this.currentTime = I(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > R, this.lastDrawTime = this.timeSource.now();
}, Gi = function() {
  const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
  if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > R, t && i) {
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
    i.clearRect(0, 0, n, a);
  }
  this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
    s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
  }), this.activeComments.clear();
}, Xi = function(e, t) {
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
}, Ui = function(e) {
  if (e instanceof HTMLVideoElement)
    return e;
  if (e instanceof Element) {
    const t = e.querySelector("video");
    if (t instanceof HTMLVideoElement)
      return t;
  }
  return null;
}, qi = (e) => {
  e.prototype.setupVideoEventListeners = Hi, e.prototype.handleVideoMetadataLoaded = _i, e.prototype.handleVideoStalled = zi, e.prototype.handleVideoCanPlay = Wi, e.prototype.handleVideoSourceChange = $i, e.prototype.syncVideoState = Bi, e.prototype.resetCommentActivity = Gi, e.prototype.setupVideoChangeDetection = Xi, e.prototype.extractVideoElement = Ui;
}, Ki = function() {
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
}, Yi = function() {
  const e = this.canvas, t = this.ctx, i = this.videoElement;
  !e || !t || !i || (this.currentTime = I(i.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !i.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, Ji = (e) => {
  e.prototype.setupVisibilityHandling = Ki, e.prototype.handleVisibilityRestore = Yi;
}, ji = function(e, t) {
  const i = this.videoElement, s = this.canvas, n = this.ctx;
  if (!i || !s)
    return;
  const a = i.getBoundingClientRect(), r = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : s.width / r, c = this.displayHeight > 0 ? this.displayHeight : s.height / r, d = e ?? a.width ?? l, u = t ?? a.height ?? c;
  if (!Number.isFinite(d) || !Number.isFinite(u) || d <= 0 || u <= 0)
    return;
  const o = Math.max(1, Math.floor(d)), f = Math.max(1, Math.floor(u)), h = this.displayWidth > 0 ? this.displayWidth : o, g = this.displayHeight > 0 ? this.displayHeight : f, p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, v = Math.max(1, Math.round(o * p)), S = Math.max(1, Math.round(f * p));
  if (!(this.displayWidth !== o || this.displayHeight !== f || Math.abs(this.canvasDpr - p) > Number.EPSILON || s.width !== v || s.height !== S))
    return;
  this.displayWidth = o, this.displayHeight = f, this.canvasDpr = p, s.width = v, s.height = S, s.style.width = `${o}px`, s.style.height = `${f}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p));
  const y = h > 0 ? o / h : 1, D = g > 0 ? f / g : 1;
  (y !== 1 || D !== 1) && this.comments.forEach((M) => {
    M.isActive && (M.x *= y, M.y *= D, M.width *= y, M.fontSize = Math.max(
      pe,
      Math.floor(Math.max(1, M.fontSize) * D)
    ), M.height = M.fontSize, M.virtualStartX *= y, M.exitThreshold *= y, M.baseSpeed *= y, M.speed *= y, M.speedPixelsPerMs *= y, M.bufferWidth *= y, M.reservationWidth *= y);
  }), this.calculateLaneMetrics();
}, Zi = function() {
  if (typeof window > "u")
    return 1;
  const e = Number(window.devicePixelRatio);
  return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, Qi = function() {
  const e = this.canvas;
  if (!e)
    return;
  const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(pe, Math.floor(t * 0.05));
  this.laneHeight = i * 1.2;
  const s = Math.floor(t / Math.max(this.laneHeight, 1));
  if (this._settings.useFixedLaneCount) {
    const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : fe, a = Math.max(se, Math.min(s, n));
    this.laneCount = a;
  } else
    this.laneCount = Math.max(se, s);
  this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, es = function(e) {
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
}, ts = function() {
  this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, is = (e) => {
  e.prototype.resize = ji, e.prototype.resolveDevicePixelRatio = Zi, e.prototype.calculateLaneMetrics = Qi, e.prototype.setupResizeHandling = es, e.prototype.cleanupResizeHandling = ts;
}, ss = function() {
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
}, ns = function(e) {
  const t = this.resolveFullscreenContainer(e);
  return t || (e.parentElement ?? e);
}, as = async function() {
  const e = this.canvas, t = this.videoElement;
  if (!e || !t)
    return;
  const i = this.containerElement ?? t.parentElement ?? null, s = this.getFullscreenElement(), n = this.resolveActiveOverlayContainer(t, i, s);
  if (!(n instanceof HTMLElement))
    return;
  e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
  const r = (s instanceof HTMLElement && s.contains(t) ? s : null) !== null;
  this.fullscreenActive !== r && (this.fullscreenActive = r, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
}, rs = function(e) {
  const t = this.getFullscreenElement();
  return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, os = function(e, t, i) {
  return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
}, ls = function() {
  if (typeof document > "u")
    return null;
  const e = document;
  return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, cs = (e) => {
  e.prototype.setupFullscreenHandling = ss, e.prototype.resolveResizeObserverTarget = ns, e.prototype.handleFullscreenChange = as, e.prototype.resolveFullscreenContainer = rs, e.prototype.resolveActiveOverlayContainer = os, e.prototype.getFullscreenElement = ls;
}, hs = function(e) {
  this.cleanupTasks.push(e);
}, us = function() {
  for (; this.cleanupTasks.length > 0; ) {
    const e = this.cleanupTasks.pop();
    try {
      e?.();
    } catch (t) {
      this.log.error("CommentRenderer.cleanupTask", t);
    }
  }
}, ds = (e) => {
  e.prototype.addCleanup = hs, e.prototype.runCleanupTasks = us;
};
class b {
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
  laneCount = fe;
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
    ye.call(this);
  }
  constructor(t = null, i = void 0) {
    let s, n;
    if (Mt(t))
      s = W({ ...t }), n = i ?? {};
    else {
      const a = t ?? i ?? {};
      n = typeof a == "object" ? a : {}, s = W(mt());
    }
    this._settings = W(s), this.timeSource = n.timeSource ?? de(), this.animationFrameProvider = n.animationFrameProvider ?? yt(this.timeSource), this.createCanvasElement = n.createCanvasElement ?? Ct(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = ve(n.loggerNamespace ?? "CommentRenderer"), this.eventHooks = n.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), n.debug && nt(n.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(t) {
    this._settings = W(t), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
Pt(b);
Ot(b);
Ht(b);
$t(b);
Ut(b);
ti(b);
oi(b);
mi(b);
Ci(b);
Ai(b);
Ni(b);
qi(b);
Ji(b);
is(b);
cs(b);
ds(b);
export {
  vs as COMMENT_OVERLAY_VERSION,
  vt as Comment,
  b as CommentRenderer,
  ps as DEFAULT_RENDERER_SETTINGS,
  mt as cloneDefaultSettings,
  nt as configureDebugLogging,
  yt as createDefaultAnimationFrameProvider,
  de as createDefaultTimeSource,
  ve as createLogger,
  C as debugLog,
  rt as dumpRendererState,
  A as isDebugLoggingEnabled,
  ot as logEpochChange,
  fs as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
