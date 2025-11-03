const G = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, he = (a, e, t) => {
  const i = [`[${e}]`, ...t];
  switch (a) {
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
}, Z = (a, e = {}) => {
  const { level: t = "info", emitter: s = he } = e, i = G[t], n = (r, l) => {
    G[r] < i || s(r, a, l);
  };
  return {
    debug: (...r) => n("debug", r),
    info: (...r) => n("info", r),
    warn: (...r) => n("warn", r),
    error: (...r) => n("error", r)
  };
}, ue = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, de = {
  defont: '"MS PGothic","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic Pro","Yu Gothic UI","Yu Gothic","Meiryo","Segoe UI","Osaka","Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","IPAPGothic","TakaoPGothic","Roboto","Helvetica Neue","Helvetica","Arial","sans-serif"',
  gothic: '"Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","Yu Gothic","Yu Gothic Medium","Meiryo","MS PGothic","Hiragino Kaku Gothic ProN","Segoe UI","Helvetica","Arial","sans-serif"',
  mincho: '"MS PMincho","MS Mincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Times New Roman","serif"'
}, Q = {
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
}, U = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, fe = /^[,.:;]+/, pe = /[,.:;]+$/, ve = (a) => {
  const e = a.trim();
  return e ? U.test(e) ? e : e.replace(fe, "").replace(pe, "") : "";
}, me = (a) => U.test(a) ? a.toUpperCase() : null, ee = (a) => {
  const e = a.trim();
  if (!e)
    return null;
  const t = e.toLowerCase().endsWith("px") ? e.slice(0, -2) : e, s = Number.parseFloat(t);
  return Number.isFinite(s) ? s : null;
}, ge = (a) => {
  const e = a.trim();
  if (!e)
    return null;
  if (e.endsWith("%")) {
    const t = Number.parseFloat(e.slice(0, -1));
    return Number.isFinite(t) ? t / 100 : null;
  }
  return ee(e);
}, Se = (a) => Number.isFinite(a) ? Math.min(100, Math.max(-100, a)) : 0, ye = (a) => !Number.isFinite(a) || a === 0 ? 1 : Math.min(5, Math.max(0.25, a)), be = (a) => a === "naka" || a === "ue" || a === "shita", Me = (a) => a === "small" || a === "medium" || a === "big", Ce = (a) => a === "defont" || a === "gothic" || a === "mincho", we = (a) => a in Q, xe = (a, e) => {
  let t = "naka", s = "medium", i = "defont", n = null, r = 1, l = null, h = !1, c = 0, u = 1;
  for (const p of a) {
    const m = ve(typeof p == "string" ? p : "");
    if (!m)
      continue;
    if (U.test(m)) {
      const y = me(m);
      if (y) {
        n = y;
        continue;
      }
    }
    const d = m.toLowerCase();
    if (be(d)) {
      t = d;
      continue;
    }
    if (Me(d)) {
      s = d;
      continue;
    }
    if (Ce(d)) {
      i = d;
      continue;
    }
    if (we(d)) {
      n = Q[d].toUpperCase();
      continue;
    }
    if (d === "_live") {
      l = 0.5;
      continue;
    }
    if (d === "invisible") {
      r = 0, h = !0;
      continue;
    }
    if (d.startsWith("ls:") || d.startsWith("letterspacing:")) {
      const y = m.indexOf(":");
      if (y >= 0) {
        const b = ee(m.slice(y + 1));
        b !== null && (c = Se(b));
      }
      continue;
    }
    if (d.startsWith("lh:") || d.startsWith("lineheight:")) {
      const y = m.indexOf(":");
      if (y >= 0) {
        const b = ge(m.slice(y + 1));
        b !== null && (u = ye(b));
      }
      continue;
    }
  }
  const o = Math.max(0, Math.min(1, r)), f = (n ?? e.defaultColor).toUpperCase(), v = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: t,
    size: s,
    sizeScale: ue[s],
    font: i,
    fontFamily: de[i],
    resolvedColor: f,
    colorOverride: n,
    opacityMultiplier: o,
    opacityOverride: v,
    isInvisible: h,
    letterSpacing: c,
    lineHeight: u
  };
}, z = Z("CommentEngine:Comment"), F = 4e3, Le = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, R = (a) => !Number.isFinite(a) || a <= 0 ? 0 : a >= 1 ? 1 : a, O = (a) => a.length === 1 ? a.repeat(2) : a, x = (a) => Number.parseInt(a, 16), Te = (a, e) => {
  const t = Le.exec(a);
  if (!t)
    return a;
  const s = t[1];
  let i, n, r, l = 1;
  s.length === 3 || s.length === 4 ? (i = x(O(s[0])), n = x(O(s[1])), r = x(O(s[2])), s.length === 4 && (l = x(O(s[3])) / 255)) : (i = x(s.slice(0, 2)), n = x(s.slice(2, 4)), r = x(s.slice(4, 6)), s.length === 8 && (l = x(s.slice(6, 8)) / 255));
  const h = R(l * R(e));
  return `rgba(${i}, ${n}, ${r}, ${h})`;
}, Ee = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), te = () => Ee(), Ae = (a) => a === "ltr" ? "ltr" : "rtl", Fe = (a) => a === "ltr" ? 1 : -1;
class Re {
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
  constructor(e, t, s, i, n = {}) {
    if (typeof e != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(t) || t < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = e, this.vposMs = t, this.commands = Array.isArray(s) ? [...s] : [];
    const r = xe(this.commands, {
      defaultColor: i.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.fontFamily = r.fontFamily, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(i.commentOpacity), this.renderStyle = i.renderStyle, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = n.timeSource ?? te(), this.applyScrollDirection(i.scrollDirection), this.syncWithSettings(i);
  }
  prepare(e, t, s, i) {
    try {
      if (!e)
        throw new Error("Canvas context is required");
      if (!Number.isFinite(t) || !Number.isFinite(s))
        throw new Error("Canvas dimensions must be numbers");
      if (!i)
        throw new Error("Prepare options are required");
      const n = Math.max(t, 1), r = Math.max(24, Math.floor(s * 0.05)), l = Math.max(24, Math.floor(r * this.sizeScale));
      this.fontSize = l, e.font = `${this.fontSize}px ${this.fontFamily}`;
      const h = this.text.includes(`
`) ? this.text.split(/\r?\n/) : [this.text];
      this.lines = h.length > 0 ? h : [""];
      let c = 0;
      const u = this.letterSpacing;
      for (const w of this.lines) {
        const V = e.measureText(w).width, ce = w.length > 1 ? u * (w.length - 1) : 0, B = Math.max(0, V + ce);
        B > c && (c = B);
      }
      this.width = c;
      const o = Math.max(
        1,
        Math.floor(this.fontSize * this.lineHeightMultiplier)
      );
      if (this.lineHeightPx = o, this.height = this.fontSize + (this.lines.length > 1 ? (this.lines.length - 1) * o : 0), !this.isScrolling) {
        this.bufferWidth = 0;
        const w = Math.max((n - this.width) / 2, 0);
        this.virtualStartX = w, this.x = w, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = F, this.preCollisionDurationMs = F, this.totalDurationMs = F, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vposMs + F, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const f = e.measureText("??".repeat(150)).width, v = this.width * Math.max(i.bufferRatio, 0);
      this.bufferWidth = Math.max(i.baseBufferPx, v);
      const p = Math.max(i.entryBufferPx, this.bufferWidth), m = this.scrollDirection, d = m === "rtl" ? n + i.virtualExtension : -this.width - this.bufferWidth - i.virtualExtension, y = m === "rtl" ? -this.width - this.bufferWidth - p : n + p, b = m === "rtl" ? n + p : -p, H = m === "rtl" ? d + this.width + this.bufferWidth : d - this.bufferWidth;
      this.virtualStartX = d, this.x = d, this.exitThreshold = y;
      const M = n > 0 ? this.width / n : 0, D = i.maxVisibleDurationMs === i.minVisibleDurationMs;
      let S = i.maxVisibleDurationMs;
      if (!D && M > 1) {
        const w = Math.min(M, i.maxWidthRatio), V = i.maxVisibleDurationMs / Math.max(w, 1);
        S = Math.max(i.minVisibleDurationMs, Math.floor(V));
      }
      const se = n + this.width + this.bufferWidth + p, ne = Math.max(S, 1), k = se / ne, re = k * 1e3 / 60;
      this.baseSpeed = re, this.speed = this.baseSpeed, this.speedPixelsPerMs = k;
      const ae = Math.abs(y - d), oe = m === "rtl" ? Math.max(0, H - b) : Math.max(0, b - H), X = Math.max(k, Number.EPSILON);
      this.visibleDurationMs = S, this.preCollisionDurationMs = Math.max(0, Math.ceil(oe / X)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(ae / X)
      );
      const le = this.width + this.bufferWidth + p;
      this.reservationWidth = Math.min(f, le), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
    } catch (n) {
      throw z.error("Comment.prepare", n, {
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
      z.error("Comment.update", s, {
        text: this.text,
        playbackRate: e,
        isPaused: t,
        isActive: this.isActive
      });
    }
  }
  draw(e, t = null) {
    try {
      if (!this.isActive || !e)
        return;
      e.save(), e.font = `${this.fontSize}px ${this.fontFamily}`;
      const s = R(this.opacity), i = t ?? this.x, n = this.lines.length > 0 ? this.lines : [this.text], r = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, l = this.y + this.fontSize, h = (o, f, v) => {
        if (o.length === 0)
          return;
        if (Math.abs(this.letterSpacing) < Number.EPSILON) {
          v === "stroke" ? e.strokeText(o, i, f) : e.fillText(o, i, f);
          return;
        }
        let p = i;
        for (let m = 0; m < o.length; m += 1) {
          const d = o[m];
          v === "stroke" ? e.strokeText(d, p, f) : e.fillText(d, p, f);
          const y = e.measureText(d), b = Number.isFinite(y.width) ? y.width : 0;
          p += b, m < o.length - 1 && (p += this.letterSpacing);
        }
      }, c = () => {
        e.globalAlpha = s, e.strokeStyle = "#000000", e.lineWidth = Math.max(3, this.fontSize / 8), e.lineJoin = "round", n.forEach((o, f) => {
          const v = l + f * r;
          h(o, v, "stroke");
        }), e.globalAlpha = 1;
      }, u = () => {
        n.forEach((o, f) => {
          const v = l + f * r;
          h(o, v, "fill");
        });
      };
      if (c(), this.renderStyle === "classic") {
        const o = Math.max(1, this.fontSize * 0.04), f = this.fontSize * 0.18;
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
        ].forEach((p) => {
          const m = R(p.alpha * s);
          e.shadowColor = `rgba(${p.rgb}, ${m})`, e.shadowBlur = f * p.blurMultiplier, e.shadowOffsetX = o * p.offsetXMultiplier, e.shadowOffsetY = o * p.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", u();
        }), e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      } else
        e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      e.globalAlpha = 1, e.fillStyle = Te(this.color, s), u(), e.restore();
    } catch (s) {
      z.error("Comment.draw", s, {
        text: this.text,
        isActive: this.isActive,
        hasContext: !!e,
        interpolatedX: t
      });
    }
  }
  syncWithSettings(e) {
    this.color = this.getEffectiveColor(e.commentColor), this.opacity = this.getEffectiveOpacity(e.commentOpacity), this.applyScrollDirection(e.scrollDirection), this.renderStyle = e.renderStyle;
  }
  getEffectiveColor(e) {
    const t = this.colorOverride ?? e;
    return typeof t != "string" || t.length === 0 ? e : t.toUpperCase();
  }
  getEffectiveOpacity(e) {
    if (typeof this.opacityOverride == "number")
      return R(this.opacityOverride);
    const t = e * this.opacityMultiplier;
    return Number.isFinite(t) ? R(t) : 0;
  }
  markActivated(e) {
    this.activationTimeMs = e;
  }
  clearActivation() {
    this.activationTimeMs = null, this.isScrolling || (this.staticExpiryTimeMs = null);
  }
  hasStaticExpired(e) {
    return this.isScrolling || this.staticExpiryTimeMs === null ? !1 : e >= this.staticExpiryTimeMs;
  }
  getDirectionSign() {
    return this.directionSign;
  }
  applyScrollDirection(e) {
    const t = Ae(e);
    this.scrollDirection = t, this.directionSign = Fe(t);
  }
}
const De = 4e3, I = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: De,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0
}, $e = I, Pe = () => ({
  ...I,
  ngWords: [...I.ngWords],
  ngRegexps: [...I.ngRegexps]
}), Ye = "v1.1.0", W = 5, A = {
  enabled: !1,
  maxLogsPerCategory: W
}, P = /* @__PURE__ */ new Map(), Oe = (a) => {
  if (a === void 0 || !Number.isFinite(a))
    return W;
  const e = Math.max(1, Math.floor(a));
  return Math.min(1e4, e);
}, _e = (a) => {
  A.enabled = !!a.enabled, A.maxLogsPerCategory = Oe(a.maxLogsPerCategory), A.enabled || P.clear();
}, Je = () => {
  P.clear();
}, L = () => A.enabled, Ne = (a) => {
  const e = P.get(a) ?? 0;
  return e >= A.maxLogsPerCategory ? (e === A.maxLogsPerCategory && (console.debug(`[CommentOverlay][${a}]`, "Further logs suppressed."), P.set(a, e + 1)), !1) : (P.set(a, e + 1), !0);
}, g = (a, ...e) => {
  A.enabled && Ne(a) && console.debug(`[CommentOverlay][${a}]`, ...e);
}, T = (a, e = 32) => a.length <= e ? a : `${a.slice(0, e)}…`, E = (a) => a * 1e3, Ie = (a) => !Number.isFinite(a) || a < 0 ? null : Math.round(a), ie = 4e3, q = 1800, He = 3, ke = 0.25, Ve = 32, ze = 48, _ = 120, We = 4e3, $ = F + ie, Ue = 1e3, Y = 1, J = 12, K = 24, C = 1e-3, j = 50, Xe = (a) => Number.isFinite(a) ? a <= 0 ? 0 : a >= 1 ? 1 : a : 1, N = (a) => {
  const e = a.scrollVisibleDurationMs, t = e == null ? null : Number.isFinite(e) ? Math.max(1, Math.floor(e)) : null;
  return {
    ...a,
    scrollDirection: a.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: Xe(a.commentOpacity),
    renderStyle: a.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: t,
    syncMode: a.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!a.useDprScaling
  };
}, Be = (a) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (e) => window.requestAnimationFrame(e),
  cancel: (e) => window.cancelAnimationFrame(e)
} : {
  request: (e) => globalThis.setTimeout(() => {
    e(a.now());
  }, 16),
  cancel: (e) => {
    globalThis.clearTimeout(e);
  }
}, Ge = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), qe = (a) => {
  if (!a || typeof a != "object")
    return !1;
  const e = a;
  return typeof e.commentColor == "string" && typeof e.commentOpacity == "number" && typeof e.isCommentVisible == "boolean";
};
class Ke {
  _settings;
  comments = [];
  reservedLanes = /* @__PURE__ */ new Map();
  topStaticLaneReservations = /* @__PURE__ */ new Map();
  bottomStaticLaneReservations = /* @__PURE__ */ new Map();
  log;
  timeSource;
  animationFrameProvider;
  createCanvasElement;
  commentDependencies;
  canvas = null;
  ctx = null;
  videoElement = null;
  containerElement = null;
  laneCount = J;
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
  frameId = null;
  videoFrameHandle = null;
  resizeObserver = null;
  resizeObserverTarget = null;
  isResizeObserverAvailable = typeof ResizeObserver < "u";
  cleanupTasks = [];
  commentSequence = 0;
  constructor(e = null, t = void 0) {
    let s, i;
    if (qe(e))
      s = N({ ...e }), i = t ?? {};
    else {
      const n = e ?? t ?? {};
      i = typeof n == "object" ? n : {}, s = N(Pe());
    }
    this.timeSource = i.timeSource ?? te(), this.animationFrameProvider = i.animationFrameProvider ?? Be(this.timeSource), this.createCanvasElement = i.createCanvasElement ?? Ge(), this.commentDependencies = { timeSource: this.timeSource }, this._settings = N(s), this.log = Z(i.loggerNamespace ?? "CommentRenderer"), i.debug && _e(i.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(e) {
    this._settings = N(e);
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
      this.videoElement = t, this.containerElement = i, this.duration = Number.isFinite(t.duration) ? E(t.duration) : 0, this.currentTime = E(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.lastDrawTime = this.timeSource.now();
      const n = this.createCanvasElement(), r = n.getContext("2d");
      if (!r)
        throw new Error("Failed to acquire 2D canvas context");
      n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
      const l = this.containerElement;
      l instanceof HTMLElement && (this.ensureContainerPositioning(l), l.appendChild(n)), this.canvas = n, this.ctx = r, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupVideoChangeDetection(t, i), this.startAnimation();
    } catch (t) {
      throw this.log.error("CommentRenderer.initialize", t), t;
    }
  }
  addComment(e, t, s = []) {
    const i = T(e);
    if (this.isNGComment(e))
      return g("comment-skip-ng", { preview: i, vposMs: t }), null;
    const n = Ie(t);
    if (n === null)
      return this.log.warn("CommentRenderer.addComment.invalidVpos", { text: e, vposMs: t }), g("comment-skip-invalid-vpos", { preview: i, vposMs: t }), null;
    if (this.comments.some(
      (h) => h.text === e && h.vposMs === n
    ))
      return g("comment-skip-duplicate", { preview: i, vposMs: n }), null;
    const l = new Re(
      e,
      n,
      s,
      this._settings,
      this.commentDependencies
    );
    return l.creationIndex = this.commentSequence++, g("comment-added", {
      preview: i,
      vposMs: n,
      commands: l.commands.length,
      layout: l.layout,
      isScrolling: l.isScrolling,
      invisible: l.isInvisible
    }), this.comments.push(l), this.comments.sort((h, c) => {
      const u = h.vposMs - c.vposMs;
      return Math.abs(u) > C ? u : h.creationIndex - c.creationIndex;
    }), l;
  }
  clearComments() {
    if (this.comments.length = 0, this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear(), this.commentSequence = 0, this.ctx && this.canvas) {
      const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, s = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
      this.ctx.clearRect(0, 0, t, s);
    }
  }
  resetState() {
    this.clearComments(), this.currentTime = 0, this.finalPhaseActive = !1;
  }
  destroy() {
    this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.reservedLanes.clear(), this.finalPhaseActive = !1, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0;
  }
  updateSettings(e) {
    const t = this._settings.useContainerResizeObserver, s = this._settings.scrollDirection, i = this._settings.useDprScaling, n = this._settings.syncMode;
    this.settings = e;
    const r = s !== this._settings.scrollDirection, l = i !== this._settings.useDprScaling, h = n !== this._settings.syncMode;
    if (this.comments.forEach((c) => {
      c.syncWithSettings(this._settings);
    }), r && this.resetCommentActivity(), !this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((f) => {
        f.isActive = !1, f.clearActivation();
      });
      const c = this.canvasDpr > 0 ? this.canvasDpr : 1, u = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / c, o = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / c;
      this.ctx.clearRect(0, 0, u, o), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    }
    t !== this._settings.useContainerResizeObserver && this.videoElement && this.setupResizeHandling(this.videoElement), l && this.resize(), h && this.videoElement && this.startAnimation();
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
  isNGComment(e) {
    try {
      if (typeof e != "string")
        return !0;
      if (Array.isArray(this._settings.ngWords) && this._settings.ngWords.length > 0) {
        const t = e.toLowerCase();
        if (this._settings.ngWords.some((i) => {
          if (typeof i != "string")
            return !1;
          const n = i.trim().toLowerCase();
          return n.length === 0 ? !1 : t.includes(n);
        }))
          return !0;
      }
      return Array.isArray(this._settings.ngRegexps) ? this._settings.ngRegexps.some((t) => {
        if (typeof t != "string" || t.length === 0)
          return !1;
        try {
          return new RegExp(t).test(e);
        } catch (s) {
          return this.log.error("CommentRenderer.isNGComment.regex", s, {
            pattern: t,
            text: e
          }), !1;
        }
      }) : !1;
    } catch (t) {
      return this.log.error("CommentRenderer.isNGComment", t, { text: e }), !0;
    }
  }
  resize(e, t) {
    const s = this.videoElement, i = this.canvas, n = this.ctx;
    if (!s || !i)
      return;
    const r = s.getBoundingClientRect(), l = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : i.width / l, c = this.displayHeight > 0 ? this.displayHeight : i.height / l, u = e ?? r.width ?? h, o = t ?? r.height ?? c;
    if (!Number.isFinite(u) || !Number.isFinite(o) || u <= 0 || o <= 0)
      return;
    const f = Math.max(1, Math.floor(u)), v = Math.max(1, Math.floor(o)), p = this.displayWidth > 0 ? this.displayWidth : f, m = this.displayHeight > 0 ? this.displayHeight : v, d = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, y = Math.max(1, Math.round(f * d)), b = Math.max(1, Math.round(v * d));
    if (!(this.displayWidth !== f || this.displayHeight !== v || Math.abs(this.canvasDpr - d) > Number.EPSILON || i.width !== y || i.height !== b))
      return;
    this.displayWidth = f, this.displayHeight = v, this.canvasDpr = d, i.width = y, i.height = b, i.style.width = `${f}px`, i.style.height = `${v}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(d, d));
    const M = p > 0 ? f / p : 1, D = m > 0 ? v / m : 1;
    (M !== 1 || D !== 1) && this.comments.forEach((S) => {
      S.isActive && (S.x *= M, S.y *= D, S.width *= M, S.fontSize = Math.max(
        K,
        Math.floor(Math.max(1, S.fontSize) * D)
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
    this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1;
  }
  calculateLaneMetrics() {
    const e = this.canvas;
    if (!e)
      return;
    const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), s = Math.max(K, Math.floor(t * 0.05));
    this.laneHeight = s * 1.2;
    const i = Math.floor(t / Math.max(this.laneHeight, 1));
    if (this._settings.useFixedLaneCount) {
      const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : J, r = Math.max(Y, Math.min(i, n));
      this.laneCount = r;
    } else
      this.laneCount = Math.max(Y, i);
    this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
  }
  updateComments(e) {
    const t = this.videoElement, s = this.canvas, i = this.ctx;
    if (!t || !s || !i)
      return;
    const n = typeof e == "number" ? e : E(t.currentTime);
    this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused;
    const r = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : s.width / r, h = this.displayHeight > 0 ? this.displayHeight : s.height / r, c = this.buildPrepareOptions(l), u = this.duration > 0 && this.duration - this.currentTime <= We;
    u && !this.finalPhaseActive && (this.finalPhaseActive = !0, i.clearRect(0, 0, l, h), this.comments.forEach((o) => {
      o.isActive = !1, o.clearActivation();
    }), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear()), !u && this.finalPhaseActive && (this.finalPhaseActive = !1), this.pruneStaticLaneReservations(this.currentTime);
    for (const o of this.comments) {
      const f = L(), v = f ? T(o.text) : "";
      if (f && g("comment-evaluate", {
        stage: "update",
        preview: v,
        vposMs: o.vposMs,
        currentTime: this.currentTime,
        isActive: o.isActive,
        hasShown: o.hasShown
      }), this.isNGComment(o.text)) {
        f && g("comment-eval-skip", {
          preview: v,
          vposMs: o.vposMs,
          reason: "ng-runtime"
        });
        continue;
      }
      if (o.isInvisible) {
        f && g("comment-eval-skip", {
          preview: v,
          vposMs: o.vposMs,
          reason: "invisible"
        }), o.isActive = !1, o.hasShown = !0, o.clearActivation();
        continue;
      }
      if (o.syncWithSettings(this._settings), this.shouldActivateCommentAtTime(o, this.currentTime, v) && this.activateComment(
        o,
        i,
        l,
        h,
        c,
        this.currentTime
      ), o.isActive) {
        if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
          const p = o.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(p, o.lane), o.isActive = !1, o.clearActivation();
          continue;
        }
        if (o.layout === "naka" && o.vposMs > this.currentTime + j) {
          o.x = o.virtualStartX, o.lastUpdateTime = this.timeSource.now();
          continue;
        }
        if (o.hasShown = !0, o.update(this.playbackRate, !this.isPlaying), !o.isScrolling && o.hasStaticExpired(this.currentTime)) {
          const p = o.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(p, o.lane), o.isActive = !1, o.clearActivation();
        }
      }
    }
    for (const o of this.comments)
      o.isActive && o.isScrolling && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, o.clearActivation());
  }
  buildPrepareOptions(e) {
    const t = this._settings.scrollVisibleDurationMs;
    let s = ie, i = q;
    return t !== null && (s = t, i = Math.max(1, Math.min(t, q))), {
      visibleWidth: e,
      virtualExtension: Ue,
      maxVisibleDurationMs: s,
      minVisibleDurationMs: i,
      maxWidthRatio: He,
      bufferRatio: ke,
      baseBufferPx: Ve,
      entryBufferPx: ze
    };
  }
  findAvailableLane(e) {
    const t = this.currentTime;
    this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
    const s = this.getLanePriorityOrder(t), i = this.createLaneReservation(e, t);
    for (const r of s)
      if (this.isLaneAvailable(r, i, t))
        return this.storeLaneReservation(r, i), r;
    const n = s[0] ?? 0;
    return this.storeLaneReservation(n, i), n;
  }
  pruneLaneReservations(e) {
    for (const [t, s] of this.reservedLanes.entries()) {
      const i = s.filter(
        (n) => n.totalEndTime + _ > e
      );
      i.length > 0 ? this.reservedLanes.set(t, i) : this.reservedLanes.delete(t);
    }
  }
  pruneStaticLaneReservations(e) {
    for (const [t, s] of this.topStaticLaneReservations.entries())
      s <= e && this.topStaticLaneReservations.delete(t);
    for (const [t, s] of this.bottomStaticLaneReservations.entries())
      s <= e && this.bottomStaticLaneReservations.delete(t);
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
    const i = s.length > 0 && L();
    return e.isInvisible ? (i && g("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      reason: "invisible"
    }), !1) : e.isActive ? (i && g("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      reason: "already-active"
    }), !1) : e.vposMs > t + j ? (i && g("comment-eval-pending", {
      preview: s,
      vposMs: e.vposMs,
      reason: "future",
      currentTime: t
    }), !1) : e.vposMs < t - $ ? (i && g("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      reason: "expired-window",
      currentTime: t
    }), !1) : (i && g("comment-eval-ready", {
      preview: s,
      vposMs: e.vposMs,
      currentTime: t
    }), !0);
  }
  activateComment(e, t, s, i, n, r) {
    if (e.prepare(t, s, i, n), L() && g("comment-prepared", {
      preview: T(e.text),
      layout: e.layout,
      isScrolling: e.isScrolling,
      width: e.width,
      height: e.height,
      bufferWidth: e.bufferWidth,
      visibleDurationMs: e.visibleDurationMs
    }), e.layout === "naka") {
      const u = Math.max(0, r - e.vposMs), o = e.speedPixelsPerMs * u, f = e.getDirectionSign(), v = e.virtualStartX + f * o, p = e.exitThreshold, m = e.scrollDirection;
      if (m === "rtl" && v <= p || m === "ltr" && v >= p) {
        e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1, L() && g("comment-skip-exited", {
          preview: T(e.text),
          vposMs: e.vposMs,
          referenceTime: r
        });
        return;
      }
      e.lane = this.findAvailableLane(e), e.y = e.lane * this.laneHeight, e.x = v, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now(), L() && g("comment-activate-scroll", {
        preview: T(e.text),
        lane: e.lane,
        startX: e.x,
        width: e.width,
        visibleDurationMs: e.visibleDurationMs
      });
      return;
    }
    const l = e.vposMs + F;
    if (r > l) {
      e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1, L() && g("comment-skip-expired", {
        preview: T(e.text),
        vposMs: e.vposMs,
        referenceTime: r,
        displayEnd: l
      });
      return;
    }
    const h = e.layout === "ue" ? "ue" : "shita", c = this.assignStaticLane(h);
    e.lane = c, e.y = c * this.laneHeight, e.x = e.virtualStartX, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = l, this.reserveStaticLane(h, c, l), L() && g("comment-activate-static", {
      preview: T(e.text),
      lane: e.lane,
      position: h,
      displayEnd: l
    });
  }
  assignStaticLane(e) {
    const t = this.getStaticLaneMap(e), s = Array.from({ length: this.laneCount }, (r, l) => l);
    e === "shita" && s.reverse();
    for (const r of s)
      if (!t.has(r))
        return r;
    let i = s[0] ?? 0, n = Number.POSITIVE_INFINITY;
    for (const [r, l] of t.entries())
      l < n && (n = l, i = r);
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
    const s = Array.from({ length: this.laneCount }, (l, h) => h).sort((l, h) => {
      const c = this.getLaneNextAvailableTime(l, e), u = this.getLaneNextAvailableTime(h, e);
      return Math.abs(c - u) <= C ? l - h : c - u;
    }), i = this.getStaticReservedLaneSet();
    if (i.size === 0)
      return s;
    const n = s.filter((l) => !i.has(l));
    if (n.length === 0)
      return s;
    const r = s.filter((l) => i.has(l));
    return [...n, ...r];
  }
  getLaneNextAvailableTime(e, t) {
    const s = this.reservedLanes.get(e);
    if (!s || s.length === 0)
      return t;
    let i = t;
    for (const n of s)
      i = Math.max(i, n.endTime);
    return i;
  }
  createLaneReservation(e, t) {
    const s = Math.max(e.speedPixelsPerMs, C), i = Number.isFinite(e.vposMs) ? e.vposMs : t, n = Math.max(0, i), r = n + e.preCollisionDurationMs + _, l = n + e.totalDurationMs + _;
    return {
      comment: e,
      startTime: n,
      endTime: Math.max(n, r),
      totalEndTime: Math.max(n, l),
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
    for (const n of i)
      if (!(n.totalEndTime + _ <= s) && this.areReservationsConflicting(n, t))
        return !1;
    return !0;
  }
  storeLaneReservation(e, t) {
    const i = [...this.reservedLanes.get(e) ?? [], t].sort((n, r) => n.endTime - r.endTime);
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
    ]), r = this.solveLeftRightEqualityTime(e, t);
    r !== null && r >= s - C && r <= i + C && n.add(r);
    const l = this.solveLeftRightEqualityTime(t, e);
    l !== null && l >= s - C && l <= i + C && n.add(l);
    for (const h of n) {
      if (h < s - C || h > i + C)
        continue;
      const c = this.computeForwardGap(e, t, h), u = this.computeForwardGap(t, e, h);
      if (c <= C && u <= C)
        return !0;
    }
    return !1;
  }
  computeForwardGap(e, t, s) {
    const i = this.getBufferedEdges(e, s), n = this.getBufferedEdges(t, s);
    return i.left - n.right;
  }
  getBufferedEdges(e, t) {
    const s = Math.max(0, t - e.startTime), i = e.speed * s, n = e.startLeft + e.directionSign * i, r = n - e.buffer, l = n + e.width + e.buffer;
    return { left: r, right: l };
  }
  solveLeftRightEqualityTime(e, t) {
    const s = e.directionSign, i = t.directionSign, n = i * t.speed - s * e.speed;
    if (Math.abs(n) < C)
      return null;
    const l = (t.startLeft + i * t.speed * t.startTime + t.width + t.buffer - e.startLeft - s * e.speed * e.startTime + e.buffer) / n;
    return Number.isFinite(l) ? l : null;
  }
  draw() {
    const e = this.canvas, t = this.ctx;
    if (!e || !t)
      return;
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, i = this.displayWidth > 0 ? this.displayWidth : e.width / s, n = this.displayHeight > 0 ? this.displayHeight : e.height / s;
    t.clearRect(0, 0, i, n);
    const r = this.comments.filter((h) => h.isActive), l = this.timeSource.now();
    if (this._settings.isCommentVisible) {
      const h = (l - this.lastDrawTime) / 16.666666666666668;
      r.sort((c, u) => {
        const o = c.vposMs - u.vposMs;
        return Math.abs(o) > C ? o : c.isScrolling !== u.isScrolling ? c.isScrolling ? 1 : -1 : c.creationIndex - u.creationIndex;
      }), r.forEach((c) => {
        const o = this.isPlaying && !c.isPaused ? c.x + c.getDirectionSign() * c.speed * h : c.x;
        c.draw(t, o);
      });
    }
    this.lastDrawTime = l;
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
    const i = E(s.currentTime);
    this.currentTime = i, this.finalPhaseActive = !1, this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    const n = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : e.width / n, l = this.displayHeight > 0 ? this.displayHeight : e.height / n, h = this.buildPrepareOptions(r);
    this.comments.forEach((c) => {
      const u = L(), o = u ? T(c.text) : "";
      if (u && g("comment-evaluate", {
        stage: "seek",
        preview: o,
        vposMs: c.vposMs,
        currentTime: this.currentTime,
        isActive: c.isActive,
        hasShown: c.hasShown
      }), this.isNGComment(c.text)) {
        u && g("comment-eval-skip", {
          preview: o,
          vposMs: c.vposMs,
          reason: "ng-runtime"
        }), c.isActive = !1, c.clearActivation();
        return;
      }
      if (c.isInvisible) {
        u && g("comment-eval-skip", {
          preview: o,
          vposMs: c.vposMs,
          reason: "invisible"
        }), c.isActive = !1, c.hasShown = !0, c.clearActivation();
        return;
      }
      if (c.syncWithSettings(this._settings), c.isActive = !1, c.lane = -1, c.clearActivation(), this.shouldActivateCommentAtTime(c, this.currentTime, o)) {
        this.activateComment(
          c,
          t,
          r,
          l,
          h,
          this.currentTime
        );
        return;
      }
      c.vposMs < this.currentTime - $ ? c.hasShown = !0 : c.hasShown = !1;
    }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
  }
  setupVideoEventListeners(e) {
    try {
      const t = () => {
        this.isPlaying = !0;
        const u = this.timeSource.now();
        this.lastDrawTime = u, this.comments.forEach((o) => {
          o.lastUpdateTime = u, o.isPaused = !1;
        });
      }, s = () => {
        this.isPlaying = !1;
        const u = this.timeSource.now();
        this.comments.forEach((o) => {
          o.lastUpdateTime = u, o.isPaused = !0;
        });
      }, i = () => {
        this.onSeek();
      }, n = () => {
        this.onSeek();
      }, r = () => {
        this.playbackRate = e.playbackRate;
        const u = this.timeSource.now();
        this.comments.forEach((o) => {
          o.lastUpdateTime = u;
        });
      }, l = () => {
        this.handleVideoMetadataLoaded(e);
      }, h = () => {
        this.duration = Number.isFinite(e.duration) ? E(e.duration) : 0;
      }, c = () => {
        this.handleVideoSourceChange();
      };
      e.addEventListener("play", t), e.addEventListener("pause", s), e.addEventListener("seeking", i), e.addEventListener("seeked", n), e.addEventListener("ratechange", r), e.addEventListener("loadedmetadata", l), e.addEventListener("durationchange", h), e.addEventListener("emptied", c), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", s)), this.addCleanup(() => e.removeEventListener("seeking", i)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", r)), this.addCleanup(() => e.removeEventListener("loadedmetadata", l)), this.addCleanup(() => e.removeEventListener("durationchange", h)), this.addCleanup(() => e.removeEventListener("emptied", c));
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
      this.isPlaying = !1, this.finalPhaseActive = !1, this.resetCommentActivity();
      return;
    }
    this.syncVideoState(t), this.finalPhaseActive = !1, this.resetCommentActivity();
  }
  syncVideoState(e) {
    this.duration = Number.isFinite(e.duration) ? E(e.duration) : 0, this.currentTime = E(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.lastDrawTime = this.timeSource.now();
  }
  resetCommentActivity() {
    const e = this.timeSource.now(), t = this.canvas, s = this.ctx;
    if (t && s) {
      const i = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / i, r = this.displayHeight > 0 ? this.displayHeight : t.height / i;
      s.clearRect(0, 0, n, r);
    }
    this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear(), this.comments.forEach((i) => {
      i.isActive = !1, i.isPaused = !this.isPlaying, i.hasShown = !1, i.lane = -1, i.x = i.virtualStartX, i.speed = i.baseSpeed, i.lastUpdateTime = e, i.clearActivation();
    });
  }
  setupVideoChangeDetection(e, t) {
    if (typeof MutationObserver > "u") {
      this.log.debug(
        "MutationObserver is not available in this environment. Video change detection is disabled."
      );
      return;
    }
    const s = new MutationObserver((n) => {
      for (const r of n) {
        if (r.type === "attributes" && r.attributeName === "src") {
          const l = r.target;
          let h = null, c = null;
          if ((l instanceof HTMLVideoElement || l instanceof HTMLSourceElement) && (h = typeof r.oldValue == "string" ? r.oldValue : null, c = l.getAttribute("src")), h === c)
            continue;
          this.handleVideoSourceChange(e);
          return;
        }
        if (r.type === "childList") {
          for (const l of r.addedNodes)
            if (l instanceof HTMLSourceElement) {
              this.handleVideoSourceChange(e);
              return;
            }
          for (const l of r.removedNodes)
            if (l instanceof HTMLSourceElement) {
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
      for (const r of n)
        if (r.type === "childList") {
          for (const l of r.addedNodes) {
            const h = this.extractVideoElement(l);
            if (h && h !== this.videoElement) {
              this.initialize(h);
              return;
            }
          }
          for (const l of r.removedNodes) {
            if (l === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
            if (l instanceof Element) {
              const h = l.querySelector("video");
              if (h && h === this.videoElement) {
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
  setupResizeHandling(e) {
    if (this.cleanupResizeHandling(), this._settings.useContainerResizeObserver && this.isResizeObserverAvailable) {
      const t = e.parentElement ?? e, s = new ResizeObserver((i) => {
        for (const n of i) {
          const { width: r, height: l } = n.contentRect;
          r > 0 && l > 0 ? this.resize(r, l) : this.resize();
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
  Ye as COMMENT_OVERLAY_VERSION,
  Re as Comment,
  Ke as CommentRenderer,
  $e as DEFAULT_RENDERER_SETTINGS,
  Pe as cloneDefaultSettings,
  _e as configureDebugLogging,
  Be as createDefaultAnimationFrameProvider,
  te as createDefaultTimeSource,
  Z as createLogger,
  g as debugLog,
  L as isDebugLoggingEnabled,
  Je as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.map
