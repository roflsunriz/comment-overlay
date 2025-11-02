const k = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, se = (l, e, t) => {
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
}, G = (l, e = {}) => {
  const { level: t = "info", emitter: s = se } = e, i = k[t], n = (r, a) => {
    k[r] < i || s(r, l, a);
  };
  return {
    debug: (...r) => n("debug", r),
    info: (...r) => n("info", r),
    warn: (...r) => n("warn", r),
    error: (...r) => n("error", r)
  };
}, ne = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, re = {
  defont: '"MS PGothic","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic Pro","Yu Gothic UI","Yu Gothic","Meiryo","Segoe UI","Osaka","Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","IPAPGothic","TakaoPGothic","Roboto","Helvetica Neue","Helvetica","Arial","sans-serif"',
  gothic: '"Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","Yu Gothic","Yu Gothic Medium","Meiryo","MS PGothic","Hiragino Kaku Gothic ProN","Segoe UI","Helvetica","Arial","sans-serif"',
  mincho: '"MS PMincho","MS Mincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Times New Roman","serif"'
}, q = {
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
}, H = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, ae = /^[,.:;]+/, oe = /[,.:;]+$/, le = (l) => {
  const e = l.trim();
  return e ? H.test(e) ? e : e.replace(ae, "").replace(oe, "") : "";
}, he = (l) => H.test(l) ? l.toUpperCase() : null, $ = (l) => {
  const e = l.trim();
  if (!e)
    return null;
  const t = e.toLowerCase().endsWith("px") ? e.slice(0, -2) : e, s = Number.parseFloat(t);
  return Number.isFinite(s) ? s : null;
}, ce = (l) => {
  const e = l.trim();
  if (!e)
    return null;
  if (e.endsWith("%")) {
    const t = Number.parseFloat(e.slice(0, -1));
    return Number.isFinite(t) ? t / 100 : null;
  }
  return $(e);
}, de = (l) => Number.isFinite(l) ? Math.min(100, Math.max(-100, l)) : 0, ue = (l) => !Number.isFinite(l) || l === 0 ? 1 : Math.min(5, Math.max(0.25, l)), fe = (l) => l === "naka" || l === "ue" || l === "shita", pe = (l) => l === "small" || l === "medium" || l === "big", me = (l) => l === "defont" || l === "gothic" || l === "mincho", ve = (l) => l in q, ge = (l, e) => {
  let t = "naka", s = "medium", i = "defont", n = null, r = 1, a = null, c = !1, h = 0, d = 1;
  for (const m of l) {
    const p = le(typeof m == "string" ? m : "");
    if (!p)
      continue;
    if (H.test(p)) {
      const S = he(p);
      if (S) {
        n = S;
        continue;
      }
    }
    const u = p.toLowerCase();
    if (fe(u)) {
      t = u;
      continue;
    }
    if (pe(u)) {
      s = u;
      continue;
    }
    if (me(u)) {
      i = u;
      continue;
    }
    if (ve(u)) {
      n = q[u].toUpperCase();
      continue;
    }
    if (u === "_live") {
      a = 0.5;
      continue;
    }
    if (u === "invisible") {
      r = 0, c = !0;
      continue;
    }
    if (u.startsWith("ls:") || u.startsWith("letterspacing:")) {
      const S = p.indexOf(":");
      if (S >= 0) {
        const y = $(p.slice(S + 1));
        y !== null && (h = de(y));
      }
      continue;
    }
    if (u.startsWith("lh:") || u.startsWith("lineheight:")) {
      const S = p.indexOf(":");
      if (S >= 0) {
        const y = ce(p.slice(S + 1));
        y !== null && (d = ue(y));
      }
      continue;
    }
  }
  const o = Math.max(0, Math.min(1, r)), f = (n ?? e.defaultColor).toUpperCase(), v = typeof a == "number" ? Math.max(0, Math.min(1, a)) : null;
  return {
    layout: t,
    size: s,
    sizeScale: ne[s],
    font: i,
    fontFamily: re[i],
    resolvedColor: f,
    colorOverride: n,
    opacityMultiplier: o,
    opacityOverride: v,
    isInvisible: c,
    letterSpacing: h,
    lineHeight: d
  };
}, _ = G("CommentEngine:Comment"), T = 4e3, Se = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, L = (l) => !Number.isFinite(l) || l <= 0 ? 0 : l >= 1 ? 1 : l, A = (l) => l.length === 1 ? l.repeat(2) : l, w = (l) => Number.parseInt(l, 16), ye = (l, e) => {
  const t = Se.exec(l);
  if (!t)
    return l;
  const s = t[1];
  let i, n, r, a = 1;
  s.length === 3 || s.length === 4 ? (i = w(A(s[0])), n = w(A(s[1])), r = w(A(s[2])), s.length === 4 && (a = w(A(s[3])) / 255)) : (i = w(s.slice(0, 2)), n = w(s.slice(2, 4)), r = w(s.slice(4, 6)), s.length === 8 && (a = w(s.slice(6, 8)) / 255));
  const c = L(a * L(e));
  return `rgba(${i}, ${n}, ${r}, ${c})`;
}, be = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), Y = () => be(), Me = (l) => l === "ltr" ? "ltr" : "rtl", Ce = (l) => l === "ltr" ? 1 : -1;
class we {
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
    const r = ge(this.commands, {
      defaultColor: i.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.fontFamily = r.fontFamily, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(i.commentOpacity), this.renderStyle = i.renderStyle, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = n.timeSource ?? Y(), this.applyScrollDirection(i.scrollDirection), this.syncWithSettings(i);
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
      this.fontSize = a, e.font = `${this.fontSize}px ${this.fontFamily}`;
      const c = this.text.includes(`
`) ? this.text.split(/\r?\n/) : [this.text];
      this.lines = c.length > 0 ? c : [""];
      let h = 0;
      const d = this.letterSpacing;
      for (const C of this.lines) {
        const N = e.measureText(C).width, ie = C.length > 1 ? d * (C.length - 1) : 0, V = Math.max(0, N + ie);
        V > h && (h = V);
      }
      this.width = h;
      const o = Math.max(
        1,
        Math.floor(this.fontSize * this.lineHeightMultiplier)
      );
      if (this.lineHeightPx = o, this.height = this.fontSize + (this.lines.length > 1 ? (this.lines.length - 1) * o : 0), !this.isScrolling) {
        this.bufferWidth = 0;
        const C = Math.max((n - this.width) / 2, 0);
        this.virtualStartX = C, this.x = C, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = T, this.preCollisionDurationMs = T, this.totalDurationMs = T, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vposMs + T, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const f = e.measureText("??".repeat(150)).width, v = this.width * Math.max(i.bufferRatio, 0);
      this.bufferWidth = Math.max(i.baseBufferPx, v);
      const m = Math.max(i.entryBufferPx, this.bufferWidth), p = this.scrollDirection, u = p === "rtl" ? n + i.virtualExtension : -this.width - this.bufferWidth - i.virtualExtension, S = p === "rtl" ? -this.width - this.bufferWidth - m : n + m, y = p === "rtl" ? n + m : -m, P = p === "rtl" ? u + this.width + this.bufferWidth : u - this.bufferWidth;
      this.virtualStartX = u, this.x = u, this.exitThreshold = S;
      const b = n > 0 ? this.width / n : 0, E = i.maxVisibleDurationMs === i.minVisibleDurationMs;
      let g = i.maxVisibleDurationMs;
      if (!E && b > 1) {
        const C = Math.min(b, i.maxWidthRatio), N = i.maxVisibleDurationMs / Math.max(C, 1);
        g = Math.max(i.minVisibleDurationMs, Math.floor(N));
      }
      const K = n + this.width + this.bufferWidth + m, j = Math.max(g, 1), O = K / j, Z = O * 1e3 / 60;
      this.baseSpeed = Z, this.speed = this.baseSpeed, this.speedPixelsPerMs = O;
      const Q = Math.abs(S - u), ee = p === "rtl" ? Math.max(0, P - y) : Math.max(0, y - P), I = Math.max(O, Number.EPSILON);
      this.visibleDurationMs = g, this.preCollisionDurationMs = Math.max(0, Math.ceil(ee / I)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(Q / I)
      );
      const te = this.width + this.bufferWidth + m;
      this.reservationWidth = Math.min(f, te), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
    } catch (n) {
      throw _.error("Comment.prepare", n, {
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
      _.error("Comment.update", s, {
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
      const s = L(this.opacity), i = t ?? this.x, n = this.lines.length > 0 ? this.lines : [this.text], r = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, a = this.y + this.fontSize, c = (o, f, v) => {
        if (o.length === 0)
          return;
        if (Math.abs(this.letterSpacing) < Number.EPSILON) {
          v === "stroke" ? e.strokeText(o, i, f) : e.fillText(o, i, f);
          return;
        }
        let m = i;
        for (let p = 0; p < o.length; p += 1) {
          const u = o[p];
          v === "stroke" ? e.strokeText(u, m, f) : e.fillText(u, m, f);
          const S = e.measureText(u), y = Number.isFinite(S.width) ? S.width : 0;
          m += y, p < o.length - 1 && (m += this.letterSpacing);
        }
      }, h = () => {
        e.globalAlpha = s, e.strokeStyle = "#000000", e.lineWidth = Math.max(3, this.fontSize / 8), e.lineJoin = "round", n.forEach((o, f) => {
          const v = a + f * r;
          c(o, v, "stroke");
        }), e.globalAlpha = 1;
      }, d = () => {
        n.forEach((o, f) => {
          const v = a + f * r;
          c(o, v, "fill");
        });
      };
      if (h(), this.renderStyle === "classic") {
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
        ].forEach((m) => {
          const p = L(m.alpha * s);
          e.shadowColor = `rgba(${m.rgb}, ${p})`, e.shadowBlur = f * m.blurMultiplier, e.shadowOffsetX = o * m.offsetXMultiplier, e.shadowOffsetY = o * m.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", d();
        }), e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      } else
        e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      e.globalAlpha = 1, e.fillStyle = ye(this.color, s), d(), e.restore();
    } catch (s) {
      _.error("Comment.draw", s, {
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
      return L(this.opacityOverride);
    const t = e * this.opacityMultiplier;
    return Number.isFinite(t) ? L(t) : 0;
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
    const t = Me(e);
    this.scrollDirection = t, this.directionSign = Ce(t);
  }
}
const xe = 4e3, D = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: xe,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0
}, Ve = D, Te = () => ({
  ...D,
  ngWords: [...D.ngWords],
  ngRegexps: [...D.ngRegexps]
}), ke = "v1.1.0", x = (l) => l * 1e3, Le = (l) => Number.isFinite(l) ? Math.max(0, Math.round(l)) : 0, J = 4e3, Ee = 1800, Ae = 3, Fe = 0.25, Re = 32, De = 48, F = 120, Pe = 4e3, z = T + J, Oe = 1e3, W = 1, U = 12, X = 24, M = 1e-3, B = 50, Ne = (l) => Number.isFinite(l) ? l <= 0 ? 0 : l >= 1 ? 1 : l : 1, R = (l) => {
  const e = l.scrollVisibleDurationMs, t = e == null ? null : Number.isFinite(e) ? Math.max(1, Math.floor(e)) : null;
  return {
    ...l,
    scrollDirection: l.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: Ne(l.commentOpacity),
    renderStyle: l.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: t,
    syncMode: l.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!l.useDprScaling
  };
}, _e = (l) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (e) => window.requestAnimationFrame(e),
  cancel: (e) => window.cancelAnimationFrame(e)
} : {
  request: (e) => globalThis.setTimeout(() => {
    e(l.now());
  }, 16),
  cancel: (e) => {
    globalThis.clearTimeout(e);
  }
}, He = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Ie = (l) => {
  if (!l || typeof l != "object")
    return !1;
  const e = l;
  return typeof e.commentColor == "string" && typeof e.commentOpacity == "number" && typeof e.isCommentVisible == "boolean";
};
class ze {
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
  laneCount = U;
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
    if (Ie(e))
      s = R({ ...e }), i = t ?? {};
    else {
      const n = e ?? t ?? {};
      i = typeof n == "object" ? n : {}, s = R(Te());
    }
    this.timeSource = i.timeSource ?? Y(), this.animationFrameProvider = i.animationFrameProvider ?? _e(this.timeSource), this.createCanvasElement = i.createCanvasElement ?? He(), this.commentDependencies = { timeSource: this.timeSource }, this._settings = R(s), this.log = G(i.loggerNamespace ?? "CommentRenderer");
  }
  get settings() {
    return this._settings;
  }
  set settings(e) {
    this._settings = R(e);
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
      this.videoElement = t, this.containerElement = i, this.duration = Number.isFinite(t.duration) ? x(t.duration) : 0, this.currentTime = x(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.lastDrawTime = this.timeSource.now();
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
    const i = Le(t);
    if (this.comments.some(
      (a) => a.text === e && a.vposMs === i
    ))
      return null;
    const r = new we(
      e,
      i,
      s,
      this._settings,
      this.commentDependencies
    );
    return r.creationIndex = this.commentSequence++, this.comments.push(r), this.comments.sort((a, c) => {
      const h = a.vposMs - c.vposMs;
      return Math.abs(h) > M ? h : a.creationIndex - c.creationIndex;
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
    const r = s !== this._settings.scrollDirection, a = i !== this._settings.useDprScaling, c = n !== this._settings.syncMode;
    if (this.comments.forEach((h) => {
      h.syncWithSettings(this._settings);
    }), r && this.resetCommentActivity(), !this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((f) => {
        f.isActive = !1, f.clearActivation();
      });
      const h = this.canvasDpr > 0 ? this.canvasDpr : 1, d = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / h, o = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / h;
      this.ctx.clearRect(0, 0, d, o), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
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
    const r = s.getBoundingClientRect(), a = this.canvasDpr > 0 ? this.canvasDpr : 1, c = this.displayWidth > 0 ? this.displayWidth : i.width / a, h = this.displayHeight > 0 ? this.displayHeight : i.height / a, d = e ?? r.width ?? c, o = t ?? r.height ?? h;
    if (!Number.isFinite(d) || !Number.isFinite(o) || d <= 0 || o <= 0)
      return;
    const f = Math.max(1, Math.floor(d)), v = Math.max(1, Math.floor(o)), m = this.displayWidth > 0 ? this.displayWidth : f, p = this.displayHeight > 0 ? this.displayHeight : v, u = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, S = Math.max(1, Math.round(f * u)), y = Math.max(1, Math.round(v * u));
    if (!(this.displayWidth !== f || this.displayHeight !== v || Math.abs(this.canvasDpr - u) > Number.EPSILON || i.width !== S || i.height !== y))
      return;
    this.displayWidth = f, this.displayHeight = v, this.canvasDpr = u, i.width = S, i.height = y, i.style.width = `${f}px`, i.style.height = `${v}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(u, u));
    const b = m > 0 ? f / m : 1, E = p > 0 ? v / p : 1;
    (b !== 1 || E !== 1) && this.comments.forEach((g) => {
      g.isActive && (g.x *= b, g.y *= E, g.width *= b, g.fontSize = Math.max(
        X,
        Math.floor(Math.max(1, g.fontSize) * E)
      ), g.height = g.fontSize, g.virtualStartX *= b, g.exitThreshold *= b, g.baseSpeed *= b, g.speed *= b, g.speedPixelsPerMs *= b, g.bufferWidth *= b, g.reservationWidth *= b);
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
    const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), s = Math.max(X, Math.floor(t * 0.05));
    this.laneHeight = s * 1.2;
    const i = Math.floor(t / Math.max(this.laneHeight, 1));
    if (this._settings.useFixedLaneCount) {
      const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : U, r = Math.max(W, Math.min(i, n));
      this.laneCount = r;
    } else
      this.laneCount = Math.max(W, i);
    this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
  }
  updateComments(e) {
    const t = this.videoElement, s = this.canvas, i = this.ctx;
    if (!t || !s || !i)
      return;
    const n = typeof e == "number" ? e : x(t.currentTime);
    this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused;
    const r = this.canvasDpr > 0 ? this.canvasDpr : 1, a = this.displayWidth > 0 ? this.displayWidth : s.width / r, c = this.displayHeight > 0 ? this.displayHeight : s.height / r, h = this.buildPrepareOptions(a), d = this.duration > 0 && this.duration - this.currentTime <= Pe;
    d && !this.finalPhaseActive && (this.finalPhaseActive = !0, i.clearRect(0, 0, a, c), this.comments.forEach((o) => {
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
          c,
          h,
          this.currentTime
        ), o.isActive) {
          if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
            const f = o.layout === "ue" ? "ue" : "shita";
            this.releaseStaticLane(f, o.lane), o.isActive = !1, o.clearActivation();
            continue;
          }
          if (o.layout === "naka" && o.vposMs > this.currentTime + B) {
            o.x = o.virtualStartX, o.lastUpdateTime = this.timeSource.now();
            continue;
          }
          if (o.hasShown = !0, o.update(this.playbackRate, !this.isPlaying), !o.isScrolling && o.hasStaticExpired(this.currentTime)) {
            const f = o.layout === "ue" ? "ue" : "shita";
            this.releaseStaticLane(f, o.lane), o.isActive = !1, o.clearActivation();
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
      virtualExtension: Oe,
      maxVisibleDurationMs: t !== null ? t : J,
      minVisibleDurationMs: t !== null ? t : Ee,
      maxWidthRatio: Ae,
      bufferRatio: Fe,
      baseBufferPx: Re,
      entryBufferPx: De
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
        (n) => n.totalEndTime + F > e
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
    return !(e.isInvisible || e.isActive || e.vposMs > t + B || e.vposMs < t - z);
  }
  activateComment(e, t, s, i, n, r) {
    if (e.prepare(t, s, i, n), e.layout === "naka") {
      const d = Math.max(0, r - e.vposMs), o = e.speedPixelsPerMs * d, f = e.getDirectionSign(), v = e.virtualStartX + f * o, m = e.exitThreshold, p = e.scrollDirection;
      if (p === "rtl" && v <= m || p === "ltr" && v >= m) {
        e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1;
        return;
      }
      e.lane = this.findAvailableLane(e), e.y = e.lane * this.laneHeight, e.x = v, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now();
      return;
    }
    const a = e.vposMs + T;
    if (r > a) {
      e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1;
      return;
    }
    const c = e.layout === "ue" ? "ue" : "shita", h = this.assignStaticLane(c);
    e.lane = h, e.y = h * this.laneHeight, e.x = e.virtualStartX, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = a, this.reserveStaticLane(c, h, a);
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
    const s = Array.from({ length: this.laneCount }, (a, c) => c).sort((a, c) => {
      const h = this.getLaneNextAvailableTime(a, e), d = this.getLaneNextAvailableTime(c, e);
      return Math.abs(h - d) <= M ? a - c : h - d;
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
    const s = Math.max(e.speedPixelsPerMs, M), i = Number.isFinite(e.vposMs) ? e.vposMs : t, n = Math.max(0, i), r = n + e.preCollisionDurationMs + F, a = n + e.totalDurationMs + F;
    return {
      comment: e,
      startTime: n,
      endTime: Math.max(n, r),
      totalEndTime: Math.max(n, a),
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
      if (!(n.totalEndTime + F <= s) && this.areReservationsConflicting(n, t))
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
    r !== null && r >= s - M && r <= i + M && n.add(r);
    const a = this.solveLeftRightEqualityTime(t, e);
    a !== null && a >= s - M && a <= i + M && n.add(a);
    for (const c of n) {
      if (c < s - M || c > i + M)
        continue;
      const h = this.computeForwardGap(e, t, c), d = this.computeForwardGap(t, e, c);
      if (h <= M && d <= M)
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
    if (Math.abs(n) < M)
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
    const r = this.comments.filter((c) => c.isActive), a = this.timeSource.now();
    if (this._settings.isCommentVisible) {
      const c = (a - this.lastDrawTime) / 16.666666666666668;
      r.sort((h, d) => {
        const o = h.vposMs - d.vposMs;
        return Math.abs(o) > M ? o : h.isScrolling !== d.isScrolling ? h.isScrolling ? 1 : -1 : h.creationIndex - d.creationIndex;
      }), r.forEach((h) => {
        const o = this.isPlaying && !h.isPaused ? h.x + h.getDirectionSign() * h.speed * c : h.x;
        h.draw(t, o);
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
    const i = x(s.currentTime);
    this.finalPhaseActive = !1, this.currentTime = i, this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    const n = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : e.width / n, a = this.displayHeight > 0 ? this.displayHeight : e.height / n, c = this.buildPrepareOptions(r);
    this.comments.forEach((h) => {
      if (this.isNGComment(h.text)) {
        h.isActive = !1, h.clearActivation();
        return;
      }
      if (h.isInvisible) {
        h.isActive = !1, h.hasShown = !0, h.clearActivation();
        return;
      }
      if (h.syncWithSettings(this._settings), h.isActive = !1, h.lane = -1, h.clearActivation(), this.shouldActivateCommentAtTime(h, this.currentTime)) {
        this.activateComment(
          h,
          t,
          r,
          a,
          c,
          this.currentTime
        );
        return;
      }
      h.vposMs < this.currentTime - z ? h.hasShown = !0 : h.hasShown = !1;
    }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
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
      }, c = () => {
        this.duration = Number.isFinite(e.duration) ? x(e.duration) : 0;
      }, h = () => {
        this.handleVideoSourceChange();
      };
      e.addEventListener("play", t), e.addEventListener("pause", s), e.addEventListener("seeking", i), e.addEventListener("seeked", n), e.addEventListener("ratechange", r), e.addEventListener("loadedmetadata", a), e.addEventListener("durationchange", c), e.addEventListener("emptied", h), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", s)), this.addCleanup(() => e.removeEventListener("seeking", i)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", r)), this.addCleanup(() => e.removeEventListener("loadedmetadata", a)), this.addCleanup(() => e.removeEventListener("durationchange", c)), this.addCleanup(() => e.removeEventListener("emptied", h));
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
    this.duration = Number.isFinite(e.duration) ? x(e.duration) : 0, this.currentTime = x(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.lastDrawTime = this.timeSource.now();
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
          let c = null, h = null;
          if ((a instanceof HTMLVideoElement || a instanceof HTMLSourceElement) && (c = typeof r.oldValue == "string" ? r.oldValue : null, h = a.getAttribute("src")), c === h)
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
            const c = this.extractVideoElement(a);
            if (c && c !== this.videoElement) {
              this.initialize(c);
              return;
            }
          }
          for (const a of r.removedNodes) {
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
  ke as COMMENT_OVERLAY_VERSION,
  we as Comment,
  ze as CommentRenderer,
  Ve as DEFAULT_RENDERER_SETTINGS,
  Te as cloneDefaultSettings,
  _e as createDefaultAnimationFrameProvider,
  Y as createDefaultTimeSource,
  G as createLogger
};
//# sourceMappingURL=comment-overlay.es.map
