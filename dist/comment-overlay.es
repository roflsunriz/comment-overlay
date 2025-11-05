const j = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, pe = (a, e, t) => {
  const s = [`[${e}]`, ...t];
  switch (a) {
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
}, se = (a, e = {}) => {
  const { level: t = "info", emitter: i = pe } = e, s = j[t], n = (r, o) => {
    j[r] < s || i(r, a, o);
  };
  return {
    debug: (...r) => n("debug", r),
    info: (...r) => n("info", r),
    warn: (...r) => n("warn", r),
    error: (...r) => n("error", r)
  };
}, ve = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, me = {
  defont: '"MS PGothic","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic Pro","Yu Gothic UI","Yu Gothic","Meiryo","Segoe UI","Osaka","Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","IPAPGothic","TakaoPGothic","Roboto","Helvetica Neue","Helvetica","Arial","sans-serif"',
  gothic: '"Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","Yu Gothic","Yu Gothic Medium","Meiryo","MS PGothic","Hiragino Kaku Gothic ProN","Segoe UI","Helvetica","Arial","sans-serif"',
  mincho: '"MS PMincho","MS Mincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Times New Roman","serif"'
}, ne = {
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
}, Y = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, ge = /^[,.:;]+/, Se = /[,.:;]+$/, Me = (a) => {
  const e = a.trim();
  return e ? Y.test(e) ? e : e.replace(ge, "").replace(Se, "") : "";
}, ye = (a) => Y.test(a) ? a.toUpperCase() : null, re = (a) => {
  const e = a.trim();
  if (!e)
    return null;
  const t = e.toLowerCase().endsWith("px") ? e.slice(0, -2) : e, i = Number.parseFloat(t);
  return Number.isFinite(i) ? i : null;
}, be = (a) => {
  const e = a.trim();
  if (!e)
    return null;
  if (e.endsWith("%")) {
    const t = Number.parseFloat(e.slice(0, -1));
    return Number.isFinite(t) ? t / 100 : null;
  }
  return re(e);
}, Ce = (a) => Number.isFinite(a) ? Math.min(100, Math.max(-100, a)) : 0, xe = (a) => !Number.isFinite(a) || a === 0 ? 1 : Math.min(5, Math.max(0.25, a)), we = (a) => a === "naka" || a === "ue" || a === "shita", Te = (a) => a === "small" || a === "medium" || a === "big", Ee = (a) => a === "defont" || a === "gothic" || a === "mincho", Pe = (a) => a in ne, Fe = (a, e) => {
  let t = "naka", i = "medium", s = "defont", n = null, r = 1, o = null, c = !1, d = 0, h = 1;
  for (const f of a) {
    const v = Me(typeof f == "string" ? f : "");
    if (!v)
      continue;
    if (Y.test(v)) {
      const M = ye(v);
      if (M) {
        n = M;
        continue;
      }
    }
    const p = v.toLowerCase();
    if (we(p)) {
      t = p;
      continue;
    }
    if (Te(p)) {
      i = p;
      continue;
    }
    if (Ee(p)) {
      s = p;
      continue;
    }
    if (Pe(p)) {
      n = ne[p].toUpperCase();
      continue;
    }
    if (p === "_live") {
      o = 0.5;
      continue;
    }
    if (p === "invisible") {
      r = 0, c = !0;
      continue;
    }
    if (p.startsWith("ls:") || p.startsWith("letterspacing:")) {
      const M = v.indexOf(":");
      if (M >= 0) {
        const C = re(v.slice(M + 1));
        C !== null && (d = Ce(C));
      }
      continue;
    }
    if (p.startsWith("lh:") || p.startsWith("lineheight:")) {
      const M = v.indexOf(":");
      if (M >= 0) {
        const C = be(v.slice(M + 1));
        C !== null && (h = xe(C));
      }
      continue;
    }
  }
  const u = Math.max(0, Math.min(1, r)), l = (n ?? e.defaultColor).toUpperCase(), m = typeof o == "number" ? Math.max(0, Math.min(1, o)) : null;
  return {
    layout: t,
    size: i,
    sizeScale: ve[i],
    font: s,
    fontFamily: me[s],
    resolvedColor: l,
    colorOverride: n,
    opacityMultiplier: u,
    opacityOverride: m,
    isInvisible: c,
    letterSpacing: d,
    lineHeight: h
  };
}, B = se("CommentEngine:Comment"), Z = /* @__PURE__ */ new WeakMap(), Le = (a) => {
  let e = Z.get(a);
  return e || (e = /* @__PURE__ */ new Map(), Z.set(a, e)), e;
}, U = (a, e) => {
  if (!a)
    return 0;
  const i = `${a.font ?? ""}::${e}`, s = Le(a), n = s.get(i);
  if (n !== void 0)
    return n;
  const r = a.measureText(e).width;
  return s.set(i, r), r;
}, A = 4e3, Ae = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, R = (a) => !Number.isFinite(a) || a <= 0 ? 0 : a >= 1 ? 1 : a, k = (a) => a.length === 1 ? a.repeat(2) : a, T = (a) => Number.parseInt(a, 16), De = (a, e) => {
  const t = Ae.exec(a);
  if (!t)
    return a;
  const i = t[1];
  let s, n, r, o = 1;
  i.length === 3 || i.length === 4 ? (s = T(k(i[0])), n = T(k(i[1])), r = T(k(i[2])), i.length === 4 && (o = T(k(i[3])) / 255)) : (s = T(i.slice(0, 2)), n = T(i.slice(2, 4)), r = T(i.slice(4, 6)), i.length === 8 && (o = T(i.slice(6, 8)) / 255));
  const c = R(o * R(e));
  return `rgba(${s}, ${n}, ${r}, ${c})`;
}, Re = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), ae = () => Re(), Ve = (a) => a === "ltr" ? "ltr" : "rtl", Oe = (a) => a === "ltr" ? 1 : -1;
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
  constructor(e, t, i, s, n = {}) {
    if (typeof e != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(t) || t < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = e, this.vposMs = t, this.commands = Array.isArray(i) ? [...i] : [];
    const r = Fe(this.commands, {
      defaultColor: s.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.fontFamily = r.fontFamily, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(s.commentOpacity), this.renderStyle = s.renderStyle, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = n.timeSource ?? ae(), this.applyScrollDirection(s.scrollDirection), this.syncWithSettings(s, n.settingsVersion);
  }
  prepare(e, t, i, s) {
    try {
      if (!e)
        throw new Error("Canvas context is required");
      if (!Number.isFinite(t) || !Number.isFinite(i))
        throw new Error("Canvas dimensions must be numbers");
      if (!s)
        throw new Error("Prepare options are required");
      const n = Math.max(t, 1), r = Math.max(24, Math.floor(i * 0.05)), o = Math.max(24, Math.floor(r * this.sizeScale));
      this.fontSize = o, e.font = `${this.fontSize}px ${this.fontFamily}`;
      const c = this.text.includes(`
`) ? this.text.split(/\r?\n/) : [this.text];
      this.lines = c.length > 0 ? c : [""];
      let d = 0;
      const h = this.letterSpacing;
      for (const w of this.lines) {
        const z = U(e, w), fe = w.length > 1 ? h * (w.length - 1) : 0, K = Math.max(0, z + fe);
        K > d && (d = K);
      }
      this.width = d;
      const u = Math.max(
        1,
        Math.floor(this.fontSize * this.lineHeightMultiplier)
      );
      if (this.lineHeightPx = u, this.height = this.fontSize + (this.lines.length > 1 ? (this.lines.length - 1) * u : 0), !this.isScrolling) {
        this.bufferWidth = 0;
        const w = Math.max((n - this.width) / 2, 0);
        this.virtualStartX = w, this.x = w, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = A, this.preCollisionDurationMs = A, this.totalDurationMs = A, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vposMs + A, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const l = U(e, "??".repeat(150)), m = this.width * Math.max(s.bufferRatio, 0);
      this.bufferWidth = Math.max(s.baseBufferPx, m);
      const f = Math.max(s.entryBufferPx, this.bufferWidth), v = this.scrollDirection, p = v === "rtl" ? n + s.virtualExtension : -this.width - this.bufferWidth - s.virtualExtension, M = v === "rtl" ? -this.width - this.bufferWidth - f : n + f, C = v === "rtl" ? n + f : -f, V = v === "rtl" ? p + this.width + this.bufferWidth : p - this.bufferWidth;
      this.virtualStartX = p, this.x = p, this.exitThreshold = M;
      const y = n > 0 ? this.width / n : 0, x = s.maxVisibleDurationMs === s.minVisibleDurationMs;
      let g = s.maxVisibleDurationMs;
      if (!x && y > 1) {
        const w = Math.min(y, s.maxWidthRatio), z = s.maxVisibleDurationMs / Math.max(w, 1);
        g = Math.max(s.minVisibleDurationMs, Math.floor(z));
      }
      const oe = n + this.width + this.bufferWidth + f, le = Math.max(g, 1), W = oe / le, he = W * 1e3 / 60;
      this.baseSpeed = he, this.speed = this.baseSpeed, this.speedPixelsPerMs = W;
      const ce = Math.abs(M - p), ue = v === "rtl" ? Math.max(0, V - C) : Math.max(0, C - V), J = Math.max(W, Number.EPSILON);
      this.visibleDurationMs = g, this.preCollisionDurationMs = Math.max(0, Math.ceil(ue / J)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(ce / J)
      );
      const de = this.width + this.bufferWidth + f;
      this.reservationWidth = Math.min(l, de), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
    } catch (n) {
      throw B.error("Comment.prepare", n, {
        text: this.text,
        visibleWidth: t,
        canvasHeight: i,
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
      B.error("Comment.update", i, {
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
      const i = R(this.opacity), s = t ?? this.x, n = this.lines.length > 0 ? this.lines : [this.text], r = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, o = this.y + this.fontSize, c = (u, l, m) => {
        if (u.length === 0)
          return;
        if (Math.abs(this.letterSpacing) < Number.EPSILON) {
          m === "stroke" ? e.strokeText(u, s, l) : e.fillText(u, s, l);
          return;
        }
        let f = s;
        for (let v = 0; v < u.length; v += 1) {
          const p = u[v];
          m === "stroke" ? e.strokeText(p, f, l) : e.fillText(p, f, l);
          const M = U(e, p);
          f += M, v < u.length - 1 && (f += this.letterSpacing);
        }
      }, d = () => {
        e.globalAlpha = i, e.strokeStyle = "#000000", e.lineWidth = Math.max(3, this.fontSize / 8), e.lineJoin = "round", n.forEach((u, l) => {
          const m = o + l * r;
          c(u, m, "stroke");
        }), e.globalAlpha = 1;
      }, h = () => {
        n.forEach((u, l) => {
          const m = o + l * r;
          c(u, m, "fill");
        });
      };
      if (d(), this.renderStyle === "classic") {
        const u = Math.max(1, this.fontSize * 0.04), l = this.fontSize * 0.18;
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
        ].forEach((f) => {
          const v = R(f.alpha * i);
          e.shadowColor = `rgba(${f.rgb}, ${v})`, e.shadowBlur = l * f.blurMultiplier, e.shadowOffsetX = u * f.offsetXMultiplier, e.shadowOffsetY = u * f.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", h();
        }), e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      } else
        e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      e.globalAlpha = 1, e.fillStyle = De(this.color, i), h(), e.restore();
    } catch (i) {
      B.error("Comment.draw", i, {
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
    const t = Ve(e);
    this.scrollDirection = t, this.directionSign = Oe(t);
  }
}
const _e = 4e3, I = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: _e,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0
}, et = I, ke = () => ({
  ...I,
  ngWords: [...I.ngWords],
  ngRegexps: [...I.ngRegexps]
}), tt = "v1.1.0", q = 5, D = {
  enabled: !1,
  maxLogsPerCategory: q
}, _ = /* @__PURE__ */ new Map(), He = (a) => {
  if (a === void 0 || !Number.isFinite(a))
    return q;
  const e = Math.max(1, Math.floor(a));
  return Math.min(1e4, e);
}, Ie = (a) => {
  D.enabled = !!a.enabled, D.maxLogsPerCategory = He(a.maxLogsPerCategory), D.enabled || _.clear();
}, it = () => {
  _.clear();
}, E = () => D.enabled, We = (a) => {
  const e = _.get(a) ?? 0;
  return e >= D.maxLogsPerCategory ? (e === D.maxLogsPerCategory && (console.debug(`[CommentOverlay][${a}]`, "Further logs suppressed."), _.set(a, e + 1)), !1) : (_.set(a, e + 1), !0);
}, S = (a, ...e) => {
  D.enabled && We(a) && console.debug(`[CommentOverlay][${a}]`, ...e);
}, P = (a, e = 32) => a.length <= e ? a : `${a.slice(0, e)}…`, F = (a) => a * 1e3, ze = (a) => !Number.isFinite(a) || a < 0 ? null : Math.round(a), $ = 4e3, Q = 1800, Be = 3, Ue = 0.25, Xe = 32, Ge = 48, X = 120, qe = 4e3, G = 120, $e = 800, Ye = 2, O = 4e3, N = A + $, Je = 1e3, ee = 1, te = 12, ie = 24, b = 1e-3, L = 50, Ke = (a) => Number.isFinite(a) ? a <= 0 ? 0 : a >= 1 ? 1 : a : 1, H = (a) => {
  const e = a.scrollVisibleDurationMs, t = e == null ? null : Number.isFinite(e) ? Math.max(1, Math.floor(e)) : null;
  return {
    ...a,
    scrollDirection: a.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: Ke(a.commentOpacity),
    renderStyle: a.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: t,
    syncMode: a.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!a.useDprScaling
  };
}, je = (a) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (e) => window.requestAnimationFrame(e),
  cancel: (e) => window.cancelAnimationFrame(e)
} : {
  request: (e) => globalThis.setTimeout(() => {
    e(a.now());
  }, 16),
  cancel: (e) => {
    globalThis.clearTimeout(e);
  }
}, Ze = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), Qe = (a) => {
  if (!a || typeof a != "object")
    return !1;
  const e = a;
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
  laneCount = te;
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
      i = H({ ...e }), s = t ?? {};
    else {
      const n = e ?? t ?? {};
      s = typeof n == "object" ? n : {}, i = H(ke());
    }
    this.timeSource = s.timeSource ?? ae(), this.animationFrameProvider = s.animationFrameProvider ?? je(this.timeSource), this.createCanvasElement = s.createCanvasElement ?? Ze(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this._settings = H(i), this.log = se(s.loggerNamespace ?? "CommentRenderer"), this.rebuildNgMatchers(), s.debug && Ie(s.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(e) {
    this._settings = H(e), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
      this.videoElement = t, this.containerElement = s, this.duration = Number.isFinite(t.duration) ? F(t.duration) : 0, this.currentTime = F(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > L, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
      const n = this.createCanvasElement(), r = n.getContext("2d");
      if (!r)
        throw new Error("Failed to acquire 2D canvas context");
      n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
      const o = this.containerElement;
      o instanceof HTMLElement && (this.ensureContainerPositioning(o), o.appendChild(n)), this.canvas = n, this.ctx = r, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
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
      const { text: s, vposMs: n, commands: r = [] } = i, o = P(s);
      if (this.isNGComment(s)) {
        S("comment-skip-ng", { preview: o, vposMs: n });
        continue;
      }
      const c = ze(n);
      if (c === null) {
        this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), S("comment-skip-invalid-vpos", { preview: o, vposMs: n });
        continue;
      }
      if (this.comments.some(
        (u) => u.text === s && u.vposMs === c
      ) || t.some(
        (u) => u.text === s && u.vposMs === c
      )) {
        S("comment-skip-duplicate", { preview: o, vposMs: c });
        continue;
      }
      const h = new Ne(
        s,
        c,
        r,
        this._settings,
        this.commentDependencies
      );
      h.creationIndex = this.commentSequence++, t.push(h), S("comment-added", {
        preview: o,
        vposMs: c,
        commands: h.commands.length,
        layout: h.layout,
        isScrolling: h.isScrolling,
        invisible: h.isInvisible
      });
    }
    return t.length === 0 ? [] : (this.comments.push(...t), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
      const n = i.vposMs - s.vposMs;
      return Math.abs(n) > b ? n : i.creationIndex - s.creationIndex;
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
      return A;
    const t = [];
    return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : $;
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
    const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + O, i = Math.max(e + O, t), s = this.comments.filter((h) => h.hasShown || h.isInvisible || this.isNGComment(h.text) ? !1 : h.vposMs >= e - N).sort((h, u) => {
      const l = h.vposMs - u.vposMs;
      return Math.abs(l) > b ? l : h.creationIndex - u.creationIndex;
    });
    if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
      this.finalPhaseScheduleDirty = !1;
      return;
    }
    const r = Math.max(i - e, O) / Math.max(s.length, 1), o = Number.isFinite(r) ? r : G, c = Math.max(G, Math.min(o, $e));
    let d = e;
    s.forEach((h, u) => {
      const l = Math.max(1, this.getFinalPhaseDisplayDuration(h)), m = i - l;
      let f = Math.max(e, Math.min(d, m));
      Number.isFinite(f) || (f = e);
      const v = Ye * u;
      f + v <= m && (f += v), this.finalPhaseVposOverrides.set(h, f);
      const p = Math.max(G, Math.min(l / 2, c));
      d = f + p;
    }), this.finalPhaseScheduleDirty = !1;
  }
  shouldSuppressRendering() {
    return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= L;
  }
  updatePlaybackProgressState() {
    this.playbackHasBegun || (this.isPlaying || this.currentTime > L) && (this.playbackHasBegun = !0);
  }
  updateSettings(e) {
    const t = this._settings.useContainerResizeObserver, i = this._settings.scrollDirection, s = this._settings.useDprScaling, n = this._settings.syncMode;
    this.settings = e;
    const r = i !== this._settings.scrollDirection, o = s !== this._settings.useDprScaling, c = n !== this._settings.syncMode;
    if (this.comments.forEach((d) => {
      d.syncWithSettings(this._settings, this.settingsVersion);
    }), r && this.resetCommentActivity(), !this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((l) => {
        l.isActive = !1, l.clearActivation();
      }), this.activeComments.clear();
      const d = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / d, u = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / d;
      this.ctx.clearRect(0, 0, h, u), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    }
    t !== this._settings.useContainerResizeObserver && this.videoElement && this.setupResizeHandling(this.videoElement), o && this.resize(), c && this.videoElement && this.startAnimation();
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
    for (const n of i) {
      if (typeof n != "string")
        continue;
      const r = n.trim().toLowerCase();
      r.length !== 0 && e.push(r);
    }
    const s = Array.isArray(this._settings.ngRegexps) ? this._settings.ngRegexps : [];
    for (const n of s)
      if (!(typeof n != "string" || n.length === 0))
        try {
          t.push(new RegExp(n));
        } catch (r) {
          this.log.error("CommentRenderer.rebuildNgMatchers.regex", r, {
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
        if (this.normalizedNgWords.some((s) => t.includes(s)))
          return !0;
      }
      return this.compiledNgRegexps.length > 0 ? this.compiledNgRegexps.some((t) => t.test(e)) : !1;
    } catch (t) {
      return this.log.error("CommentRenderer.isNGComment", t, { text: e }), !0;
    }
  }
  resize(e, t) {
    const i = this.videoElement, s = this.canvas, n = this.ctx;
    if (!i || !s)
      return;
    const r = i.getBoundingClientRect(), o = this.canvasDpr > 0 ? this.canvasDpr : 1, c = this.displayWidth > 0 ? this.displayWidth : s.width / o, d = this.displayHeight > 0 ? this.displayHeight : s.height / o, h = e ?? r.width ?? c, u = t ?? r.height ?? d;
    if (!Number.isFinite(h) || !Number.isFinite(u) || h <= 0 || u <= 0)
      return;
    const l = Math.max(1, Math.floor(h)), m = Math.max(1, Math.floor(u)), f = this.displayWidth > 0 ? this.displayWidth : l, v = this.displayHeight > 0 ? this.displayHeight : m, p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, M = Math.max(1, Math.round(l * p)), C = Math.max(1, Math.round(m * p));
    if (!(this.displayWidth !== l || this.displayHeight !== m || Math.abs(this.canvasDpr - p) > Number.EPSILON || s.width !== M || s.height !== C))
      return;
    this.displayWidth = l, this.displayHeight = m, this.canvasDpr = p, s.width = M, s.height = C, s.style.width = `${l}px`, s.style.height = `${m}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p));
    const y = f > 0 ? l / f : 1, x = v > 0 ? m / v : 1;
    (y !== 1 || x !== 1) && this.comments.forEach((g) => {
      g.isActive && (g.x *= y, g.y *= x, g.width *= y, g.fontSize = Math.max(
        ie,
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
    const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(ie, Math.floor(t * 0.05));
    this.laneHeight = i * 1.2;
    const s = Math.floor(t / Math.max(this.laneHeight, 1));
    if (this._settings.useFixedLaneCount) {
      const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : te, r = Math.max(ee, Math.min(s, n));
      this.laneCount = r;
    } else
      this.laneCount = Math.max(ee, s);
    this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
  }
  updateComments(e) {
    const t = this.videoElement, i = this.canvas, s = this.ctx;
    if (!t || !i || !s)
      return;
    const n = typeof e == "number" ? e : F(t.currentTime);
    if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
      return;
    const r = this.canvasDpr > 0 ? this.canvasDpr : 1, o = this.displayWidth > 0 ? this.displayWidth : i.width / r, c = this.displayHeight > 0 ? this.displayHeight : i.height / r, d = this.buildPrepareOptions(o), h = this.duration > 0 && this.duration - this.currentTime <= qe;
    h && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, o, c), this.comments.forEach((l) => {
      l.isActive = !1, l.clearActivation();
    }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear()), !h && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
    const u = this.getCommentsInTimeWindow(this.currentTime, N);
    for (const l of u) {
      const m = E(), f = m ? P(l.text) : "";
      if (m && S("comment-evaluate", {
        stage: "update",
        preview: f,
        vposMs: l.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(l),
        currentTime: this.currentTime,
        isActive: l.isActive,
        hasShown: l.hasShown
      }), this.isNGComment(l.text)) {
        m && S("comment-eval-skip", {
          preview: f,
          vposMs: l.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(l),
          reason: "ng-runtime"
        });
        continue;
      }
      if (l.isInvisible) {
        m && S("comment-eval-skip", {
          preview: f,
          vposMs: l.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(l),
          reason: "invisible"
        }), l.isActive = !1, this.activeComments.delete(l), l.hasShown = !0, l.clearActivation();
        continue;
      }
      if (l.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(l, this.currentTime, f) && this.activateComment(
        l,
        s,
        o,
        c,
        d,
        this.currentTime
      ), l.isActive) {
        if (l.layout !== "naka" && l.hasStaticExpired(this.currentTime)) {
          const v = l.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(v, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
          continue;
        }
        if (l.layout === "naka" && this.getEffectiveCommentVpos(l) > this.currentTime + L) {
          l.x = l.virtualStartX, l.lastUpdateTime = this.timeSource.now();
          continue;
        }
        if (l.hasShown = !0, l.update(this.playbackRate, !this.isPlaying), !l.isScrolling && l.hasStaticExpired(this.currentTime)) {
          const v = l.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(v, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
        }
      }
    }
    for (const l of this.comments)
      l.isActive && l.isScrolling && (l.scrollDirection === "rtl" && l.x <= l.exitThreshold || l.scrollDirection === "ltr" && l.x >= l.exitThreshold) && (l.isActive = !1, this.activeComments.delete(l), l.clearActivation());
  }
  buildPrepareOptions(e) {
    const t = this._settings.scrollVisibleDurationMs;
    let i = $, s = Q;
    return t !== null && (i = t, s = Math.max(1, Math.min(t, Q))), {
      visibleWidth: e,
      virtualExtension: Je,
      maxVisibleDurationMs: i,
      minVisibleDurationMs: s,
      maxWidthRatio: Be,
      bufferRatio: Ue,
      baseBufferPx: Xe,
      entryBufferPx: Ge
    };
  }
  findAvailableLane(e) {
    const t = this.currentTime;
    this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
    const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t);
    for (const r of i)
      if (this.isLaneAvailable(r, s, t))
        return this.storeLaneReservation(r, s), r;
    const n = i[0] ?? 0;
    return this.storeLaneReservation(n, s), n;
  }
  /**
   * 二分探索で、指定した時刻より後に終了する最初の予約のインデックスを返す
   */
  findFirstValidReservationIndex(e, t) {
    let i = 0, s = e.length;
    for (; i < s; ) {
      const n = Math.floor((i + s) / 2), r = e[n];
      r !== void 0 && r.totalEndTime + X <= t ? i = n + 1 : s = n;
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
      const s = Math.floor((t + i) / 2), n = this.comments[s];
      n !== void 0 && n.vposMs < e ? t = s + 1 : i = s;
    }
    return t;
  }
  /**
   * 指定した時刻範囲内のコメントのみを返す
   */
  getCommentsInTimeWindow(e, t) {
    if (this.comments.length === 0)
      return [];
    const i = e - t, s = e + t, n = this.findCommentIndexAtOrAfter(i), r = [];
    for (let o = n; o < this.comments.length; o++) {
      const c = this.comments[o];
      if (c === void 0 || c.vposMs > s)
        break;
      r.push(c);
    }
    return r;
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
    const s = i.length > 0 && E(), n = this.resolveFinalPhaseVpos(e);
    return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - b ? (s && S("comment-eval-skip", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "final-phase-trimmed",
      finalPhaseStartTime: this.finalPhaseStartTime
    }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (s && S("comment-eval-skip", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "invisible"
    }), !1) : e.isActive ? (s && S("comment-eval-skip", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "already-active"
    }), !1) : n > t + L ? (s && S("comment-eval-pending", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "future",
      currentTime: t
    }), !1) : n < t - N ? (s && S("comment-eval-skip", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "expired-window",
      currentTime: t
    }), !1) : (s && S("comment-eval-ready", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      currentTime: t
    }), !0);
  }
  activateComment(e, t, i, s, n, r) {
    e.prepare(t, i, s, n);
    const o = this.resolveFinalPhaseVpos(e);
    if (E() && S("comment-prepared", {
      preview: P(e.text),
      layout: e.layout,
      isScrolling: e.isScrolling,
      width: e.width,
      height: e.height,
      bufferWidth: e.bufferWidth,
      visibleDurationMs: e.visibleDurationMs,
      effectiveVposMs: o
    }), e.layout === "naka") {
      const u = Math.max(0, r - o), l = e.speedPixelsPerMs * u;
      if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
        const C = this.duration > 0 ? this.duration : this.finalPhaseStartTime + O, V = Math.max(
          this.finalPhaseStartTime + O,
          C
        ), y = Math.abs(e.exitThreshold - e.virtualStartX), x = V - o;
        if (x > 0 && y > 0) {
          const g = y / x;
          g > e.speedPixelsPerMs && (e.speedPixelsPerMs = g, e.baseSpeed = g * (1e3 / 60), e.speed = e.baseSpeed, e.totalDurationMs = Math.ceil(y / g));
        }
      }
      const m = e.getDirectionSign(), f = e.virtualStartX + m * l, v = e.exitThreshold, p = e.scrollDirection;
      if (p === "rtl" && f <= v || p === "ltr" && f >= v) {
        e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation(), e.lane = -1, E() && S("comment-skip-exited", {
          preview: P(e.text),
          vposMs: e.vposMs,
          effectiveVposMs: o,
          referenceTime: r
        });
        return;
      }
      e.lane = this.findAvailableLane(e), e.y = e.lane * this.laneHeight, e.x = f, e.isActive = !0, this.activeComments.add(e), e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now(), E() && S("comment-activate-scroll", {
        preview: P(e.text),
        lane: e.lane,
        startX: e.x,
        width: e.width,
        visibleDurationMs: e.visibleDurationMs,
        effectiveVposMs: o
      });
      return;
    }
    const c = o + A;
    if (r > c) {
      e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation(), e.lane = -1, E() && S("comment-skip-expired", {
        preview: P(e.text),
        vposMs: e.vposMs,
        effectiveVposMs: o,
        referenceTime: r,
        displayEnd: c
      });
      return;
    }
    const d = e.layout === "ue" ? "ue" : "shita", h = this.assignStaticLane(d);
    e.lane = h, e.y = h * this.laneHeight, e.x = e.virtualStartX, e.isActive = !0, this.activeComments.add(e), e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = c, this.reserveStaticLane(d, h, c), E() && S("comment-activate-static", {
      preview: P(e.text),
      lane: e.lane,
      position: d,
      displayEnd: c,
      effectiveVposMs: o
    });
  }
  assignStaticLane(e) {
    const t = this.getStaticLaneMap(e), i = Array.from({ length: this.laneCount }, (r, o) => o);
    e === "shita" && i.reverse();
    for (const r of i)
      if (!t.has(r))
        return r;
    let s = i[0] ?? 0, n = Number.POSITIVE_INFINITY;
    for (const [r, o] of t.entries())
      o < n && (n = o, s = r);
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
    const i = Array.from({ length: this.laneCount }, (o, c) => c).sort((o, c) => {
      const d = this.getLaneNextAvailableTime(o, e), h = this.getLaneNextAvailableTime(c, e);
      return Math.abs(d - h) <= b ? o - c : d - h;
    }), s = this.getStaticReservedLaneSet();
    if (s.size === 0)
      return i;
    const n = i.filter((o) => !s.has(o));
    if (n.length === 0)
      return i;
    const r = i.filter((o) => s.has(o));
    return [...n, ...r];
  }
  getLaneNextAvailableTime(e, t) {
    const i = this.reservedLanes.get(e);
    if (!i || i.length === 0)
      return t;
    const s = this.findFirstValidReservationIndex(i, t);
    let n = t;
    for (let r = s; r < i.length; r++) {
      const o = i[r];
      o !== void 0 && (n = Math.max(n, o.endTime));
    }
    return n;
  }
  createLaneReservation(e, t) {
    const i = Math.max(e.speedPixelsPerMs, b), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, r = Math.max(0, n), o = r + e.preCollisionDurationMs + X, c = r + e.totalDurationMs + X;
    return {
      comment: e,
      startTime: r,
      endTime: Math.max(r, o),
      totalEndTime: Math.max(r, c),
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
    const n = this.findFirstValidReservationIndex(s, i);
    for (let r = n; r < s.length; r++) {
      const o = s[r];
      if (o === void 0)
        break;
      if (this.areReservationsConflicting(o, t))
        return !1;
    }
    return !0;
  }
  storeLaneReservation(e, t) {
    const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, r) => n.totalEndTime - r.totalEndTime);
    this.reservedLanes.set(e, s);
  }
  areReservationsConflicting(e, t) {
    const i = Math.max(e.startTime, t.startTime), s = Math.min(e.endTime, t.endTime);
    if (i >= s)
      return !1;
    const n = /* @__PURE__ */ new Set([
      i,
      s,
      i + (s - i) / 2
    ]), r = this.solveLeftRightEqualityTime(e, t);
    r !== null && r >= i - b && r <= s + b && n.add(r);
    const o = this.solveLeftRightEqualityTime(t, e);
    o !== null && o >= i - b && o <= s + b && n.add(o);
    for (const c of n) {
      if (c < i - b || c > s + b)
        continue;
      const d = this.computeForwardGap(e, t, c), h = this.computeForwardGap(t, e, c);
      if (d <= b && h <= b)
        return !0;
    }
    return !1;
  }
  computeForwardGap(e, t, i) {
    const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
    return s.left - n.right;
  }
  getBufferedEdges(e, t) {
    const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, r = n - e.buffer, o = n + e.width + e.buffer;
    return { left: r, right: o };
  }
  solveLeftRightEqualityTime(e, t) {
    const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
    if (Math.abs(n) < b)
      return null;
    const o = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
    return Number.isFinite(o) ? o : null;
  }
  draw() {
    const e = this.canvas, t = this.ctx;
    if (!e || !t)
      return;
    const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i, r = this.timeSource.now();
    if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering()) {
      t.clearRect(0, 0, s, n), this.lastDrawTime = r;
      return;
    }
    t.clearRect(0, 0, s, n);
    const o = Array.from(this.activeComments);
    if (this._settings.isCommentVisible) {
      const c = (r - this.lastDrawTime) / 16.666666666666668;
      o.sort((d, h) => {
        const u = this.getEffectiveCommentVpos(d), l = this.getEffectiveCommentVpos(h), m = u - l;
        return Math.abs(m) > b ? m : d.isScrolling !== h.isScrolling ? d.isScrolling ? 1 : -1 : d.creationIndex - h.creationIndex;
      }), o.forEach((d) => {
        const u = this.isPlaying && !d.isPaused ? d.x + d.getDirectionSign() * d.speed * c : d.x;
        d.draw(t, u);
      });
    }
    this.lastDrawTime = r;
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
    const s = F(i.currentTime);
    this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    const n = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : e.width / n, o = this.displayHeight > 0 ? this.displayHeight : e.height / n, c = this.buildPrepareOptions(r);
    this.getCommentsInTimeWindow(this.currentTime, N).forEach((h) => {
      const u = E(), l = u ? P(h.text) : "";
      if (u && S("comment-evaluate", {
        stage: "seek",
        preview: l,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        currentTime: this.currentTime,
        isActive: h.isActive,
        hasShown: h.hasShown
      }), this.isNGComment(h.text)) {
        u && S("comment-eval-skip", {
          preview: l,
          vposMs: h.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(h),
          reason: "ng-runtime"
        }), h.isActive = !1, this.activeComments.delete(h), h.clearActivation();
        return;
      }
      if (h.isInvisible) {
        u && S("comment-eval-skip", {
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
          r,
          o,
          c,
          this.currentTime
        );
        return;
      }
      this.getEffectiveCommentVpos(h) < this.currentTime - N ? h.hasShown = !0 : h.hasShown = !1;
    }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
  }
  setupVideoEventListeners(e) {
    try {
      const t = () => {
        this.isPlaying = !0, this.playbackHasBegun = !0;
        const h = this.timeSource.now();
        this.lastDrawTime = h, this.comments.forEach((u) => {
          u.lastUpdateTime = h, u.isPaused = !1;
        });
      }, i = () => {
        this.isPlaying = !1;
        const h = this.timeSource.now();
        this.comments.forEach((u) => {
          u.lastUpdateTime = h, u.isPaused = !0;
        });
      }, s = () => {
        this.onSeek();
      }, n = () => {
        this.onSeek();
      }, r = () => {
        this.playbackRate = e.playbackRate;
        const h = this.timeSource.now();
        this.comments.forEach((u) => {
          u.lastUpdateTime = h;
        });
      }, o = () => {
        this.handleVideoMetadataLoaded(e);
      }, c = () => {
        this.duration = Number.isFinite(e.duration) ? F(e.duration) : 0;
      }, d = () => {
        this.handleVideoSourceChange();
      };
      e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", r), e.addEventListener("loadedmetadata", o), e.addEventListener("durationchange", c), e.addEventListener("emptied", d), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", r)), this.addCleanup(() => e.removeEventListener("loadedmetadata", o)), this.addCleanup(() => e.removeEventListener("durationchange", c)), this.addCleanup(() => e.removeEventListener("emptied", d));
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
    this.duration = Number.isFinite(e.duration) ? F(e.duration) : 0, this.currentTime = F(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.playbackHasBegun = this.isPlaying || this.currentTime > L, this.lastDrawTime = this.timeSource.now();
  }
  resetCommentActivity() {
    const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
    if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > L, t && i) {
      const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, r = this.displayHeight > 0 ? this.displayHeight : t.height / s;
      i.clearRect(0, 0, n, r);
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
    const i = new MutationObserver((n) => {
      for (const r of n) {
        if (r.type === "attributes" && r.attributeName === "src") {
          const o = r.target;
          let c = null, d = null;
          if ((o instanceof HTMLVideoElement || o instanceof HTMLSourceElement) && (c = typeof r.oldValue == "string" ? r.oldValue : null, d = o.getAttribute("src")), c === d)
            continue;
          this.handleVideoSourceChange(e);
          return;
        }
        if (r.type === "childList") {
          for (const o of r.addedNodes)
            if (o instanceof HTMLSourceElement) {
              this.handleVideoSourceChange(e);
              return;
            }
          for (const o of r.removedNodes)
            if (o instanceof HTMLSourceElement) {
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
      for (const r of n)
        if (r.type === "childList") {
          for (const o of r.addedNodes) {
            const c = this.extractVideoElement(o);
            if (c && c !== this.videoElement) {
              this.initialize(c);
              return;
            }
          }
          for (const o of r.removedNodes) {
            if (o === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
            if (o instanceof Element) {
              const c = o.querySelector("video");
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
        for (const n of s) {
          const { width: r, height: o } = n.contentRect;
          r > 0 && o > 0 ? this.resize(r, o) : this.resize();
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
    const i = this.containerElement ?? t.parentElement ?? null, s = this.getFullscreenElement(), n = this.resolveActiveOverlayContainer(
      t,
      i,
      s
    );
    if (!(n instanceof HTMLElement))
      return;
    e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
    const o = (s instanceof HTMLElement && s.contains(t) ? s : null) !== null;
    this.fullscreenActive !== o && (this.fullscreenActive = o, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
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
  ke as cloneDefaultSettings,
  Ie as configureDebugLogging,
  je as createDefaultAnimationFrameProvider,
  ae as createDefaultTimeSource,
  se as createLogger,
  S as debugLog,
  E as isDebugLoggingEnabled,
  it as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.map
