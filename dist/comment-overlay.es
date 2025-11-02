const I = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, $ = (l, e, t) => {
  const i = [`[${e}]`, ...t];
  switch (l) {
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
}, U = (l, e = {}) => {
  const { level: t = "info", emitter: s = $ } = e, i = I[t], n = (r, a) => {
    I[r] < i || s(r, l, a);
  };
  return {
    debug: (...r) => n("debug", r),
    info: (...r) => n("info", r),
    warn: (...r) => n("warn", r),
    error: (...r) => n("error", r)
  };
}, j = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, J = {
  defont: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", sans-serif',
  gothic: '"Noto Sans JP", "Yu Gothic", "Yu Gothic Medium", "Hiragino Kaku Gothic ProN", "Meiryo", "Segoe UI", sans-serif',
  mincho: '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "MS Mincho", "Times New Roman", serif'
}, X = {
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
}, _ = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, K = /^[,.:;]+/, Z = /[,.:;]+$/, Q = (l) => {
  const e = l.trim();
  return e ? _.test(e) ? e : e.replace(K, "").replace(Z, "") : "";
}, ee = (l) => _.test(l) ? l.toUpperCase() : null, te = (l) => l === "naka" || l === "ue" || l === "shita", ie = (l) => l === "small" || l === "medium" || l === "big", se = (l) => l === "defont" || l === "gothic" || l === "mincho", ne = (l) => l in X, re = (l, e) => {
  let t = "naka", s = "medium", i = "defont", n = null, r = 1, a = null, h = !1;
  for (const u of l) {
    const p = Q(typeof u == "string" ? u : "");
    if (!p)
      continue;
    if (_.test(p)) {
      const S = ee(p);
      if (S) {
        n = S;
        continue;
      }
    }
    const f = p.toLowerCase();
    if (te(f)) {
      t = f;
      continue;
    }
    if (ie(f)) {
      s = f;
      continue;
    }
    if (se(f)) {
      i = f;
      continue;
    }
    if (ne(f)) {
      n = X[f].toUpperCase();
      continue;
    }
    if (f === "_live") {
      a = 0.5;
      continue;
    }
    f === "invisible" && (r = 0, h = !0);
  }
  const c = Math.max(0, Math.min(1, r)), d = (n ?? e.defaultColor).toUpperCase(), o = typeof a == "number" ? Math.max(0, Math.min(1, a)) : null;
  return {
    layout: t,
    size: s,
    sizeScale: j[s],
    font: i,
    fontFamily: J[i],
    resolvedColor: d,
    colorOverride: n,
    opacityMultiplier: c,
    opacityOverride: o,
    isInvisible: h
  };
}, O = U("CommentEngine:Comment"), E = 4e3, ae = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, w = (l) => !Number.isFinite(l) || l <= 0 ? 0 : l >= 1 ? 1 : l, A = (l) => l.length === 1 ? l.repeat(2) : l, b = (l) => Number.parseInt(l, 16), oe = (l, e) => {
  const t = ae.exec(l);
  if (!t)
    return l;
  const s = t[1];
  let i, n, r, a = 1;
  s.length === 3 || s.length === 4 ? (i = b(A(s[0])), n = b(A(s[1])), r = b(A(s[2])), s.length === 4 && (a = b(A(s[3])) / 255)) : (i = b(s.slice(0, 2)), n = b(s.slice(2, 4)), r = b(s.slice(4, 6)), s.length === 8 && (a = b(s.slice(6, 8)) / 255));
  const h = w(a * w(e));
  return `rgba(${i}, ${n}, ${r}, ${h})`;
}, le = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), B = () => le(), ce = (l) => l === "ltr" ? "ltr" : "rtl", he = (l) => l === "ltr" ? 1 : -1;
class de {
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
  renderStyle = "outline-only";
  creationIndex = 0;
  directionSign = -1;
  timeSource;
  constructor(e, t, s, i, n = {}) {
    if (typeof e != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(t) || t < 0)
      throw new Error("Comment vpos must be a non-negative number");
    this.text = e, this.vpos = t, this.commands = Array.isArray(s) ? [...s] : [];
    const r = re(this.commands, {
      defaultColor: i.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.fontFamily = r.fontFamily, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(i.commentOpacity), this.renderStyle = i.renderStyle, this.timeSource = n.timeSource ?? B(), this.applyScrollDirection(i.scrollDirection), this.syncWithSettings(i);
  }
  prepare(e, t, s, i) {
    try {
      if (!e)
        throw new Error("Canvas context is required");
      if (!Number.isFinite(t) || !Number.isFinite(s))
        throw new Error("Canvas dimensions must be numbers");
      if (!i)
        throw new Error("Prepare options are required");
      const n = Math.max(t, 1), r = Math.max(24, Math.floor(s * 0.05)), a = Math.max(24, Math.floor(r * this.sizeScale));
      if (this.fontSize = a, e.font = `${this.fontSize}px ${this.fontFamily}`, this.width = e.measureText(this.text).width, this.height = this.fontSize, !this.isScrolling) {
        this.bufferWidth = 0;
        const L = Math.max((n - this.width) / 2, 0);
        this.virtualStartX = L, this.x = L, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = E, this.preCollisionDurationMs = E, this.totalDurationMs = E, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vpos + E, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const h = e.measureText("??".repeat(150)).width, c = this.width * Math.max(i.bufferRatio, 0);
      this.bufferWidth = Math.max(i.baseBufferPx, c);
      const d = Math.max(i.entryBufferPx, this.bufferWidth), o = this.scrollDirection, u = o === "rtl" ? n + i.virtualExtension : -this.width - this.bufferWidth - i.virtualExtension, p = o === "rtl" ? -this.width - this.bufferWidth - d : n + d, f = o === "rtl" ? n + d : -d, S = o === "rtl" ? u + this.width + this.bufferWidth : u - this.bufferWidth;
      this.virtualStartX = u, this.x = u, this.exitThreshold = p;
      const y = this.width / n;
      let C = i.maxVisibleDurationMs;
      if (y > 1) {
        const L = Math.min(y, i.maxWidthRatio), Y = i.maxVisibleDurationMs / Math.max(L, 1);
        C = Math.max(i.minVisibleDurationMs, Math.floor(Y));
      }
      const T = n + this.width + this.bufferWidth + d, P = Math.max(C, 1), v = T / P, x = v * 1e3 / 60;
      this.baseSpeed = x, this.speed = this.baseSpeed, this.speedPixelsPerMs = v;
      const m = Math.abs(p - u), q = o === "rtl" ? Math.max(0, S - f) : Math.max(0, f - S), N = Math.max(v, Number.EPSILON);
      this.visibleDurationMs = C, this.preCollisionDurationMs = Math.max(0, Math.ceil(q / N)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(m / N)
      );
      const G = this.width + this.bufferWidth + d;
      this.reservationWidth = Math.min(h, G), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
    } catch (n) {
      throw O.error("Comment.prepare", n, {
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
      O.error("Comment.update", s, {
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
      const s = w(this.opacity);
      e.globalAlpha = s;
      const i = t ?? this.x, n = this.y + this.fontSize;
      if (e.strokeStyle = "#000000", e.lineWidth = Math.max(3, this.fontSize / 8), e.lineJoin = "round", e.strokeText(this.text, i, n), e.globalAlpha = 1, this.renderStyle === "classic") {
        const r = Math.max(1, this.fontSize * 0.04), a = this.fontSize * 0.18;
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
          const d = w(c.alpha * s);
          e.shadowColor = `rgba(${c.rgb}, ${d})`, e.shadowBlur = a * c.blurMultiplier, e.shadowOffsetX = r * c.offsetXMultiplier, e.shadowOffsetY = r * c.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", e.fillText(this.text, i, n);
        }), e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      } else
        e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      e.globalAlpha = 1, e.fillStyle = oe(this.color, s), e.fillText(this.text, i, n), e.restore();
    } catch (s) {
      O.error("Comment.draw", s, {
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
      return w(this.opacityOverride);
    const t = e * this.opacityMultiplier;
    return Number.isFinite(t) ? w(t) : 0;
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
    const t = ce(e);
    this.scrollDirection = t, this.directionSign = he(t);
  }
}
const ue = 4e3, F = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: ue,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0
}, Ae = F, fe = () => ({
  ...F,
  ngWords: [...F.ngWords],
  ngRegexps: [...F.ngRegexps]
}), Re = "v1.1.0", M = (l) => l * 1e3, pe = 10, me = (l) => {
  if (!Number.isFinite(l))
    return 0;
  const e = Math.max(0, l);
  return Math.round(e * pe);
}, ve = 4e3, V = 2e3, ge = 1e3, Se = 4e3, ye = 1800, be = 3, Me = 0.25, Ce = 32, we = 48, R = 120, z = 1, k = 12, H = 24, g = 1e-3, W = 50, xe = (l) => Number.isFinite(l) ? l <= 0 ? 0 : l >= 1 ? 1 : l : 1, D = (l) => {
  const e = l.scrollVisibleDurationMs, t = e == null ? null : Number.isFinite(e) ? Math.max(1, Math.floor(e)) : null;
  return {
    ...l,
    scrollDirection: l.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: xe(l.commentOpacity),
    renderStyle: l.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: t,
    syncMode: l.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!l.useDprScaling
  };
}, Ee = (l) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (e) => window.requestAnimationFrame(e),
  cancel: (e) => window.cancelAnimationFrame(e)
} : {
  request: (e) => globalThis.setTimeout(() => {
    e(l.now());
  }, 16),
  cancel: (e) => {
    globalThis.clearTimeout(e);
  }
}, Te = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Le = (l) => {
  if (!l || typeof l != "object")
    return !1;
  const e = l;
  return typeof e.commentColor == "string" && typeof e.commentOpacity == "number" && typeof e.isCommentVisible == "boolean";
};
class De {
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
  laneCount = k;
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
    if (Le(e))
      s = D({ ...e }), i = t ?? {};
    else {
      const n = e ?? t ?? {};
      i = typeof n == "object" ? n : {}, s = D(fe());
    }
    this.timeSource = i.timeSource ?? B(), this.animationFrameProvider = i.animationFrameProvider ?? Ee(this.timeSource), this.createCanvasElement = i.createCanvasElement ?? Te(), this.commentDependencies = { timeSource: this.timeSource }, this._settings = D(s), this.log = U(i.loggerNamespace ?? "CommentRenderer");
  }
  get settings() {
    return this._settings;
  }
  set settings(e) {
    this._settings = D(e);
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
      this.videoElement = t, this.containerElement = i, this.duration = Number.isFinite(t.duration) ? M(t.duration) : 0, this.currentTime = M(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.lastDrawTime = this.timeSource.now();
      const n = this.createCanvasElement(), r = n.getContext("2d");
      if (!r)
        throw new Error("Failed to acquire 2D canvas context");
      n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
      const a = this.containerElement;
      a instanceof HTMLElement && (this.ensureContainerPositioning(a), a.appendChild(n)), this.canvas = n, this.ctx = r, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupVideoChangeDetection(t, i), this.startAnimation();
    } catch (t) {
      throw this.log.error("CommentRenderer.initialize", t), t;
    }
  }
  addComment(e, t, s = []) {
    if (this.isNGComment(e))
      return null;
    const i = me(t);
    if (this.comments.some(
      (a) => a.text === e && a.vpos === i
    ))
      return null;
    const r = new de(e, i, s, this._settings, this.commentDependencies);
    return r.creationIndex = this.commentSequence++, this.comments.push(r), this.comments.sort((a, h) => {
      const c = a.vpos - h.vpos;
      return Math.abs(c) > g ? c : a.creationIndex - h.creationIndex;
    }), r;
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
    const r = s !== this._settings.scrollDirection, a = i !== this._settings.useDprScaling, h = n !== this._settings.syncMode;
    if (this.comments.forEach((c) => {
      c.syncWithSettings(this._settings);
    }), r && this.resetCommentActivity(), !this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((u) => {
        u.isActive = !1, u.clearActivation();
      });
      const c = this.canvasDpr > 0 ? this.canvasDpr : 1, d = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / c, o = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / c;
      this.ctx.clearRect(0, 0, d, o), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    }
    t !== this._settings.useContainerResizeObserver && this.videoElement && this.setupResizeHandling(this.videoElement), a && this.resize(), h && this.videoElement && this.startAnimation();
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
    const r = s.getBoundingClientRect(), a = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : i.width / a, c = this.displayHeight > 0 ? this.displayHeight : i.height / a, d = e ?? r.width ?? h, o = t ?? r.height ?? c;
    if (!Number.isFinite(d) || !Number.isFinite(o) || d <= 0 || o <= 0)
      return;
    const u = Math.max(1, Math.floor(d)), p = Math.max(1, Math.floor(o)), f = this.displayWidth > 0 ? this.displayWidth : u, S = this.displayHeight > 0 ? this.displayHeight : p, y = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, C = Math.max(1, Math.round(u * y)), T = Math.max(1, Math.round(p * y));
    if (!(this.displayWidth !== u || this.displayHeight !== p || Math.abs(this.canvasDpr - y) > Number.EPSILON || i.width !== C || i.height !== T))
      return;
    this.displayWidth = u, this.displayHeight = p, this.canvasDpr = y, i.width = C, i.height = T, i.style.width = `${u}px`, i.style.height = `${p}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(y, y));
    const v = f > 0 ? u / f : 1, x = S > 0 ? p / S : 1;
    (v !== 1 || x !== 1) && this.comments.forEach((m) => {
      m.isActive && (m.x *= v, m.y *= x, m.width *= v, m.fontSize = Math.max(
        H,
        Math.floor(Math.max(1, m.fontSize) * x)
      ), m.height = m.fontSize, m.virtualStartX *= v, m.exitThreshold *= v, m.baseSpeed *= v, m.speed *= v, m.speedPixelsPerMs *= v, m.bufferWidth *= v, m.reservationWidth *= v);
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
    const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), s = Math.max(H, Math.floor(t * 0.05));
    this.laneHeight = s * 1.2;
    const i = Math.floor(t / Math.max(this.laneHeight, 1));
    if (this._settings.useFixedLaneCount) {
      const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : k, r = Math.max(z, Math.min(i, n));
      this.laneCount = r;
    } else
      this.laneCount = Math.max(z, i);
    this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
  }
  updateComments(e) {
    const t = this.videoElement, s = this.canvas, i = this.ctx;
    if (!t || !s || !i)
      return;
    const n = typeof e == "number" ? e : M(t.currentTime);
    this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused;
    const r = this.canvasDpr > 0 ? this.canvasDpr : 1, a = this.displayWidth > 0 ? this.displayWidth : s.width / r, h = this.displayHeight > 0 ? this.displayHeight : s.height / r, c = this.buildPrepareOptions(a), d = this.duration > 0 && this.duration - this.currentTime <= ve;
    d && !this.finalPhaseActive && (this.finalPhaseActive = !0, i.clearRect(0, 0, a, h), this.comments.forEach((o) => {
      o.isActive = !1, o.clearActivation();
    }), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear()), !d && this.finalPhaseActive && (this.finalPhaseActive = !1), this.pruneStaticLaneReservations(this.currentTime);
    for (const o of this.comments)
      if (!this.isNGComment(o.text)) {
        if (o.isInvisible) {
          o.isActive = !1, o.hasShown = !0, o.clearActivation();
          continue;
        }
        if (o.syncWithSettings(this._settings), this.shouldActivateCommentAtTime(o, this.currentTime) && this.activateComment(
          o,
          i,
          a,
          h,
          c,
          this.currentTime
        ), o.isActive) {
          if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
            const u = o.layout === "ue" ? "ue" : "shita";
            this.releaseStaticLane(u, o.lane), o.isActive = !1, o.clearActivation();
            continue;
          }
          if (o.layout === "naka" && o.vpos > this.currentTime + W) {
            o.x = o.virtualStartX, o.lastUpdateTime = this.timeSource.now();
            continue;
          }
          if (o.hasShown = !0, o.update(this.playbackRate, !this.isPlaying), !o.isScrolling && o.hasStaticExpired(this.currentTime)) {
            const u = o.layout === "ue" ? "ue" : "shita";
            this.releaseStaticLane(u, o.lane), o.isActive = !1, o.clearActivation();
          }
        }
      }
    for (const o of this.comments)
      o.isActive && o.isScrolling && (o.scrollDirection === "rtl" && o.x <= o.exitThreshold || o.scrollDirection === "ltr" && o.x >= o.exitThreshold) && (o.isActive = !1, o.clearActivation());
  }
  buildPrepareOptions(e) {
    const t = this._settings.scrollVisibleDurationMs;
    return {
      visibleWidth: e,
      virtualExtension: ge,
      maxVisibleDurationMs: t !== null ? t : Se,
      minVisibleDurationMs: t !== null ? t : ye,
      maxWidthRatio: be,
      bufferRatio: Me,
      baseBufferPx: Ce,
      entryBufferPx: we
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
        (n) => n.totalEndTime + R > e
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
  shouldActivateCommentAtTime(e, t) {
    return !(e.isInvisible || e.isActive || e.vpos > t + W || e.vpos < t - V);
  }
  activateComment(e, t, s, i, n, r) {
    if (e.prepare(t, s, i, n), e.layout === "naka") {
      const d = Math.max(0, r - e.vpos), o = e.speedPixelsPerMs * d, u = e.getDirectionSign(), p = e.virtualStartX + u * o, f = e.exitThreshold, S = e.scrollDirection;
      if (S === "rtl" && p <= f || S === "ltr" && p >= f) {
        e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1;
        return;
      }
      e.lane = this.findAvailableLane(e), e.y = e.lane * this.laneHeight, e.x = p, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now();
      return;
    }
    const a = e.vpos + E;
    if (r > a) {
      e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1;
      return;
    }
    const h = e.layout === "ue" ? "ue" : "shita", c = this.assignStaticLane(h);
    e.lane = c, e.y = c * this.laneHeight, e.x = e.virtualStartX, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = a, this.reserveStaticLane(h, c, a);
  }
  assignStaticLane(e) {
    const t = this.getStaticLaneMap(e), s = Array.from({ length: this.laneCount }, (r, a) => a);
    e === "shita" && s.reverse();
    for (const r of s)
      if (!t.has(r))
        return r;
    let i = s[0] ?? 0, n = Number.POSITIVE_INFINITY;
    for (const [r, a] of t.entries())
      a < n && (n = a, i = r);
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
    const s = Array.from({ length: this.laneCount }, (a, h) => h).sort((a, h) => {
      const c = this.getLaneNextAvailableTime(a, e), d = this.getLaneNextAvailableTime(h, e);
      return Math.abs(c - d) <= g ? a - h : c - d;
    }), i = this.getStaticReservedLaneSet();
    if (i.size === 0)
      return s;
    const n = s.filter((a) => !i.has(a));
    if (n.length === 0)
      return s;
    const r = s.filter((a) => i.has(a));
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
    const s = Math.max(e.speedPixelsPerMs, g), i = t + e.preCollisionDurationMs + R, n = t + e.totalDurationMs + R;
    return {
      comment: e,
      startTime: t,
      endTime: Math.max(t, i),
      totalEndTime: Math.max(t, n),
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
      if (!(n.totalEndTime + R <= s) && this.areReservationsConflicting(n, t))
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
    r !== null && r >= s - g && r <= i + g && n.add(r);
    const a = this.solveLeftRightEqualityTime(t, e);
    a !== null && a >= s - g && a <= i + g && n.add(a);
    for (const h of n) {
      if (h < s - g || h > i + g)
        continue;
      const c = this.computeForwardGap(e, t, h), d = this.computeForwardGap(t, e, h);
      if (c <= g && d <= g)
        return !0;
    }
    return !1;
  }
  computeForwardGap(e, t, s) {
    const i = this.getBufferedEdges(e, s), n = this.getBufferedEdges(t, s);
    return i.left - n.right;
  }
  getBufferedEdges(e, t) {
    const s = Math.max(0, t - e.startTime), i = e.speed * s, n = e.startLeft + e.directionSign * i, r = n - e.buffer, a = n + e.width + e.buffer;
    return { left: r, right: a };
  }
  solveLeftRightEqualityTime(e, t) {
    const s = e.directionSign, i = t.directionSign, n = i * t.speed - s * e.speed;
    if (Math.abs(n) < g)
      return null;
    const a = (t.startLeft + i * t.speed * t.startTime + t.width + t.buffer - e.startLeft - s * e.speed * e.startTime + e.buffer) / n;
    return Number.isFinite(a) ? a : null;
  }
  draw() {
    const e = this.canvas, t = this.ctx;
    if (!e || !t)
      return;
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, i = this.displayWidth > 0 ? this.displayWidth : e.width / s, n = this.displayHeight > 0 ? this.displayHeight : e.height / s;
    t.clearRect(0, 0, i, n);
    const r = this.comments.filter((h) => h.isActive), a = this.timeSource.now();
    if (this._settings.isCommentVisible) {
      const h = (a - this.lastDrawTime) / 16.666666666666668;
      r.sort((c, d) => {
        const o = c.vpos - d.vpos;
        return Math.abs(o) > g ? o : c.isScrolling !== d.isScrolling ? c.isScrolling ? 1 : -1 : c.creationIndex - d.creationIndex;
      }), r.forEach((c) => {
        const d = c.x + c.getDirectionSign() * c.speed * h;
        c.draw(t, d);
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
    const i = M(s.currentTime);
    this.finalPhaseActive = !1, this.currentTime = i, this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    const n = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : e.width / n, a = this.displayHeight > 0 ? this.displayHeight : e.height / n, h = this.buildPrepareOptions(r);
    this.comments.forEach((c) => {
      if (this.isNGComment(c.text)) {
        c.isActive = !1, c.clearActivation();
        return;
      }
      if (c.isInvisible) {
        c.isActive = !1, c.hasShown = !0, c.clearActivation();
        return;
      }
      if (c.syncWithSettings(this._settings), c.isActive = !1, c.lane = -1, c.clearActivation(), this.shouldActivateCommentAtTime(c, this.currentTime)) {
        this.activateComment(
          c,
          t,
          r,
          a,
          h,
          this.currentTime
        );
        return;
      }
      c.vpos < this.currentTime - V ? c.hasShown = !0 : c.hasShown = !1;
    });
  }
  setupVideoEventListeners(e) {
    try {
      const t = () => {
        this.isPlaying = !0;
        const d = this.timeSource.now();
        this.lastDrawTime = d, this.comments.forEach((o) => {
          o.lastUpdateTime = d, o.isPaused = !1;
        });
      }, s = () => {
        this.isPlaying = !1;
        const d = this.timeSource.now();
        this.comments.forEach((o) => {
          o.lastUpdateTime = d, o.isPaused = !0;
        });
      }, i = () => {
        this.onSeek();
      }, n = () => {
        this.onSeek();
      }, r = () => {
        this.playbackRate = e.playbackRate;
        const d = this.timeSource.now();
        this.comments.forEach((o) => {
          o.lastUpdateTime = d;
        });
      }, a = () => {
        this.handleVideoMetadataLoaded(e);
      }, h = () => {
        this.duration = Number.isFinite(e.duration) ? M(e.duration) : 0;
      }, c = () => {
        this.handleVideoSourceChange();
      };
      e.addEventListener("play", t), e.addEventListener("pause", s), e.addEventListener("seeking", i), e.addEventListener("seeked", n), e.addEventListener("ratechange", r), e.addEventListener("loadedmetadata", a), e.addEventListener("durationchange", h), e.addEventListener("emptied", c), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", s)), this.addCleanup(() => e.removeEventListener("seeking", i)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", r)), this.addCleanup(() => e.removeEventListener("loadedmetadata", a)), this.addCleanup(() => e.removeEventListener("durationchange", h)), this.addCleanup(() => e.removeEventListener("emptied", c));
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
    this.duration = Number.isFinite(e.duration) ? M(e.duration) : 0, this.currentTime = M(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.lastDrawTime = this.timeSource.now();
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
          const a = r.target;
          let h = null, c = null;
          if ((a instanceof HTMLVideoElement || a instanceof HTMLSourceElement) && (h = typeof r.oldValue == "string" ? r.oldValue : null, c = a.getAttribute("src")), h === c)
            continue;
          this.handleVideoSourceChange(e);
          return;
        }
        if (r.type === "childList") {
          for (const a of r.addedNodes)
            if (a instanceof HTMLSourceElement) {
              this.handleVideoSourceChange(e);
              return;
            }
          for (const a of r.removedNodes)
            if (a instanceof HTMLSourceElement) {
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
          for (const a of r.addedNodes) {
            const h = this.extractVideoElement(a);
            if (h && h !== this.videoElement) {
              this.initialize(h);
              return;
            }
          }
          for (const a of r.removedNodes) {
            if (a === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
            if (a instanceof Element) {
              const h = a.querySelector("video");
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
          const { width: r, height: a } = n.contentRect;
          r > 0 && a > 0 ? this.resize(r, a) : this.resize();
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
  Re as COMMENT_OVERLAY_VERSION,
  de as Comment,
  De as CommentRenderer,
  Ae as DEFAULT_RENDERER_SETTINGS,
  fe as cloneDefaultSettings,
  Ee as createDefaultAnimationFrameProvider,
  B as createDefaultTimeSource,
  U as createLogger
};
//# sourceMappingURL=comment-overlay.es.map
