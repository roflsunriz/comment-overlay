const se = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, ge = (o, e, t) => {
  const i = [`[${e}]`, ...t];
  switch (o) {
    case "debug":
      console.debug(...i);
      break;
    case "info":
      console.info(...i);
      break;
    case "warn":
      console.warn(...i);
      break;
    case "error":
      console.error(...i);
      break;
    default:
      console.log(...i);
  }
}, ce = (o, e = {}) => {
  const { level: t = "info", emitter: s = ge } = e, i = se[t], n = (a, r) => {
    se[a] < i || s(a, o, r);
  };
  return {
    debug: (...a) => n("debug", a),
    info: (...a) => n("info", a),
    warn: (...a) => n("warn", a),
    error: (...a) => n("error", a)
  };
}, me = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, Se = {
  defont: '"MS PGothic","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic Pro","Yu Gothic UI","Yu Gothic","Meiryo","Segoe UI","Osaka","Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","IPAPGothic","TakaoPGothic","Roboto","Helvetica Neue","Helvetica","Arial","sans-serif"',
  gothic: '"Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","Yu Gothic","Yu Gothic Medium","Meiryo","MS PGothic","Hiragino Kaku Gothic ProN","Segoe UI","Helvetica","Arial","sans-serif"',
  mincho: '"MS PMincho","MS Mincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Times New Roman","serif"'
}, ue = {
  white: "#FFFFFF",
  red: "#FF0000",
  pink: "#FF8080",
  orange: "#FF9900",
  yellow: "#FFFF00",
  green: "#00FF00",
  cyan: "#00FFFF",
  blue: "#0000FF",
  purple: "#C000FF",
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
}, te = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Me = /^[,.:;]+/, be = /[,.:;]+$/, ye = (o) => {
  const e = o.trim();
  return e ? te.test(e) ? e : e.replace(Me, "").replace(be, "") : "";
}, Ce = (o) => te.test(o) ? o.toUpperCase() : null, de = (o) => {
  const e = o.trim();
  if (!e)
    return null;
  const t = e.toLowerCase().endsWith("px") ? e.slice(0, -2) : e, s = Number.parseFloat(t);
  return Number.isFinite(s) ? s : null;
}, we = (o) => {
  const e = o.trim();
  if (!e)
    return null;
  if (e.endsWith("%")) {
    const t = Number.parseFloat(e.slice(0, -1));
    return Number.isFinite(t) ? t / 100 : null;
  }
  return de(e);
}, xe = (o) => Number.isFinite(o) ? Math.min(100, Math.max(-100, o)) : 0, Te = (o) => !Number.isFinite(o) || o === 0 ? 1 : Math.min(5, Math.max(0.25, o)), Fe = (o) => o === "naka" || o === "ue" || o === "shita", Ee = (o) => o === "small" || o === "medium" || o === "big", Pe = (o) => o === "defont" || o === "gothic" || o === "mincho", Le = (o) => o in ue, Ae = (o, e) => {
  let t = "naka", s = "medium", i = "defont", n = null, a = 1, r = null, l = !1, u = 0, c = 1;
  for (const p of o) {
    const m = ye(typeof p == "string" ? p : "");
    if (!m)
      continue;
    if (te.test(m)) {
      const y = Ce(m);
      if (y) {
        n = y;
        continue;
      }
    }
    const v = m.toLowerCase();
    if (Fe(v)) {
      t = v;
      continue;
    }
    if (Ee(v)) {
      s = v;
      continue;
    }
    if (Pe(v)) {
      i = v;
      continue;
    }
    if (Le(v)) {
      n = ue[v].toUpperCase();
      continue;
    }
    if (v === "_live") {
      r = 0.5;
      continue;
    }
    if (v === "invisible") {
      a = 0, l = !0;
      continue;
    }
    if (v.startsWith("ls:") || v.startsWith("letterspacing:")) {
      const y = m.indexOf(":");
      if (y >= 0) {
        const b = de(m.slice(y + 1));
        b !== null && (u = xe(b));
      }
      continue;
    }
    if (v.startsWith("lh:") || v.startsWith("lineheight:")) {
      const y = m.indexOf(":");
      if (y >= 0) {
        const b = we(m.slice(y + 1));
        b !== null && (c = Te(b));
      }
      continue;
    }
  }
  const f = Math.max(0, Math.min(1, a)), h = (n ?? e.defaultColor).toUpperCase(), g = typeof r == "number" ? Math.max(0, Math.min(1, r)) : null;
  return {
    layout: t,
    size: s,
    sizeScale: me[s],
    font: i,
    fontFamily: Se[i],
    resolvedColor: h,
    colorOverride: n,
    opacityMultiplier: f,
    opacityOverride: g,
    isInvisible: l,
    letterSpacing: u,
    lineHeight: c
  };
}, Q = 5, N = {
  enabled: !1,
  maxLogsPerCategory: Q
}, B = /* @__PURE__ */ new Map(), De = (o) => {
  if (o === void 0 || !Number.isFinite(o))
    return Q;
  const e = Math.max(1, Math.floor(o));
  return Math.min(1e4, e);
}, ke = (o) => {
  N.enabled = !!o.enabled, N.maxLogsPerCategory = De(o.maxLogsPerCategory), N.enabled || B.clear();
}, et = () => {
  B.clear();
}, E = () => N.enabled, Re = (o) => {
  const e = B.get(o) ?? 0;
  return e >= N.maxLogsPerCategory ? (e === N.maxLogsPerCategory && (console.debug(`[CommentOverlay][${o}]`, "Further logs suppressed."), B.set(o, e + 1)), !1) : (B.set(o, e + 1), !0);
}, w = (o, ...e) => {
  N.enabled && Re(o) && console.debug(`[CommentOverlay][${o}]`, ...e);
}, L = (o, e = 32) => o.length <= e ? o : `${o.slice(0, e)}…`, J = ce("CommentEngine:Comment"), ne = /* @__PURE__ */ new WeakMap(), Oe = (o) => {
  let e = ne.get(o);
  return e || (e = /* @__PURE__ */ new Map(), ne.set(o, e)), e;
}, W = (o, e) => {
  if (!o)
    return 0;
  const s = `${o.font ?? ""}::${e}`, i = Oe(o), n = i.get(s);
  if (n !== void 0)
    return n;
  const a = o.measureText(e).width;
  return i.set(s, a), a;
}, I = 4e3, Ve = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, D = (o) => !Number.isFinite(o) || o <= 0 ? 0 : o >= 1 ? 1 : o, G = (o) => o.length === 1 ? o.repeat(2) : o, A = (o) => Number.parseInt(o, 16), ae = (o, e) => {
  const t = Ve.exec(o);
  if (!t)
    return o;
  const s = t[1];
  let i, n, a, r = 1;
  s.length === 3 || s.length === 4 ? (i = A(G(s[0])), n = A(G(s[1])), a = A(G(s[2])), s.length === 4 && (r = A(G(s[3])) / 255)) : (i = A(s.slice(0, 2)), n = A(s.slice(2, 4)), a = A(s.slice(4, 6)), s.length === 8 && (r = A(s.slice(6, 8)) / 255));
  const l = D(r * D(e));
  return `rgba(${i}, ${n}, ${a}, ${l})`;
}, Ie = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), fe = () => Ie(), Ne = (o) => o === "ltr" ? "ltr" : "rtl", He = (o) => o === "ltr" ? 1 : -1;
class d {
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
  strokeTextThreshold = 30;
  directionSign = -1;
  timeSource;
  lastSyncedSettingsVersion = -1;
  cachedTexture = null;
  textureCacheKey = "";
  constructor(e, t, s, i, n = {}) {
    if (typeof e != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(t) || t < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = e, this.vposMs = t, this.commands = Array.isArray(s) ? [...s] : [];
    const a = Ae(this.commands, {
      defaultColor: i.commentColor
    });
    this.layout = a.layout, this.isScrolling = this.layout === "naka", this.sizeScale = a.sizeScale, this.opacityMultiplier = a.opacityMultiplier, this.opacityOverride = a.opacityOverride, this.colorOverride = a.colorOverride, this.isInvisible = a.isInvisible, this.fontFamily = a.fontFamily, this.color = a.resolvedColor, this.opacity = this.getEffectiveOpacity(i.commentOpacity), this.renderStyle = i.renderStyle, this.letterSpacing = a.letterSpacing, this.lineHeightMultiplier = a.lineHeight, this.timeSource = n.timeSource ?? fe(), this.applyScrollDirection(i.scrollDirection), this.syncWithSettings(i, n.settingsVersion);
  }
  prepare(e, t, s, i) {
    try {
      if (!e)
        throw new Error("Canvas context is required");
      if (!Number.isFinite(t) || !Number.isFinite(s))
        throw new Error("Canvas dimensions must be numbers");
      if (!i)
        throw new Error("Prepare options are required");
      const n = Math.max(t, 1), a = Math.max(24, Math.floor(s * 0.05)), r = Math.max(24, Math.floor(a * this.sizeScale));
      this.fontSize = r, e.font = `${this.fontSize}px ${this.fontFamily}`;
      const l = this.text.includes(`
`) ? this.text.split(/\r?\n/) : [this.text];
      this.lines = l.length > 0 ? l : [""];
      let u = 0;
      const c = this.letterSpacing;
      for (const P of this.lines) {
        const K = W(e, P), ve = P.length > 1 ? c * (P.length - 1) : 0, ie = Math.max(0, K + ve);
        ie > u && (u = ie);
      }
      this.width = u;
      const f = Math.max(
        1,
        Math.floor(this.fontSize * this.lineHeightMultiplier)
      );
      if (this.lineHeightPx = f, this.height = this.fontSize + (this.lines.length > 1 ? (this.lines.length - 1) * f : 0), !this.isScrolling) {
        this.bufferWidth = 0;
        const P = Math.max((n - this.width) / 2, 0);
        this.virtualStartX = P, this.x = P, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = I, this.preCollisionDurationMs = I, this.totalDurationMs = I, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vposMs + I, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const h = W(e, "??".repeat(150)), g = this.width * Math.max(i.bufferRatio, 0);
      this.bufferWidth = Math.max(i.baseBufferPx, g);
      const p = Math.max(i.entryBufferPx, this.bufferWidth), m = this.scrollDirection, v = m === "rtl" ? n + i.virtualExtension : -this.width - this.bufferWidth - i.virtualExtension, y = m === "rtl" ? -this.width - this.bufferWidth - p : n + p, b = m === "rtl" ? n + p : -p, x = m === "rtl" ? v + this.width + this.bufferWidth : v - this.bufferWidth;
      this.virtualStartX = v, this.x = v, this.exitThreshold = y;
      const M = n > 0 ? this.width / n : 0, C = i.maxVisibleDurationMs === i.minVisibleDurationMs;
      let S = i.maxVisibleDurationMs;
      if (!C && M > 1) {
        const P = Math.min(M, i.maxWidthRatio), K = i.maxVisibleDurationMs / Math.max(P, 1);
        S = Math.max(i.minVisibleDurationMs, Math.floor(K));
      }
      const k = n + this.width + this.bufferWidth + p, R = Math.max(S, 1), F = k / R, H = F * 1e3 / 60;
      this.baseSpeed = H, this.speed = this.baseSpeed, this.speedPixelsPerMs = F;
      const z = Math.abs(y - v), _ = m === "rtl" ? Math.max(0, x - b) : Math.max(0, b - x), U = Math.max(F, Number.EPSILON);
      this.visibleDurationMs = S, this.preCollisionDurationMs = Math.max(0, Math.ceil(_ / U)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(z / U)
      );
      const pe = this.width + this.bufferWidth + p;
      this.reservationWidth = Math.min(h, pe), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
    } catch (n) {
      throw J.error("Comment.prepare", n, {
        text: this.text,
        visibleWidth: t,
        canvasHeight: s,
        hasContext: !!e
      }), n;
    }
  }
  update(e = 1, t = !1) {
    try {
      if (!this.isActive) {
        this.isPaused = t;
        return;
      }
      const s = this.timeSource.now();
      if (!this.isScrolling) {
        this.isPaused = t, this.lastUpdateTime = s;
        return;
      }
      if (t) {
        this.isPaused = !0, this.lastUpdateTime = s;
        return;
      }
      const i = (s - this.lastUpdateTime) / (1e3 / 60);
      this.speed = this.baseSpeed * e, this.x += this.speed * i * this.directionSign, (this.scrollDirection === "rtl" && this.x <= this.exitThreshold || this.scrollDirection === "ltr" && this.x >= this.exitThreshold) && (this.isActive = !1), this.lastUpdateTime = s, this.isPaused = !1;
    } catch (s) {
      J.error("Comment.update", s, {
        text: this.text,
        playbackRate: e,
        isPaused: t,
        isActive: this.isActive
      });
    }
  }
  generateTextureCacheKey() {
    return `v2::${this.text}::${this.fontSize}::${this.fontFamily}::${this.color}::${this.opacity}::${this.renderStyle}::${this.letterSpacing}::${this.lines.length}`;
  }
  // デバッグ用：キャッシュ統計
  static cacheStats = {
    hits: 0,
    misses: 0,
    creates: 0,
    fallbacks: 0,
    strokeCallsInCache: 0,
    fillCallsInCache: 0,
    strokeCallsInFallback: 0,
    fillCallsInFallback: 0,
    letterSpacingComments: 0,
    normalComments: 0,
    multiLineComments: 0,
    totalCharactersDrawn: 0,
    strokeSkippedCount: 0,
    strokeUsedCount: 0,
    smallFontComments: 0,
    largeFontComments: 0,
    lastReported: 0
  };
  static reportCacheStats() {
    if (!E())
      return;
    const e = performance.now();
    if (e - d.cacheStats.lastReported > 5e3) {
      const t = d.cacheStats.hits + d.cacheStats.misses, s = t > 0 ? d.cacheStats.hits / t * 100 : 0, i = d.cacheStats.creates > 0 ? (d.cacheStats.totalCharactersDrawn / d.cacheStats.creates).toFixed(1) : "0", n = d.cacheStats.strokeUsedCount + d.cacheStats.strokeSkippedCount > 0 ? (d.cacheStats.strokeSkippedCount / (d.cacheStats.strokeUsedCount + d.cacheStats.strokeSkippedCount) * 100).toFixed(1) : "0";
      console.log(
        "[TextureCache Stats]",
        `
  Cache: Hits=${d.cacheStats.hits}, Misses=${d.cacheStats.misses}, Hit Rate=${s.toFixed(1)}%`,
        `
  Creates: ${d.cacheStats.creates}, Fallbacks: ${d.cacheStats.fallbacks}`,
        `
  Comments: Normal=${d.cacheStats.normalComments}, LetterSpacing=${d.cacheStats.letterSpacingComments}, MultiLine=${d.cacheStats.multiLineComments}`,
        `
  Font Sizes: Small(<30px)=${d.cacheStats.smallFontComments}, Large(≥30px)=${d.cacheStats.largeFontComments}`,
        `
  Stroke: Used=${d.cacheStats.strokeUsedCount}, Skipped=${d.cacheStats.strokeSkippedCount}, Reduction=${n}%`,
        `
  Draw Calls: StrokeText=${d.cacheStats.strokeCallsInCache + d.cacheStats.strokeCallsInFallback}, FillText=${d.cacheStats.fillCallsInCache + d.cacheStats.fillCallsInFallback}`,
        `
  Avg Characters/Comment: ${i}`
      ), d.cacheStats.lastReported = e;
    }
  }
  isOffscreenCanvasSupported() {
    return typeof OffscreenCanvas < "u";
  }
  createTextureCanvas(e) {
    if (!this.isOffscreenCanvasSupported())
      return null;
    const t = Math.abs(this.letterSpacing) >= Number.EPSILON, s = this.lines.length > 1;
    t && d.cacheStats.letterSpacingComments++, s && d.cacheStats.multiLineComments++, !t && !s && d.cacheStats.normalComments++, d.cacheStats.totalCharactersDrawn += this.text.length, this.fontSize < this.strokeTextThreshold ? d.cacheStats.smallFontComments++ : d.cacheStats.largeFontComments++;
    const i = Math.max(10, this.fontSize * 0.5), n = Math.ceil(this.width + i * 2), a = Math.ceil(this.height + i * 2), r = new OffscreenCanvas(n, a), l = r.getContext("2d");
    if (!l)
      return null;
    l.save(), l.font = `${this.fontSize}px ${this.fontFamily}`;
    const u = D(this.opacity), c = i, f = this.lines.length > 0 ? this.lines : [this.text], h = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, g = i + this.fontSize, p = (b, x, M) => {
      if (b.length === 0)
        return;
      const C = b.match(/^[\u3000\u00A0]+/), S = C ? C[0].length : 0, k = S > 0 ? W(e, C[0]) : 0, R = c + k, F = S > 0 ? b.substring(S) : b;
      if (Math.abs(this.letterSpacing) < Number.EPSILON) {
        M === "stroke" ? (d.cacheStats.strokeCallsInCache++, l.strokeText(F, R, x)) : (d.cacheStats.fillCallsInCache++, l.fillText(F, R, x));
        return;
      }
      let H = R;
      for (let z = 0; z < F.length; z += 1) {
        const _ = F[z];
        M === "stroke" ? (d.cacheStats.strokeCallsInCache++, l.strokeText(_, H, x)) : (d.cacheStats.fillCallsInCache++, l.fillText(_, H, x));
        const U = W(e, _);
        H += U, z < F.length - 1 && (H += this.letterSpacing);
      }
    }, m = this.fontSize >= this.strokeTextThreshold, v = () => {
      if (!m) {
        d.cacheStats.strokeSkippedCount++;
        return;
      }
      d.cacheStats.strokeUsedCount++, l.globalAlpha = u, l.strokeStyle = "#000000", l.lineWidth = Math.max(3, this.fontSize / 8), l.lineJoin = "round", f.forEach((b, x) => {
        const M = g + x * h;
        p(b, M, "stroke");
      }), l.globalAlpha = 1;
    }, y = () => {
      m || (l.shadowColor = "#000000", l.shadowBlur = Math.max(2, this.fontSize * 0.1), l.shadowOffsetX = 0, l.shadowOffsetY = 0), f.forEach((b, x) => {
        const M = g + x * h;
        p(b, M, "fill");
      }), m || (l.shadowColor = "transparent", l.shadowBlur = 0);
    };
    if (v(), this.renderStyle === "classic") {
      const b = Math.max(1, this.fontSize * 0.04), x = this.fontSize * 0.18;
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
      ].forEach((C) => {
        const S = D(C.alpha * u);
        l.shadowColor = `rgba(${C.rgb}, ${S})`, l.shadowBlur = x * C.blurMultiplier, l.shadowOffsetX = b * C.offsetXMultiplier, l.shadowOffsetY = b * C.offsetYMultiplier, l.fillStyle = "rgba(0, 0, 0, 0)", y();
      }), l.shadowColor = "transparent", l.shadowBlur = 0, l.shadowOffsetX = 0, l.shadowOffsetY = 0;
    } else
      l.shadowColor = "transparent", l.shadowBlur = 0, l.shadowOffsetX = 0, l.shadowOffsetY = 0;
    return l.globalAlpha = 1, l.fillStyle = ae(this.color, u), y(), l.restore(), r;
  }
  draw(e, t = null) {
    try {
      if (!this.isActive || !e)
        return;
      const s = this.generateTextureCacheKey();
      if (this.textureCacheKey !== s || !this.cachedTexture ? (d.cacheStats.misses++, d.cacheStats.creates++, this.cachedTexture = this.createTextureCanvas(e), this.textureCacheKey = s) : d.cacheStats.hits++, this.cachedTexture) {
        const g = t ?? this.x, p = Math.max(10, this.fontSize * 0.5);
        e.drawImage(this.cachedTexture, g - p, this.y - p), d.reportCacheStats();
        return;
      }
      d.cacheStats.fallbacks++, e.save(), e.font = `${this.fontSize}px ${this.fontFamily}`;
      const i = D(this.opacity), n = t ?? this.x, a = this.lines.length > 0 ? this.lines : [this.text], r = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, l = this.y + this.fontSize, u = (g, p, m) => {
        if (g.length === 0)
          return;
        const v = g.match(/^[\u3000\u00A0]+/), y = v ? v[0].length : 0, b = y > 0 ? W(e, v[0]) : 0, x = n + b, M = y > 0 ? g.substring(y) : g;
        if (Math.abs(this.letterSpacing) < Number.EPSILON) {
          m === "stroke" ? (d.cacheStats.strokeCallsInFallback++, e.strokeText(M, x, p)) : (d.cacheStats.fillCallsInFallback++, e.fillText(M, x, p));
          return;
        }
        let C = x;
        for (let S = 0; S < M.length; S += 1) {
          const k = M[S];
          m === "stroke" ? (d.cacheStats.strokeCallsInFallback++, e.strokeText(k, C, p)) : (d.cacheStats.fillCallsInFallback++, e.fillText(k, C, p));
          const R = W(e, k);
          C += R, S < M.length - 1 && (C += this.letterSpacing);
        }
      }, c = this.fontSize >= this.strokeTextThreshold, f = () => {
        if (!c) {
          d.cacheStats.strokeSkippedCount++;
          return;
        }
        d.cacheStats.strokeUsedCount++, e.globalAlpha = i, e.strokeStyle = "#000000", e.lineWidth = Math.max(3, this.fontSize / 8), e.lineJoin = "round", a.forEach((g, p) => {
          const m = l + p * r;
          u(g, m, "stroke");
        }), e.globalAlpha = 1;
      }, h = () => {
        c || (e.shadowColor = "#000000", e.shadowBlur = Math.max(2, this.fontSize * 0.1), e.shadowOffsetX = 0, e.shadowOffsetY = 0), a.forEach((g, p) => {
          const m = l + p * r;
          u(g, m, "fill");
        }), c || (e.shadowColor = "transparent", e.shadowBlur = 0);
      };
      if (f(), this.renderStyle === "classic") {
        const g = Math.max(1, this.fontSize * 0.04), p = this.fontSize * 0.18;
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
        ].forEach((v) => {
          const y = D(v.alpha * i);
          e.shadowColor = `rgba(${v.rgb}, ${y})`, e.shadowBlur = p * v.blurMultiplier, e.shadowOffsetX = g * v.offsetXMultiplier, e.shadowOffsetY = g * v.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", h();
        }), e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      } else
        e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      e.globalAlpha = 1, e.fillStyle = ae(this.color, i), h(), e.restore(), d.reportCacheStats();
    } catch (s) {
      J.error("Comment.draw", s, {
        text: this.text,
        isActive: this.isActive,
        hasContext: !!e,
        interpolatedX: t
      });
    }
  }
  syncWithSettings(e, t) {
    typeof t == "number" && t === this.lastSyncedSettingsVersion || (this.color = this.getEffectiveColor(e.commentColor), this.opacity = this.getEffectiveOpacity(e.commentOpacity), this.applyScrollDirection(e.scrollDirection), this.renderStyle = e.renderStyle, this.strokeTextThreshold = e.strokeTextThreshold, typeof t == "number" && (this.lastSyncedSettingsVersion = t));
  }
  getEffectiveColor(e) {
    const t = this.colorOverride ?? e;
    return typeof t != "string" || t.length === 0 ? e : t.toUpperCase();
  }
  getEffectiveOpacity(e) {
    if (typeof this.opacityOverride == "number")
      return D(this.opacityOverride);
    const t = e * this.opacityMultiplier;
    return Number.isFinite(t) ? D(t) : 0;
  }
  markActivated(e) {
    this.activationTimeMs = e;
  }
  clearActivation() {
    this.activationTimeMs = null, this.isScrolling || (this.staticExpiryTimeMs = null), this.cachedTexture = null, this.textureCacheKey = "";
  }
  hasStaticExpired(e) {
    return this.isScrolling || this.staticExpiryTimeMs === null ? !1 : e >= this.staticExpiryTimeMs;
  }
  getDirectionSign() {
    return this.directionSign;
  }
  applyScrollDirection(e) {
    const t = Ne(e);
    this.scrollDirection = t, this.directionSign = He(t);
  }
}
const ze = 4e3, Y = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: ze,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0,
  strokeTextThreshold: 30
}, tt = Y, We = () => ({
  ...Y,
  ngWords: [...Y.ngWords],
  ngRegexps: [...Y.ngRegexps]
}), it = "v2.2.0", O = (o) => o * 1e3, _e = (o) => !Number.isFinite(o) || o < 0 ? null : Math.round(o), ee = 4e3, re = 1800, Xe = 3, $e = 0.25, Be = 32, Ue = 48, j = 120, Ge = 4e3, Z = 120, qe = 800, Ye = 2, X = 4e3, $ = I + ee, Ke = 1e3, oe = 1, le = 12, he = 24, T = 1e-3, V = 50, Je = (o) => Number.isFinite(o) ? o <= 0 ? 0 : o >= 1 ? 1 : o : 1, q = (o) => {
  const e = o.scrollVisibleDurationMs, t = e == null ? null : Number.isFinite(e) ? Math.max(1, Math.floor(e)) : null;
  return {
    ...o,
    scrollDirection: o.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: Je(o.commentOpacity),
    renderStyle: o.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: t,
    syncMode: o.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!o.useDprScaling
  };
}, je = (o) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (e) => window.requestAnimationFrame(e),
  cancel: (e) => window.cancelAnimationFrame(e)
} : {
  request: (e) => globalThis.setTimeout(() => {
    e(o.now());
  }, 16),
  cancel: (e) => {
    globalThis.clearTimeout(e);
  }
}, Ze = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Qe = (o) => {
  if (!o || typeof o != "object")
    return !1;
  const e = o;
  return typeof e.commentColor == "string" && typeof e.commentOpacity == "number" && typeof e.isCommentVisible == "boolean";
};
class st {
  _settings;
  comments = [];
  activeComments = /* @__PURE__ */ new Set();
  reservedLanes = /* @__PURE__ */ new Map();
  topStaticLaneReservations = /* @__PURE__ */ new Map();
  bottomStaticLaneReservations = /* @__PURE__ */ new Map();
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
  laneCount = le;
  laneHeight = 0;
  displayWidth = 0;
  displayHeight = 0;
  canvasDpr = 1;
  currentTime = 0;
  duration = 0;
  playbackRate = 1;
  isPlaying = !0;
  lastDrawTime = 0;
  finalPhaseActive = !1;
  finalPhaseStartTime = null;
  finalPhaseScheduleDirty = !1;
  playbackHasBegun = !1;
  skipDrawingForCurrentFrame = !1;
  finalPhaseVposOverrides = /* @__PURE__ */ new Map();
  frameId = null;
  videoFrameHandle = null;
  resizeObserver = null;
  resizeObserverTarget = null;
  isResizeObserverAvailable = typeof ResizeObserver < "u";
  cleanupTasks = [];
  commentSequence = 0;
  constructor(e = null, t = void 0) {
    let s, i;
    if (Qe(e))
      s = q({ ...e }), i = t ?? {};
    else {
      const n = e ?? t ?? {};
      i = typeof n == "object" ? n : {}, s = q(We());
    }
    this.timeSource = i.timeSource ?? fe(), this.animationFrameProvider = i.animationFrameProvider ?? je(this.timeSource), this.createCanvasElement = i.createCanvasElement ?? Ze(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this._settings = q(s), this.log = ce(i.loggerNamespace ?? "CommentRenderer"), this.rebuildNgMatchers(), i.debug && ke(i.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(e) {
    this._settings = q(e), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
  }
  resolveContainer(e, t) {
    if (e)
      return e;
    if (t.parentElement)
      return t.parentElement;
    if (typeof document < "u" && document.body)
      return document.body;
    throw new Error(
      "Cannot resolve container element. Provide container explicitly when DOM is unavailable."
    );
  }
  ensureContainerPositioning(e) {
    if (typeof getComputedStyle == "function") {
      getComputedStyle(e).position === "static" && (e.style.position = "relative");
      return;
    }
    e.style.position || (e.style.position = "relative");
  }
  initialize(e) {
    try {
      this.destroyCanvasOnly();
      const t = e instanceof HTMLVideoElement ? e : e.video, s = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, i = this.resolveContainer(s ?? null, t);
      this.videoElement = t, this.containerElement = i, this.duration = Number.isFinite(t.duration) ? O(t.duration) : 0, this.currentTime = O(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > V, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
      const n = this.createCanvasElement(), a = n.getContext("2d");
      if (!a)
        throw new Error("Failed to acquire 2D canvas context");
      n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
      const r = this.containerElement;
      r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, i), this.startAnimation(), this.setupVisibilityHandling();
    } catch (t) {
      throw this.log.error("CommentRenderer.initialize", t), t;
    }
  }
  addComments(e) {
    if (!Array.isArray(e) || e.length === 0)
      return [];
    const t = [];
    this.commentDependencies.settingsVersion = this.settingsVersion;
    for (const s of e) {
      const { text: i, vposMs: n, commands: a = [] } = s, r = L(i);
      if (this.isNGComment(i)) {
        w("comment-skip-ng", { preview: r, vposMs: n });
        continue;
      }
      const l = _e(n);
      if (l === null) {
        this.log.warn("CommentRenderer.addComment.invalidVpos", { text: i, vposMs: n }), w("comment-skip-invalid-vpos", { preview: r, vposMs: n });
        continue;
      }
      if (this.comments.some(
        (f) => f.text === i && f.vposMs === l
      ) || t.some(
        (f) => f.text === i && f.vposMs === l
      )) {
        w("comment-skip-duplicate", { preview: r, vposMs: l });
        continue;
      }
      const c = new d(
        i,
        l,
        a,
        this._settings,
        this.commentDependencies
      );
      c.creationIndex = this.commentSequence++, t.push(c), w("comment-added", {
        preview: r,
        vposMs: l,
        commands: c.commands.length,
        layout: c.layout,
        isScrolling: c.isScrolling,
        invisible: c.isInvisible
      });
    }
    return t.length === 0 ? [] : (this.comments.push(...t), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((s, i) => {
      const n = s.vposMs - i.vposMs;
      return Math.abs(n) > T ? n : s.creationIndex - i.creationIndex;
    }), t);
  }
  addComment(e, t, s = []) {
    const [i] = this.addComments([{ text: e, vposMs: t, commands: s }]);
    return i ?? null;
  }
  clearComments() {
    if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear(), this.commentSequence = 0, this.ctx && this.canvas) {
      const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, s = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
      this.ctx.clearRect(0, 0, t, s);
    }
  }
  resetState() {
    this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1;
  }
  destroy() {
    this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1;
  }
  resetFinalPhaseState() {
    this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
  }
  getEffectiveCommentVpos(e) {
    return this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.finalPhaseVposOverrides.get(e) ?? e.vposMs;
  }
  getFinalPhaseDisplayDuration(e) {
    if (!e.isScrolling)
      return I;
    const t = [];
    return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : ee;
  }
  resolveFinalPhaseVpos(e) {
    if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
      return this.finalPhaseVposOverrides.delete(e), e.vposMs;
    this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
    const t = this.finalPhaseVposOverrides.get(e);
    if (t !== void 0)
      return t;
    const s = Math.max(e.vposMs, this.finalPhaseStartTime);
    return this.finalPhaseVposOverrides.set(e, s), s;
  }
  recomputeFinalPhaseTimeline() {
    if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
      this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
      return;
    }
    const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + X, s = Math.max(e + X, t), i = this.comments.filter((c) => c.hasShown || c.isInvisible || this.isNGComment(c.text) ? !1 : c.vposMs >= e - $).sort((c, f) => {
      const h = c.vposMs - f.vposMs;
      return Math.abs(h) > T ? h : c.creationIndex - f.creationIndex;
    });
    if (this.finalPhaseVposOverrides.clear(), i.length === 0) {
      this.finalPhaseScheduleDirty = !1;
      return;
    }
    const a = Math.max(s - e, X) / Math.max(i.length, 1), r = Number.isFinite(a) ? a : Z, l = Math.max(Z, Math.min(r, qe));
    let u = e;
    i.forEach((c, f) => {
      const h = Math.max(1, this.getFinalPhaseDisplayDuration(c)), g = s - h;
      let p = Math.max(e, Math.min(u, g));
      Number.isFinite(p) || (p = e);
      const m = Ye * f;
      p + m <= g && (p += m), this.finalPhaseVposOverrides.set(c, p);
      const v = Math.max(Z, Math.min(h / 2, l));
      u = p + v;
    }), this.finalPhaseScheduleDirty = !1;
  }
  shouldSuppressRendering() {
    return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= V;
  }
  updatePlaybackProgressState() {
    this.playbackHasBegun || (this.isPlaying || this.currentTime > V) && (this.playbackHasBegun = !0);
  }
  updateSettings(e) {
    const t = this._settings.useContainerResizeObserver, s = this._settings.scrollDirection, i = this._settings.useDprScaling, n = this._settings.syncMode;
    this.settings = e;
    const a = s !== this._settings.scrollDirection, r = i !== this._settings.useDprScaling, l = n !== this._settings.syncMode;
    if (this.comments.forEach((u) => {
      u.syncWithSettings(this._settings, this.settingsVersion);
    }), a && this.resetCommentActivity(), !this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((h) => {
        h.isActive = !1, h.clearActivation();
      }), this.activeComments.clear();
      const u = this.canvasDpr > 0 ? this.canvasDpr : 1, c = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / u, f = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / u;
      this.ctx.clearRect(0, 0, c, f), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    }
    t !== this._settings.useContainerResizeObserver && this.videoElement && this.setupResizeHandling(this.videoElement), r && this.resize(), l && this.videoElement && this.startAnimation();
  }
  getVideoElement() {
    return this.videoElement;
  }
  getCurrentVideoSource() {
    const e = this.videoElement;
    if (!e)
      return null;
    if (typeof e.currentSrc == "string" && e.currentSrc.length > 0)
      return e.currentSrc;
    const t = e.getAttribute("src");
    if (t && t.length > 0)
      return t;
    const s = e.querySelector("source[src]");
    return s && typeof s.src == "string" ? s.src : null;
  }
  getCommentsSnapshot() {
    return [...this.comments];
  }
  rebuildNgMatchers() {
    const e = [], t = [], s = Array.isArray(this._settings.ngWords) ? this._settings.ngWords : [];
    for (const n of s) {
      if (typeof n != "string")
        continue;
      const a = n.trim().toLowerCase();
      a.length !== 0 && e.push(a);
    }
    const i = Array.isArray(this._settings.ngRegexps) ? this._settings.ngRegexps : [];
    for (const n of i)
      if (!(typeof n != "string" || n.length === 0))
        try {
          t.push(new RegExp(n));
        } catch (a) {
          this.log.error("CommentRenderer.rebuildNgMatchers.regex", a, {
            pattern: n
          });
        }
    this.normalizedNgWords = e, this.compiledNgRegexps = t;
  }
  isNGComment(e) {
    try {
      if (typeof e != "string")
        return !0;
      if (this.normalizedNgWords.length > 0) {
        const t = e.toLowerCase();
        if (this.normalizedNgWords.some((i) => t.includes(i)))
          return !0;
      }
      return this.compiledNgRegexps.length > 0 ? this.compiledNgRegexps.some((t) => t.test(e)) : !1;
    } catch (t) {
      return this.log.error("CommentRenderer.isNGComment", t, { text: e }), !0;
    }
  }
  resize(e, t) {
    const s = this.videoElement, i = this.canvas, n = this.ctx;
    if (!s || !i)
      return;
    const a = s.getBoundingClientRect(), r = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : i.width / r, u = this.displayHeight > 0 ? this.displayHeight : i.height / r, c = e ?? a.width ?? l, f = t ?? a.height ?? u;
    if (!Number.isFinite(c) || !Number.isFinite(f) || c <= 0 || f <= 0)
      return;
    const h = Math.max(1, Math.floor(c)), g = Math.max(1, Math.floor(f)), p = this.displayWidth > 0 ? this.displayWidth : h, m = this.displayHeight > 0 ? this.displayHeight : g, v = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, y = Math.max(1, Math.round(h * v)), b = Math.max(1, Math.round(g * v));
    if (!(this.displayWidth !== h || this.displayHeight !== g || Math.abs(this.canvasDpr - v) > Number.EPSILON || i.width !== y || i.height !== b))
      return;
    this.displayWidth = h, this.displayHeight = g, this.canvasDpr = v, i.width = y, i.height = b, i.style.width = `${h}px`, i.style.height = `${g}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(v, v));
    const M = p > 0 ? h / p : 1, C = m > 0 ? g / m : 1;
    (M !== 1 || C !== 1) && this.comments.forEach((S) => {
      S.isActive && (S.x *= M, S.y *= C, S.width *= M, S.fontSize = Math.max(
        he,
        Math.floor(Math.max(1, S.fontSize) * C)
      ), S.height = S.fontSize, S.virtualStartX *= M, S.exitThreshold *= M, S.baseSpeed *= M, S.speed *= M, S.speedPixelsPerMs *= M, S.bufferWidth *= M, S.reservationWidth *= M);
    }), this.calculateLaneMetrics();
  }
  resolveDevicePixelRatio() {
    if (typeof window > "u")
      return 1;
    const e = Number(window.devicePixelRatio);
    return !Number.isFinite(e) || e <= 0 ? 1 : e;
  }
  destroyCanvasOnly() {
    this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
  }
  calculateLaneMetrics() {
    const e = this.canvas;
    if (!e)
      return;
    const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), s = Math.max(he, Math.floor(t * 0.05));
    this.laneHeight = s * 1.2;
    const i = Math.floor(t / Math.max(this.laneHeight, 1));
    if (this._settings.useFixedLaneCount) {
      const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : le, a = Math.max(oe, Math.min(i, n));
      this.laneCount = a;
    } else
      this.laneCount = Math.max(oe, i);
    this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
  }
  updateComments(e) {
    const t = this.videoElement, s = this.canvas, i = this.ctx;
    if (!t || !s || !i)
      return;
    const n = typeof e == "number" ? e : O(t.currentTime);
    if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
      return;
    const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : s.width / a, l = this.displayHeight > 0 ? this.displayHeight : s.height / a, u = this.buildPrepareOptions(r), c = this.duration > 0 && this.duration - this.currentTime <= Ge;
    c && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, i.clearRect(0, 0, r, l), this.comments.forEach((h) => {
      h.isActive = !1, h.clearActivation();
    }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear()), !c && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
    const f = this.getCommentsInTimeWindow(this.currentTime, $);
    for (const h of f) {
      const g = E(), p = g ? L(h.text) : "";
      if (g && w("comment-evaluate", {
        stage: "update",
        preview: p,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        currentTime: this.currentTime,
        isActive: h.isActive,
        hasShown: h.hasShown
      }), this.isNGComment(h.text)) {
        g && w("comment-eval-skip", {
          preview: p,
          vposMs: h.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(h),
          reason: "ng-runtime"
        });
        continue;
      }
      if (h.isInvisible) {
        g && w("comment-eval-skip", {
          preview: p,
          vposMs: h.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(h),
          reason: "invisible"
        }), h.isActive = !1, this.activeComments.delete(h), h.hasShown = !0, h.clearActivation();
        continue;
      }
      if (h.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(h, this.currentTime, p) && this.activateComment(
        h,
        i,
        r,
        l,
        u,
        this.currentTime
      ), h.isActive) {
        if (h.layout !== "naka" && h.hasStaticExpired(this.currentTime)) {
          const m = h.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(m, h.lane), h.isActive = !1, this.activeComments.delete(h), h.clearActivation();
          continue;
        }
        if (h.layout === "naka" && this.getEffectiveCommentVpos(h) > this.currentTime + V) {
          h.x = h.virtualStartX, h.lastUpdateTime = this.timeSource.now();
          continue;
        }
        if (h.hasShown = !0, h.update(this.playbackRate, !this.isPlaying), !h.isScrolling && h.hasStaticExpired(this.currentTime)) {
          const m = h.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(m, h.lane), h.isActive = !1, this.activeComments.delete(h), h.clearActivation();
        }
      }
    }
    for (const h of this.comments)
      h.isActive && h.isScrolling && (h.scrollDirection === "rtl" && h.x <= h.exitThreshold || h.scrollDirection === "ltr" && h.x >= h.exitThreshold) && (h.isActive = !1, this.activeComments.delete(h), h.clearActivation());
  }
  buildPrepareOptions(e) {
    const t = this._settings.scrollVisibleDurationMs;
    let s = ee, i = re;
    return t !== null && (s = t, i = Math.max(1, Math.min(t, re))), {
      visibleWidth: e,
      virtualExtension: Ke,
      maxVisibleDurationMs: s,
      minVisibleDurationMs: i,
      maxWidthRatio: Xe,
      bufferRatio: $e,
      baseBufferPx: Be,
      entryBufferPx: Ue
    };
  }
  findAvailableLane(e) {
    const t = this.currentTime;
    this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
    const s = this.getLanePriorityOrder(t), i = this.createLaneReservation(e, t);
    for (const a of s)
      if (this.isLaneAvailable(a, i, t))
        return this.storeLaneReservation(a, i), a;
    const n = s[0] ?? 0;
    return this.storeLaneReservation(n, i), n;
  }
  /**
   * 二分探索で、指定した時刻より後に終了する最初の予約のインデックスを返す
   */
  findFirstValidReservationIndex(e, t) {
    let s = 0, i = e.length;
    for (; s < i; ) {
      const n = Math.floor((s + i) / 2), a = e[n];
      a !== void 0 && a.totalEndTime + j <= t ? s = n + 1 : i = n;
    }
    return s;
  }
  pruneLaneReservations(e) {
    for (const [t, s] of this.reservedLanes.entries()) {
      const i = this.findFirstValidReservationIndex(s, e);
      i >= s.length ? this.reservedLanes.delete(t) : i > 0 && this.reservedLanes.set(t, s.slice(i));
    }
  }
  pruneStaticLaneReservations(e) {
    for (const [t, s] of this.topStaticLaneReservations.entries())
      s <= e && this.topStaticLaneReservations.delete(t);
    for (const [t, s] of this.bottomStaticLaneReservations.entries())
      s <= e && this.bottomStaticLaneReservations.delete(t);
  }
  /**
   * 二分探索で、指定した時刻以上の最初のコメントのインデックスを返す
   */
  findCommentIndexAtOrAfter(e) {
    let t = 0, s = this.comments.length;
    for (; t < s; ) {
      const i = Math.floor((t + s) / 2), n = this.comments[i];
      n !== void 0 && n.vposMs < e ? t = i + 1 : s = i;
    }
    return t;
  }
  /**
   * 指定した時刻範囲内のコメントのみを返す
   */
  getCommentsInTimeWindow(e, t) {
    if (this.comments.length === 0)
      return [];
    const s = e - t, i = e + t, n = this.findCommentIndexAtOrAfter(s), a = [];
    for (let r = n; r < this.comments.length; r++) {
      const l = this.comments[r];
      if (l === void 0 || l.vposMs > i)
        break;
      a.push(l);
    }
    return a;
  }
  getStaticLaneMap(e) {
    return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
  }
  getStaticReservedLaneSet() {
    const e = /* @__PURE__ */ new Set();
    for (const t of this.topStaticLaneReservations.keys())
      e.add(t);
    for (const t of this.bottomStaticLaneReservations.keys())
      e.add(t);
    return e;
  }
  shouldActivateCommentAtTime(e, t, s = "") {
    const i = s.length > 0 && E(), n = this.resolveFinalPhaseVpos(e);
    return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - T ? (i && w("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "final-phase-trimmed",
      finalPhaseStartTime: this.finalPhaseStartTime
    }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (i && w("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "invisible"
    }), !1) : e.isActive ? (i && w("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "already-active"
    }), !1) : n > t + V ? (i && w("comment-eval-pending", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "future",
      currentTime: t
    }), !1) : n < t - $ ? (i && w("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "expired-window",
      currentTime: t
    }), !1) : (i && w("comment-eval-ready", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      currentTime: t
    }), !0);
  }
  activateComment(e, t, s, i, n, a) {
    e.prepare(t, s, i, n);
    const r = this.resolveFinalPhaseVpos(e);
    if (E() && w("comment-prepared", {
      preview: L(e.text),
      layout: e.layout,
      isScrolling: e.isScrolling,
      width: e.width,
      height: e.height,
      bufferWidth: e.bufferWidth,
      visibleDurationMs: e.visibleDurationMs,
      effectiveVposMs: r
    }), e.layout === "naka") {
      const f = Math.max(0, a - r), h = e.speedPixelsPerMs * f;
      if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
        const b = this.duration > 0 ? this.duration : this.finalPhaseStartTime + X, x = Math.max(
          this.finalPhaseStartTime + X,
          b
        ), M = Math.abs(e.exitThreshold - e.virtualStartX), C = x - r;
        if (C > 0 && M > 0) {
          const S = M / C;
          S > e.speedPixelsPerMs && (e.speedPixelsPerMs = S, e.baseSpeed = S * (1e3 / 60), e.speed = e.baseSpeed, e.totalDurationMs = Math.ceil(M / S));
        }
      }
      const g = e.getDirectionSign(), p = e.virtualStartX + g * h, m = e.exitThreshold, v = e.scrollDirection;
      if (v === "rtl" && p <= m || v === "ltr" && p >= m) {
        e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation(), e.lane = -1, E() && w("comment-skip-exited", {
          preview: L(e.text),
          vposMs: e.vposMs,
          effectiveVposMs: r,
          referenceTime: a
        });
        return;
      }
      e.lane = this.findAvailableLane(e), e.y = e.lane * this.laneHeight, e.x = p, e.isActive = !0, this.activeComments.add(e), e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), E() && w("comment-activate-scroll", {
        preview: L(e.text),
        lane: e.lane,
        startX: e.x,
        width: e.width,
        visibleDurationMs: e.visibleDurationMs,
        effectiveVposMs: r
      });
      return;
    }
    const l = r + I;
    if (a > l) {
      e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation(), e.lane = -1, E() && w("comment-skip-expired", {
        preview: L(e.text),
        vposMs: e.vposMs,
        effectiveVposMs: r,
        referenceTime: a,
        displayEnd: l
      });
      return;
    }
    const u = e.layout === "ue" ? "ue" : "shita", c = this.assignStaticLane(u);
    e.lane = c, e.y = c * this.laneHeight, e.x = e.virtualStartX, e.isActive = !0, this.activeComments.add(e), e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = l, this.reserveStaticLane(u, c, l), E() && w("comment-activate-static", {
      preview: L(e.text),
      lane: e.lane,
      position: u,
      displayEnd: l,
      effectiveVposMs: r
    });
  }
  assignStaticLane(e) {
    const t = this.getStaticLaneMap(e), s = Array.from({ length: this.laneCount }, (a, r) => r);
    e === "shita" && s.reverse();
    for (const a of s)
      if (!t.has(a))
        return a;
    let i = s[0] ?? 0, n = Number.POSITIVE_INFINITY;
    for (const [a, r] of t.entries())
      r < n && (n = r, i = a);
    return i;
  }
  reserveStaticLane(e, t, s) {
    this.getStaticLaneMap(e).set(t, s);
  }
  releaseStaticLane(e, t) {
    if (t < 0)
      return;
    this.getStaticLaneMap(e).delete(t);
  }
  getLanePriorityOrder(e) {
    const s = Array.from({ length: this.laneCount }, (r, l) => l).sort((r, l) => {
      const u = this.getLaneNextAvailableTime(r, e), c = this.getLaneNextAvailableTime(l, e);
      return Math.abs(u - c) <= T ? r - l : u - c;
    }), i = this.getStaticReservedLaneSet();
    if (i.size === 0)
      return s;
    const n = s.filter((r) => !i.has(r));
    if (n.length === 0)
      return s;
    const a = s.filter((r) => i.has(r));
    return [...n, ...a];
  }
  getLaneNextAvailableTime(e, t) {
    const s = this.reservedLanes.get(e);
    if (!s || s.length === 0)
      return t;
    const i = this.findFirstValidReservationIndex(s, t);
    let n = t;
    for (let a = i; a < s.length; a++) {
      const r = s[a];
      r !== void 0 && (n = Math.max(n, r.endTime));
    }
    return n;
  }
  createLaneReservation(e, t) {
    const s = Math.max(e.speedPixelsPerMs, T), i = this.getEffectiveCommentVpos(e), n = Number.isFinite(i) ? i : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + j, l = a + e.totalDurationMs + j;
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
  }
  isLaneAvailable(e, t, s) {
    const i = this.reservedLanes.get(e);
    if (!i || i.length === 0)
      return !0;
    const n = this.findFirstValidReservationIndex(i, s);
    for (let a = n; a < i.length; a++) {
      const r = i[a];
      if (r === void 0)
        break;
      if (this.areReservationsConflicting(r, t))
        return !1;
    }
    return !0;
  }
  storeLaneReservation(e, t) {
    const i = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
    this.reservedLanes.set(e, i);
  }
  areReservationsConflicting(e, t) {
    const s = Math.max(e.startTime, t.startTime), i = Math.min(e.endTime, t.endTime);
    if (s >= i)
      return !1;
    const n = /* @__PURE__ */ new Set([
      s,
      i,
      s + (i - s) / 2
    ]), a = this.solveLeftRightEqualityTime(e, t);
    a !== null && a >= s - T && a <= i + T && n.add(a);
    const r = this.solveLeftRightEqualityTime(t, e);
    r !== null && r >= s - T && r <= i + T && n.add(r);
    for (const l of n) {
      if (l < s - T || l > i + T)
        continue;
      const u = this.computeForwardGap(e, t, l), c = this.computeForwardGap(t, e, l);
      if (u <= T && c <= T)
        return !0;
    }
    return !1;
  }
  computeForwardGap(e, t, s) {
    const i = this.getBufferedEdges(e, s), n = this.getBufferedEdges(t, s);
    return i.left - n.right;
  }
  getBufferedEdges(e, t) {
    const s = Math.max(0, t - e.startTime), i = e.speed * s, n = e.startLeft + e.directionSign * i, a = n - e.buffer, r = n + e.width + e.buffer;
    return { left: a, right: r };
  }
  solveLeftRightEqualityTime(e, t) {
    const s = e.directionSign, i = t.directionSign, n = i * t.speed - s * e.speed;
    if (Math.abs(n) < T)
      return null;
    const r = (t.startLeft + i * t.speed * t.startTime + t.width + t.buffer - e.startLeft - s * e.speed * e.startTime + e.buffer) / n;
    return Number.isFinite(r) ? r : null;
  }
  draw() {
    const e = this.canvas, t = this.ctx;
    if (!e || !t)
      return;
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, i = this.displayWidth > 0 ? this.displayWidth : e.width / s, n = this.displayHeight > 0 ? this.displayHeight : e.height / s, a = this.timeSource.now();
    if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering()) {
      t.clearRect(0, 0, i, n), this.lastDrawTime = a;
      return;
    }
    t.clearRect(0, 0, i, n);
    const r = Array.from(this.activeComments);
    if (this._settings.isCommentVisible) {
      const l = (a - this.lastDrawTime) / 16.666666666666668;
      r.sort((u, c) => {
        const f = this.getEffectiveCommentVpos(u), h = this.getEffectiveCommentVpos(c), g = f - h;
        return Math.abs(g) > T ? g : u.isScrolling !== c.isScrolling ? u.isScrolling ? 1 : -1 : u.creationIndex - c.creationIndex;
      }), r.forEach((u) => {
        const f = this.isPlaying && !u.isPaused ? u.x + u.getDirectionSign() * u.speed * l : u.x;
        u.draw(t, f);
      });
    }
    this.lastDrawTime = a;
  }
  processFrame(e) {
    this.videoElement && this._settings.isCommentVisible && (this.updateComments(e), this.draw());
  }
  handleAnimationFrame = () => {
    const e = this.frameId;
    this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
  };
  handleVideoFrame = (e, t) => {
    this.videoFrameHandle = null;
    const s = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
    this.processFrame(typeof s == "number" ? s : void 0), this.scheduleNextFrame();
  };
  shouldUseVideoFrameCallback() {
    if (this._settings.syncMode !== "video-frame")
      return !1;
    const e = this.videoElement;
    return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
  }
  scheduleNextFrame() {
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
  }
  cancelAnimationFrameRequest() {
    this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
  }
  cancelVideoFrameCallback() {
    if (this.videoFrameHandle === null)
      return;
    const e = this.videoElement;
    e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
  }
  startAnimation() {
    this.stopAnimation(), this.scheduleNextFrame();
  }
  stopAnimation() {
    this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
  }
  onSeek() {
    const e = this.canvas, t = this.ctx, s = this.videoElement;
    if (!e || !t || !s)
      return;
    const i = O(s.currentTime);
    this.currentTime = i, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    const n = this.canvasDpr > 0 ? this.canvasDpr : 1, a = this.displayWidth > 0 ? this.displayWidth : e.width / n, r = this.displayHeight > 0 ? this.displayHeight : e.height / n, l = this.buildPrepareOptions(a);
    this.getCommentsInTimeWindow(this.currentTime, $).forEach((c) => {
      const f = E(), h = f ? L(c.text) : "";
      if (f && w("comment-evaluate", {
        stage: "seek",
        preview: h,
        vposMs: c.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(c),
        currentTime: this.currentTime,
        isActive: c.isActive,
        hasShown: c.hasShown
      }), this.isNGComment(c.text)) {
        f && w("comment-eval-skip", {
          preview: h,
          vposMs: c.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(c),
          reason: "ng-runtime"
        }), c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
        return;
      }
      if (c.isInvisible) {
        f && w("comment-eval-skip", {
          preview: h,
          vposMs: c.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(c),
          reason: "invisible"
        }), c.isActive = !1, this.activeComments.delete(c), c.hasShown = !0, c.clearActivation();
        return;
      }
      if (c.syncWithSettings(this._settings, this.settingsVersion), c.isActive = !1, this.activeComments.delete(c), c.lane = -1, c.clearActivation(), this.shouldActivateCommentAtTime(c, this.currentTime, h)) {
        this.activateComment(
          c,
          t,
          a,
          r,
          l,
          this.currentTime
        );
        return;
      }
      this.getEffectiveCommentVpos(c) < this.currentTime - $ ? c.hasShown = !0 : c.hasShown = !1;
    }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
  }
  setupVideoEventListeners(e) {
    try {
      const t = () => {
        this.isPlaying = !0, this.playbackHasBegun = !0;
        const c = this.timeSource.now();
        this.lastDrawTime = c, this.comments.forEach((f) => {
          f.lastUpdateTime = c, f.isPaused = !1;
        });
      }, s = () => {
        this.isPlaying = !1;
        const c = this.timeSource.now();
        this.comments.forEach((f) => {
          f.lastUpdateTime = c, f.isPaused = !0;
        });
      }, i = () => {
        this.onSeek();
      }, n = () => {
        this.onSeek();
      }, a = () => {
        this.playbackRate = e.playbackRate;
        const c = this.timeSource.now();
        this.comments.forEach((f) => {
          f.lastUpdateTime = c;
        });
      }, r = () => {
        this.handleVideoMetadataLoaded(e);
      }, l = () => {
        this.duration = Number.isFinite(e.duration) ? O(e.duration) : 0;
      }, u = () => {
        this.handleVideoSourceChange();
      };
      e.addEventListener("play", t), e.addEventListener("pause", s), e.addEventListener("seeking", i), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", l), e.addEventListener("emptied", u), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", s)), this.addCleanup(() => e.removeEventListener("seeking", i)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", u));
    } catch (t) {
      throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
    }
  }
  handleVideoMetadataLoaded(e) {
    this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek();
  }
  handleVideoSourceChange(e) {
    const t = e ?? this.videoElement;
    if (!t) {
      this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
      return;
    }
    this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity();
  }
  syncVideoState(e) {
    this.duration = Number.isFinite(e.duration) ? O(e.duration) : 0, this.currentTime = O(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.playbackHasBegun = this.isPlaying || this.currentTime > V, this.lastDrawTime = this.timeSource.now();
  }
  resetCommentActivity() {
    const e = this.timeSource.now(), t = this.canvas, s = this.ctx;
    if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > V, t && s) {
      const i = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / i, a = this.displayHeight > 0 ? this.displayHeight : t.height / i;
      s.clearRect(0, 0, n, a);
    }
    this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear(), this.comments.forEach((i) => {
      i.isActive = !1, i.isPaused = !this.isPlaying, i.hasShown = !1, i.lane = -1, i.x = i.virtualStartX, i.speed = i.baseSpeed, i.lastUpdateTime = e, i.clearActivation();
    }), this.activeComments.clear();
  }
  setupVideoChangeDetection(e, t) {
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
  }
  extractVideoElement(e) {
    if (e instanceof HTMLVideoElement)
      return e;
    if (e instanceof Element) {
      const t = e.querySelector("video");
      if (t instanceof HTMLVideoElement)
        return t;
    }
    return null;
  }
  setupVisibilityHandling() {
    if (typeof document > "u" || typeof document.addEventListener != "function" || typeof document.removeEventListener != "function")
      return;
    const e = () => {
      if (document.visibilityState !== "visible") {
        this.stopAnimation();
        return;
      }
      this._settings.isCommentVisible && this.startAnimation();
    };
    document.addEventListener("visibilitychange", e), this.addCleanup(() => document.removeEventListener("visibilitychange", e)), document.visibilityState !== "visible" && this.stopAnimation();
  }
  setupResizeHandling(e) {
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
  }
  cleanupResizeHandling() {
    this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
  }
  setupFullscreenHandling() {
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
  }
  resolveResizeObserverTarget(e) {
    const t = this.resolveFullscreenContainer(e);
    return t || (e.parentElement ?? e);
  }
  async handleFullscreenChange() {
    const e = this.canvas, t = this.videoElement;
    if (!e || !t)
      return;
    const s = this.containerElement ?? t.parentElement ?? null, i = this.getFullscreenElement(), n = this.resolveActiveOverlayContainer(
      t,
      s,
      i
    );
    if (!(n instanceof HTMLElement))
      return;
    e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
    const r = (i instanceof HTMLElement && i.contains(t) ? i : null) !== null;
    this.fullscreenActive !== r && (this.fullscreenActive = r, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
  }
  resolveFullscreenContainer(e) {
    const t = this.getFullscreenElement();
    return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
  }
  resolveActiveOverlayContainer(e, t, s) {
    return s instanceof HTMLElement && s.contains(e) ? s instanceof HTMLVideoElement && t instanceof HTMLElement ? t : s : t ?? null;
  }
  getFullscreenElement() {
    if (typeof document > "u")
      return null;
    const e = document;
    return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
  }
  addCleanup(e) {
    this.cleanupTasks.push(e);
  }
  runCleanupTasks() {
    for (; this.cleanupTasks.length > 0; ) {
      const e = this.cleanupTasks.pop();
      try {
        e?.();
      } catch (t) {
        this.log.error("CommentRenderer.cleanupTask", t);
      }
    }
  }
}
export {
  it as COMMENT_OVERLAY_VERSION,
  d as Comment,
  st as CommentRenderer,
  tt as DEFAULT_RENDERER_SETTINGS,
  We as cloneDefaultSettings,
  ke as configureDebugLogging,
  je as createDefaultAnimationFrameProvider,
  fe as createDefaultTimeSource,
  ce as createLogger,
  w as debugLog,
  E as isDebugLoggingEnabled,
  et as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.map
