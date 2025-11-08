const ae = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}, ye = (o, e, t) => {
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
}, fe = (o, e = {}) => {
  const { level: t = "info", emitter: i = ye } = e, s = ae[t], n = (a, r) => {
    ae[a] < s || i(a, o, r);
  };
  return {
    debug: (...a) => n("debug", a),
    info: (...a) => n("info", a),
    warn: (...a) => n("warn", a),
    error: (...a) => n("error", a)
  };
}, Me = {
  small: 0.8,
  medium: 1,
  big: 1.4
}, be = {
  defont: '"MS PGothic","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic Pro","Yu Gothic UI","Yu Gothic","Meiryo","Segoe UI","Osaka","Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","IPAPGothic","TakaoPGothic","Roboto","Helvetica Neue","Helvetica","Arial","sans-serif"',
  gothic: '"Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP","Yu Gothic","Yu Gothic Medium","Meiryo","MS PGothic","Hiragino Kaku Gothic ProN","Segoe UI","Helvetica","Arial","sans-serif"',
  mincho: '"MS PMincho","MS Mincho","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Times New Roman","serif"'
}, pe = {
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
}, te = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Ce = /^[,.:;]+/, xe = /[,.:;]+$/, we = (o) => {
  const e = o.trim();
  return e ? te.test(e) ? e : e.replace(Ce, "").replace(xe, "") : "";
}, Te = (o) => te.test(o) ? o.toUpperCase() : null, ve = (o) => {
  const e = o.trim();
  if (!e)
    return null;
  const t = e.toLowerCase().endsWith("px") ? e.slice(0, -2) : e, i = Number.parseFloat(t);
  return Number.isFinite(i) ? i : null;
}, Ee = (o) => {
  const e = o.trim();
  if (!e)
    return null;
  if (e.endsWith("%")) {
    const t = Number.parseFloat(e.slice(0, -1));
    return Number.isFinite(t) ? t / 100 : null;
  }
  return ve(e);
}, Pe = (o) => Number.isFinite(o) ? Math.min(100, Math.max(-100, o)) : 0, Le = (o) => !Number.isFinite(o) || o === 0 ? 1 : Math.min(5, Math.max(0.25, o)), Fe = (o) => o === "naka" || o === "ue" || o === "shita", Ae = (o) => o === "small" || o === "medium" || o === "big", De = (o) => o === "defont" || o === "gothic" || o === "mincho", Re = (o) => o in pe, Ie = (o, e) => {
  let t = "naka", i = "medium", s = "defont", n = null, a = 1, r = null, h = !1, u = 0, c = 1;
  for (const d of o) {
    const m = we(typeof d == "string" ? d : "");
    if (!m)
      continue;
    if (te.test(m)) {
      const S = Te(m);
      if (S) {
        n = S;
        continue;
      }
    }
    const v = m.toLowerCase();
    if (Fe(v)) {
      t = v;
      continue;
    }
    if (Ae(v)) {
      i = v;
      continue;
    }
    if (De(v)) {
      s = v;
      continue;
    }
    if (Re(v)) {
      n = pe[v].toUpperCase();
      continue;
    }
    if (v === "_live") {
      r = 0.5;
      continue;
    }
    if (v === "invisible") {
      a = 0, h = !0;
      continue;
    }
    if (v.startsWith("ls:") || v.startsWith("letterspacing:")) {
      const S = m.indexOf(":");
      if (S >= 0) {
        const b = ve(m.slice(S + 1));
        b !== null && (u = Pe(b));
      }
      continue;
    }
    if (v.startsWith("lh:") || v.startsWith("lineheight:")) {
      const S = m.indexOf(":");
      if (S >= 0) {
        const b = Ee(m.slice(S + 1));
        b !== null && (c = Le(b));
      }
      continue;
    }
  }
  const f = Math.max(0, Math.min(1, a)), l = (n ?? e.defaultColor).toUpperCase(), p = typeof r == "number" ? Math.max(0, Math.min(1, r)) : null;
  return {
    layout: t,
    size: i,
    sizeScale: Me[i],
    font: s,
    fontFamily: be[s],
    resolvedColor: l,
    colorOverride: n,
    opacityMultiplier: f,
    opacityOverride: p,
    isInvisible: h,
    letterSpacing: u,
    lineHeight: c
  };
}, Q = 5, D = {
  enabled: !1,
  maxLogsPerCategory: Q
}, W = /* @__PURE__ */ new Map(), Ve = (o) => {
  if (o === void 0 || !Number.isFinite(o))
    return Q;
  const e = Math.max(1, Math.floor(o));
  return Math.min(1e4, e);
}, Oe = (o) => {
  D.enabled = !!o.enabled, D.maxLogsPerCategory = Ve(o.maxLogsPerCategory), D.enabled || W.clear();
}, lt = () => {
  W.clear();
}, A = () => D.enabled, He = (o) => {
  const e = W.get(o) ?? 0;
  return e >= D.maxLogsPerCategory ? (e === D.maxLogsPerCategory && (console.debug(`[CommentOverlay][${o}]`, "Further logs suppressed."), W.set(o, e + 1)), !1) : (W.set(o, e + 1), !0);
}, C = (o, ...e) => {
  D.enabled && He(o) && console.debug(`[CommentOverlay][${o}]`, ...e);
}, I = (o, e = 32) => o.length <= e ? o : `${o.slice(0, e)}…`, Ne = (o, e) => {
  D.enabled && (console.group(`[CommentOverlay][state-dump] ${o}`), console.table({
    "Current Time": `${e.currentTime.toFixed(2)}ms`,
    Duration: `${e.duration.toFixed(2)}ms`,
    "Is Playing": e.isPlaying,
    "Epoch ID": e.epochId,
    "Total Comments": e.totalComments,
    "Active Comments": e.activeComments,
    "Reserved Lanes": e.reservedLanes,
    "Final Phase": e.finalPhaseActive,
    "Playback Begun": e.playbackHasBegun,
    "Is Stalled": e.isStalled
  }), console.groupEnd());
}, ke = (o, e, t) => {
  D.enabled && C("epoch-change", `Epoch changed: ${o} → ${e} (reason: ${t})`);
}, K = fe("CommentEngine:Comment"), re = /* @__PURE__ */ new WeakMap(), ze = (o) => {
  let e = re.get(o);
  return e || (e = /* @__PURE__ */ new Map(), re.set(o, e)), e;
}, $ = (o, e) => {
  if (!o)
    return 0;
  const i = `${o.font ?? ""}::${e}`, s = ze(o), n = s.get(i);
  if (n !== void 0)
    return n;
  const a = o.measureText(e).width;
  return s.set(i, a), a;
}, N = 4e3, _e = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, oe = 8, We = 12, L = (o) => !Number.isFinite(o) || o <= 0 ? 0 : o >= 1 ? 1 : o, B = (o) => o.length === 1 ? o.repeat(2) : o, V = (o) => Number.parseInt(o, 16), le = (o, e) => {
  const t = _e.exec(o);
  if (!t)
    return o;
  const i = t[1];
  let s, n, a, r = 1;
  i.length === 3 || i.length === 4 ? (s = V(B(i[0])), n = V(B(i[1])), a = V(B(i[2])), i.length === 4 && (r = V(B(i[3])) / 255)) : (s = V(i.slice(0, 2)), n = V(i.slice(2, 4)), a = V(i.slice(4, 6)), i.length === 8 && (r = V(i.slice(6, 8)) / 255));
  const h = L(r * L(e));
  return `rgba(${s}, ${n}, ${a}, ${h})`;
}, $e = () => ({
  now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now()
}), me = () => $e(), Be = (o) => o === "ltr" ? "ltr" : "rtl", Xe = (o) => o === "ltr" ? 1 : -1;
class g {
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
  epochId = 0;
  directionSign = -1;
  timeSource;
  lastSyncedSettingsVersion = -1;
  cachedTexture = null;
  textureCacheKey = "";
  constructor(e, t, i, s, n = {}) {
    if (typeof e != "string")
      throw new Error("Comment text must be a string");
    if (!Number.isFinite(t) || t < 0)
      throw new Error("Comment vposMs must be a non-negative number");
    this.text = e, this.vposMs = t, this.commands = Array.isArray(i) ? [...i] : [];
    const a = Ie(this.commands, {
      defaultColor: s.commentColor
    });
    this.layout = a.layout, this.isScrolling = this.layout === "naka", this.sizeScale = a.sizeScale, this.opacityMultiplier = a.opacityMultiplier, this.opacityOverride = a.opacityOverride, this.colorOverride = a.colorOverride, this.isInvisible = a.isInvisible, this.fontFamily = a.fontFamily, this.color = a.resolvedColor, this.opacity = this.getEffectiveOpacity(s.commentOpacity), this.renderStyle = s.renderStyle, this.letterSpacing = a.letterSpacing, this.lineHeightMultiplier = a.lineHeight, this.timeSource = n.timeSource ?? me(), this.applyScrollDirection(s.scrollDirection), this.syncWithSettings(s, n.settingsVersion);
  }
  prepare(e, t, i, s) {
    try {
      if (!e)
        throw new Error("Canvas context is required");
      if (!Number.isFinite(t) || !Number.isFinite(i))
        throw new Error("Canvas dimensions must be numbers");
      if (!s)
        throw new Error("Prepare options are required");
      const n = Math.max(t, 1), a = Math.max(24, Math.floor(i * 0.05)), r = Math.max(24, Math.floor(a * this.sizeScale));
      this.fontSize = r, e.font = `${this.fontSize}px ${this.fontFamily}`;
      const h = this.text.includes(`
`) ? this.text.split(/\r?\n/) : [this.text];
      this.lines = h.length > 0 ? h : [""], this.updateTextMetrics(e);
      const u = !this.isScrolling && (this.layout === "ue" || this.layout === "shita");
      if (u) {
        const E = Math.max(1, n - oe * 2);
        if (this.width > E) {
          const R = Math.max(
            We,
            Math.min(this.fontSize, Math.floor(a * 0.6))
          ), q = E / Math.max(this.width, 1), z = Math.max(
            R,
            Math.floor(this.fontSize * Math.min(q, 1))
          );
          z < this.fontSize && (this.fontSize = z, e.font = `${this.fontSize}px ${this.fontFamily}`, this.updateTextMetrics(e));
          let se = 0;
          for (; this.width > E && this.fontSize > R && se < 5; ) {
            const Se = E / Math.max(this.width, 1), ne = Math.max(
              R,
              Math.floor(this.fontSize * Math.max(Se, 0.7))
            );
            ne >= this.fontSize ? this.fontSize = Math.max(R, this.fontSize - 1) : this.fontSize = ne, e.font = `${this.fontSize}px ${this.fontFamily}`, this.updateTextMetrics(e), se += 1;
          }
        }
      }
      if (!this.isScrolling) {
        this.bufferWidth = 0;
        const E = u ? oe : 0, R = Math.max((n - this.width) / 2, E), q = Math.max(E, n - this.width - E), z = Math.min(R, Math.max(q, E));
        this.virtualStartX = z, this.x = z, this.baseSpeed = 0, this.speed = 0, this.speedPixelsPerMs = 0, this.visibleDurationMs = N, this.preCollisionDurationMs = N, this.totalDurationMs = N, this.reservationWidth = this.width, this.staticExpiryTimeMs = this.vposMs + N, this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
        return;
      }
      this.staticExpiryTimeMs = null;
      const c = $(e, "??".repeat(150)), f = this.width * Math.max(s.bufferRatio, 0);
      this.bufferWidth = Math.max(s.baseBufferPx, f);
      const l = Math.max(s.entryBufferPx, this.bufferWidth), p = this.scrollDirection, d = p === "rtl" ? n + s.virtualExtension : -this.width - this.bufferWidth - s.virtualExtension, m = p === "rtl" ? -this.width - this.bufferWidth - l : n + l, v = p === "rtl" ? n + l : -l, S = p === "rtl" ? d + this.width + this.bufferWidth : d - this.bufferWidth;
      this.virtualStartX = d, this.x = d, this.exitThreshold = m;
      const b = n > 0 ? this.width / n : 0, x = s.maxVisibleDurationMs === s.minVisibleDurationMs;
      let M = s.maxVisibleDurationMs;
      if (!x && b > 1) {
        const E = Math.min(b, s.maxWidthRatio), R = s.maxVisibleDurationMs / Math.max(E, 1);
        M = Math.max(s.minVisibleDurationMs, Math.floor(R));
      }
      const w = n + this.width + this.bufferWidth + l, y = Math.max(M, 1), H = w / y, k = H * 1e3 / 60;
      this.baseSpeed = k, this.speed = this.baseSpeed, this.speedPixelsPerMs = H;
      const U = Math.abs(m - d), Y = p === "rtl" ? Math.max(0, S - v) : Math.max(0, v - S), ie = Math.max(H, Number.EPSILON);
      this.visibleDurationMs = M, this.preCollisionDurationMs = Math.max(0, Math.ceil(Y / ie)), this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(U / ie)
      );
      const ge = this.width + this.bufferWidth + l;
      this.reservationWidth = Math.min(c, ge), this.lastUpdateTime = this.timeSource.now(), this.isPaused = !1;
    } catch (n) {
      throw K.error("Comment.prepare", n, {
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
      K.error("Comment.update", i, {
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
    outlineCallsInCache: 0,
    fillCallsInCache: 0,
    outlineCallsInFallback: 0,
    fillCallsInFallback: 0,
    letterSpacingComments: 0,
    normalComments: 0,
    multiLineComments: 0,
    totalCharactersDrawn: 0,
    lastReported: 0
  };
  static reportCacheStats() {
    if (!A())
      return;
    const e = performance.now();
    if (e - g.cacheStats.lastReported > 5e3) {
      const t = g.cacheStats.hits + g.cacheStats.misses, i = t > 0 ? g.cacheStats.hits / t * 100 : 0, s = g.cacheStats.creates > 0 ? (g.cacheStats.totalCharactersDrawn / g.cacheStats.creates).toFixed(1) : "0", n = g.cacheStats.outlineCallsInCache + g.cacheStats.outlineCallsInFallback, a = g.cacheStats.fillCallsInCache + g.cacheStats.fillCallsInFallback;
      console.log(
        "[TextureCache Stats]",
        `
  Cache: Hits=${g.cacheStats.hits}, Misses=${g.cacheStats.misses}, Hit Rate=${i.toFixed(1)}%`,
        `
  Creates: ${g.cacheStats.creates}, Fallbacks: ${g.cacheStats.fallbacks}`,
        `
  Comments: Normal=${g.cacheStats.normalComments}, LetterSpacing=${g.cacheStats.letterSpacingComments}, MultiLine=${g.cacheStats.multiLineComments}`,
        `
  Draw Calls: Outline=${n}, Fill=${a}`,
        `
  Avg Characters/Comment: ${s}`
      ), g.cacheStats.lastReported = e;
    }
  }
  isOffscreenCanvasSupported() {
    return typeof OffscreenCanvas < "u";
  }
  createTextureCanvas(e) {
    if (!this.isOffscreenCanvasSupported())
      return null;
    const t = Math.abs(this.letterSpacing) >= Number.EPSILON, i = this.lines.length > 1;
    t && g.cacheStats.letterSpacingComments++, i && g.cacheStats.multiLineComments++, !t && !i && g.cacheStats.normalComments++, g.cacheStats.totalCharactersDrawn += this.text.length;
    const s = Math.max(10, this.fontSize * 0.5), n = Math.ceil(this.width + s * 2), a = Math.ceil(this.height + s * 2), r = new OffscreenCanvas(n, a), h = r.getContext("2d");
    if (!h)
      return null;
    h.save(), h.font = `${this.fontSize}px ${this.fontFamily}`;
    const u = L(this.opacity), c = s, f = this.lines.length > 0 ? this.lines : [this.text], l = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, p = s + this.fontSize, d = this.createSegmentDrawer(h, e, "cache", c), m = this.getOutlineOffsets(), v = () => {
      const x = L(u * 0.6);
      h.save(), h.fillStyle = `rgba(0, 0, 0, ${x})`;
      for (const [M, w] of m)
        f.forEach((y, H) => {
          const k = p + H * l + w;
          d(y, k, "outline", M);
        });
      h.restore();
    }, S = (x) => {
      h.save(), h.fillStyle = x, f.forEach((M, w) => {
        const y = p + w * l;
        d(M, y, "fill");
      }), h.restore();
    };
    if (v(), this.renderStyle === "classic") {
      const x = Math.max(1, this.fontSize * 0.04), M = this.fontSize * 0.18;
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
      ].forEach((y) => {
        const H = L(y.alpha * u);
        h.save(), h.shadowColor = `rgba(${y.rgb}, ${H})`, h.shadowBlur = M * y.blurMultiplier, h.shadowOffsetX = x * y.offsetXMultiplier, h.shadowOffsetY = x * y.offsetYMultiplier, h.fillStyle = "rgba(0, 0, 0, 0)", f.forEach((k, U) => {
          const Y = p + U * l;
          d(k, Y, "fill");
        }), h.restore();
      });
    }
    const b = le(this.color, u);
    return S(b), h.restore(), r;
  }
  draw(e, t = null) {
    try {
      if (!this.isActive || !e)
        return;
      const i = this.generateTextureCacheKey();
      if (this.textureCacheKey !== i || !this.cachedTexture ? (g.cacheStats.misses++, g.cacheStats.creates++, this.cachedTexture = this.createTextureCanvas(e), this.textureCacheKey = i) : g.cacheStats.hits++, this.cachedTexture) {
        const d = t ?? this.x, m = Math.max(10, this.fontSize * 0.5);
        e.drawImage(this.cachedTexture, d - m, this.y - m), g.reportCacheStats();
        return;
      }
      g.cacheStats.fallbacks++, e.save(), e.font = `${this.fontSize}px ${this.fontFamily}`;
      const s = L(this.opacity), n = t ?? this.x, a = this.lines.length > 0 ? this.lines : [this.text], r = this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize, h = this.y + this.fontSize, u = this.createSegmentDrawer(e, e, "fallback", n), c = this.getOutlineOffsets(), f = () => {
        const d = L(s * 0.6);
        e.save(), e.fillStyle = `rgba(0, 0, 0, ${d})`;
        for (const [m, v] of c)
          a.forEach((S, b) => {
            const x = h + b * r + v;
            u(S, x, "outline", m);
          });
        e.restore();
      }, l = (d) => {
        e.save(), e.fillStyle = d, a.forEach((m, v) => {
          const S = h + v * r;
          u(m, S, "fill");
        }), e.restore();
      };
      if (f(), this.renderStyle === "classic") {
        const d = Math.max(1, this.fontSize * 0.04), m = this.fontSize * 0.18;
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
          const b = L(S.alpha * s);
          e.save(), e.shadowColor = `rgba(${S.rgb}, ${b})`, e.shadowBlur = m * S.blurMultiplier, e.shadowOffsetX = d * S.offsetXMultiplier, e.shadowOffsetY = d * S.offsetYMultiplier, e.fillStyle = "rgba(0, 0, 0, 0)", a.forEach((x, M) => {
            const w = h + M * r;
            u(x, w, "fill");
          }), e.restore();
        });
      }
      const p = le(this.color, s);
      l(p), e.restore(), g.reportCacheStats();
    } catch (i) {
      K.error("Comment.draw", i, {
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
      return L(this.opacityOverride);
    const t = e * this.opacityMultiplier;
    return Number.isFinite(t) ? L(t) : 0;
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
    const t = Be(e);
    this.scrollDirection = t, this.directionSign = Xe(t);
  }
  createSegmentDrawer(e, t, i, s) {
    return (n, a, r, h = 0) => {
      if (n.length === 0)
        return;
      const u = n.match(/^[\u3000\u00A0]+/), c = u ? u[0].length : 0, f = c > 0 ? $(t, u[0]) : 0, l = s + f + h, p = c > 0 ? n.substring(c) : n, d = () => {
        i === "cache" ? r === "outline" ? g.cacheStats.outlineCallsInCache++ : g.cacheStats.fillCallsInCache++ : r === "outline" ? g.cacheStats.outlineCallsInFallback++ : g.cacheStats.fillCallsInFallback++;
      };
      if (Math.abs(this.letterSpacing) < Number.EPSILON) {
        d(), e.fillText(p, l, a);
        return;
      }
      let m = l;
      for (let v = 0; v < p.length; v += 1) {
        const S = p[v];
        d(), e.fillText(S, m, a);
        const b = $(t, S);
        m += b, v < p.length - 1 && (m += this.letterSpacing);
      }
    };
  }
  getOutlineOffsets() {
    const e = Math.max(1, Math.round(this.fontSize * 0.08)), t = [
      [-e, 0],
      [e, 0],
      [0, -e],
      [0, e]
    ];
    if (e > 1) {
      const i = Math.max(1, Math.round(e * 0.7));
      t.push(
        [-i, -i],
        [-i, i],
        [i, -i],
        [i, i]
      );
    }
    return t;
  }
  updateTextMetrics(e) {
    let t = 0;
    const i = this.letterSpacing;
    for (const a of this.lines) {
      const r = $(e, a), h = a.length > 1 ? i * (a.length - 1) : 0, u = Math.max(0, r + h);
      u > t && (t = u);
    }
    this.width = t;
    const s = Math.max(1, Math.floor(this.fontSize * this.lineHeightMultiplier));
    this.lineHeightPx = s;
    const n = this.lines.length > 1 ? (this.lines.length - 1) * s : 0;
    this.height = this.fontSize + n;
  }
}
const Ge = 4e3, G = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: !0,
  useContainerResizeObserver: !0,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: Ge,
  useFixedLaneCount: !1,
  fixedLaneCount: 12,
  useDprScaling: !0
}, ht = G, Ue = () => ({
  ...G,
  ngWords: [...G.ngWords],
  ngRegexps: [...G.ngRegexps]
}), ct = "v2.5.0", P = (o) => o * 1e3, Ye = (o) => !Number.isFinite(o) || o < 0 ? null : Math.round(o), ee = 4e3, he = 1800, qe = 3, Ke = 0.25, Je = 32, je = 48, J = 120, Ze = 4e3, j = 120, Qe = 800, et = 2, _ = 4e3, F = N + ee, tt = 1e3, ce = 1, de = 12, ue = 24, T = 1e-3, O = 50, it = 0.05, st = 10, nt = (o) => Number.isFinite(o) ? o <= 0 ? 0 : o >= 1 ? 1 : o : 1, Z = (o) => Math.max(
  st,
  Math.floor(o * it)
), X = (o) => {
  const e = o.scrollVisibleDurationMs, t = e == null ? null : Number.isFinite(e) ? Math.max(1, Math.floor(e)) : null;
  return {
    ...o,
    scrollDirection: o.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: nt(o.commentOpacity),
    renderStyle: o.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: t,
    syncMode: o.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: !!o.useDprScaling
  };
}, at = (o) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
  request: (e) => window.requestAnimationFrame(e),
  cancel: (e) => window.cancelAnimationFrame(e)
} : {
  request: (e) => globalThis.setTimeout(() => {
    e(o.now());
  }, 16),
  cancel: (e) => {
    globalThis.clearTimeout(e);
  }
}, rt = () => typeof document > "u" ? () => {
  throw new Error(
    "Document is not available. Provide a custom createCanvasElement implementation."
  );
} : () => document.createElement("canvas"), ot = (o) => {
  if (!o || typeof o != "object")
    return !1;
  const e = o;
  return typeof e.commentColor == "string" && typeof e.commentOpacity == "number" && typeof e.isCommentVisible == "boolean";
};
class dt {
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
  laneCount = de;
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
  constructor(e = null, t = void 0) {
    let i, s;
    if (ot(e))
      i = X({ ...e }), s = t ?? {};
    else {
      const n = e ?? t ?? {};
      s = typeof n == "object" ? n : {}, i = X(Ue());
    }
    this._settings = X(i), this.timeSource = s.timeSource ?? me(), this.animationFrameProvider = s.animationFrameProvider ?? at(this.timeSource), this.createCanvasElement = s.createCanvasElement ?? rt(), this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion
    }, this.log = fe(s.loggerNamespace ?? "CommentRenderer"), this.eventHooks = s.eventHooks ?? {}, this.rebuildNgMatchers(), s.debug && Oe(s.debug);
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
      this.videoElement = t, this.containerElement = s, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? P(t.duration) : 0, this.currentTime = P(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > O, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
      const n = this.createCanvasElement(), a = n.getContext("2d");
      if (!a)
        throw new Error("Failed to acquire 2D canvas context");
      n.style.position = "absolute", n.style.top = "0", n.style.left = "0", n.style.pointerEvents = "none", n.style.zIndex = "1000";
      const r = this.containerElement;
      r instanceof HTMLElement && (this.ensureContainerPositioning(r), r.appendChild(n)), this.canvas = n, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, s), this.startAnimation(), this.setupVisibilityHandling();
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
      const { text: s, vposMs: n, commands: a = [] } = i, r = I(s);
      if (this.isNGComment(s)) {
        C("comment-skip-ng", { preview: r, vposMs: n });
        continue;
      }
      const h = Ye(n);
      if (h === null) {
        this.log.warn("CommentRenderer.addComment.invalidVpos", { text: s, vposMs: n }), C("comment-skip-invalid-vpos", { preview: r, vposMs: n });
        continue;
      }
      if (this.comments.some(
        (f) => f.text === s && f.vposMs === h
      ) || t.some(
        (f) => f.text === s && f.vposMs === h
      )) {
        C("comment-skip-duplicate", { preview: r, vposMs: h });
        continue;
      }
      const c = new g(
        s,
        h,
        a,
        this._settings,
        this.commentDependencies
      );
      c.creationIndex = this.commentSequence++, c.epochId = this.epochId, t.push(c), C("comment-added", {
        preview: r,
        vposMs: h,
        commands: c.commands.length,
        layout: c.layout,
        isScrolling: c.isScrolling,
        invisible: c.isInvisible
      });
    }
    return t.length === 0 ? [] : (this.comments.push(...t), this.finalPhaseActive && (this.finalPhaseScheduleDirty = !0), this.comments.sort((i, s) => {
      const n = i.vposMs - s.vposMs;
      return Math.abs(n) > T ? n : i.creationIndex - s.creationIndex;
    }), t);
  }
  addComment(e, t, i = []) {
    const [s] = this.addComments([{ text: e, vposMs: t, commands: i }]);
    return s ?? null;
  }
  clearComments() {
    if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
      const e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, i = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
      this.ctx.clearRect(0, 0, t, i);
    }
  }
  resetState() {
    this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
  }
  destroy() {
    this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
  }
  /**
   * 前エポックのゴーストコメントを強制掃除し、次のフレームで絶対時間同期を行う
   * 動画ロード直後の初期化やソース変更時に使用
   */
  hardReset() {
    const e = this.canvas, t = this.ctx;
    if (this.incrementEpoch("manual-reset"), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((i) => {
      i.isActive = !1, i.hasShown = !1, i.lane = -1, i.clearActivation(), i.epochId = this.epochId;
    }), e && t) {
      const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
      t.clearRect(0, 0, s, n);
    }
    this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.emitStateSnapshot("hardReset");
  }
  resetFinalPhaseState() {
    this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
  }
  /**
   * エポックIDを更新し、イベントを発火する
   */
  incrementEpoch(e) {
    const t = this.epochId;
    if (this.epochId += 1, ke(t, this.epochId, e), this.eventHooks.onEpochChange) {
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
  }
  /**
   * 状態スナップショットを生成してイベントを発火する
   */
  emitStateSnapshot(e) {
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
    if (Ne(e, i), this.eventHooks.onStateSnapshot)
      try {
        this.eventHooks.onStateSnapshot(i);
      } catch (s) {
        this.log.error("CommentRenderer.emitStateSnapshot.callback", s);
      }
    this.lastSnapshotEmitTime = t;
  }
  getEffectiveCommentVpos(e) {
    return this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.finalPhaseVposOverrides.get(e) ?? e.vposMs;
  }
  getFinalPhaseDisplayDuration(e) {
    if (!e.isScrolling)
      return N;
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
    const i = Math.max(e.vposMs, this.finalPhaseStartTime);
    return this.finalPhaseVposOverrides.set(e, i), i;
  }
  recomputeFinalPhaseTimeline() {
    if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
      this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
      return;
    }
    const e = this.finalPhaseStartTime, t = this.duration > 0 ? this.duration : e + _, i = Math.max(e + _, t), s = this.comments.filter((c) => c.hasShown || c.isInvisible || this.isNGComment(c.text) ? !1 : c.vposMs >= e - F).sort((c, f) => {
      const l = c.vposMs - f.vposMs;
      return Math.abs(l) > T ? l : c.creationIndex - f.creationIndex;
    });
    if (this.finalPhaseVposOverrides.clear(), s.length === 0) {
      this.finalPhaseScheduleDirty = !1;
      return;
    }
    const a = Math.max(i - e, _) / Math.max(s.length, 1), r = Number.isFinite(a) ? a : j, h = Math.max(j, Math.min(r, Qe));
    let u = e;
    s.forEach((c, f) => {
      const l = Math.max(1, this.getFinalPhaseDisplayDuration(c)), p = i - l;
      let d = Math.max(e, Math.min(u, p));
      Number.isFinite(d) || (d = e);
      const m = et * f;
      d + m <= p && (d += m), this.finalPhaseVposOverrides.set(c, d);
      const v = Math.max(j, Math.min(l / 2, h));
      u = d + v;
    }), this.finalPhaseScheduleDirty = !1;
  }
  shouldSuppressRendering() {
    return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= O;
  }
  updatePlaybackProgressState() {
    this.playbackHasBegun || (this.isPlaying || this.currentTime > O) && (this.playbackHasBegun = !0);
  }
  updateSettings(e) {
    const t = this._settings.useContainerResizeObserver, i = this._settings.scrollDirection, s = this._settings.useDprScaling, n = this._settings.syncMode;
    this.settings = e;
    const a = i !== this._settings.scrollDirection, r = s !== this._settings.useDprScaling, h = n !== this._settings.syncMode;
    if (this.comments.forEach((u) => {
      u.syncWithSettings(this._settings, this.settingsVersion);
    }), a && this.resetCommentActivity(), !this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((l) => {
        l.isActive = !1, l.clearActivation();
      }), this.activeComments.clear();
      const u = this.canvasDpr > 0 ? this.canvasDpr : 1, c = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / u, f = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / u;
      this.ctx.clearRect(0, 0, c, f), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
    }
    t !== this._settings.useContainerResizeObserver && this.videoElement && this.setupResizeHandling(this.videoElement), r && this.resize(), h && this.videoElement && this.startAnimation(), this.calculateLaneMetrics();
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
      const a = n.trim().toLowerCase();
      a.length !== 0 && e.push(a);
    }
    const s = Array.isArray(this._settings.ngRegexps) ? this._settings.ngRegexps : [];
    for (const n of s)
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
    const a = i.getBoundingClientRect(), r = this.canvasDpr > 0 ? this.canvasDpr : 1, h = this.displayWidth > 0 ? this.displayWidth : s.width / r, u = this.displayHeight > 0 ? this.displayHeight : s.height / r, c = e ?? a.width ?? h, f = t ?? a.height ?? u;
    if (!Number.isFinite(c) || !Number.isFinite(f) || c <= 0 || f <= 0)
      return;
    const l = Math.max(1, Math.floor(c)), p = Math.max(1, Math.floor(f)), d = this.displayWidth > 0 ? this.displayWidth : l, m = this.displayHeight > 0 ? this.displayHeight : p, v = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, S = Math.max(1, Math.round(l * v)), b = Math.max(1, Math.round(p * v));
    if (!(this.displayWidth !== l || this.displayHeight !== p || Math.abs(this.canvasDpr - v) > Number.EPSILON || s.width !== S || s.height !== b))
      return;
    this.displayWidth = l, this.displayHeight = p, this.canvasDpr = v, s.width = S, s.height = b, s.style.width = `${l}px`, s.style.height = `${p}px`, n && (n.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && n.scale(v, v));
    const M = d > 0 ? l / d : 1, w = m > 0 ? p / m : 1;
    (M !== 1 || w !== 1) && this.comments.forEach((y) => {
      y.isActive && (y.x *= M, y.y *= w, y.width *= M, y.fontSize = Math.max(
        ue,
        Math.floor(Math.max(1, y.fontSize) * w)
      ), y.height = y.fontSize, y.virtualStartX *= M, y.exitThreshold *= M, y.baseSpeed *= M, y.speed *= M, y.speedPixelsPerMs *= M, y.bufferWidth *= M, y.reservationWidth *= M);
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
    const t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1), i = Math.max(ue, Math.floor(t * 0.05));
    this.laneHeight = i * 1.2;
    const s = Math.floor(t / Math.max(this.laneHeight, 1));
    if (this._settings.useFixedLaneCount) {
      const n = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : de, a = Math.max(ce, Math.min(s, n));
      this.laneCount = a;
    } else
      this.laneCount = Math.max(ce, s);
    this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
  }
  updateComments(e) {
    const t = this.videoElement, i = this.canvas, s = this.ctx;
    if (!t || !i || !s)
      return;
    const n = typeof e == "number" ? e : P(t.currentTime);
    if (this.currentTime = n, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame)
      return;
    const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, h = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(r), c = this.duration > 0 && this.duration - this.currentTime <= Ze;
    c && !this.finalPhaseActive && (this.finalPhaseActive = !0, this.finalPhaseStartTime = this.currentTime, this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !0, s.clearRect(0, 0, r, h), this.comments.forEach((l) => {
      l.isActive = !1, l.clearActivation();
    }), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0), !c && this.finalPhaseActive && this.resetFinalPhaseState(), this.finalPhaseActive && this.finalPhaseScheduleDirty && this.recomputeFinalPhaseTimeline(), this.pruneStaticLaneReservations(this.currentTime);
    const f = this.getCommentsInTimeWindow(this.currentTime, F);
    for (const l of f) {
      const p = A(), d = p ? I(l.text) : "";
      if (p && C("comment-evaluate", {
        stage: "update",
        preview: d,
        vposMs: l.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(l),
        currentTime: this.currentTime,
        isActive: l.isActive,
        hasShown: l.hasShown
      }), this.isNGComment(l.text)) {
        p && C("comment-eval-skip", {
          preview: d,
          vposMs: l.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(l),
          reason: "ng-runtime"
        });
        continue;
      }
      if (l.isInvisible) {
        p && C("comment-eval-skip", {
          preview: d,
          vposMs: l.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(l),
          reason: "invisible"
        }), l.isActive = !1, this.activeComments.delete(l), l.hasShown = !0, l.clearActivation();
        continue;
      }
      if (l.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(l, this.currentTime, d) && this.activateComment(
        l,
        s,
        r,
        h,
        u,
        this.currentTime
      ), l.isActive) {
        if (l.layout !== "naka" && l.hasStaticExpired(this.currentTime)) {
          const m = l.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(m, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
          continue;
        }
        if (l.layout === "naka" && this.getEffectiveCommentVpos(l) > this.currentTime + O) {
          l.x = l.virtualStartX, l.lastUpdateTime = this.timeSource.now();
          continue;
        }
        if (l.hasShown = !0, l.update(this.playbackRate, !this.isPlaying), !l.isScrolling && l.hasStaticExpired(this.currentTime)) {
          const m = l.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(m, l.lane), l.isActive = !1, this.activeComments.delete(l), l.clearActivation();
        }
      }
    }
    if (this.isPlaying)
      for (const l of this.comments)
        l.isActive && l.isScrolling && (l.scrollDirection === "rtl" && l.x <= l.exitThreshold || l.scrollDirection === "ltr" && l.x >= l.exitThreshold) && (l.isActive = !1, this.activeComments.delete(l), l.clearActivation());
  }
  buildPrepareOptions(e) {
    const t = this._settings.scrollVisibleDurationMs;
    let i = ee, s = he;
    return t !== null && (i = t, s = Math.max(1, Math.min(t, he))), {
      visibleWidth: e,
      virtualExtension: tt,
      maxVisibleDurationMs: i,
      minVisibleDurationMs: s,
      maxWidthRatio: qe,
      bufferRatio: Ke,
      baseBufferPx: Je,
      entryBufferPx: je
    };
  }
  findAvailableLane(e) {
    const t = this.currentTime;
    this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
    const i = this.getLanePriorityOrder(t), s = this.createLaneReservation(e, t);
    for (const a of i)
      if (this.isLaneAvailable(a, s, t))
        return this.storeLaneReservation(a, s), a;
    const n = i[0] ?? 0;
    return this.storeLaneReservation(n, s), n;
  }
  /**
   * 二分探索で、指定した時刻より後に終了する最初の予約のインデックスを返す
   */
  findFirstValidReservationIndex(e, t) {
    let i = 0, s = e.length;
    for (; i < s; ) {
      const n = Math.floor((i + s) / 2), a = e[n];
      a !== void 0 && a.totalEndTime + J <= t ? i = n + 1 : s = n;
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
    const t = (n) => n.filter((a) => a.releaseTime > e), i = t(this.topStaticLaneReservations), s = t(this.bottomStaticLaneReservations);
    this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...i), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...s);
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
    const i = e - t, s = e + t, n = this.findCommentIndexAtOrAfter(i), a = [];
    for (let r = n; r < this.comments.length; r++) {
      const h = this.comments[r];
      if (h === void 0 || h.vposMs > s)
        break;
      a.push(h);
    }
    return a;
  }
  getStaticReservations(e) {
    return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
  }
  getStaticLaneDepth(e) {
    const t = this.getStaticReservations(e);
    if (t.length === 0)
      return 0;
    let i = -1;
    for (const s of t)
      s.lane > i && (i = s.lane);
    return Math.max(0, i + 1);
  }
  getStaticLaneLimit(e) {
    const t = e === "ue" ? "shita" : "ue", i = this.getStaticLaneDepth(t), s = this.laneCount - i;
    return s <= 0 ? -1 : s - 1;
  }
  getGlobalLaneIndexForBottom(e) {
    const t = Math.max(1, this.laneCount), i = Math.max(0, e);
    return Math.max(0, t - 1 - i);
  }
  resolveStaticCommentOffset(e, t, i, s) {
    const n = Math.max(1, i), a = Math.max(s.height, s.fontSize), r = Z(s.fontSize);
    if (e === "ue") {
      const c = t * this.laneHeight, f = r, l = Math.max(r, n - a - r);
      return Math.max(f, Math.min(c, l));
    }
    const u = n - t * this.laneHeight - a - r;
    return Math.max(r, u);
  }
  getStaticReservedLaneSet() {
    const e = /* @__PURE__ */ new Set();
    for (const t of this.topStaticLaneReservations)
      e.add(t.lane);
    for (const t of this.bottomStaticLaneReservations)
      e.add(this.getGlobalLaneIndexForBottom(t.lane));
    return e;
  }
  shouldActivateCommentAtTime(e, t, i = "") {
    const s = i.length > 0 && A(), n = this.resolveFinalPhaseVpos(e);
    return this.finalPhaseActive && this.finalPhaseStartTime !== null && e.vposMs < this.finalPhaseStartTime - T ? (s && C("comment-eval-skip", {
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
    }), !1) : n > t + O ? (s && C("comment-eval-pending", {
      preview: i,
      vposMs: e.vposMs,
      effectiveVposMs: n,
      reason: "future",
      currentTime: t
    }), !1) : n < t - F ? (s && C("comment-eval-skip", {
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
  }
  activateComment(e, t, i, s, n, a) {
    e.prepare(t, i, s, n);
    const r = this.resolveFinalPhaseVpos(e);
    if (A() && C("comment-prepared", {
      preview: I(e.text),
      layout: e.layout,
      isScrolling: e.isScrolling,
      width: e.width,
      height: e.height,
      bufferWidth: e.bufferWidth,
      visibleDurationMs: e.visibleDurationMs,
      effectiveVposMs: r
    }), e.layout === "naka") {
      const f = Math.max(0, a - r), l = e.speedPixelsPerMs * f;
      if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
        const b = this.duration > 0 ? this.duration : this.finalPhaseStartTime + _, x = Math.max(
          this.finalPhaseStartTime + _,
          b
        ), M = Math.abs(e.exitThreshold - e.virtualStartX), w = x - r;
        if (w > 0 && M > 0) {
          const y = M / w;
          y > e.speedPixelsPerMs && (e.speedPixelsPerMs = y, e.baseSpeed = y * (1e3 / 60), e.speed = e.baseSpeed, e.totalDurationMs = Math.ceil(M / y));
        }
      }
      const p = e.getDirectionSign(), d = e.virtualStartX + p * l, m = e.exitThreshold, v = e.scrollDirection;
      if (v === "rtl" && d <= m || v === "ltr" && d >= m) {
        e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation(), e.lane = -1, A() && C("comment-skip-exited", {
          preview: I(e.text),
          vposMs: e.vposMs,
          effectiveVposMs: r,
          referenceTime: a
        });
        return;
      }
      e.lane = this.findAvailableLane(e), e.y = e.lane * this.laneHeight, e.x = d, e.isActive = !0, this.activeComments.add(e), e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), A() && C("comment-activate-scroll", {
        preview: I(e.text),
        lane: e.lane,
        startX: e.x,
        width: e.width,
        visibleDurationMs: e.visibleDurationMs,
        effectiveVposMs: r
      });
      return;
    }
    const h = r + N;
    if (a > h) {
      e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation(), e.lane = -1, A() && C("comment-skip-expired", {
        preview: I(e.text),
        vposMs: e.vposMs,
        effectiveVposMs: r,
        referenceTime: a,
        displayEnd: h
      });
      return;
    }
    const u = e.layout === "ue" ? "ue" : "shita", c = this.assignStaticLane(u, e, s, a);
    e.lane = c, e.y = this.resolveStaticCommentOffset(u, c, s, e), e.x = e.virtualStartX, e.isActive = !0, this.activeComments.add(e), e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = h, this.reserveStaticLane(u, e, c, h), A() && C("comment-activate-static", {
      preview: I(e.text),
      lane: e.lane,
      position: u,
      displayEnd: h,
      effectiveVposMs: r
    });
  }
  assignStaticLane(e, t, i, s) {
    const n = this.getStaticReservations(e), a = this.getStaticLaneLimit(e), r = a >= 0 ? a + 1 : 0, h = Array.from({ length: r }, (f, l) => l);
    for (const f of h) {
      const l = this.resolveStaticCommentOffset(e, f, i, t), p = Math.max(t.height, t.fontSize), d = Z(t.fontSize), m = l - d, v = l + p + d;
      if (!n.some((b) => b.releaseTime > s ? !(v <= b.yStart || m >= b.yEnd) : !1))
        return f;
    }
    let u = h[0] ?? 0, c = Number.POSITIVE_INFINITY;
    for (const f of n)
      f.releaseTime < c && (c = f.releaseTime, u = f.lane);
    return u;
  }
  reserveStaticLane(e, t, i, s) {
    const n = this.getStaticReservations(e), a = Math.max(t.height, t.fontSize), r = Z(t.fontSize), h = t.y - r, u = t.y + a + r;
    n.push({
      comment: t,
      releaseTime: s,
      yStart: h,
      yEnd: u,
      lane: i
    });
  }
  releaseStaticLane(e, t) {
    if (t < 0)
      return;
    const i = this.getStaticReservations(e), s = i.findIndex((n) => n.lane === t);
    s >= 0 && i.splice(s, 1);
  }
  getLanePriorityOrder(e) {
    const i = Array.from({ length: this.laneCount }, (r, h) => h).sort((r, h) => {
      const u = this.getLaneNextAvailableTime(r, e), c = this.getLaneNextAvailableTime(h, e);
      return Math.abs(u - c) <= T ? r - h : u - c;
    }), s = this.getStaticReservedLaneSet();
    if (s.size === 0)
      return i;
    const n = i.filter((r) => !s.has(r));
    if (n.length === 0)
      return i;
    const a = i.filter((r) => s.has(r));
    return [...n, ...a];
  }
  getLaneNextAvailableTime(e, t) {
    const i = this.reservedLanes.get(e);
    if (!i || i.length === 0)
      return t;
    const s = this.findFirstValidReservationIndex(i, t);
    let n = t;
    for (let a = s; a < i.length; a++) {
      const r = i[a];
      r !== void 0 && (n = Math.max(n, r.endTime));
    }
    return n;
  }
  createLaneReservation(e, t) {
    const i = Math.max(e.speedPixelsPerMs, T), s = this.getEffectiveCommentVpos(e), n = Number.isFinite(s) ? s : t, a = Math.max(0, n), r = a + e.preCollisionDurationMs + J, h = a + e.totalDurationMs + J;
    return {
      comment: e,
      startTime: a,
      endTime: Math.max(a, r),
      totalEndTime: Math.max(a, h),
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
    for (let a = n; a < s.length; a++) {
      const r = s[a];
      if (r === void 0)
        break;
      if (this.areReservationsConflicting(r, t))
        return !1;
    }
    return !0;
  }
  storeLaneReservation(e, t) {
    const s = [...this.reservedLanes.get(e) ?? [], t].sort((n, a) => n.totalEndTime - a.totalEndTime);
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
    ]), a = this.solveLeftRightEqualityTime(e, t);
    a !== null && a >= i - T && a <= s + T && n.add(a);
    const r = this.solveLeftRightEqualityTime(t, e);
    r !== null && r >= i - T && r <= s + T && n.add(r);
    for (const h of n) {
      if (h < i - T || h > s + T)
        continue;
      const u = this.computeForwardGap(e, t, h), c = this.computeForwardGap(t, e, h);
      if (u <= T && c <= T)
        return !0;
    }
    return !1;
  }
  computeForwardGap(e, t, i) {
    const s = this.getBufferedEdges(e, i), n = this.getBufferedEdges(t, i);
    return s.left - n.right;
  }
  getBufferedEdges(e, t) {
    const i = Math.max(0, t - e.startTime), s = e.speed * i, n = e.startLeft + e.directionSign * s, a = n - e.buffer, r = n + e.width + e.buffer;
    return { left: a, right: r };
  }
  solveLeftRightEqualityTime(e, t) {
    const i = e.directionSign, s = t.directionSign, n = s * t.speed - i * e.speed;
    if (Math.abs(n) < T)
      return null;
    const r = (t.startLeft + s * t.speed * t.startTime + t.width + t.buffer - e.startLeft - i * e.speed * e.startTime + e.buffer) / n;
    return Number.isFinite(r) ? r : null;
  }
  draw() {
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
      const h = (a - this.lastDrawTime) / 16.666666666666668;
      r.sort((u, c) => {
        const f = this.getEffectiveCommentVpos(u), l = this.getEffectiveCommentVpos(c), p = f - l;
        return Math.abs(p) > T ? p : u.isScrolling !== c.isScrolling ? u.isScrolling ? 1 : -1 : u.creationIndex - c.creationIndex;
      }), r.forEach((u) => {
        const f = this.isPlaying && !u.isPaused ? u.x + u.getDirectionSign() * u.speed * h : u.x;
        u.draw(t, f);
      });
    }
    this.lastDrawTime = a;
  }
  /**
   * 初回フレームで絶対時間同期を実行
   * 相対進行（dt積分）で初期区間を駆け抜けないようにする
   */
  performInitialSync(e) {
    const t = this.videoElement, i = this.canvas, s = this.ctx;
    if (!t || !i || !s)
      return;
    const n = typeof e == "number" ? e : P(t.currentTime);
    this.currentTime = n, this.lastDrawTime = this.timeSource.now();
    const a = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : i.width / a, h = this.displayHeight > 0 ? this.displayHeight : i.height / a, u = this.buildPrepareOptions(r);
    this.getCommentsInTimeWindow(this.currentTime, F).forEach((f) => {
      if (this.isNGComment(f.text) || f.isInvisible) {
        f.isActive = !1, this.activeComments.delete(f), f.clearActivation();
        return;
      }
      if (f.syncWithSettings(this._settings, this.settingsVersion), f.isActive = !1, this.activeComments.delete(f), f.lane = -1, f.clearActivation(), this.shouldActivateCommentAtTime(f, this.currentTime)) {
        this.activateComment(
          f,
          s,
          r,
          h,
          u,
          this.currentTime
        );
        return;
      }
      this.getEffectiveCommentVpos(f) < this.currentTime - F ? f.hasShown = !0 : f.hasShown = !1;
    });
  }
  processFrame(e) {
    this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync && (this.performInitialSync(e), this.pendingInitialSync = !1), this.updateComments(e), this.draw());
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
    const s = P(i.currentTime), n = Math.abs(s - this.currentTime), a = this.timeSource.now();
    if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
      this.currentTime = s, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
      return;
    }
    const h = n > O;
    if (this.currentTime = s, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !h) {
      this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
      return;
    }
    this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
    const u = this.canvasDpr > 0 ? this.canvasDpr : 1, c = this.displayWidth > 0 ? this.displayWidth : e.width / u, f = this.displayHeight > 0 ? this.displayHeight : e.height / u, l = this.buildPrepareOptions(c);
    this.getCommentsInTimeWindow(this.currentTime, F).forEach((d) => {
      const m = A(), v = m ? I(d.text) : "";
      if (m && C("comment-evaluate", {
        stage: "seek",
        preview: v,
        vposMs: d.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(d),
        currentTime: this.currentTime,
        isActive: d.isActive,
        hasShown: d.hasShown
      }), this.isNGComment(d.text)) {
        m && C("comment-eval-skip", {
          preview: v,
          vposMs: d.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(d),
          reason: "ng-runtime"
        }), d.isActive = !1, this.activeComments.delete(d), d.clearActivation();
        return;
      }
      if (d.isInvisible) {
        m && C("comment-eval-skip", {
          preview: v,
          vposMs: d.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(d),
          reason: "invisible"
        }), d.isActive = !1, this.activeComments.delete(d), d.hasShown = !0, d.clearActivation();
        return;
      }
      if (d.syncWithSettings(this._settings, this.settingsVersion), d.isActive = !1, this.activeComments.delete(d), d.lane = -1, d.clearActivation(), this.shouldActivateCommentAtTime(d, this.currentTime, v)) {
        this.activateComment(
          d,
          t,
          c,
          f,
          l,
          this.currentTime
        );
        return;
      }
      this.getEffectiveCommentVpos(d) < this.currentTime - F ? d.hasShown = !0 : d.hasShown = !1;
    }), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
  }
  setupVideoEventListeners(e) {
    try {
      const t = () => {
        this.isPlaying = !0, this.playbackHasBegun = !0;
        const p = this.timeSource.now();
        this.lastDrawTime = p, this.lastPlayResumeTime = p, this.comments.forEach((d) => {
          d.lastUpdateTime = p, d.isPaused = !1;
        });
      }, i = () => {
        this.isPlaying = !1;
        const p = this.timeSource.now();
        this.comments.forEach((d) => {
          d.lastUpdateTime = p, d.isPaused = !0;
        });
      }, s = () => {
        this.onSeek();
      }, n = () => {
        this.onSeek();
      }, a = () => {
        this.playbackRate = e.playbackRate;
        const p = this.timeSource.now();
        this.comments.forEach((d) => {
          d.lastUpdateTime = p;
        });
      }, r = () => {
        this.handleVideoMetadataLoaded(e);
      }, h = () => {
        this.duration = Number.isFinite(e.duration) ? P(e.duration) : 0;
      }, u = () => {
        this.handleVideoSourceChange();
      }, c = () => {
        this.handleVideoStalled();
      }, f = () => {
        this.handleVideoCanPlay();
      }, l = () => {
        this.handleVideoCanPlay();
      };
      e.addEventListener("play", t), e.addEventListener("pause", i), e.addEventListener("seeking", s), e.addEventListener("seeked", n), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", r), e.addEventListener("durationchange", h), e.addEventListener("emptied", u), e.addEventListener("waiting", c), e.addEventListener("canplay", f), e.addEventListener("playing", l), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", i)), this.addCleanup(() => e.removeEventListener("seeking", s)), this.addCleanup(() => e.removeEventListener("seeked", n)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", r)), this.addCleanup(() => e.removeEventListener("durationchange", h)), this.addCleanup(() => e.removeEventListener("emptied", u)), this.addCleanup(() => e.removeEventListener("waiting", c)), this.addCleanup(() => e.removeEventListener("canplay", f)), this.addCleanup(() => e.removeEventListener("playing", l));
    } catch (t) {
      throw this.log.error("CommentRenderer.setupVideoEventListeners", t), t;
    }
  }
  handleVideoMetadataLoaded(e) {
    this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.hardReset(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
  }
  handleVideoStalled() {
    const e = this.canvas, t = this.ctx;
    if (!e || !t)
      return;
    this.isStalled = !0;
    const i = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : e.width / i, n = this.displayHeight > 0 ? this.displayHeight : e.height / i;
    t.clearRect(0, 0, s, n), this.comments.forEach((a) => {
      a.isActive && (a.lastUpdateTime = this.timeSource.now());
    });
  }
  handleVideoCanPlay() {
    this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = P(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
  }
  handleVideoSourceChange(e) {
    const t = e ?? this.videoElement;
    if (!t) {
      this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
      return;
    }
    const i = this.getCurrentVideoSource();
    i !== this.lastVideoSource && (this.lastVideoSource = i, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
  }
  syncVideoState(e) {
    this.duration = Number.isFinite(e.duration) ? P(e.duration) : 0, this.currentTime = P(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > O, this.lastDrawTime = this.timeSource.now();
  }
  resetCommentActivity() {
    const e = this.timeSource.now(), t = this.canvas, i = this.ctx;
    if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > O, t && i) {
      const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : t.width / s, a = this.displayHeight > 0 ? this.displayHeight : t.height / s;
      i.clearRect(0, 0, n, a);
    }
    this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((s) => {
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
      for (const a of n) {
        if (a.type === "attributes" && a.attributeName === "src") {
          const r = a.target;
          let h = null, u = null;
          if ((r instanceof HTMLVideoElement || r instanceof HTMLSourceElement) && (h = typeof a.oldValue == "string" ? a.oldValue : null, u = r.getAttribute("src")), h === u)
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
            const h = this.extractVideoElement(r);
            if (h && h !== this.videoElement) {
              this.initialize(h);
              return;
            }
          }
          for (const r of a.removedNodes) {
            if (r === this.videoElement) {
              this.videoElement = null, this.handleVideoSourceChange(null);
              return;
            }
            if (r instanceof Element) {
              const h = r.querySelector("video");
              if (h && h === this.videoElement) {
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
      this._settings.isCommentVisible && (this.handleVisibilityRestore(), this.startAnimation());
    };
    document.addEventListener("visibilitychange", e), this.addCleanup(() => document.removeEventListener("visibilitychange", e)), document.visibilityState !== "visible" && this.stopAnimation();
  }
  handleVisibilityRestore() {
    const e = this.canvas, t = this.ctx, i = this.videoElement;
    if (!e || !t || !i)
      return;
    this.currentTime = P(i.currentTime), this.isPlaying = !i.paused, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
    const s = this.canvasDpr > 0 ? this.canvasDpr : 1, n = this.displayWidth > 0 ? this.displayWidth : e.width / s, a = this.displayHeight > 0 ? this.displayHeight : e.height / s;
    t.clearRect(0, 0, n, a);
    const r = this.buildPrepareOptions(n), h = this.timeSource.now();
    this.getCommentsInTimeWindow(this.currentTime, F).forEach((c) => {
      if (this.isNGComment(c.text) || c.isInvisible) {
        c.isActive = !1, this.activeComments.delete(c), c.clearActivation();
        return;
      }
      c.syncWithSettings(this._settings, this.settingsVersion), c.isActive = !1, this.activeComments.delete(c), c.lane = -1, c.clearActivation(), c.lastUpdateTime = h, this.shouldActivateCommentAtTime(c, this.currentTime) && this.activateComment(
        c,
        t,
        n,
        a,
        r,
        this.currentTime
      );
      const f = this.getEffectiveCommentVpos(c);
      f < this.currentTime - F ? c.hasShown = !0 : f > this.currentTime && (c.hasShown = !1);
    }), this.lastDrawTime = h;
  }
  setupResizeHandling(e) {
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
    const r = (s instanceof HTMLElement && s.contains(t) ? s : null) !== null;
    this.fullscreenActive !== r && (this.fullscreenActive = r, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", this.resize();
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
  ct as COMMENT_OVERLAY_VERSION,
  g as Comment,
  dt as CommentRenderer,
  ht as DEFAULT_RENDERER_SETTINGS,
  Ue as cloneDefaultSettings,
  Oe as configureDebugLogging,
  at as createDefaultAnimationFrameProvider,
  me as createDefaultTimeSource,
  fe as createLogger,
  C as debugLog,
  Ne as dumpRendererState,
  A as isDebugLoggingEnabled,
  ke as logEpochChange,
  lt as resetDebugCounters
};
//# sourceMappingURL=comment-overlay.es.js.map
