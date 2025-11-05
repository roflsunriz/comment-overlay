const ee = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, ve = (o, e, t) => {
  const s = [`[${e}]`, ...t];
  switch (o) {
    case "debug":
      console.debug(...s);
      break;
    case "info":
      console.info(...s);
      break;
    case "warn":
      console.warn(...s);
      break;
    case "error":
      console.error(...s);
      break;
    default:
      console.log(...s);
  }
}, oe = (o, e = {}) => {
  const { level: t = "info", emitter: i = ve } = e, s = ee[t], r = (n, a) => {
    ee[n] < s || i(n, o, a);
  };
  return {
    debug: (...n) => r("debug", n),
    info: (...n) => r("info", n),
    warn: (...n) => r("warn", n),
    error: (...n) => r("error", n)
  };
}, me = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, ge = {
  defont: '"MS PGothic","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic Pro","Yu Gothic UI","Yu Gothic","Meiryo","Segoe UI","Osaka","Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","IPAPGothic","TakaoPGothic","Roboto","Helvetica Neue","Helvetica","Arial","sans-serif"',
  gothic: '"Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","Yu Gothic","Yu Gothic Medium","Meiryo","MS PGothic","Hiragino Kaku Gothic ProN","Segoe UI","Helvetica","Arial","sans-serif"',
  mincho: '"MS PMincho","MS Mincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Times New Roman","serif"'
}, le = {
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
}, j = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Se = /^[,.:;]+/, Me = /[,.:;]+$/, ye = (o) => {
  const e = o.trim();
  return e ? j.test(e) ? e : e.replace(Se, "").replace(Me, "") : "";
}, be = (o) => j.test(o) ? o.toUpperCase() : null, he = (o) => {
  const e = o.trim();
  if (!e)
    return null;
  const t = e.toLowerCase().endsWith("px") ? e.slice(0, -2) : e, i = Number.parseFloat(t);
  return Number.isFinite(i) ? i : null;
}, Ce = (o) => {
  const e = o.trim();
  if (!e)
    return null;
  if (e.endsWith("%")) {
    const t = Number.parseFloat(e.slice(0, -1));
    return Number.isFinite(t) ? t / 100 : null;
  }
  return he(e);
}, xe = (o) => Number.isFinite(o) ? Math.min(100, Math.max(-100, o)) : 0, we = (o) => !Number.isFinite(o) || o === 0 ? 1 : Math.min(5, Math.max(0.25, o)), Te = (o) => o === "naka" || o === "ue" || o === "shita", Ee = (o) => o === "small" || o === "medium" || o === "big", Pe = (o) => o === "defont" || o === "gothic" || o === "mincho", Fe = (o) => o in le, Le = (o, e) => {
  let t = "naka", i = "medium", s = "defont", r = null, n = 1, a = null, c = !1, u = 0, h = 1;
  for (const m of o) {
    const d = ye(typeof m == "string" ? m : "");
    if (!d)
      continue;
    if (j.test(d)) {
      const M = be(d);
      if (M) {
        r = M;
        continue;
      }
    }
    const f = d.toLowerCase();
    if (Te(f)) {
      t = f;
      continue;
    }
    if (Ee(f)) {
      i = f;
      continue;
    }
    if (Pe(f)) {
      s = f;
      continue;
    }
    if (Fe(f)) {
      r = le[f].toUpperCase();
      continue;
    }
    if (f === "_live") {
      a = 0.5;
      continue;
    }
    if (f === "invisible") {
      n = 0, c = !0;
      continue;
    }
    if (f.startsWith("ls:") || f.startsWith("letterspacing:")) {
      const M = d.indexOf(":");
      if (M >= 0) {
        const S = he(d.slice(M + 1));
        S !== null && (u = xe(S));
      }
      continue;
    }
    if (f.startsWith("lh:") || f.startsWith("lineheight:")) {
      const M = d.indexOf(":");
      if (M >= 0) {
        const S = Ce(d.slice(M + 1));
        S !== null && (h = we(S));
      }
      continue;
    }
  }
  const p = Math.max(0, Math.min(1, n)), l = (r ?? e.defaultColor).toUpperCase(), v = typeof a == "number" ? Math.max(0, Math.min(1, a)) : null;
  return {
    layout: t,
    size: i,
    sizeScale: me[i],
    font: s,
    fontFamily: ge[s],
    resolvedColor: l,
    colorOverride: r,
    opacityMultiplier: p,
    opacityOverride: v,
    isInvisible: c,
    letterSpacing: u,
    lineHeight: h
  };
}, $ = oe("CommentEngine:Comment"), te = /* @__PURE__ */ new WeakMap(), Ae = (o) => {
  let e = te.get(o);
  return e || (e = /* @__PURE__ */ new Map(), te.set(o, e)), e;
}, _ = (o, e) => {
  if (!o)
    return 0;
  const i = `${o.font ?? ""}::${e}`, s = Ae(o), r = s.get(i);
  if (r !== void 0)
    return r;
  const n = o.measureText(e).width;
  return s.set(i, n), n;
}, O = 4e3, De = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, A = (o) => !Number.isFinite(o) || o <= 0 ? 0 : o >= 1 ? 1 : o, W = (o) => o.length === 1 ? o.repeat(2) : o, P = (o) => Number.parseInt(o, 16), ie = (o, e) => {
  const t = De.exec(o);
  if (!t)
    return o;
  const i = t[1];
  let s, r, n, a = 1;
  i.length === 3 || i.length === 4 ? (s = P(W(i[0])), r = P(W(i[1])), n = P(W(i[2])), i.length === 4 && (a = P(W(i[3])) / 255)) : (s = P(i.slice(0, 2)), r = P(i.slice(2, 4)), n = P(i.slice(4, 6)), i.length === 8 && (a = P(i.slice(6, 8)) / 255));
  const c = A(a * A(e));
  return `rgba(${s}, ${r}, ${n}, ${c})`;
}, Re = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), ce = () => Re(), Ve = (o) => o === "ltr" ? "ltr" : "rtl", Oe = (o) => o === "ltr" ? 1 : -1;
class Ne {
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
  directionSign = -1;
  timeSource;
  lastSyncedSettingsVersion = -1;
  cachedTexture = null;
  textureCacheKey = "";
  constructor(e, t, i, s, r = {}) {
    if (typeof e != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(t) || t < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = e, this.vposMs = t, this.commands = Array.isArray(i) ? [...i] : [];
    const n = Le(this.commands, {
      defaultColor: s.commentColor
    });
    this.layout = n.layout, this.isScrolling = this.layout === "naka", this.sizeScale = n.sizeScale, this.opacityMultiplier = n.opacityMultiplier, this.opacityOverride = n.opacityOverride, this.colorOverride = n.colorOverride, this.isInvisible = n.isInvisible, this.fontFamily = n.fontFamily, this.color = n.resolvedColor, this.opacity = this.getEffectiveOpacity(s.commentOpacity), this.renderStyle = s.renderStyle, this.letterSpacing = n.letterSpacing, this.lineHeightMultiplier = n.lineHeight, this.timeSource = r.timeSource ?? ce(), this.applyScrollDirection(s.scrollDirection), this.syncWithSettings(s, r.settingsVersion);
  }
  prepare(e, t, i, s) {
    try {
      if (!e)
        throw new Error("Canvas context is required");
      if (!Number.isFinite(t) || !Number.isFinite(i))
        throw new Error("Canvas dimensions must be numbers");
      if (!s)
        throw new Error("Prepare options are required");
      const r = Math.max(t, 1), n = Math.max(24, Math.floor(i * 0.05)), a = Math.max(24, Math.floor(n * this.sizeScale));
      this.fontSize = a, e.font = `${this.fontSize}px ${this.fontFamily}`;
      const c = this.text.includes(`
`) ? this.text.split(/\r?\n/) : [this.text];
      this.lines = c.length > 0 ? c : [""];
      let u = 0;
      const h = this.letterSpacing;
      for (const E of this.lines) {
        const G = _(e, E), pe = E.length > 1 ? h * (E.length - 1) : 0, Q = Math.max(0, G + pe);
        Q > u && (u = Q);
      }
      this.width = u;
      const p = Math.max(
        1,
        Math.floor(this.fontSize * this.lineHeightMultiplier)
      );
      if (this.lineHeightPx = p, this.height = this.fontSize + (this.lines.length > 1 ? (this.lines.length - 1) * p : 0), !this.isScrolling) {
        this.bufferWidth = 0;
        const E = Math.max((r - this.width) / 2, 0);
        this.virtualStartX = E, this.x = E, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = O, this.preCollisionDurationMs = O, this.totalDurationMs = O, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vposMs + O, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const l = _(e, "??".repeat(150)), v = this.width * Math.max(s.bufferRatio, 0);
      this.bufferWidth = Math.max(s.baseBufferPx, v);
      const m = Math.max(s.entryBufferPx, this.bufferWidth), d = this.scrollDirection, f = d === "rtl" ? r + s.virtualExtension : -this.width - this.bufferWidth - s.virtualExtension, M = d === "rtl" ? -this.width - this.bufferWidth - m : r + m, S = d === "rtl" ? r + m : -m, C = d === "rtl" ? f + this.width + this.bufferWidth : f - this.bufferWidth;
      this.virtualStartX = f, this.x = f, this.exitThreshold = M;
      const y = r > 0 ? this.width / r : 0, x = s.maxVisibleDurationMs === s.minVisibleDurationMs;
      let g = s.maxVisibleDurationMs;
      if (!x && y > 1) {
        const E = Math.min(y, s.maxWidthRatio), G = s.maxVisibleDurationMs / Math.max(E, 1);
        g = Math.max(s.minVisibleDurationMs, Math.floor(G));
      }
      const T = r + this.width + this.bufferWidth + m, k = Math.max(g, 1), D = T / k, U = D * 1e3 / 60;
      this.baseSpeed = U, this.speed = this.baseSpeed, this.speedPixelsPerMs = D;
      const ue = Math.abs(M - f), de = d === "rtl" ? Math.max(0, C - S) : Math.max(0, S - C), Z = Math.max(D, Number.EPSILON);
      this.visibleDurationMs = g, this.preCollisionDurationMs = Math.max(0, Math.ceil(de / Z)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(ue / Z)
      );
      const fe = this.width + this.bufferWidth + m;
      this.reservationWidth = Math.min(l, fe), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
    } catch (r) {
      throw $.error("Comment.prepare", r, {
        text: this.text,
        visibleWidth: t,
        canvasHeight: i,
        hasContext: !!e
      }), r;
    }
  }
  update(e = 1, t = !1) {
    try {
      if (!this.isActive) {
        this.isPaused = t;
        return;
      }
      const i = this.timeSource.now();
      if (!this.isScrolling) {
        this.isPaused = t, this.lastUpdateTime = i;
        return;
      }
      if (t) {
        this.isPaused = !0, this.lastUpdateTime = i;
        return;
      }
      const s = (i - this.lastUpdateTime) / (1e3 / 60);
      this.speed = this.baseSpeed * e, this.x += this.speed * s * this.directionSign, (this.scrollDirection === "rtl" && this.x <= this.exitThreshold || this.scrollDirection === "ltr" && this.x >= this.exitThreshold) && (this.isActive = !1), this.lastUpdateTime = i, this.isPaused = !1;
    } catch (i) {
      $.error("Comment.update", i, {
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
  isOffscreenCanvasSupported() {
    return typeof OffscreenCanvas < "u";
  }
  createTextureCanvas(e) {
    if (!this.isOffscreenCanvasSupported())
      return null;
    const t = Math.max(10, this.fontSize * 0.5), i = Math.ceil(this.width + t * 2), s = Math.ceil(this.height + t * 2), r = new OffscreenCanvas(i, s), n = r.getContext("2d");
    if (!n)
      return null;
    n.save(), n.font = `${this.fontSize}px ${this.fontFamily}`;
    const a = A(this.opacity), c = t, u = this.lines.length > 0 ? this.lines : [this.text], h = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, p = t + this.fontSize, l = (d, f, M) => {
      if (d.length === 0)
        return;
      const S = d.match(/^[\u3000\u00A0]+/), C = S ? S[0].length : 0, y = C > 0 ? _(e, S[0]) : 0, x = c + y, g = C > 0 ? d.substring(C) : d;
      if (Math.abs(this.letterSpacing) < Number.EPSILON) {
        M === "stroke" ? n.strokeText(g, x, f) : n.fillText(g, x, f);
        return;
      }
      let T = x;
      for (let k = 0; k < g.length; k += 1) {
        const D = g[k];
        M === "stroke" ? n.strokeText(D, T, f) : n.fillText(D, T, f);
        const U = _(e, D);
        T += U, k < g.length - 1 && (T += this.letterSpacing);
      }
    }, v = () => {
      n.globalAlpha = a, n.strokeStyle = "#000000", n.lineWidth = Math.max(3, this.fontSize / 8), n.lineJoin = "round", u.forEach((d, f) => {
        const M = p + f * h;
        l(d, M, "stroke");
      }), n.globalAlpha = 1;
    }, m = () => {
      u.forEach((d, f) => {
        const M = p + f * h;
        l(d, M, "fill");
      });
    };
    if (v(), this.renderStyle === "classic") {
      const d = Math.max(1, this.fontSize * 0.04), f = this.fontSize * 0.18;
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
      ].forEach((S) => {
        const C = A(S.alpha * a);
        n.shadowColor = `rgba(${S.rgb}, ${C})`, n.shadowBlur = f * S.blurMultiplier, n.shadowOffsetX = d * S.offsetXMultiplier, n.shadowOffsetY = d * S.offsetYMultiplier, n.fillStyle = "rgba(0, 0, 0, 0)", m();
      }), n.shadowColor = "transparent", n.shadowBlur = 0, n.shadowOffsetX = 0, n.shadowOffsetY = 0;
    } else
      n.shadowColor = "transparent", n.shadowBlur = 0, n.shadowOffsetX = 0, n.shadowOffsetY = 0;
    return n.globalAlpha = 1, n.fillStyle = ie(this.color, a), m(), n.restore(), r;
  }
  draw(e, t = null) {
    try {
      if (!this.isActive || !e)
        return;
      const i = this.generateTextureCacheKey();
      if ((this.textureCacheKey !== i || !this.cachedTexture) && (this.cachedTexture = this.createTextureCanvas(e), this.textureCacheKey = i), this.cachedTexture) {
        const l = t ?? this.x, v = Math.max(10, this.fontSize * 0.5);
        e.drawImage(this.cachedTexture, l - v, this.y - v);
        return;
      }
      e.save(), e.font = `${this.fontSize}px ${this.fontFamily}`;
      const s = A(this.opacity), r = t ?? this.x, n = this.lines.length > 0 ? this.lines : [this.text], a = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, c = this.y + this.fontSize, u = (l, v, m) => {
        if (l.length === 0)
          return;
        const d = l.match(/^[\u3000\u00A0]+/), f = d ? d[0].length : 0, M = f > 0 ? _(e, d[0]) : 0, S = r + M, C = f > 0 ? l.substring(f) : l;
        if (Math.abs(this.letterSpacing) < Number.EPSILON) {
          m === "stroke" ? e.strokeText(C, S, v) : e.fillText(C, S, v);
          return;
        }
        let y = S;
        for (let x = 0; x < C.length; x += 1) {
          const g = C[x];
          m === "stroke" ? e.strokeText(g, y, v) : e.fillText(g, y, v);
          const T = _(e, g);
          y += T, x < C.length - 1 && (y += this.letterSpacing);
        }
      }, h = () => {
        e.globalAlpha = s, e.strokeStyle = "#000000", e.lineWidth = Math.max(3, this.fontSize / 8), e.lineJoin = "round", n.forEach((l, v) => {
          const m = c + v * a;
          u(l, m, "stroke");
        }), e.globalAlpha = 1;
      }, p = () => {
        n.forEach((l, v) => {
          const m = c + v * a;
          u(l, m, "fill");
        });
      };
      if (h(), this.renderStyle === "classic") {
        const l = Math.max(1, this.fontSize * 0.04), v = this.fontSize * 0.18;
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
        ].forEach((d) => {
          const f = A(d.alpha * s);
          e.shadowColor = `rgba(${d.rgb}, ${f})`, e.shadowBlur = v * d.blurMultiplier, e.shadowOffsetX = l * d.offsetXMultiplier, e.shadowOffsetY = l * d.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", p();
        }), e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      } else
        e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      e.globalAlpha = 1, e.fillStyle = ie(this.color, s), p(), e.restore();
    } catch (i) {
      $.error("Comment.draw", i, {
        text: this.text,
        isActive: this.isActive,
        hasContext: !!e,
        interpolatedX: t
      });
    }
  }
  syncWithSettings(e, t) {
    typeof t == "number" && t === this.lastSyncedSettingsVersion || (this.color = this.getEffectiveColor(e.commentColor), this.opacity = this.getEffectiveOpacity(e.commentOpacity), this.applyScrollDirection(e.scrollDirection), this.renderStyle = e.renderStyle, typeof t == "number" && (this.lastSyncedSettingsVersion = t));
  }
  getEffectiveColor(e) {
    const t = this.colorOverride ?? e;
    return typeof t != "string" || t.length === 0 ? e : t.toUpperCase();
  }
  getEffectiveOpacity(e) {
    if (typeof this.opacityOverride == "number")
      return A(this.opacityOverride);
    const t = e * this.opacityMultiplier;
    return Number.isFinite(t) ? A(t) : 0;
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
    const t = Ve(e);
    this.scrollDirection = t, this.directionSign = Oe(t);
  }
}
const ke = 4e3, B = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: ke,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0
}, et = B, _e = () => ({
  ...B,
  ngWords: [...B.ngWords],
  ngRegexps: [...B.ngRegexps]
}), tt = "v1.1.0", K = 5, N = {
  enabled: !1,
  maxLogsPerCategory: K
}, z = /* @__PURE__ */ new Map(), He = (o) => {
  if (o === void 0 || !Number.isFinite(o))
    return K;
  const e = Math.max(1, Math.floor(o));
  return Math.min(1e4, e);
}, Ie = (o) => {
  N.enabled = !!o.enabled, N.maxLogsPerCategory = He(o.maxLogsPerCategory), N.enabled || z.clear();
}, it = () => {
  z.clear();
}, F = () => N.enabled, ze = (o) => {
  const e = z.get(o) ?? 0;
  return e >= N.maxLogsPerCategory ? (e === N.maxLogsPerCategory && (console.debug(`[CommentOverlay][${o}]`, "Further logs suppressed."), z.set(o, e + 1)), !1) : (z.set(o, e + 1), !0);
}, b = (o, ...e) => {
  N.enabled && ze(o) && console.debug(`[CommentOverlay][${o}]`, ...e);
}, L = (o, e = 32) => o.length <= e ? o : `${o.slice(0, e)}…`, R = (o) => o * 1e3, We = (o) => !Number.isFinite(o) || o < 0 ? null : Math.round(o), J = 4e3, se = 1800, Xe = 3, Be = 0.25, Ue = 32, Ge = 48, q = 120, $e = 4e3, Y = 120, qe = 800, Ye = 2, H = 4e3, I = O + J, Ke = 1e3, ne = 1, re = 12, ae = 24, w = 1e-3, V = 50, Je = (o) => Number.isFinite(o) ? o <= 0 ? 0 : o >= 1 ? 1 : o : 1, X = (o) => {
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
  laneCount = re;
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
    let i, s;
    if (Qe(e))
      i = X({ ...e }), s = t ?? {};
    else {
      const r = e ?? t ?? {};
      s = typeof r == "object" ? r : {}, i = X(_e());
    }
    this.timeSource = s.timeSource ?? ce(), this.animationFrameProvider = s.animationFrameProvider ?? je(this.timeSource), this.createCanvasElement = s.createCanvasElement ?? Ze(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this._settings = X(i), this.log = oe(s.loggerNamespace ?? "CommentRenderer"), this.rebuildNgMatchers(), s.debug && Ie(s.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(e) {
    this._settings = X(e), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
      const t = e instanceof HTMLVideoElement ? e : e.video, i = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(i ?? null, t);
      this.videoElement = t, this.containerElement = s, this.duration = Number.isFinite(t.duration) ? R(t.duration) : 0, this.currentTime = R(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > V, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
      const r = this.createCanvasElement(), n = r.getContext("2d");
      if (!n)
        throw new Error("Failed to acquire 2D canvas context");
      r.style.position = "absolute", r.style.top = "0", r.style.left = "0", r.style.pointerEvents = "none", r.style.zIndex = "1000";
      const a = this.containerElement;
      a instanceof HTMLElement && (this.ensureContainerPositioning(a), a.appendChild(r)), this.canvas = r, this.ctx = n, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
    } catch (t) {
      throw this.log.error("CommentRenderer.initialize", t), t;
    }
  }
  addComments(e) {
    if (!Array.isArray(e) || e.length === 0)
      return [];
    const t = [];
    this.commentDependencies.settingsVersion = this.settingsVersion;
    for (const i of e) {
      const { text: s, vposMs: r, commands: n = [] } = i, a = L(s);
      if (this.isNGComment(s)) {
        b("comment-skip-ng", { preview: a, vposMs: r });
        continue;
      }
      const c = We(r);
      if (c === null) {
        this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: r }), b("comment-skip-invalid-vpos", { preview: a, vposMs: r });
        continue;
      }
      if (this.comments.some(
        (p) => p.text === s && p.vposMs === c
      ) || t.some(
        (p) => p.text === s && p.vposMs === c
      )) {
        b("comment-skip-duplicate", { preview: a, vposMs: c });
        continue;
      }
      const h = new Ne(
        s,
        c,
        n,
        this._settings,
        this.commentDependencies
      );
      h.creationIndex = this.commentSequence++, t.push(h), b("comment-added", {
        preview: a,
        vposMs: c,
        commands: h.commands.length,
        layout: h.layout,
        isScrolling: h.isScrolling,
        invisible: h.isInvisible
      });
    }
    return t.length === 0 ? [] : (this.comments.push(...t), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
      const r = i.vposMs - s.vposMs;
      return Math.abs(r) > w ? r : i.creationIndex - s.creationIndex;
    }), t);
  }
  addComment(e, t, i = []) {
    const [s] = this.addComments([{ text: e, vposMs: t, commands: i }]);
    return s ?? null;
  }
  clearComments() {
    if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear(), this.commentSequence = 0, this.ctx && this.canvas) {
      const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
      this.ctx.clearRect(0, 0, t, i);
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
      return O;
    const t = [];
    return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : J;
  }
  resolveFinalPhaseVpos(e) {
    if (!this.finalPhaseActive || this.finalPhaseStartTime === null)
      return this.finalPhaseVposOverrides.delete(e), e.vposMs;
    this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline();
    const t = this.finalPhaseVposOverrides.get(e);
    if (t !== void 0)
      return t;
    const i = Math.max(e.vposMs, this.finalPhaseStartTime);
    return this.finalPhaseVposOverrides.set(e, i), i;
  }
  recomputeFinalPhaseTimeline() {
    if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
      this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
      return;
    }
    const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + H, i = Math.max(e + H, t), s = this.comments.filter((h) => h.hasShown || h.isInvisible || this.isNGComment(h.text) ? !1 : h.vposMs >= e - I).sort((h, p) => {
      const l = h.vposMs - p.vposMs;
      return Math.abs(l) > w ? l : h.creationIndex - p.creationIndex;
    });
    if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
      this.finalPhaseScheduleDirty = !1;
      return;
    }
    const n = Math.max(i - e, H) / Math.max(s.length, 1), a = Number.isFinite(n) ? n : Y, c = Math.max(Y, Math.min(a, qe));
    let u = e;
    s.forEach((h, p) => {
      const l = Math.max(1, this.getFinalPhaseDisplayDuration(h)), v = i - l;
      let m = Math.max(e, Math.min(u, v));
      Number.isFinite(m) || (m = e);
      const d = Ye * p;
      m + d <= v && (m += d), this.finalPhaseVposOverrides.set(h, m);
      const f = Math.max(Y, Math.min(l / 2, c));
      u = m + f;
    }), this.finalPhaseScheduleDirty = !1;
  }
  shouldSuppressRendering() {
    return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= V;
  }
  updatePlaybackProgressState() {
    this.playbackHasBegun || (this.isPlaying || this.currentTime > V) && (this.playbackHasBegun = !0);
  }
  updateSettings(e) {
    const t = this._settings.useContainerResizeObserver, i = this._settings.scrollDirection, s = this._settings.useDprScaling, r = this._settings.syncMode;
    this.settings = e;
    const n = i !== this._settings.scrollDirection, a = s !== this._settings.useDprScaling, c = r !== this._settings.syncMode;
    if (this.comments.forEach((u) => {
      u.syncWithSettings(this._settings, this.settingsVersion);
    }), n && this.resetCommentActivity(), !this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((l) => {
        l.isActive = !1, l.clearActivation();
      }), this.activeComments.clear();
      const u = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / u, p = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / u;
      this.ctx.clearRect(0, 0, h, p), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    }
    t !== this._settings.useContainerResizeObserver && this.videoElement && this.setupResizeHandling(this.videoElement), a && this.resize(), c && this.videoElement && this.startAnimation();
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
    const i = e.querySelector("source[src]");
    return i && typeof i.src == "string" ? i.src : null;
  }
  getCommentsSnapshot() {
    return [...this.comments];
  }
  rebuildNgMatchers() {
    const e = [], t = [], i = Array.isArray(this._settings.ngWords) ? this._settings.ngWords : [];
    for (const r of i) {
      if (typeof r != "string")
        continue;
      const n = r.trim().toLowerCase();
      n.length !== 0 && e.push(n);
    }
    const s = Array.isArray(this._settings.ngRegexps) ? this._settings.ngRegexps : [];
    for (const r of s)
      if (!(typeof r != "string" || r.length === 0))
        try {
          t.push(new RegExp(r));
        } catch (n) {
          this.log.error("CommentRenderer.rebuildNgMatchers.regex", n, {
            pattern: r
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
        if (this.normalizedNgWords.some((s) => t.includes(s)))
          return !0;
      }
      return this.compiledNgRegexps.length > 0 ? this.compiledNgRegexps.some((t) => t.test(e)) : !1;
    } catch (t) {
      return this.log.error("CommentRenderer.isNGComment", t, { text: e }), !0;
    }
  }
  resize(e, t) {
    const i = this.videoElement, s = this.canvas, r = this.ctx;
    if (!i || !s)
      return;
    const n = i.getBoundingClientRect(), a = this.canvasDpr > 0 ? this.canvasDpr : 1, c = this.displayWidth > 0 ? this.displayWidth : s.width / a, u = this.displayHeight > 0 ? this.displayHeight : s.height / a, h = e ?? n.width ?? c, p = t ?? n.height ?? u;
    if (!Number.isFinite(h) || !Number.isFinite(p) || h <= 0 || p <= 0)
      return;
    const l = Math.max(1, Math.floor(h)), v = Math.max(1, Math.floor(p)), m = this.displayWidth > 0 ? this.displayWidth : l, d = this.displayHeight > 0 ? this.displayHeight : v, f = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, M = Math.max(1, Math.round(l * f)), S = Math.max(1, Math.round(v * f));
    if (!(this.displayWidth !== l || this.displayHeight !== v || Math.abs(this.canvasDpr - f) > Number.EPSILON || s.width !== M || s.height !== S))
      return;
    this.displayWidth = l, this.displayHeight = v, this.canvasDpr = f, s.width = M, s.height = S, s.style.width = `${l}px`, s.style.height = `${v}px`, r && (r.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && r.scale(f, f));
    const y = m > 0 ? l / m : 1, x = d > 0 ? v / d : 1;
    (y !== 1 || x !== 1) && this.comments.forEach((g) => {
      g.isActive && (g.x *= y, g.y *= x, g.width *= y, g.fontSize = Math.max(
        ae,
        Math.floor(Math.max(1, g.fontSize) * x)
      ), g.height = g.fontSize, g.virtualStartX *= y, g.exitThreshold *= y, g.baseSpeed *= y, g.speed *= y, g.speedPixelsPerMs *= y, g.bufferWidth *= y, g.reservationWidth *= y);
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
    const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(ae, Math.floor(t * 0.05));
    this.laneHeight = i * 1.2;
    const s = Math.floor(t / Math.max(this.laneHeight, 1));
    if (this._settings.useFixedLaneCount) {
      const r = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : re, n = Math.max(ne, Math.min(s, r));
      this.laneCount = n;
    } else
      this.laneCount = Math.max(ne, s);
    this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
  }
  updateComments(e) {
    const t = this.videoElement, i = this.canvas, s = this.ctx;
    if (!t || !i || !s)
      return;
    const r = typeof e == "number" ? e : R(t.currentTime);
    if (this.currentTime = r, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
      return;
    const n = this.canvasDpr > 0 ? this.canvasDpr : 1, a = this.displayWidth > 0 ? this.displayWidth : i.width / n, c = this.displayHeight > 0 ? this.displayHeight : i.height / n, u = this.buildPrepareOptions(a), h = this.duration > 0 && this.duration - this.currentTime <= $e;
    h && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, a, c), this.comments.forEach((l) => {
      l.isActive = !1, l.clearActivation();
    }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear()), !h && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
    const p = this.getCommentsInTimeWindow(this.currentTime, I);
    for (const l of p) {
      const v = F(), m = v ? L(l.text) : "";
      if (v && b("comment-evaluate", {
        stage: "update",
        preview: m,
        vposMs: l.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(l),
        currentTime: this.currentTime,
        isActive: l.isActive,
        hasShown: l.hasShown
      }), this.isNGComment(l.text)) {
        v && b("comment-eval-skip", {
          preview: m,
          vposMs: l.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(l),
          reason: "ng-runtime"
        });
        continue;
      }
      if (l.isInvisible) {
        v && b("comment-eval-skip", {
          preview: m,
          vposMs: l.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(l),
          reason: "invisible"
        }), l.isActive = !1, this.activeComments.delete(l), l.hasShown = !0, l.clearActivation();
        continue;
      }
      if (l.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(l, this.currentTime, m) && this.activateComment(
        l,
        s,
        a,
        c,
        u,
        this.currentTime
      ), l.isActive) {
        if (l.layout !== "naka" && l.hasStaticExpired(this.currentTime)) {
          const d = l.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(d, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
          continue;
        }
        if (l.layout === "naka" && this.getEffectiveCommentVpos(l) > this.currentTime + V) {
          l.x = l.virtualStartX, l.lastUpdateTime = this.timeSource.now();
          continue;
        }
        if (l.hasShown = !0, l.update(this.playbackRate, !this.isPlaying), !l.isScrolling && l.hasStaticExpired(this.currentTime)) {
          const d = l.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(d, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
        }
      }
    }
    for (const l of this.comments)
      l.isActive && l.isScrolling && (l.scrollDirection === "rtl" && l.x <= l.exitThreshold || l.scrollDirection === "ltr" && l.x >= l.exitThreshold) && (l.isActive = !1, this.activeComments.delete(l), l.clearActivation());
  }
  buildPrepareOptions(e) {
    const t = this._settings.scrollVisibleDurationMs;
    let i = J, s = se;
    return t !== null && (i = t, s = Math.max(1, Math.min(t, se))), {
      visibleWidth: e,
      virtualExtension: Ke,
      maxVisibleDurationMs: i,
      minVisibleDurationMs: s,
      maxWidthRatio: Xe,
      bufferRatio: Be,
      baseBufferPx: Ue,
      entryBufferPx: Ge
    };
  }
  findAvailableLane(e) {
    const t = this.currentTime;
    this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
    const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t);
    for (const n of i)
      if (this.isLaneAvailable(n, s, t))
        return this.storeLaneReservation(n, s), n;
    const r = i[0] ?? 0;
    return this.storeLaneReservation(r, s), r;
  }
  /**
   * 二分探索で、指定した時刻より後に終了する最初の予約のインデックスを返す
   */
  findFirstValidReservationIndex(e, t) {
    let i = 0, s = e.length;
    for (; i < s; ) {
      const r = Math.floor((i + s) / 2), n = e[r];
      n !== void 0 && n.totalEndTime + q <= t ? i = r + 1 : s = r;
    }
    return i;
  }
  pruneLaneReservations(e) {
    for (const [t, i] of this.reservedLanes.entries()) {
      const s = this.findFirstValidReservationIndex(i, e);
      s >= i.length ? this.reservedLanes.delete(t) : s > 0 && this.reservedLanes.set(t, i.slice(s));
    }
  }
  pruneStaticLaneReservations(e) {
    for (const [t, i] of this.topStaticLaneReservations.entries())
      i <= e && this.topStaticLaneReservations.delete(t);
    for (const [t, i] of this.bottomStaticLaneReservations.entries())
      i <= e && this.bottomStaticLaneReservations.delete(t);
  }
  /**
   * 二分探索で、指定した時刻以上の最初のコメントのインデックスを返す
   */
  findCommentIndexAtOrAfter(e) {
    let t = 0, i = this.comments.length;
    for (; t < i; ) {
      const s = Math.floor((t + i) / 2), r = this.comments[s];
      r !== void 0 && r.vposMs < e ? t = s + 1 : i = s;
    }
    return t;
  }
  /**
   * 指定した時刻範囲内のコメントのみを返す
   */
  getCommentsInTimeWindow(e, t) {
    if (this.comments.length === 0)
      return [];
    const i = e - t, s = e + t, r = this.findCommentIndexAtOrAfter(i), n = [];
    for (let a = r; a < this.comments.length; a++) {
      const c = this.comments[a];
      if (c === void 0 || c.vposMs > s)
        break;
      n.push(c);
    }
    return n;
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
  shouldActivateCommentAtTime(e, t, i = "") {
    const s = i.length > 0 && F(), r = this.resolveFinalPhaseVpos(e);
    return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - w ? (s && b("comment-eval-skip", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: r,
      reason: "final-phase-trimmed",
      finalPhaseStartTime: this.finalPhaseStartTime
    }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (s && b("comment-eval-skip", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: r,
      reason: "invisible"
    }), !1) : e.isActive ? (s && b("comment-eval-skip", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: r,
      reason: "already-active"
    }), !1) : r > t + V ? (s && b("comment-eval-pending", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: r,
      reason: "future",
      currentTime: t
    }), !1) : r < t - I ? (s && b("comment-eval-skip", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: r,
      reason: "expired-window",
      currentTime: t
    }), !1) : (s && b("comment-eval-ready", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: r,
      currentTime: t
    }), !0);
  }
  activateComment(e, t, i, s, r, n) {
    e.prepare(t, i, s, r);
    const a = this.resolveFinalPhaseVpos(e);
    if (F() && b("comment-prepared", {
      preview: L(e.text),
      layout: e.layout,
      isScrolling: e.isScrolling,
      width: e.width,
      height: e.height,
      bufferWidth: e.bufferWidth,
      visibleDurationMs: e.visibleDurationMs,
      effectiveVposMs: a
    }), e.layout === "naka") {
      const p = Math.max(0, n - a), l = e.speedPixelsPerMs * p;
      if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
        const S = this.duration > 0 ? this.duration : this.finalPhaseStartTime + H, C = Math.max(
          this.finalPhaseStartTime + H,
          S
        ), y = Math.abs(e.exitThreshold - e.virtualStartX), x = C - a;
        if (x > 0 && y > 0) {
          const g = y / x;
          g > e.speedPixelsPerMs && (e.speedPixelsPerMs = g, e.baseSpeed = g * (1e3 / 60), e.speed = e.baseSpeed, e.totalDurationMs = Math.ceil(y / g));
        }
      }
      const v = e.getDirectionSign(), m = e.virtualStartX + v * l, d = e.exitThreshold, f = e.scrollDirection;
      if (f === "rtl" && m <= d || f === "ltr" && m >= d) {
        e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation(), e.lane = -1, F() && b("comment-skip-exited", {
          preview: L(e.text),
          vposMs: e.vposMs,
          effectiveVposMs: a,
          referenceTime: n
        });
        return;
      }
      e.lane = this.findAvailableLane(e), e.y = e.lane * this.laneHeight, e.x = m, e.isActive = !0, this.activeComments.add(e), e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(n), e.lastUpdateTime = this.timeSource.now(), F() && b("comment-activate-scroll", {
        preview: L(e.text),
        lane: e.lane,
        startX: e.x,
        width: e.width,
        visibleDurationMs: e.visibleDurationMs,
        effectiveVposMs: a
      });
      return;
    }
    const c = a + O;
    if (n > c) {
      e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation(), e.lane = -1, F() && b("comment-skip-expired", {
        preview: L(e.text),
        vposMs: e.vposMs,
        effectiveVposMs: a,
        referenceTime: n,
        displayEnd: c
      });
      return;
    }
    const u = e.layout === "ue" ? "ue" : "shita", h = this.assignStaticLane(u);
    e.lane = h, e.y = h * this.laneHeight, e.x = e.virtualStartX, e.isActive = !0, this.activeComments.add(e), e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(n), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = c, this.reserveStaticLane(u, h, c), F() && b("comment-activate-static", {
      preview: L(e.text),
      lane: e.lane,
      position: u,
      displayEnd: c,
      effectiveVposMs: a
    });
  }
  assignStaticLane(e) {
    const t = this.getStaticLaneMap(e), i = Array.from({ length: this.laneCount }, (n, a) => a);
    e === "shita" && i.reverse();
    for (const n of i)
      if (!t.has(n))
        return n;
    let s = i[0] ?? 0, r = Number.POSITIVE_INFINITY;
    for (const [n, a] of t.entries())
      a < r && (r = a, s = n);
    return s;
  }
  reserveStaticLane(e, t, i) {
    this.getStaticLaneMap(e).set(t, i);
  }
  releaseStaticLane(e, t) {
    if (t < 0)
      return;
    this.getStaticLaneMap(e).delete(t);
  }
  getLanePriorityOrder(e) {
    const i = Array.from({ length: this.laneCount }, (a, c) => c).sort((a, c) => {
      const u = this.getLaneNextAvailableTime(a, e), h = this.getLaneNextAvailableTime(c, e);
      return Math.abs(u - h) <= w ? a - c : u - h;
    }), s = this.getStaticReservedLaneSet();
    if (s.size === 0)
      return i;
    const r = i.filter((a) => !s.has(a));
    if (r.length === 0)
      return i;
    const n = i.filter((a) => s.has(a));
    return [...r, ...n];
  }
  getLaneNextAvailableTime(e, t) {
    const i = this.reservedLanes.get(e);
    if (!i || i.length === 0)
      return t;
    const s = this.findFirstValidReservationIndex(i, t);
    let r = t;
    for (let n = s; n < i.length; n++) {
      const a = i[n];
      a !== void 0 && (r = Math.max(r, a.endTime));
    }
    return r;
  }
  createLaneReservation(e, t) {
    const i = Math.max(e.speedPixelsPerMs, w), s = this.getEffectiveCommentVpos(e), r = Number.isFinite(s) ? s : t, n = Math.max(0, r), a = n + e.preCollisionDurationMs + q, c = n + e.totalDurationMs + q;
    return {
      comment: e,
      startTime: n,
      endTime: Math.max(n, a),
      totalEndTime: Math.max(n, c),
      startLeft: e.virtualStartX,
      width: e.width,
      speed: i,
      buffer: e.bufferWidth,
      directionSign: e.getDirectionSign()
    };
  }
  isLaneAvailable(e, t, i) {
    const s = this.reservedLanes.get(e);
    if (!s || s.length === 0)
      return !0;
    const r = this.findFirstValidReservationIndex(s, i);
    for (let n = r; n < s.length; n++) {
      const a = s[n];
      if (a === void 0)
        break;
      if (this.areReservationsConflicting(a, t))
        return !1;
    }
    return !0;
  }
  storeLaneReservation(e, t) {
    const s = [...this.reservedLanes.get(e) ?? [], t].sort((r, n) => r.totalEndTime - n.totalEndTime);
    this.reservedLanes.set(e, s);
  }
  areReservationsConflicting(e, t) {
    const i = Math.max(e.startTime, t.startTime), s = Math.min(e.endTime, t.endTime);
    if (i >= s)
      return !1;
    const r = /* @__PURE__ */ new Set([
      i,
      s,
      i + (s - i) / 2
    ]), n = this.solveLeftRightEqualityTime(e, t);
    n !== null && n >= i - w && n <= s + w && r.add(n);
    const a = this.solveLeftRightEqualityTime(t, e);
    a !== null && a >= i - w && a <= s + w && r.add(a);
    for (const c of r) {
      if (c < i - w || c > s + w)
        continue;
      const u = this.computeForwardGap(e, t, c), h = this.computeForwardGap(t, e, c);
      if (u <= w && h <= w)
        return !0;
    }
    return !1;
  }
  computeForwardGap(e, t, i) {
    const s = this.getBufferedEdges(e, i), r = this.getBufferedEdges(t, i);
    return s.left - r.right;
  }
  getBufferedEdges(e, t) {
    const i = Math.max(0, t - e.startTime), s = e.speed * i, r = e.startLeft + e.directionSign * s, n = r - e.buffer, a = r + e.width + e.buffer;
    return { left: n, right: a };
  }
  solveLeftRightEqualityTime(e, t) {
    const i = e.directionSign, s = t.directionSign, r = s * t.speed - i * e.speed;
    if (Math.abs(r) < w)
      return null;
    const a = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / r;
    return Number.isFinite(a) ? a : null;
  }
  draw() {
    const e = this.canvas, t = this.ctx;
    if (!e || !t)
      return;
    const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, r = this.displayHeight > 0 ? this.displayHeight : e.height / i, n = this.timeSource.now();
    if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering()) {
      t.clearRect(0, 0, s, r), this.lastDrawTime = n;
      return;
    }
    t.clearRect(0, 0, s, r);
    const a = Array.from(this.activeComments);
    if (this._settings.isCommentVisible) {
      const c = (n - this.lastDrawTime) / 16.666666666666668;
      a.sort((u, h) => {
        const p = this.getEffectiveCommentVpos(u), l = this.getEffectiveCommentVpos(h), v = p - l;
        return Math.abs(v) > w ? v : u.isScrolling !== h.isScrolling ? u.isScrolling ? 1 : -1 : u.creationIndex - h.creationIndex;
      }), a.forEach((u) => {
        const p = this.isPlaying && !u.isPaused ? u.x + u.getDirectionSign() * u.speed * c : u.x;
        u.draw(t, p);
      });
    }
    this.lastDrawTime = n;
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
    const i = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
    this.processFrame(typeof i == "number" ? i : void 0), this.scheduleNextFrame();
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
    const e = this.canvas, t = this.ctx, i = this.videoElement;
    if (!e || !t || !i)
      return;
    const s = R(i.currentTime);
    this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    const r = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : e.width / r, a = this.displayHeight > 0 ? this.displayHeight : e.height / r, c = this.buildPrepareOptions(n);
    this.getCommentsInTimeWindow(this.currentTime, I).forEach((h) => {
      const p = F(), l = p ? L(h.text) : "";
      if (p && b("comment-evaluate", {
        stage: "seek",
        preview: l,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        currentTime: this.currentTime,
        isActive: h.isActive,
        hasShown: h.hasShown
      }), this.isNGComment(h.text)) {
        p && b("comment-eval-skip", {
          preview: l,
          vposMs: h.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(h),
          reason: "ng-runtime"
        }), h.isActive = !1, this.activeComments.delete(h), h.clearActivation();
        return;
      }
      if (h.isInvisible) {
        p && b("comment-eval-skip", {
          preview: l,
          vposMs: h.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(h),
          reason: "invisible"
        }), h.isActive = !1, this.activeComments.delete(h), h.hasShown = !0, h.clearActivation();
        return;
      }
      if (h.syncWithSettings(this._settings, this.settingsVersion), h.isActive = !1, this.activeComments.delete(h), h.lane = -1, h.clearActivation(), this.shouldActivateCommentAtTime(h, this.currentTime, l)) {
        this.activateComment(
          h,
          t,
          n,
          a,
          c,
          this.currentTime
        );
        return;
      }
      this.getEffectiveCommentVpos(h) < this.currentTime - I ? h.hasShown = !0 : h.hasShown = !1;
    }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
  }
  setupVideoEventListeners(e) {
    try {
      const t = () => {
        this.isPlaying = !0, this.playbackHasBegun = !0;
        const h = this.timeSource.now();
        this.lastDrawTime = h, this.comments.forEach((p) => {
          p.lastUpdateTime = h, p.isPaused = !1;
        });
      }, i = () => {
        this.isPlaying = !1;
        const h = this.timeSource.now();
        this.comments.forEach((p) => {
          p.lastUpdateTime = h, p.isPaused = !0;
        });
      }, s = () => {
        this.onSeek();
      }, r = () => {
        this.onSeek();
      }, n = () => {
        this.playbackRate = e.playbackRate;
        const h = this.timeSource.now();
        this.comments.forEach((p) => {
          p.lastUpdateTime = h;
        });
      }, a = () => {
        this.handleVideoMetadataLoaded(e);
      }, c = () => {
        this.duration = Number.isFinite(e.duration) ? R(e.duration) : 0;
      }, u = () => {
        this.handleVideoSourceChange();
      };
      e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", r), e.addEventListener("ratechange", n), e.addEventListener("loadedmetadata", a), e.addEventListener("durationchange", c), e.addEventListener("emptied", u), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", r)), this.addCleanup(() => e.removeEventListener("ratechange", n)), this.addCleanup(() => e.removeEventListener("loadedmetadata", a)), this.addCleanup(() => e.removeEventListener("durationchange", c)), this.addCleanup(() => e.removeEventListener("emptied", u));
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
    this.duration = Number.isFinite(e.duration) ? R(e.duration) : 0, this.currentTime = R(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.playbackHasBegun = this.isPlaying || this.currentTime > V, this.lastDrawTime = this.timeSource.now();
  }
  resetCommentActivity() {
    const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
    if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > V, t && i) {
      const s = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : t.width / s, n = this.displayHeight > 0 ? this.displayHeight : t.height / s;
      i.clearRect(0, 0, r, n);
    }
    this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear(), this.comments.forEach((s) => {
      s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
    }), this.activeComments.clear();
  }
  setupVideoChangeDetection(e, t) {
    if (typeof MutationObserver > "u") {
      this.log.debug(
        "MutationObserver is not available in this environment. Video change detection is disabled."
      );
      return;
    }
    const i = new MutationObserver((r) => {
      for (const n of r) {
        if (n.type === "attributes" && n.attributeName === "src") {
          const a = n.target;
          let c = null, u = null;
          if ((a instanceof HTMLVideoElement || a instanceof HTMLSourceElement) && (c = typeof n.oldValue == "string" ? n.oldValue : null, u = a.getAttribute("src")), c === u)
            continue;
          this.handleVideoSourceChange(e);
          return;
        }
        if (n.type === "childList") {
          for (const a of n.addedNodes)
            if (a instanceof HTMLSourceElement) {
              this.handleVideoSourceChange(e);
              return;
            }
          for (const a of n.removedNodes)
            if (a instanceof HTMLSourceElement) {
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
    const s = new MutationObserver((r) => {
      for (const n of r)
        if (n.type === "childList") {
          for (const a of n.addedNodes) {
            const c = this.extractVideoElement(a);
            if (c && c !== this.videoElement) {
              this.initialize(c);
              return;
            }
          }
          for (const a of n.removedNodes) {
            if (a === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
            if (a instanceof Element) {
              const c = a.querySelector("video");
              if (c && c === this.videoElement) {
                this.videoElement = null, this.handleVideoSourceChange(null);
                return;
              }
            }
          }
        }
    });
    s.observe(t, { childList: !0, subtree: !0 }), this.addCleanup(() => s.disconnect());
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
      const t = this.resolveResizeObserverTarget(e), i = new ResizeObserver((s) => {
        for (const r of s) {
          const { width: n, height: a } = r.contentRect;
          n > 0 && a > 0 ? this.resize(n, a) : this.resize();
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
    ].forEach((i) => {
      document.addEventListener(i, e), this.addCleanup(() => document.removeEventListener(i, e));
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
    const i = this.containerElement ?? t.parentElement ?? null, s = this.getFullscreenElement(), r = this.resolveActiveOverlayContainer(
      t,
      i,
      s
    );
    if (!(r instanceof HTMLElement))
      return;
    e.parentElement !== r ? (this.ensureContainerPositioning(r), r.appendChild(e)) : this.ensureContainerPositioning(r);
    const a = (s instanceof HTMLElement && s.contains(t) ? s : null) !== null;
    this.fullscreenActive !== a && (this.fullscreenActive = a, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
  }
  resolveFullscreenContainer(e) {
    const t = this.getFullscreenElement();
    return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
  }
  resolveActiveOverlayContainer(e, t, i) {
    return i instanceof HTMLElement && i.contains(e) ? i instanceof HTMLVideoElement && t instanceof HTMLElement ? t : i : t ?? null;
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
  tt as COMMENT_OVERLAY_VERSION,
  Ne as Comment,
  st as CommentRenderer,
  et as DEFAULT_RENDERER_SETTINGS,
  _e as cloneDefaultSettings,
  Ie as configureDebugLogging,
  je as createDefaultAnimationFrameProvider,
  ce as createDefaultTimeSource,
  oe as createLogger,
  b as debugLog,
  F as isDebugLoggingEnabled,
  it as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.map
