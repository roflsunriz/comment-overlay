const j = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, pe = (a, e, t) => {
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
}, se = (a, e = {}) => {
  const { level: t = "info", emitter: s = pe } = e, i = j[t], n = (r, o) => {
    j[r] < i || s(r, a, o);
  };
  return {
    debug: (...r) => n("debug", r),
    info: (...r) => n("info", r),
    warn: (...r) => n("warn", r),
    error: (...r) => n("error", r)
  };
}, me = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, ve = {
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
  const t = e.toLowerCase().endsWith("px") ? e.slice(0, -2) : e, s = Number.parseFloat(t);
  return Number.isFinite(s) ? s : null;
}, be = (a) => {
  const e = a.trim();
  if (!e)
    return null;
  if (e.endsWith("%")) {
    const t = Number.parseFloat(e.slice(0, -1));
    return Number.isFinite(t) ? t / 100 : null;
  }
  return re(e);
}, Ce = (a) => Number.isFinite(a) ? Math.min(100, Math.max(-100, a)) : 0, we = (a) => !Number.isFinite(a) || a === 0 ? 1 : Math.min(5, Math.max(0.25, a)), xe = (a) => a === "naka" || a === "ue" || a === "shita", Te = (a) => a === "small" || a === "medium" || a === "big", Ee = (a) => a === "defont" || a === "gothic" || a === "mincho", Pe = (a) => a in ne, Le = (a, e) => {
  let t = "naka", s = "medium", i = "defont", n = null, r = 1, o = null, c = !1, d = 0, h = 1;
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
      s = p;
      continue;
    }
    if (Ee(p)) {
      i = p;
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
      const M = m.indexOf(":");
      if (M >= 0) {
        const C = re(m.slice(M + 1));
        C !== null && (d = Ce(C));
      }
      continue;
    }
    if (p.startsWith("lh:") || p.startsWith("lineheight:")) {
      const M = m.indexOf(":");
      if (M >= 0) {
        const C = be(m.slice(M + 1));
        C !== null && (h = we(C));
      }
      continue;
    }
  }
  const u = Math.max(0, Math.min(1, r)), l = (n ?? e.defaultColor).toUpperCase(), v = typeof o == "number" ? Math.max(0, Math.min(1, o)) : null;
  return {
    layout: t,
    size: s,
    sizeScale: me[s],
    font: i,
    fontFamily: ve[i],
    resolvedColor: l,
    colorOverride: n,
    opacityMultiplier: u,
    opacityOverride: v,
    isInvisible: c,
    letterSpacing: d,
    lineHeight: h
  };
}, U = se("CommentEngine:Comment"), Z = /* @__PURE__ */ new WeakMap(), Fe = (a) => {
  let e = Z.get(a);
  return e || (e = /* @__PURE__ */ new Map(), Z.set(a, e)), e;
}, X = (a, e) => {
  if (!a)
    return 0;
  const s = `${a.font ?? ""}::${e}`, i = Fe(a), n = i.get(s);
  if (n !== void 0)
    return n;
  const r = a.measureText(e).width;
  return i.set(s, r), r;
}, A = 4e3, Ae = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, R = (a) => !Number.isFinite(a) || a <= 0 ? 0 : a >= 1 ? 1 : a, k = (a) => a.length === 1 ? a.repeat(2) : a, T = (a) => Number.parseInt(a, 16), De = (a, e) => {
  const t = Ae.exec(a);
  if (!t)
    return a;
  const s = t[1];
  let i, n, r, o = 1;
  s.length === 3 || s.length === 4 ? (i = T(k(s[0])), n = T(k(s[1])), r = T(k(s[2])), s.length === 4 && (o = T(k(s[3])) / 255)) : (i = T(s.slice(0, 2)), n = T(s.slice(2, 4)), r = T(s.slice(4, 6)), s.length === 8 && (o = T(s.slice(6, 8)) / 255));
  const c = R(o * R(e));
  return `rgba(${i}, ${n}, ${r}, ${c})`;
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
  constructor(e, t, s, i, n = {}) {
    if (typeof e != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(t) || t < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = e, this.vposMs = t, this.commands = Array.isArray(s) ? [...s] : [];
    const r = Le(this.commands, {
      defaultColor: i.commentColor
    });
    this.layout = r.layout, this.isScrolling = this.layout === "naka", this.sizeScale = r.sizeScale, this.opacityMultiplier = r.opacityMultiplier, this.opacityOverride = r.opacityOverride, this.colorOverride = r.colorOverride, this.isInvisible = r.isInvisible, this.fontFamily = r.fontFamily, this.color = r.resolvedColor, this.opacity = this.getEffectiveOpacity(i.commentOpacity), this.renderStyle = i.renderStyle, this.letterSpacing = r.letterSpacing, this.lineHeightMultiplier = r.lineHeight, this.timeSource = n.timeSource ?? ae(), this.applyScrollDirection(i.scrollDirection), this.syncWithSettings(i, n.settingsVersion);
  }
  prepare(e, t, s, i) {
    try {
      if (!e)
        throw new Error("Canvas context is required");
      if (!Number.isFinite(t) || !Number.isFinite(s))
        throw new Error("Canvas dimensions must be numbers");
      if (!i)
        throw new Error("Prepare options are required");
      const n = Math.max(t, 1), r = Math.max(24, Math.floor(s * 0.05)), o = Math.max(24, Math.floor(r * this.sizeScale));
      this.fontSize = o, e.font = `${this.fontSize}px ${this.fontFamily}`;
      const c = this.text.includes(`
`) ? this.text.split(/\r?\n/) : [this.text];
      this.lines = c.length > 0 ? c : [""];
      let d = 0;
      const h = this.letterSpacing;
      for (const x of this.lines) {
        const B = X(e, x), fe = x.length > 1 ? h * (x.length - 1) : 0, K = Math.max(0, B + fe);
        K > d && (d = K);
      }
      this.width = d;
      const u = Math.max(
        1,
        Math.floor(this.fontSize * this.lineHeightMultiplier)
      );
      if (this.lineHeightPx = u, this.height = this.fontSize + (this.lines.length > 1 ? (this.lines.length - 1) * u : 0), !this.isScrolling) {
        this.bufferWidth = 0;
        const x = Math.max((n - this.width) / 2, 0);
        this.virtualStartX = x, this.x = x, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = A, this.preCollisionDurationMs = A, this.totalDurationMs = A, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vposMs + A, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const l = X(e, "??".repeat(150)), v = this.width * Math.max(i.bufferRatio, 0);
      this.bufferWidth = Math.max(i.baseBufferPx, v);
      const f = Math.max(i.entryBufferPx, this.bufferWidth), m = this.scrollDirection, p = m === "rtl" ? n + i.virtualExtension : -this.width - this.bufferWidth - i.virtualExtension, M = m === "rtl" ? -this.width - this.bufferWidth - f : n + f, C = m === "rtl" ? n + f : -f, V = m === "rtl" ? p + this.width + this.bufferWidth : p - this.bufferWidth;
      this.virtualStartX = p, this.x = p, this.exitThreshold = M;
      const y = n > 0 ? this.width / n : 0, w = i.maxVisibleDurationMs === i.minVisibleDurationMs;
      let g = i.maxVisibleDurationMs;
      if (!w && y > 1) {
        const x = Math.min(y, i.maxWidthRatio), B = i.maxVisibleDurationMs / Math.max(x, 1);
        g = Math.max(i.minVisibleDurationMs, Math.floor(B));
      }
      const oe = n + this.width + this.bufferWidth + f, le = Math.max(g, 1), z = oe / le, he = z * 1e3 / 60;
      this.baseSpeed = he, this.speed = this.baseSpeed, this.speedPixelsPerMs = z;
      const ce = Math.abs(M - p), ue = m === "rtl" ? Math.max(0, V - C) : Math.max(0, C - V), J = Math.max(z, Number.EPSILON);
      this.visibleDurationMs = g, this.preCollisionDurationMs = Math.max(0, Math.ceil(ue / J)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(ce / J)
      );
      const de = this.width + this.bufferWidth + f;
      this.reservationWidth = Math.min(l, de), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
    } catch (n) {
      throw U.error("Comment.prepare", n, {
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
      U.error("Comment.update", s, {
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
      const s = R(this.opacity), i = t ?? this.x, n = this.lines.length > 0 ? this.lines : [this.text], r = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, o = this.y + this.fontSize, c = (u, l, v) => {
        if (u.length === 0)
          return;
        if (Math.abs(this.letterSpacing) < Number.EPSILON) {
          v === "stroke" ? e.strokeText(u, i, l) : e.fillText(u, i, l);
          return;
        }
        let f = i;
        for (let m = 0; m < u.length; m += 1) {
          const p = u[m];
          v === "stroke" ? e.strokeText(p, f, l) : e.fillText(p, f, l);
          const M = X(e, p);
          f += M, m < u.length - 1 && (f += this.letterSpacing);
        }
      }, d = () => {
        e.globalAlpha = s, e.strokeStyle = "#000000", e.lineWidth = Math.max(3, this.fontSize / 8), e.lineJoin = "round", n.forEach((u, l) => {
          const v = o + l * r;
          c(u, v, "stroke");
        }), e.globalAlpha = 1;
      }, h = () => {
        n.forEach((u, l) => {
          const v = o + l * r;
          c(u, v, "fill");
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
          const m = R(f.alpha * s);
          e.shadowColor = `rgba(${f.rgb}, ${m})`, e.shadowBlur = l * f.blurMultiplier, e.shadowOffsetX = u * f.offsetXMultiplier, e.shadowOffsetY = u * f.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", h();
        }), e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      } else
        e.shadowColor = "transparent", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0;
      e.globalAlpha = 1, e.fillStyle = De(this.color, s), h(), e.restore();
    } catch (s) {
      U.error("Comment.draw", s, {
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
const _e = 4e3, W = {
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
}, et = W, ke = () => ({
  ...W,
  ngWords: [...W.ngWords],
  ngRegexps: [...W.ngRegexps]
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
}, P = (a, e = 32) => a.length <= e ? a : `${a.slice(0, e)}…`, L = (a) => a * 1e3, ze = (a) => !Number.isFinite(a) || a < 0 ? null : Math.round(a), $ = 4e3, Q = 1800, Be = 3, Ue = 0.25, Xe = 32, Ge = 48, H = 120, qe = 4e3, G = 120, $e = 800, Ye = 2, O = 4e3, N = A + $, Je = 1e3, ee = 1, te = 12, ie = 24, b = 1e-3, F = 50, Ke = (a) => Number.isFinite(a) ? a <= 0 ? 0 : a >= 1 ? 1 : a : 1, I = (a) => {
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
    let s, i;
    if (Qe(e))
      s = I({ ...e }), i = t ?? {};
    else {
      const n = e ?? t ?? {};
      i = typeof n == "object" ? n : {}, s = I(ke());
    }
    this.timeSource = i.timeSource ?? ae(), this.animationFrameProvider = i.animationFrameProvider ?? je(this.timeSource), this.createCanvasElement = i.createCanvasElement ?? Ze(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this._settings = I(s), this.log = se(i.loggerNamespace ?? "CommentRenderer"), this.rebuildNgMatchers(), i.debug && Ie(i.debug);
  }
  get settings() {
    return this._settings;
  }
  set settings(e) {
    this._settings = I(e), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
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
      this.videoElement = t, this.containerElement = i, this.duration = Number.isFinite(t.duration) ? L(t.duration) : 0, this.currentTime = L(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > F, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
      const n = this.createCanvasElement(), r = n.getContext("2d");
      if (!r)
        throw new Error("Failed to acquire 2D canvas context");
      n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
      const o = this.containerElement;
      o instanceof HTMLElement && (this.ensureContainerPositioning(o), o.appendChild(n)), this.canvas = n, this.ctx = r, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, i), this.startAnimation(), this.setupVisibilityHandling();
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
      const { text: i, vposMs: n, commands: r = [] } = s, o = P(i);
      if (this.isNGComment(i)) {
        S("comment-skip-ng", { preview: o, vposMs: n });
        continue;
      }
      const c = ze(n);
      if (c === null) {
        this.log.warn("CommentRenderer.addComment.invalidVpos", { text: i, vposMs: n }), S("comment-skip-invalid-vpos", { preview: o, vposMs: n });
        continue;
      }
      if (this.comments.some(
        (u) => u.text === i && u.vposMs === c
      ) || t.some(
        (u) => u.text === i && u.vposMs === c
      )) {
        S("comment-skip-duplicate", { preview: o, vposMs: c });
        continue;
      }
      const h = new Ne(
        i,
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
    return t.length === 0 ? [] : (this.comments.push(...t), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((s, i) => {
      const n = s.vposMs - i.vposMs;
      return Math.abs(n) > b ? n : s.creationIndex - i.creationIndex;
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
    const s = Math.max(e.vposMs, this.finalPhaseStartTime);
    return this.finalPhaseVposOverrides.set(e, s), s;
  }
  recomputeFinalPhaseTimeline() {
    if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
      this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
      return;
    }
    const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + O, s = Math.max(e + O, t), i = this.comments.filter((h) => h.hasShown || h.isInvisible || this.isNGComment(h.text) ? !1 : h.vposMs >= e - N).sort((h, u) => {
      const l = h.vposMs - u.vposMs;
      return Math.abs(l) > b ? l : h.creationIndex - u.creationIndex;
    });
    if (this.finalPhaseVposOverrides.clear(), i.length === 0) {
      this.finalPhaseScheduleDirty = !1;
      return;
    }
    const r = Math.max(s - e, O) / Math.max(i.length, 1), o = Number.isFinite(r) ? r : G, c = Math.max(G, Math.min(o, $e));
    let d = e;
    i.forEach((h, u) => {
      const l = Math.max(1, this.getFinalPhaseDisplayDuration(h)), v = s - l;
      let f = Math.max(e, Math.min(d, v));
      Number.isFinite(f) || (f = e);
      const m = Ye * u;
      f + m <= v && (f += m), this.finalPhaseVposOverrides.set(h, f);
      const p = Math.max(G, Math.min(l / 2, c));
      d = f + p;
    }), this.finalPhaseScheduleDirty = !1;
  }
  shouldSuppressRendering() {
    return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= F;
  }
  updatePlaybackProgressState() {
    this.playbackHasBegun || (this.isPlaying || this.currentTime > F) && (this.playbackHasBegun = !0);
  }
  updateSettings(e) {
    const t = this._settings.useContainerResizeObserver, s = this._settings.scrollDirection, i = this._settings.useDprScaling, n = this._settings.syncMode;
    this.settings = e;
    const r = s !== this._settings.scrollDirection, o = i !== this._settings.useDprScaling, c = n !== this._settings.syncMode;
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
      const r = n.trim().toLowerCase();
      r.length !== 0 && e.push(r);
    }
    const i = Array.isArray(this._settings.ngRegexps) ? this._settings.ngRegexps : [];
    for (const n of i)
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
    const r = s.getBoundingClientRect(), o = this.canvasDpr > 0 ? this.canvasDpr : 1, c = this.displayWidth > 0 ? this.displayWidth : i.width / o, d = this.displayHeight > 0 ? this.displayHeight : i.height / o, h = e ?? r.width ?? c, u = t ?? r.height ?? d;
    if (!Number.isFinite(h) || !Number.isFinite(u) || h <= 0 || u <= 0)
      return;
    const l = Math.max(1, Math.floor(h)), v = Math.max(1, Math.floor(u)), f = this.displayWidth > 0 ? this.displayWidth : l, m = this.displayHeight > 0 ? this.displayHeight : v, p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, M = Math.max(1, Math.round(l * p)), C = Math.max(1, Math.round(v * p));
    if (!(this.displayWidth !== l || this.displayHeight !== v || Math.abs(this.canvasDpr - p) > Number.EPSILON || i.width !== M || i.height !== C))
      return;
    this.displayWidth = l, this.displayHeight = v, this.canvasDpr = p, i.width = M, i.height = C, i.style.width = `${l}px`, i.style.height = `${v}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(p, p));
    const y = f > 0 ? l / f : 1, w = m > 0 ? v / m : 1;
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
    const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), s = Math.max(ie, Math.floor(t * 0.05));
    this.laneHeight = s * 1.2;
    const i = Math.floor(t / Math.max(this.laneHeight, 1));
    if (this._settings.useFixedLaneCount) {
      const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : te, r = Math.max(ee, Math.min(i, n));
      this.laneCount = r;
    } else
      this.laneCount = Math.max(ee, i);
    this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
  }
  updateComments(e) {
    const t = this.videoElement, s = this.canvas, i = this.ctx;
    if (!t || !s || !i)
      return;
    const n = typeof e == "number" ? e : L(t.currentTime);
    if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
      return;
    const r = this.canvasDpr > 0 ? this.canvasDpr : 1, o = this.displayWidth > 0 ? this.displayWidth : s.width / r, c = this.displayHeight > 0 ? this.displayHeight : s.height / r, d = this.buildPrepareOptions(o), h = this.duration > 0 && this.duration - this.currentTime <= qe;
    h && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, i.clearRect(0, 0, o, c), this.comments.forEach((l) => {
      l.isActive = !1, l.clearActivation();
    }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear()), !h && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
    const u = this.getCommentsInTimeWindow(this.currentTime, N);
    for (const l of u) {
      const v = E(), f = v ? P(l.text) : "";
      if (v && S("comment-evaluate", {
        stage: "update",
        preview: f,
        vposMs: l.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(l),
        currentTime: this.currentTime,
        isActive: l.isActive,
        hasShown: l.hasShown
      }), this.isNGComment(l.text)) {
        v && S("comment-eval-skip", {
          preview: f,
          vposMs: l.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(l),
          reason: "ng-runtime"
        });
        continue;
      }
      if (l.isInvisible) {
        v && S("comment-eval-skip", {
          preview: f,
          vposMs: l.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(l),
          reason: "invisible"
        }), l.isActive = !1, this.activeComments.delete(l), l.hasShown = !0, l.clearActivation();
        continue;
      }
      if (l.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(l, this.currentTime, f) && this.activateComment(
        l,
        i,
        o,
        c,
        d,
        this.currentTime
      ), l.isActive) {
        if (l.layout !== "naka" && l.hasStaticExpired(this.currentTime)) {
          const m = l.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(m, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
          continue;
        }
        if (l.layout === "naka" && this.getEffectiveCommentVpos(l) > this.currentTime + F) {
          l.x = l.virtualStartX, l.lastUpdateTime = this.timeSource.now();
          continue;
        }
        if (l.hasShown = !0, l.update(this.playbackRate, !this.isPlaying), !l.isScrolling && l.hasStaticExpired(this.currentTime)) {
          const m = l.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(m, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
        }
      }
    }
    for (const l of this.comments)
      l.isActive && l.isScrolling && (l.scrollDirection === "rtl" && l.x <= l.exitThreshold || l.scrollDirection === "ltr" && l.x >= l.exitThreshold) && (l.isActive = !1, this.activeComments.delete(l), l.clearActivation());
  }
  buildPrepareOptions(e) {
    const t = this._settings.scrollVisibleDurationMs;
    let s = $, i = Q;
    return t !== null && (s = t, i = Math.max(1, Math.min(t, Q))), {
      visibleWidth: e,
      virtualExtension: Je,
      maxVisibleDurationMs: s,
      minVisibleDurationMs: i,
      maxWidthRatio: Be,
      bufferRatio: Ue,
      baseBufferPx: Xe,
      entryBufferPx: Ge
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
        (n) => n.totalEndTime + H > e
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
    const s = e - t, i = e + t, n = this.findCommentIndexAtOrAfter(s), r = [];
    for (let o = n; o < this.comments.length; o++) {
      const c = this.comments[o];
      if (c === void 0 || c.vposMs > i)
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
  shouldActivateCommentAtTime(e, t, s = "") {
    const i = s.length > 0 && E(), n = this.resolveFinalPhaseVpos(e);
    return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - b ? (i && S("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "final-phase-trimmed",
      finalPhaseStartTime: this.finalPhaseStartTime
    }), this.finalPhaseVposOverrides.delete(e), !1) : e.isInvisible ? (i && S("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "invisible"
    }), !1) : e.isActive ? (i && S("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "already-active"
    }), !1) : n > t + F ? (i && S("comment-eval-pending", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "future",
      currentTime: t
    }), !1) : n < t - N ? (i && S("comment-eval-skip", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "expired-window",
      currentTime: t
    }), !1) : (i && S("comment-eval-ready", {
      preview: s,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      currentTime: t
    }), !0);
  }
  activateComment(e, t, s, i, n, r) {
    e.prepare(t, s, i, n);
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
        ), y = Math.abs(e.exitThreshold - e.virtualStartX), w = V - o;
        if (w > 0 && y > 0) {
          const g = y / w;
          g > e.speedPixelsPerMs && (e.speedPixelsPerMs = g, e.baseSpeed = g * (1e3 / 60), e.speed = e.baseSpeed, e.totalDurationMs = Math.ceil(y / g));
        }
      }
      const v = e.getDirectionSign(), f = e.virtualStartX + v * l, m = e.exitThreshold, p = e.scrollDirection;
      if (p === "rtl" && f <= m || p === "ltr" && f >= m) {
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
    const t = this.getStaticLaneMap(e), s = Array.from({ length: this.laneCount }, (r, o) => o);
    e === "shita" && s.reverse();
    for (const r of s)
      if (!t.has(r))
        return r;
    let i = s[0] ?? 0, n = Number.POSITIVE_INFINITY;
    for (const [r, o] of t.entries())
      o < n && (n = o, i = r);
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
    const s = Array.from({ length: this.laneCount }, (o, c) => c).sort((o, c) => {
      const d = this.getLaneNextAvailableTime(o, e), h = this.getLaneNextAvailableTime(c, e);
      return Math.abs(d - h) <= b ? o - c : d - h;
    }), i = this.getStaticReservedLaneSet();
    if (i.size === 0)
      return s;
    const n = s.filter((o) => !i.has(o));
    if (n.length === 0)
      return s;
    const r = s.filter((o) => i.has(o));
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
    const s = Math.max(e.speedPixelsPerMs, b), i = this.getEffectiveCommentVpos(e), n = Number.isFinite(i) ? i : t, r = Math.max(0, n), o = r + e.preCollisionDurationMs + H, c = r + e.totalDurationMs + H;
    return {
      comment: e,
      startTime: r,
      endTime: Math.max(r, o),
      totalEndTime: Math.max(r, c),
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
      if (!(n.totalEndTime + H <= s) && this.areReservationsConflicting(n, t))
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
    r !== null && r >= s - b && r <= i + b && n.add(r);
    const o = this.solveLeftRightEqualityTime(t, e);
    o !== null && o >= s - b && o <= i + b && n.add(o);
    for (const c of n) {
      if (c < s - b || c > i + b)
        continue;
      const d = this.computeForwardGap(e, t, c), h = this.computeForwardGap(t, e, c);
      if (d <= b && h <= b)
        return !0;
    }
    return !1;
  }
  computeForwardGap(e, t, s) {
    const i = this.getBufferedEdges(e, s), n = this.getBufferedEdges(t, s);
    return i.left - n.right;
  }
  getBufferedEdges(e, t) {
    const s = Math.max(0, t - e.startTime), i = e.speed * s, n = e.startLeft + e.directionSign * i, r = n - e.buffer, o = n + e.width + e.buffer;
    return { left: r, right: o };
  }
  solveLeftRightEqualityTime(e, t) {
    const s = e.directionSign, i = t.directionSign, n = i * t.speed - s * e.speed;
    if (Math.abs(n) < b)
      return null;
    const o = (t.startLeft + i * t.speed * t.startTime + t.width + t.buffer - e.startLeft - s * e.speed * e.startTime + e.buffer) / n;
    return Number.isFinite(o) ? o : null;
  }
  draw() {
    const e = this.canvas, t = this.ctx;
    if (!e || !t)
      return;
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, i = this.displayWidth > 0 ? this.displayWidth : e.width / s, n = this.displayHeight > 0 ? this.displayHeight : e.height / s, r = this.timeSource.now();
    if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering()) {
      t.clearRect(0, 0, i, n), this.lastDrawTime = r;
      return;
    }
    t.clearRect(0, 0, i, n);
    const o = Array.from(this.activeComments);
    if (this._settings.isCommentVisible) {
      const c = (r - this.lastDrawTime) / 16.666666666666668;
      o.sort((d, h) => {
        const u = this.getEffectiveCommentVpos(d), l = this.getEffectiveCommentVpos(h), v = u - l;
        return Math.abs(v) > b ? v : d.isScrolling !== h.isScrolling ? d.isScrolling ? 1 : -1 : d.creationIndex - h.creationIndex;
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
    const i = L(s.currentTime);
    this.currentTime = i, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.reservedLanes.clear(), this.topStaticLaneReservations.clear(), this.bottomStaticLaneReservations.clear();
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
      }, s = () => {
        this.isPlaying = !1;
        const h = this.timeSource.now();
        this.comments.forEach((u) => {
          u.lastUpdateTime = h, u.isPaused = !0;
        });
      }, i = () => {
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
        this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0;
      }, d = () => {
        this.handleVideoSourceChange();
      };
      e.addEventListener("play", t), e.addEventListener("pause", s), e.addEventListener("seeking", i), e.addEventListener("seeked", n), e.addEventListener("ratechange", r), e.addEventListener("loadedmetadata", o), e.addEventListener("durationchange", c), e.addEventListener("emptied", d), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", s)), this.addCleanup(() => e.removeEventListener("seeking", i)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", r)), this.addCleanup(() => e.removeEventListener("loadedmetadata", o)), this.addCleanup(() => e.removeEventListener("durationchange", c)), this.addCleanup(() => e.removeEventListener("emptied", d));
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
    this.duration = Number.isFinite(e.duration) ? L(e.duration) : 0, this.currentTime = L(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.playbackHasBegun = this.isPlaying || this.currentTime > F, this.lastDrawTime = this.timeSource.now();
  }
  resetCommentActivity() {
    const e = this.timeSource.now(), t = this.canvas, s = this.ctx;
    if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > F, t && s) {
      const i = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / i, r = this.displayHeight > 0 ? this.displayHeight : t.height / i;
      s.clearRect(0, 0, n, r);
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
          const { width: r, height: o } = n.contentRect;
          r > 0 && o > 0 ? this.resize(r, o) : this.resize();
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
    const o = (i instanceof HTMLElement && i.contains(t) ? i : null) !== null;
    this.fullscreenActive !== o && (this.fullscreenActive = o, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
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
