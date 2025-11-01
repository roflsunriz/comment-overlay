const P = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, Y = (o, e, t) => {
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
}, I = (o, e = {}) => {
  const { level: t = "info", emitter: n = Y } = e, s = P[t], r = (i, a) => {
    P[i] < s || n(i, o, a);
  };
  return {
    debug: (...i) => r("debug", i),
    info: (...i) => r("info", i),
    warn: (...i) => r("warn", i),
    error: (...i) => r("error", i)
  };
}, q = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, $ = {
  defont: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", sans-serif',
  gothic: '"Noto Sans JP", "Yu Gothic", "Yu Gothic Medium", "Hiragino Kaku Gothic ProN", "Meiryo", "Segoe UI", sans-serif',
  mincho: '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "MS Mincho", "Times New Roman", serif'
}, z = {
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
}, F = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, j = /^[,.:;]+/, J = /[,.:;]+$/, K = (o) => {
  const e = o.trim();
  return e ? F.test(e) ? e : e.replace(j, "").replace(J, "") : "";
}, Z = (o) => F.test(o) ? o.toUpperCase() : null, Q = (o) => o === "naka" || o === "ue" || o === "shita", ee = (o) => o === "small" || o === "medium" || o === "big", te = (o) => o === "defont" || o === "gothic" || o === "mincho", ie = (o) => o in z, se = (o, e) => {
  let t = "naka", n = "medium", s = "defont", r = null, i = 1, a = null, l = !1;
  for (const f of o) {
    const p = K(typeof f == "string" ? f : "");
    if (!p)
      continue;
    if (F.test(p)) {
      const v = Z(p);
      if (v) {
        r = v;
        continue;
      }
    }
    const u = p.toLowerCase();
    if (Q(u)) {
      t = u;
      continue;
    }
    if (ee(u)) {
      n = u;
      continue;
    }
    if (te(u)) {
      s = u;
      continue;
    }
    if (ie(u)) {
      r = z[u].toUpperCase();
      continue;
    }
    if (u === "_live") {
      a = 0.5;
      continue;
    }
    u === "invisible" && (i = 0, l = !0);
  }
  const c = Math.max(0, Math.min(1, i)), h = (r ?? e.defaultColor).toUpperCase(), d = typeof a == "number" ? Math.max(0, Math.min(1, a)) : null;
  return {
    layout: t,
    size: n,
    sizeScale: q[n],
    font: s,
    fontFamily: $[s],
    resolvedColor: h,
    colorOverride: r,
    opacityMultiplier: c,
    opacityOverride: d,
    isInvisible: l
  };
}, R = I("CommentEngine:Comment"), y = 4e3, ne = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, b = (o) => !Number.isFinite(o) || o <= 0 ? 0 : o >= 1 ? 1 : o, w = (o) => o.length === 1 ? o.repeat(2) : o, g = (o) => Number.parseInt(o, 16), re = (o, e) => {
  const t = ne.exec(o);
  if (!t)
    return o;
  const n = t[1];
  let s, r, i, a = 1;
  n.length === 3 || n.length === 4 ? (s = g(w(n[0])), r = g(w(n[1])), i = g(w(n[2])), n.length === 4 && (a = g(w(n[3])) / 255)) : (s = g(n.slice(0, 2)), r = g(n.slice(2, 4)), i = g(n.slice(4, 6)), n.length === 8 && (a = g(n.slice(6, 8)) / 255));
  const l = b(a * b(e));
  return `rgba(${s}, ${r}, ${i}, ${l})`;
}, ae = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), k = () => ae(), oe = (o) => o === "ltr" ? "ltr" : "rtl", le = (o) => o === "ltr" ? 1 : -1;
class ce {
  text;
  vpos;
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
  directionSign = -1;
  timeSource;
  constructor(e, t, n, s, r = {}) {
    if (typeof e != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(t) || t < 0)
      throw new Error("Comment vpos must be a non-negative number");
    this.text = e, this.vpos = t, this.commands = Array.isArray(n) ? [...n] : [];
    const i = se(this.commands, {
      defaultColor: s.commentColor
    });
    this.layout = i.layout, this.isScrolling = this.layout === "naka", this.sizeScale = i.sizeScale, this.opacityMultiplier = i.opacityMultiplier, this.opacityOverride = i.opacityOverride, this.colorOverride = i.colorOverride, this.isInvisible = i.isInvisible, this.fontFamily = i.fontFamily, this.color = i.resolvedColor, this.opacity = this.getEffectiveOpacity(s.commentOpacity), this.timeSource = r.timeSource ?? k(), this.applyScrollDirection(s.scrollDirection), this.syncWithSettings(s);
  }
  prepare(e, t, n, s) {
    try {
      if (!e)
        throw new Error("Canvas context is required");
      if (!Number.isFinite(t) || !Number.isFinite(n))
        throw new Error("Canvas dimensions must be numbers");
      if (!s)
        throw new Error("Prepare options are required");
      const r = Math.max(t, 1), i = Math.max(24, Math.floor(n * 0.05)), a = Math.max(24, Math.floor(i * this.sizeScale));
      if (this.fontSize = a, e.font = `${this.fontSize}px ${this.fontFamily}`, this.width = e.measureText(this.text).width, this.height = this.fontSize, !this.isScrolling) {
        this.bufferWidth = 0;
        const M = Math.max((r - this.width) / 2, 0);
        this.virtualStartX = M, this.x = M, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = y, this.preCollisionDurationMs = y, this.totalDurationMs = y, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vpos + y, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const l = e.measureText("??".repeat(150)).width, c = this.width * Math.max(s.bufferRatio, 0);
      this.bufferWidth = Math.max(s.baseBufferPx, c);
      const h = Math.max(s.entryBufferPx, this.bufferWidth), d = this.scrollDirection, f = d === "rtl" ? r + s.virtualExtension : -this.width - this.bufferWidth - s.virtualExtension, p = d === "rtl" ? -this.width - this.bufferWidth - h : r + h, u = d === "rtl" ? r + h : -h, v = d === "rtl" ? f + this.width + this.bufferWidth : f - this.bufferWidth;
      this.virtualStartX = f, this.x = f, this.exitThreshold = p;
      const L = this.width / r;
      let x = s.maxVisibleDurationMs;
      if (L > 1) {
        const M = Math.min(L, s.maxWidthRatio), G = s.maxVisibleDurationMs / Math.max(M, 1);
        x = Math.max(s.minVisibleDurationMs, Math.floor(G));
      }
      const V = r + this.width + this.bufferWidth + h, W = Math.max(x, 1), A = V / W, H = A * 1e3 / 60;
      this.baseSpeed = H, this.speed = this.baseSpeed, this.speedPixelsPerMs = A;
      const U = Math.abs(p - f), X = d === "rtl" ? Math.max(0, v - u) : Math.max(0, u - v), O = Math.max(A, Number.EPSILON);
      this.visibleDurationMs = x, this.preCollisionDurationMs = Math.max(0, Math.ceil(X / O)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(U / O)
      );
      const B = this.width + this.bufferWidth + h;
      this.reservationWidth = Math.min(l, B), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
    } catch (r) {
      throw R.error("Comment.prepare", r, {
        text: this.text,
        visibleWidth: t,
        canvasHeight: n,
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
      const n = this.timeSource.now();
      if (!this.isScrolling) {
        this.isPaused = t, this.lastUpdateTime = n;
        return;
      }
      if (t) {
        this.isPaused = !0, this.lastUpdateTime = n;
        return;
      }
      const s = (n - this.lastUpdateTime) / (1e3 / 60);
      this.speed = this.baseSpeed * e, this.x += this.speed * s * this.directionSign, (this.scrollDirection === "rtl" && this.x <= this.exitThreshold || this.scrollDirection === "ltr" && this.x >= this.exitThreshold) && (this.isActive = !1), this.lastUpdateTime = n, this.isPaused = !1;
    } catch (n) {
      R.error("Comment.update", n, {
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
      const n = b(this.opacity);
      e.globalAlpha = n;
      const s = t ?? this.x, r = this.y + this.fontSize;
      e.strokeStyle = "#000000", e.lineWidth = Math.max(3, this.fontSize / 8), e.lineJoin = "round", e.strokeText(this.text, s, r), e.globalAlpha = 1;
      const i = Math.max(1, this.fontSize * 0.04), a = this.fontSize * 0.18;
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
      ].forEach((c) => {
        const h = b(c.alpha * n);
        e.shadowColor = `rgba(${c.rgb}, ${h})`, e.shadowBlur = a * c.blurMultiplier, e.shadowOffsetX = i * c.offsetXMultiplier, e.shadowOffsetY = i * c.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", e.fillText(this.text, s, r);
      }), e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0, e.globalAlpha = 1, e.fillStyle = re(this.color, n), e.fillText(this.text, s, r), e.restore();
    } catch (n) {
      R.error("Comment.draw", n, {
        text: this.text,
        isActive: this.isActive,
        hasContext: !!e,
        interpolatedX: t
      });
    }
  }
  syncWithSettings(e) {
    this.color = this.getEffectiveColor(e.commentColor), this.opacity = this.getEffectiveOpacity(e.commentOpacity), this.applyScrollDirection(e.scrollDirection);
  }
  getEffectiveColor(e) {
    const t = this.colorOverride ?? e;
    return typeof t != "string" || t.length === 0 ? e : t.toUpperCase();
  }
  getEffectiveOpacity(e) {
    if (typeof this.opacityOverride == "number")
      return b(this.opacityOverride);
    const t = e * this.opacityMultiplier;
    return Number.isFinite(t) ? b(t) : 0;
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
    const t = oe(e);
    this.scrollDirection = t, this.directionSign = le(t);
  }
}
const T = {
  commentColor: "#FFFFFF",
  commentOpacity: 0.75,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl"
}, Ee = T, he = () => ({
  ...T,
  ngWords: [...T.ngWords],
  ngRegexps: [...T.ngRegexps]
}), Te = "v1.1.0", S = (o) => o * 1e3, ue = 1e4, _ = 2e3, de = 1e3, fe = 4e3, pe = 1800, me = 3, ve = 0.25, ge = 32, Se = 48, C = 120, be = 1, ye = 12, D = 24, m = 1e-3, N = 50, E = (o) => ({
  ...o,
  scrollDirection: o.scrollDirection === "ltr" ? "ltr" : "rtl"
}), Me = (o) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (e) => window.requestAnimationFrame(e),
  cancel: (e) => window.cancelAnimationFrame(e)
} : {
  request: (e) => globalThis.setTimeout(() => {
    e(o.now());
  }, 16),
  cancel: (e) => {
    globalThis.clearTimeout(e);
  }
}, we = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Ce = (o) => {
  if (!o || typeof o != "object")
    return !1;
  const e = o;
  return typeof e.commentColor == "string" && typeof e.commentOpacity == "number" && typeof e.isCommentVisible == "boolean";
};
class Le {
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
  laneCount = ye;
  laneHeight = 0;
  currentTime = 0;
  duration = 0;
  playbackRate = 1;
  isPlaying = !0;
  lastDrawTime = 0;
  finalPhaseActive = !1;
  frameId = null;
  resizeObserver = null;
  resizeObserverTarget = null;
  isResizeObserverAvailable = typeof ResizeObserver < "u";
  cleanupTasks = [];
  constructor(e = null, t = void 0) {
    let n, s;
    if (Ce(e))
      n = E({ ...e }), s = t ?? {};
    else {
      const r = e ?? t ?? {};
      s = typeof r == "object" ? r : {}, n = E(he());
    }
    this.timeSource = s.timeSource ?? k(), this.animationFrameProvider = s.animationFrameProvider ?? Me(this.timeSource), this.createCanvasElement = s.createCanvasElement ?? we(), this.commentDependencies = { timeSource: this.timeSource }, this._settings = E(n), this.log = I(s.loggerNamespace ?? "CommentRenderer");
  }
  get settings() {
    return this._settings;
  }
  set settings(e) {
    this._settings = E(e);
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
      const t = e instanceof HTMLVideoElement ? e : e.video, n = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, s = this.resolveContainer(n ?? null, t);
      this.videoElement = t, this.containerElement = s, this.duration = Number.isFinite(t.duration) ? S(t.duration) : 0, this.currentTime = S(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.lastDrawTime = this.timeSource.now();
      const r = this.createCanvasElement(), i = r.getContext("2d");
      if (!i)
        throw new Error("Failed to acquire 2D canvas context");
      r.style.position = "absolute", r.style.top = "0", r.style.left = "0", r.style.pointerEvents = "none", r.style.zIndex = "1000";
      const a = this.containerElement;
      a instanceof HTMLElement && (this.ensureContainerPositioning(a), a.appendChild(r)), this.canvas = r, this.ctx = i, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupVideoChangeDetection(t, s), this.startAnimation();
    } catch (t) {
      throw this.log.error("CommentRenderer.initialize", t), t;
    }
  }
  addComment(e, t, n = []) {
    if (this.isNGComment(e) || this.comments.some(
      (i) => i.text === e && i.vpos === t
    ))
      return null;
    const r = new ce(e, t, n, this._settings, this.commentDependencies);
    return this.comments.push(r), this.comments.sort((i, a) => i.vpos - a.vpos), r;
  }
  clearComments() {
    this.comments.length = 0, this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear(), this.ctx && this.canvas && this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  resetState() {
    this.clearComments(), this.currentTime = 0, this.finalPhaseActive = !1;
  }
  destroy() {
    this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.reservedLanes.clear(), this.finalPhaseActive = !1;
  }
  updateSettings(e) {
    const t = this._settings.useContainerResizeObserver, n = this._settings.scrollDirection;
    this.settings = e;
    const s = n !== this._settings.scrollDirection;
    this.comments.forEach((r) => {
      r.syncWithSettings(this._settings);
    }), s && this.resetCommentActivity(), !this._settings.isCommentVisible && this.ctx && this.canvas && (this.comments.forEach((r) => {
      r.isActive = !1, r.clearActivation();
    }), this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear()), t !== this._settings.useContainerResizeObserver && this.videoElement && this.setupResizeHandling(this.videoElement);
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
    const n = e.querySelector("source[src]");
    return n && typeof n.src == "string" ? n.src : null;
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
        if (this._settings.ngWords.some((s) => {
          if (typeof s != "string")
            return !1;
          const r = s.trim().toLowerCase();
          return r.length === 0 ? !1 : t.includes(r);
        }))
          return !0;
      }
      return Array.isArray(this._settings.ngRegexps) ? this._settings.ngRegexps.some((t) => {
        if (typeof t != "string" || t.length === 0)
          return !1;
        try {
          return new RegExp(t).test(e);
        } catch (n) {
          return this.log.error("CommentRenderer.isNGComment.regex", n, {
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
    const n = this.videoElement, s = this.canvas;
    if (!n || !s)
      return;
    const r = n.getBoundingClientRect(), i = e ?? r.width ?? s.width, a = t ?? r.height ?? s.height;
    if (!Number.isFinite(i) || !Number.isFinite(a) || i <= 0 || a <= 0)
      return;
    const l = Math.max(1, Math.floor(i)), c = Math.max(1, Math.floor(a));
    if (!Number.isFinite(l) || !Number.isFinite(c))
      return;
    const h = s.width || l, d = s.height || c;
    if (h === l && d === c)
      return;
    s.width = l, s.height = c, s.style.width = `${l}px`, s.style.height = `${c}px`;
    const f = h > 0 ? l / h : 1, p = d > 0 ? c / d : 1;
    (f !== 1 || p !== 1) && this.comments.forEach((u) => {
      u.isActive && (u.x *= f, u.y *= p, u.baseSpeed *= f, u.speed *= f, u.fontSize = Math.max(D, Math.floor(c * 0.05)));
    }), this.calculateLaneMetrics();
  }
  destroyCanvasOnly() {
    this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null;
  }
  calculateLaneMetrics() {
    const e = this.canvas;
    if (!e)
      return;
    const t = Math.max(D, Math.floor(e.height * 0.05));
    this.laneHeight = t * 1.2;
    const n = Math.floor(e.height / Math.max(this.laneHeight, 1));
    this.laneCount = Math.max(be, n), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
  }
  updateComments() {
    const e = this.videoElement, t = this.canvas, n = this.ctx;
    if (!e || !t || !n)
      return;
    this.currentTime = S(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused;
    const s = this.buildPrepareOptions(t.width), r = this.duration > 0 && this.duration - this.currentTime <= ue;
    r && !this.finalPhaseActive && (this.finalPhaseActive = !0, n.clearRect(0, 0, t.width, t.height), this.comments.forEach((i) => {
      i.isActive = !1, i.clearActivation();
    }), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear()), !r && this.finalPhaseActive && (this.finalPhaseActive = !1), this.pruneStaticLaneReservations(this.currentTime);
    for (const i of this.comments)
      if (!this.isNGComment(i.text)) {
        if (i.isInvisible) {
          i.isActive = !1, i.hasShown = !0, i.clearActivation();
          continue;
        }
        if (i.syncWithSettings(this._settings), this.shouldActivateCommentAtTime(i, this.currentTime) && this.activateComment(
          i,
          n,
          t.width,
          t.height,
          s,
          this.currentTime
        ), i.isActive) {
          if (i.layout !== "naka" && i.hasStaticExpired(this.currentTime)) {
            const a = i.layout === "ue" ? "ue" : "shita";
            this.releaseStaticLane(a, i.lane), i.isActive = !1, i.clearActivation();
            continue;
          }
          if (i.layout === "naka" && i.vpos > this.currentTime + N) {
            i.x = i.virtualStartX, i.lastUpdateTime = this.timeSource.now();
            continue;
          }
          if (i.hasShown = !0, i.update(this.playbackRate, !this.isPlaying), !i.isScrolling && i.hasStaticExpired(this.currentTime)) {
            const a = i.layout === "ue" ? "ue" : "shita";
            this.releaseStaticLane(a, i.lane), i.isActive = !1, i.clearActivation();
          }
        }
      }
    for (const i of this.comments)
      i.isActive && i.isScrolling && (i.scrollDirection === "rtl" && i.x <= i.exitThreshold || i.scrollDirection === "ltr" && i.x >= i.exitThreshold) && (i.isActive = !1, i.clearActivation());
  }
  buildPrepareOptions(e) {
    return {
      visibleWidth: e,
      virtualExtension: de,
      maxVisibleDurationMs: fe,
      minVisibleDurationMs: pe,
      maxWidthRatio: me,
      bufferRatio: ve,
      baseBufferPx: ge,
      entryBufferPx: Se
    };
  }
  findAvailableLane(e) {
    const t = this.currentTime;
    this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
    const n = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t);
    for (const i of n)
      if (this.isLaneAvailable(i, s, t))
        return this.storeLaneReservation(i, s), i;
    const r = n[0] ?? 0;
    return this.storeLaneReservation(r, s), r;
  }
  pruneLaneReservations(e) {
    for (const [t, n] of this.reservedLanes.entries()) {
      const s = n.filter(
        (r) => r.totalEndTime + C > e
      );
      s.length > 0 ? this.reservedLanes.set(t, s) : this.reservedLanes.delete(t);
    }
  }
  pruneStaticLaneReservations(e) {
    for (const [t, n] of this.topStaticLaneReservations.entries())
      n <= e && this.topStaticLaneReservations.delete(t);
    for (const [t, n] of this.bottomStaticLaneReservations.entries())
      n <= e && this.bottomStaticLaneReservations.delete(t);
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
  shouldActivateCommentAtTime(e, t) {
    return !(e.isInvisible || e.isActive || e.vpos > t + N || e.vpos < t - _);
  }
  activateComment(e, t, n, s, r, i) {
    if (e.prepare(t, n, s, r), e.layout === "naka") {
      const h = Math.max(0, i - e.vpos), d = e.speedPixelsPerMs * h, f = e.getDirectionSign(), p = e.virtualStartX + f * d, u = e.exitThreshold, v = e.scrollDirection;
      if (v === "rtl" && p <= u || v === "ltr" && p >= u) {
        e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1;
        return;
      }
      e.lane = this.findAvailableLane(e), e.y = e.lane * this.laneHeight, e.x = p, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(i), e.lastUpdateTime = this.timeSource.now();
      return;
    }
    const a = e.vpos + y;
    if (i > a) {
      e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1;
      return;
    }
    const l = e.layout === "ue" ? "ue" : "shita", c = this.assignStaticLane(l);
    e.lane = c, e.y = c * this.laneHeight, e.x = e.virtualStartX, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(i), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = a, this.reserveStaticLane(l, c, a);
  }
  assignStaticLane(e) {
    const t = this.getStaticLaneMap(e), n = Array.from({ length: this.laneCount }, (i, a) => a);
    e === "shita" && n.reverse();
    for (const i of n)
      if (!t.has(i))
        return i;
    let s = n[0] ?? 0, r = Number.POSITIVE_INFINITY;
    for (const [i, a] of t.entries())
      a < r && (r = a, s = i);
    return s;
  }
  reserveStaticLane(e, t, n) {
    this.getStaticLaneMap(e).set(t, n);
  }
  releaseStaticLane(e, t) {
    if (t < 0)
      return;
    this.getStaticLaneMap(e).delete(t);
  }
  getLanePriorityOrder(e) {
    const n = Array.from({ length: this.laneCount }, (a, l) => l).sort((a, l) => {
      const c = this.getLaneNextAvailableTime(a, e), h = this.getLaneNextAvailableTime(l, e);
      return Math.abs(c - h) <= m ? a - l : c - h;
    }), s = this.getStaticReservedLaneSet();
    if (s.size === 0)
      return n;
    const r = n.filter((a) => !s.has(a));
    if (r.length === 0)
      return n;
    const i = n.filter((a) => s.has(a));
    return [...r, ...i];
  }
  getLaneNextAvailableTime(e, t) {
    const n = this.reservedLanes.get(e);
    if (!n || n.length === 0)
      return t;
    let s = t;
    for (const r of n)
      s = Math.max(s, r.endTime);
    return s;
  }
  createLaneReservation(e, t) {
    const n = Math.max(e.speedPixelsPerMs, m), s = t + e.preCollisionDurationMs + C, r = t + e.totalDurationMs + C;
    return {
      comment: e,
      startTime: t,
      endTime: Math.max(t, s),
      totalEndTime: Math.max(t, r),
      startLeft: e.virtualStartX,
      width: e.width,
      speed: n,
      buffer: e.bufferWidth,
      directionSign: e.getDirectionSign()
    };
  }
  isLaneAvailable(e, t, n) {
    const s = this.reservedLanes.get(e);
    if (!s || s.length === 0)
      return !0;
    for (const r of s)
      if (!(r.totalEndTime + C <= n) && this.areReservationsConflicting(r, t))
        return !1;
    return !0;
  }
  storeLaneReservation(e, t) {
    const s = [...this.reservedLanes.get(e) ?? [], t].sort((r, i) => r.endTime - i.endTime);
    this.reservedLanes.set(e, s);
  }
  areReservationsConflicting(e, t) {
    const n = Math.max(e.startTime, t.startTime), s = Math.min(e.endTime, t.endTime);
    if (n >= s)
      return !1;
    const r = /* @__PURE__ */ new Set([
      n,
      s,
      n + (s - n) / 2
    ]), i = this.solveLeftRightEqualityTime(e, t);
    i !== null && i >= n - m && i <= s + m && r.add(i);
    const a = this.solveLeftRightEqualityTime(t, e);
    a !== null && a >= n - m && a <= s + m && r.add(a);
    for (const l of r) {
      if (l < n - m || l > s + m)
        continue;
      const c = this.computeForwardGap(e, t, l), h = this.computeForwardGap(t, e, l);
      if (c <= m && h <= m)
        return !0;
    }
    return !1;
  }
  computeForwardGap(e, t, n) {
    const s = this.getBufferedEdges(e, n), r = this.getBufferedEdges(t, n);
    return s.left - r.right;
  }
  getBufferedEdges(e, t) {
    const n = Math.max(0, t - e.startTime), s = e.speed * n, r = e.startLeft + e.directionSign * s, i = r - e.buffer, a = r + e.width + e.buffer;
    return { left: i, right: a };
  }
  solveLeftRightEqualityTime(e, t) {
    const n = e.directionSign, s = t.directionSign, r = s * t.speed - n * e.speed;
    if (Math.abs(r) < m)
      return null;
    const a = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - n * e.speed * e.startTime + e.buffer) / r;
    return Number.isFinite(a) ? a : null;
  }
  draw() {
    const e = this.canvas, t = this.ctx;
    if (!e || !t)
      return;
    t.clearRect(0, 0, e.width, e.height);
    const n = this.comments.filter((r) => r.isActive), s = this.timeSource.now();
    if (this._settings.isCommentVisible) {
      const r = (s - this.lastDrawTime) / 16.666666666666668;
      n.forEach((i) => {
        const a = i.x + i.getDirectionSign() * i.speed * r;
        i.draw(t, a);
      });
    }
    this.lastDrawTime = s;
  }
  updateFrame = () => {
    if (this.videoElement) {
      if (!this._settings.isCommentVisible) {
        this.frameId = this.animationFrameProvider.request(this.updateFrame);
        return;
      }
      this.updateComments(), this.draw(), this.frameId = this.animationFrameProvider.request(this.updateFrame);
    }
  };
  startAnimation() {
    this.stopAnimation(), this.frameId = this.animationFrameProvider.request(this.updateFrame);
  }
  stopAnimation() {
    this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
  }
  onSeek() {
    const e = this.canvas, t = this.ctx, n = this.videoElement;
    if (!e || !t || !n)
      return;
    const s = S(n.currentTime);
    this.finalPhaseActive = !1, this.currentTime = s, this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    const r = this.buildPrepareOptions(e.width);
    this.comments.forEach((i) => {
      if (this.isNGComment(i.text)) {
        i.isActive = !1, i.clearActivation();
        return;
      }
      if (i.isInvisible) {
        i.isActive = !1, i.hasShown = !0, i.clearActivation();
        return;
      }
      if (i.syncWithSettings(this._settings), i.isActive = !1, i.lane = -1, i.clearActivation(), this.shouldActivateCommentAtTime(i, this.currentTime)) {
        this.activateComment(
          i,
          t,
          e.width,
          e.height,
          r,
          this.currentTime
        );
        return;
      }
      i.vpos < this.currentTime - _ ? i.hasShown = !0 : i.hasShown = !1;
    });
  }
  setupVideoEventListeners(e) {
    try {
      const t = () => {
        this.isPlaying = !0;
        const h = this.timeSource.now();
        this.lastDrawTime = h, this.comments.forEach((d) => {
          d.lastUpdateTime = h, d.isPaused = !1;
        });
      }, n = () => {
        this.isPlaying = !1;
        const h = this.timeSource.now();
        this.comments.forEach((d) => {
          d.lastUpdateTime = h, d.isPaused = !0;
        });
      }, s = () => {
        this.onSeek();
      }, r = () => {
        this.onSeek();
      }, i = () => {
        this.playbackRate = e.playbackRate;
        const h = this.timeSource.now();
        this.comments.forEach((d) => {
          d.lastUpdateTime = h;
        });
      }, a = () => {
        this.handleVideoMetadataLoaded(e);
      }, l = () => {
        this.duration = Number.isFinite(e.duration) ? S(e.duration) : 0;
      }, c = () => {
        this.handleVideoSourceChange();
      };
      e.addEventListener("play", t), e.addEventListener("pause", n), e.addEventListener("seeking", s), e.addEventListener("seeked", r), e.addEventListener("ratechange", i), e.addEventListener("loadedmetadata", a), e.addEventListener("durationchange", l), e.addEventListener("emptied", c), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", n)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", r)), this.addCleanup(() => e.removeEventListener("ratechange", i)), this.addCleanup(() => e.removeEventListener("loadedmetadata", a)), this.addCleanup(() => e.removeEventListener("durationchange", l)), this.addCleanup(() => e.removeEventListener("emptied", c));
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
    this.duration = Number.isFinite(e.duration) ? S(e.duration) : 0, this.currentTime = S(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.lastDrawTime = this.timeSource.now();
  }
  resetCommentActivity() {
    const e = this.timeSource.now(), t = this.canvas, n = this.ctx;
    t && n && n.clearRect(0, 0, t.width, t.height), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear(), this.comments.forEach((s) => {
      s.isActive = !1, s.isPaused = !this.isPlaying, s.hasShown = !1, s.lane = -1, s.x = s.virtualStartX, s.speed = s.baseSpeed, s.lastUpdateTime = e, s.clearActivation();
    });
  }
  setupVideoChangeDetection(e, t) {
    if (typeof MutationObserver > "u") {
      this.log.debug(
        "MutationObserver is not available in this environment. Video change detection is disabled."
      );
      return;
    }
    const n = new MutationObserver((r) => {
      for (const i of r) {
        if (i.type === "attributes" && i.attributeName === "src") {
          const a = i.target;
          let l = null, c = null;
          if ((a instanceof HTMLVideoElement || a instanceof HTMLSourceElement) && (l = typeof i.oldValue == "string" ? i.oldValue : null, c = a.getAttribute("src")), l === c)
            continue;
          this.handleVideoSourceChange(e);
          return;
        }
        if (i.type === "childList") {
          for (const a of i.addedNodes)
            if (a instanceof HTMLSourceElement) {
              this.handleVideoSourceChange(e);
              return;
            }
          for (const a of i.removedNodes)
            if (a instanceof HTMLSourceElement) {
              this.handleVideoSourceChange(e);
              return;
            }
        }
      }
    });
    n.observe(e, {
      attributes: !0,
      attributeFilter: ["src"],
      attributeOldValue: !0,
      childList: !0,
      subtree: !0
    }), this.addCleanup(() => n.disconnect());
    const s = new MutationObserver((r) => {
      for (const i of r)
        if (i.type === "childList") {
          for (const a of i.addedNodes) {
            const l = this.extractVideoElement(a);
            if (l && l !== this.videoElement) {
              this.initialize(l);
              return;
            }
          }
          for (const a of i.removedNodes) {
            if (a === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
            if (a instanceof Element) {
              const l = a.querySelector("video");
              if (l && l === this.videoElement) {
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
  setupResizeHandling(e) {
    if (this.cleanupResizeHandling(), this._settings.useContainerResizeObserver && this.isResizeObserverAvailable) {
      const t = e.parentElement ?? e, n = new ResizeObserver((s) => {
        for (const r of s) {
          const { width: i, height: a } = r.contentRect;
          i > 0 && a > 0 ? this.resize(i, a) : this.resize();
        }
      });
      n.observe(t), this.resizeObserver = n, this.resizeObserverTarget = t;
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
  Te as COMMENT_OVERLAY_VERSION,
  ce as Comment,
  Le as CommentRenderer,
  Ee as DEFAULT_RENDERER_SETTINGS,
  he as cloneDefaultSettings,
  Me as createDefaultAnimationFrameProvider,
  k as createDefaultTimeSource,
  I as createLogger
};
//# sourceMappingURL=comment-overlay.es.map
