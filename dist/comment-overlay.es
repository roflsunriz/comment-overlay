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
  const { level: t = "info", emitter: i = pe } = e, s = j[t], n = (r, l) => {
    j[r] < s || i(r, a, l);
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
}, Ce = (a) => Number.isFinite(a) ? Math.min(100, Math.max(-100, a)) : 0, we = (a) => !Number.isFinite(a) || a === 0 ? 1 : Math.min(5, Math.max(0.25, a)), xe = (a) => a === "naka" || a === "ue" || a === "shita", Te = (a) => a === "small" || a === "medium" || a === "big", Ee = (a) => a === "defont" || a === "gothic" || a === "mincho", Pe = (a) => a in ne, Fe = (a, e) => {
  let t = "naka", i = "medium", s = "defont", n = null, r = 1, l = null, c = !1, h = 0, u = 1;
  for (const f of a) {
    const m = Me(typeof f == "string" ? f : "");
    if (!m)
      continue;
    if (Y.test(m)) {
      const M = ye(m);
      if (M) {
        n = M;
        continue;
      }
    }
    const p = m.toLowerCase();
    if (xe(p)) {
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
      l = 0.5;
      continue;
    }
    if (p === "invisible") {
      r = 0, c = !0;
      continue;
    }
    if (p.startsWith("ls:") || p.startsWith("letterspacing:")) {
      const M = m.indexOf(":");
      if (M >= 0) {
        const C = re(m.slice(M + 1));
        C !== null && (h = Ce(C));
      }
      continue;
    }
    if (p.startsWith("lh:") || p.startsWith("lineheight:")) {
      const M = m.indexOf(":");
      if (M >= 0) {
        const C = be(m.slice(M + 1));
        C !== null && (u = we(C));
      }
      continue;
    }
  }
  const o = Math.max(0, Math.min(1, r)), d = (n ?? e.defaultColor).toUpperCase(), v = typeof l == "number" ? Math.max(0, Math.min(1, l)) : null;
  return {
    layout: t,
    size: i,
    sizeScale: ve[i],
    font: s,
    fontFamily: me[s],
    resolvedColor: d,
    colorOverride: n,
    opacityMultiplier: o,
    opacityOverride: v,
    isInvisible: c,
    letterSpacing: h,
    lineHeight: u
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
}, A = 4e3, Ae = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, R = (a) => !Number.isFinite(a) || a <= 0 ? 0 : a >= 1 ? 1 : a, _ = (a) => a.length === 1 ? a.repeat(2) : a, T = (a) => Number.parseInt(a, 16), De = (a, e) => {
  const t = Ae.exec(a);
  if (!t)
    return a;
  const i = t[1];
  let s, n, r, l = 1;
  i.length === 3 || i.length === 4 ? (s = T(_(i[0])), n = T(_(i[1])), r = T(_(i[2])), i.length === 4 && (l = T(_(i[3])) / 255)) : (s = T(i.slice(0, 2)), n = T(i.slice(2, 4)), r = T(i.slice(4, 6)), i.length === 8 && (l = T(i.slice(6, 8)) / 255));
  const c = R(l * R(e));
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
      const n = Math.max(t, 1), r = Math.max(24, Math.floor(i * 0.05)), l = Math.max(24, Math.floor(r * this.sizeScale));
      this.fontSize = l, e.font = `${this.fontSize}px ${this.fontFamily}`;
      const c = this.text.includes(`
`) ? this.text.split(/\r?\n/) : [this.text];
      this.lines = c.length > 0 ? c : [""];
      let h = 0;
      const u = this.letterSpacing;
      for (const x of this.lines) {
        const W = U(e, x), fe = x.length > 1 ? u * (x.length - 1) : 0, K = Math.max(0, W + fe);
        K > h && (h = K);
      }
      this.width = h;
      const o = Math.max(
        1,
        Math.floor(this.fontSize * this.lineHeightMultiplier)
      );
      if (this.lineHeightPx = o, this.height = this.fontSize + (this.lines.length > 1 ? (this.lines.length - 1) * o : 0), !this.isScrolling) {
        this.bufferWidth = 0;
        const x = Math.max((n - this.width) / 2, 0);
        this.virtualStartX = x, this.x = x, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = A, this.preCollisionDurationMs = A, this.totalDurationMs = A, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vposMs + A, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const d = U(e, "??".repeat(150)), v = this.width * Math.max(s.bufferRatio, 0);
      this.bufferWidth = Math.max(s.baseBufferPx, v);
      const f = Math.max(s.entryBufferPx, this.bufferWidth), m = this.scrollDirection, p = m === "rtl" ? n + s.virtualExtension : -this.width - this.bufferWidth - s.virtualExtension, M = m === "rtl" ? -this.width - this.bufferWidth - f : n + f, C = m === "rtl" ? n + f : -f, V = m === "rtl" ? p + this.width + this.bufferWidth : p - this.bufferWidth;
      this.virtualStartX = p, this.x = p, this.exitThreshold = M;
      const y = n > 0 ? this.width / n : 0, w = s.maxVisibleDurationMs === s.minVisibleDurationMs;
      let g = s.maxVisibleDurationMs;
      if (!w && y > 1) {
        const x = Math.min(y, s.maxWidthRatio), W = s.maxVisibleDurationMs / Math.max(x, 1);
        g = Math.max(s.minVisibleDurationMs, Math.floor(W));
      }
      const oe = n + this.width + this.bufferWidth + f, le = Math.max(g, 1), z = oe / le, he = z * 1e3 / 60;
      this.baseSpeed = he, this.speed = this.baseSpeed, this.speedPixelsPerMs = z;
      const ce = Math.abs(M - p), ue = m === "rtl" ? Math.max(0, V - C) : Math.max(0, C - V), J = Math.max(z, Number.EPSILON);
      this.visibleDurationMs = g, this.preCollisionDurationMs = Math.max(0, Math.ceil(ue / J)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(ce / J)
      );
      const de = this.width + this.bufferWidth + f;
      this.reservationWidth = Math.min(d, de), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
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
      const i = R(this.opacity), s = t ?? this.x, n = this.lines.length > 0 ? this.lines : [this.text], r = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, l = this.y + this.fontSize, c = (o, d, v) => {
        if (o.length === 0)
          return;
        if (Math.abs(this.letterSpacing) < Number.EPSILON) {
          v === "stroke" ? e.strokeText(o, s, d) : e.fillText(o, s, d);
          return;
        }
        let f = s;
        for (let m = 0; m < o.length; m += 1) {
          const p = o[m];
          v === "stroke" ? e.strokeText(p, f, d) : e.fillText(p, f, d);
          const M = U(e, p);
          f += M, m < o.length - 1 && (f += this.letterSpacing);
        }
      }, h = () => {
        e.globalAlpha = i, e.strokeStyle = "#000000", e.lineWidth = Math.max(3, this.fontSize / 8), e.lineJoin = "round", n.forEach((o, d) => {
          const v = l + d * r;
          c(o, v, "stroke");
        }), e.globalAlpha = 1;
      }, u = () => {
        n.forEach((o, d) => {
          const v = l + d * r;
          c(o, v, "fill");
        });
      };
      if (h(), this.renderStyle === "classic") {
        const o = Math.max(1, this.fontSize * 0.04), d = this.fontSize * 0.18;
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
          const m = R(f.alpha * i);
          e.shadowColor = `rgba(${f.rgb}, ${m})`, e.shadowBlur = d * f.blurMultiplier, e.shadowOffsetX = o * f.offsetXMultiplier, e.shadowOffsetY = o * f.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", u();
        }), e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      } else
        e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      e.globalAlpha = 1, e.fillStyle = De(this.color, i), u(), e.restore();
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
}, et = I, He = () => ({
  ...I,
  ngWords: [...I.ngWords],
  ngRegexps: [...I.ngRegexps]
}), tt = "v1.1.0", q = 5, D = {
  enabled: !1,
  maxLogsPerCategory: q
}, N = /* @__PURE__ */ new Map(), ke = (a) => {
  if (a === void 0 || !Number.isFinite(a))
    return q;
  const e = Math.max(1, Math.floor(a));
  return Math.min(1e4, e);
}, Ie = (a) => {
  D.enabled = !!a.enabled, D.maxLogsPerCategory = ke(a.maxLogsPerCategory), D.enabled || N.clear();
}, it = () => {
  N.clear();
}, E = () => D.enabled, ze = (a) => {
  const e = N.get(a) ?? 0;
  return e >= D.maxLogsPerCategory ? (e === D.maxLogsPerCategory && (console.debug(`[CommentOverlay][${a}]`, "Further logs suppressed."), N.set(a, e + 1)), !1) : (N.set(a, e + 1), !0);
}, S = (a, ...e) => {
  D.enabled && ze(a) && console.debug(`[CommentOverlay][${a}]`, ...e);
}, P = (a, e = 32) => a.length <= e ? a : `${a.slice(0, e)}…`, F = (a) => a * 1e3, We = (a) => !Number.isFinite(a) || a < 0 ? null : Math.round(a), $ = 4e3, Q = 1800, Be = 3, Ue = 0.25, Xe = 32, Ge = 48, H = 120, qe = 4e3, X = 120, $e = 800, Ye = 2, O = 4e3, G = A + $, Je = 1e3, ee = 1, te = 12, ie = 24, b = 1e-3, L = 50, Ke = (a) => Number.isFinite(a) ? a <= 0 ? 0 : a >= 1 ? 1 : a : 1, k = (a) => {
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
      i = k({ ...e }), s = t ?? {};
    else {
      const n = e ?? t ?? {};
      s = typeof n == "object" ? n : {}, i = k(He());
    }
    this.timeSource = s.timeSource ?? ae(), this.animationFrameProvider = s.animationFrameProvider ?? je(this.timeSource), this.createCanvasElement = s.createCanvasElement ?? Ze(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this._settings = k(i), this.log = se(s.loggerNamespace ?? "CommentRenderer"), this.rebuildNgMatchers(), s.debug && Ie(s.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(e) {
    this._settings = k(e), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
      const l = this.containerElement;
      l instanceof HTMLElement && (this.ensureContainerPositioning(l), l.appendChild(n)), this.canvas = n, this.ctx = r, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
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
      const { text: s, vposMs: n, commands: r = [] } = i, l = P(s);
      if (this.isNGComment(s)) {
        S("comment-skip-ng", { preview: l, vposMs: n });
        continue;
      }
      const c = We(n);
      if (c === null) {
        this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), S("comment-skip-invalid-vpos", { preview: l, vposMs: n });
        continue;
      }
      if (this.comments.some(
        (o) => o.text === s && o.vposMs === c
      ) || t.some(
        (o) => o.text === s && o.vposMs === c
      )) {
        S("comment-skip-duplicate", { preview: l, vposMs: c });
        continue;
      }
      const u = new Ne(
        s,
        c,
        r,
        this._settings,
        this.commentDependencies
      );
      u.creationIndex = this.commentSequence++, t.push(u), S("comment-added", {
        preview: l,
        vposMs: c,
        commands: u.commands.length,
        layout: u.layout,
        isScrolling: u.isScrolling,
        invisible: u.isInvisible
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
    if (this.comments.length = 0, this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear(), this.commentSequence = 0, this.ctx && this.canvas) {
      const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
      this.ctx.clearRect(0, 0, t, i);
    }
  }
  resetState() {
    this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1;
  }
  destroy() {
    this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1;
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
    const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + O, i = Math.max(e + O, t), s = this.comments.filter((u) => u.hasShown || u.isInvisible || this.isNGComment(u.text) ? !1 : u.vposMs >= e - G).sort((u, o) => {
      const d = u.vposMs - o.vposMs;
      return Math.abs(d) > b ? d : u.creationIndex - o.creationIndex;
    });
    if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
      this.finalPhaseScheduleDirty = !1;
      return;
    }
    const r = Math.max(i - e, O) / Math.max(s.length, 1), l = Number.isFinite(r) ? r : X, c = Math.max(X, Math.min(l, $e));
    let h = e;
    s.forEach((u, o) => {
      const d = Math.max(1, this.getFinalPhaseDisplayDuration(u)), v = i - d;
      let f = Math.max(e, Math.min(h, v));
      Number.isFinite(f) || (f = e);
      const m = Ye * o;
      f + m <= v && (f += m), this.finalPhaseVposOverrides.set(u, f);
      const p = Math.max(X, Math.min(d / 2, c));
      h = f + p;
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
    const r = i !== this._settings.scrollDirection, l = s !== this._settings.useDprScaling, c = n !== this._settings.syncMode;
    if (this.comments.forEach((h) => {
      h.syncWithSettings(this._settings, this.settingsVersion);
    }), r && this.resetCommentActivity(), !this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((d) => {
        d.isActive = !1, d.clearActivation();
      });
      const h = this.canvasDpr > 0 ? this.canvasDpr : 1, u = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / h, o = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / h;
      this.ctx.clearRect(0, 0, u, o), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    }
    t !== this._settings.useContainerResizeObserver && this.videoElement && this.setupResizeHandling(this.videoElement), l && this.resize(), c && this.videoElement && this.startAnimation();
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
    const r = i.getBoundingClientRect(), l = this.canvasDpr > 0 ? this.canvasDpr : 1, c = this.displayWidth > 0 ? this.displayWidth : s.width / l, h = this.displayHeight > 0 ? this.displayHeight : s.height / l, u = e ?? r.width ?? c, o = t ?? r.height ?? h;
    if (!Number.isFinite(u) || !Number.isFinite(o) || u <= 0 || o <= 0)
      return;
    const d = Math.max(1, Math.floor(u)), v = Math.max(1, Math.floor(o)), f = this.displayWidth > 0 ? this.displayWidth : d, m = this.displayHeight > 0 ? this.displayHeight : v, p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, M = Math.max(1, Math.round(d * p)), C = Math.max(1, Math.round(v * p));
    if (!(this.displayWidth !== d || this.displayHeight !== v || Math.abs(this.canvasDpr - p) > Number.EPSILON || s.width !== M || s.height !== C))
      return;
    this.displayWidth = d, this.displayHeight = v, this.canvasDpr = p, s.width = M, s.height = C, s.style.width = `${d}px`, s.style.height = `${v}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p));
    const y = f > 0 ? d / f : 1, w = m > 0 ? v / m : 1;
    (y !== 1 || w !== 1) && this.comments.forEach((g) => {
      g.isActive && (g.x *= y, g.y *= w, g.width *= y, g.fontSize = Math.max(
        ie,
        Math.floor(Math.max(1, g.fontSize) * w)
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
    const r = this.canvasDpr > 0 ? this.canvasDpr : 1, l = this.displayWidth > 0 ? this.displayWidth : i.width / r, c = this.displayHeight > 0 ? this.displayHeight : i.height / r, h = this.buildPrepareOptions(l), u = this.duration > 0 && this.duration - this.currentTime <= qe;
    u && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, l, c), this.comments.forEach((o) => {
      o.isActive = !1, o.clearActivation();
    }), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear()), !u && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
    for (const o of this.comments) {
      const d = E(), v = d ? P(o.text) : "";
      if (d && S("comment-evaluate", {
        stage: "update",
        preview: v,
        vposMs: o.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(o),
        currentTime: this.currentTime,
        isActive: o.isActive,
        hasShown: o.hasShown
      }), this.isNGComment(o.text)) {
        d && S("comment-eval-skip", {
          preview: v,
          vposMs: o.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(o),
          reason: "ng-runtime"
        });
        continue;
      }
      if (o.isInvisible) {
        d && S("comment-eval-skip", {
          preview: v,
          vposMs: o.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(o),
          reason: "invisible"
        }), o.isActive = !1, o.hasShown = !0, o.clearActivation();
        continue;
      }
      if (o.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(o, this.currentTime, v) && this.activateComment(
        o,
        s,
        l,
        c,
        h,
        this.currentTime
      ), o.isActive) {
        if (o.layout !== "naka" && o.hasStaticExpired(this.currentTime)) {
          const f = o.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(f, o.lane), o.isActive = !1, o.clearActivation();
          continue;
        }
        if (o.layout === "naka" && this.getEffectiveCommentVpos(o) > this.currentTime + L) {
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
  pruneLaneReservations(e) {
    for (const [t, i] of this.reservedLanes.entries()) {
      const s = i.filter(
        (n) => n.totalEndTime + H > e
      );
      s.length > 0 ? this.reservedLanes.set(t, s) : this.reservedLanes.delete(t);
    }
  }
  pruneStaticLaneReservations(e) {
    for (const [t, i] of this.topStaticLaneReservations.entries())
      i <= e && this.topStaticLaneReservations.delete(t);
    for (const [t, i] of this.bottomStaticLaneReservations.entries())
      i <= e && this.bottomStaticLaneReservations.delete(t);
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
    }), !1) : n < t - G ? (s && S("comment-eval-skip", {
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
    const l = this.resolveFinalPhaseVpos(e);
    if (E() && S("comment-prepared", {
      preview: P(e.text),
      layout: e.layout,
      isScrolling: e.isScrolling,
      width: e.width,
      height: e.height,
      bufferWidth: e.bufferWidth,
      visibleDurationMs: e.visibleDurationMs,
      effectiveVposMs: l
    }), e.layout === "naka") {
      const o = Math.max(0, r - l), d = e.speedPixelsPerMs * o;
      if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
        const C = this.duration > 0 ? this.duration : this.finalPhaseStartTime + O, V = Math.max(
          this.finalPhaseStartTime + O,
          C
        ), y = Math.abs(e.exitThreshold - e.virtualStartX), w = V - l;
        if (w > 0 && y > 0) {
          const g = y / w;
          g > e.speedPixelsPerMs && (e.speedPixelsPerMs = g, e.baseSpeed = g * (1e3 / 60), e.speed = e.baseSpeed, e.totalDurationMs = Math.ceil(y / g));
        }
      }
      const v = e.getDirectionSign(), f = e.virtualStartX + v * d, m = e.exitThreshold, p = e.scrollDirection;
      if (p === "rtl" && f <= m || p === "ltr" && f >= m) {
        e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1, E() && S("comment-skip-exited", {
          preview: P(e.text),
          vposMs: e.vposMs,
          effectiveVposMs: l,
          referenceTime: r
        });
        return;
      }
      e.lane = this.findAvailableLane(e), e.y = e.lane * this.laneHeight, e.x = f, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now(), E() && S("comment-activate-scroll", {
        preview: P(e.text),
        lane: e.lane,
        startX: e.x,
        width: e.width,
        visibleDurationMs: e.visibleDurationMs,
        effectiveVposMs: l
      });
      return;
    }
    const c = l + A;
    if (r > c) {
      e.isActive = !1, e.hasShown = !0, e.clearActivation(), e.lane = -1, E() && S("comment-skip-expired", {
        preview: P(e.text),
        vposMs: e.vposMs,
        effectiveVposMs: l,
        referenceTime: r,
        displayEnd: c
      });
      return;
    }
    const h = e.layout === "ue" ? "ue" : "shita", u = this.assignStaticLane(h);
    e.lane = u, e.y = u * this.laneHeight, e.x = e.virtualStartX, e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(r), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = c, this.reserveStaticLane(h, u, c), E() && S("comment-activate-static", {
      preview: P(e.text),
      lane: e.lane,
      position: h,
      displayEnd: c,
      effectiveVposMs: l
    });
  }
  assignStaticLane(e) {
    const t = this.getStaticLaneMap(e), i = Array.from({ length: this.laneCount }, (r, l) => l);
    e === "shita" && i.reverse();
    for (const r of i)
      if (!t.has(r))
        return r;
    let s = i[0] ?? 0, n = Number.POSITIVE_INFINITY;
    for (const [r, l] of t.entries())
      l < n && (n = l, s = r);
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
    const i = Array.from({ length: this.laneCount }, (l, c) => c).sort((l, c) => {
      const h = this.getLaneNextAvailableTime(l, e), u = this.getLaneNextAvailableTime(c, e);
      return Math.abs(h - u) <= b ? l - c : h - u;
    }), s = this.getStaticReservedLaneSet();
    if (s.size === 0)
      return i;
    const n = i.filter((l) => !s.has(l));
    if (n.length === 0)
      return i;
    const r = i.filter((l) => s.has(l));
    return [...n, ...r];
  }
  getLaneNextAvailableTime(e, t) {
    const i = this.reservedLanes.get(e);
    if (!i || i.length === 0)
      return t;
    let s = t;
    for (const n of i)
      s = Math.max(s, n.endTime);
    return s;
  }
  createLaneReservation(e, t) {
    const i = Math.max(e.speedPixelsPerMs, b), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, r = Math.max(0, n), l = r + e.preCollisionDurationMs + H, c = r + e.totalDurationMs + H;
    return {
      comment: e,
      startTime: r,
      endTime: Math.max(r, l),
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
    for (const n of s)
      if (!(n.totalEndTime + H <= i) && this.areReservationsConflicting(n, t))
        return !1;
    return !0;
  }
  storeLaneReservation(e, t) {
    const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, r) => n.endTime - r.endTime);
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
    const l = this.solveLeftRightEqualityTime(t, e);
    l !== null && l >= i - b && l <= s + b && n.add(l);
    for (const c of n) {
      if (c < i - b || c > s + b)
        continue;
      const h = this.computeForwardGap(e, t, c), u = this.computeForwardGap(t, e, c);
      if (h <= b && u <= b)
        return !0;
    }
    return !1;
  }
  computeForwardGap(e, t, i) {
    const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
    return s.left - n.right;
  }
  getBufferedEdges(e, t) {
    const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, r = n - e.buffer, l = n + e.width + e.buffer;
    return { left: r, right: l };
  }
  solveLeftRightEqualityTime(e, t) {
    const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
    if (Math.abs(n) < b)
      return null;
    const l = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
    return Number.isFinite(l) ? l : null;
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
    const l = this.comments.filter((c) => c.isActive);
    if (this._settings.isCommentVisible) {
      const c = (r - this.lastDrawTime) / 16.666666666666668;
      l.sort((h, u) => {
        const o = this.getEffectiveCommentVpos(h), d = this.getEffectiveCommentVpos(u), v = o - d;
        return Math.abs(v) > b ? v : h.isScrolling !== u.isScrolling ? h.isScrolling ? 1 : -1 : h.creationIndex - u.creationIndex;
      }), l.forEach((h) => {
        const o = this.isPlaying && !h.isPaused ? h.x + h.getDirectionSign() * h.speed * c : h.x;
        h.draw(t, o);
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
    this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
    const n = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : e.width / n, l = this.displayHeight > 0 ? this.displayHeight : e.height / n, c = this.buildPrepareOptions(r);
    this.comments.forEach((h) => {
      const u = E(), o = u ? P(h.text) : "";
      if (u && S("comment-evaluate", {
        stage: "seek",
        preview: o,
        vposMs: h.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(h),
        currentTime: this.currentTime,
        isActive: h.isActive,
        hasShown: h.hasShown
      }), this.isNGComment(h.text)) {
        u && S("comment-eval-skip", {
          preview: o,
          vposMs: h.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(h),
          reason: "ng-runtime"
        }), h.isActive = !1, h.clearActivation();
        return;
      }
      if (h.isInvisible) {
        u && S("comment-eval-skip", {
          preview: o,
          vposMs: h.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(h),
          reason: "invisible"
        }), h.isActive = !1, h.hasShown = !0, h.clearActivation();
        return;
      }
      if (h.syncWithSettings(this._settings, this.settingsVersion), h.isActive = !1, h.lane = -1, h.clearActivation(), this.shouldActivateCommentAtTime(h, this.currentTime, o)) {
        this.activateComment(
          h,
          t,
          r,
          l,
          c,
          this.currentTime
        );
        return;
      }
      this.getEffectiveCommentVpos(h) < this.currentTime - G ? h.hasShown = !0 : h.hasShown = !1;
    }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
  }
  setupVideoEventListeners(e) {
    try {
      const t = () => {
        this.isPlaying = !0, this.playbackHasBegun = !0;
        const u = this.timeSource.now();
        this.lastDrawTime = u, this.comments.forEach((o) => {
          o.lastUpdateTime = u, o.isPaused = !1;
        });
      }, i = () => {
        this.isPlaying = !1;
        const u = this.timeSource.now();
        this.comments.forEach((o) => {
          o.lastUpdateTime = u, o.isPaused = !0;
        });
      }, s = () => {
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
      }, c = () => {
        this.duration = Number.isFinite(e.duration) ? F(e.duration) : 0;
      }, h = () => {
        this.handleVideoSourceChange();
      };
      e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", r), e.addEventListener("loadedmetadata", l), e.addEventListener("durationchange", c), e.addEventListener("emptied", h), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", r)), this.addCleanup(() => e.removeEventListener("loadedmetadata", l)), this.addCleanup(() => e.removeEventListener("durationchange", c)), this.addCleanup(() => e.removeEventListener("emptied", h));
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
    });
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
          const l = r.target;
          let c = null, h = null;
          if ((l instanceof HTMLVideoElement || l instanceof HTMLSourceElement) && (c = typeof r.oldValue == "string" ? r.oldValue : null, h = l.getAttribute("src")), c === h)
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
          for (const l of r.addedNodes) {
            const c = this.extractVideoElement(l);
            if (c && c !== this.videoElement) {
              this.initialize(c);
              return;
            }
          }
          for (const l of r.removedNodes) {
            if (l === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
            if (l instanceof Element) {
              const c = l.querySelector("video");
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
          const { width: r, height: l } = n.contentRect;
          r > 0 && l > 0 ? this.resize(r, l) : this.resize();
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
    const i = this.containerElement ?? t.parentElement ?? null, s = this.getFullscreenElement();
    if (s === t && i instanceof HTMLElement && i !== t && i.contains(t) && typeof i.requestFullscreen == "function" && await this.promoteContainerToFullscreen(i))
      return;
    const n = this.resolveActiveOverlayContainer(
      t,
      i,
      s
    );
    if (!(n instanceof HTMLElement))
      return;
    e.parentElement !== n ? (this.ensureContainerPositioning(n), n.appendChild(e)) : this.ensureContainerPositioning(n);
    const l = (s instanceof HTMLElement && s.contains(t) ? s : null) !== null;
    this.fullscreenActive !== l && (this.fullscreenActive = l, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
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
  async promoteContainerToFullscreen(e) {
    if (typeof e.requestFullscreen != "function")
      return !1;
    try {
      return await e.requestFullscreen(), !0;
    } catch (t) {
      return this.log.warn("CommentRenderer.promoteContainerToFullscreen", t), !1;
    }
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
  He as cloneDefaultSettings,
  Ie as configureDebugLogging,
  je as createDefaultAnimationFrameProvider,
  ae as createDefaultTimeSource,
  se as createLogger,
  S as debugLog,
  E as isDebugLoggingEnabled,
  it as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.map
