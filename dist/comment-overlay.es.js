//#region src/comment/comment-commands.ts
var e = {
	small: 2 / 3,
	medium: 1,
	big: 13 / 9
}, t = {
	defont: "Arial,\"ＭＳ Ｐゴシック\",\"MS PGothic\",MSPGothic,MS-PGothic",
	gothic: "\"游ゴシック体\",\"游ゴシック\",\"Yu Gothic\",YuGothic,yugothic,YuGo-Medium,\"宋体\",SimSun,Arial,\"ＭＳ Ｐゴシック\",\"MS PGothic\",MSPGothic,MS-PGothic",
	mincho: "\"游明朝体\",\"游明朝\",\"Yu Mincho\",YuMincho,yumincho,YuMin-Medium,\"宋体\",SimSun,Arial,\"ＭＳ Ｐゴシック\",\"MS PGothic\",MSPGothic,MS-PGothic"
}, n = {
	defont: "600",
	gothic: "",
	mincho: ""
}, r = {
	white: "#FFFFFF",
	red: "#FF0000",
	pink: "#FFA5CC",
	orange: "#FFBA66",
	yellow: "#FFFFAA",
	green: "#00FF00",
	cyan: "#88FFFF",
	blue: "#8899FF",
	purple: "#D9A5FF",
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
}, i = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, a = /^[,.:;]+/, o = /[,.:;]+$/, s = (e) => {
	let t = e.trim();
	return t ? i.test(t) ? t : t.replace(a, "").replace(o, "") : "";
}, c = (e) => i.test(e) ? e.toUpperCase() : null, l = (e) => {
	let t = e.trim();
	if (!t) return null;
	let n = t.toLowerCase().endsWith("px") ? t.slice(0, -2) : t, r = Number.parseFloat(n);
	return Number.isFinite(r) ? r : null;
}, u = (e) => {
	let t = e.trim();
	if (!t) return null;
	if (t.endsWith("%")) {
		let e = Number.parseFloat(t.slice(0, -1));
		return Number.isFinite(e) ? e / 100 : null;
	}
	return l(t);
}, d = (e) => Number.isFinite(e) ? Math.min(100, Math.max(-100, e)) : 0, f = (e) => !Number.isFinite(e) || e === 0 ? 1 : Math.min(5, Math.max(.25, e)), p = (e) => e === "naka" || e === "ue" || e === "shita", m = (e) => e === "small" || e === "medium" || e === "big", h = (e) => e === "defont" || e === "gothic" || e === "mincho", g = (e) => e in r, _ = (a, o) => {
	let _ = "naka", v = "medium", y = "defont", b = null, x = 1, S = null, C = !1, w = !1, T = !1, E = 0, D = 1;
	for (let e of a) {
		let t = s(typeof e == "string" ? e : "");
		if (!t) continue;
		if (i.test(t)) {
			let e = c(t);
			if (e) {
				b = e;
				continue;
			}
		}
		let n = t.toLowerCase();
		if (p(n)) {
			_ = n;
			continue;
		}
		if (m(n)) {
			v = n;
			continue;
		}
		if (h(n)) {
			y = n;
			continue;
		}
		if (g(n)) {
			b = r[n].toUpperCase();
			continue;
		}
		if (n === "_live") {
			S = .5;
			continue;
		}
		if (n === "invisible") {
			x = 0, C = !0;
			continue;
		}
		if (n === "full") {
			w = !0;
			continue;
		}
		if (n === "ender") {
			T = !0;
			continue;
		}
		if (n.startsWith("ls:") || n.startsWith("letterspacing:")) {
			let e = t.indexOf(":");
			if (e >= 0) {
				let n = l(t.slice(e + 1));
				n !== null && (E = d(n));
			}
			continue;
		}
		if (n.startsWith("lh:") || n.startsWith("lineheight:")) {
			let e = t.indexOf(":");
			if (e >= 0) {
				let n = u(t.slice(e + 1));
				n !== null && (D = f(n));
			}
			continue;
		}
	}
	let O = Math.max(0, Math.min(1, x)), ee = (b ?? o.defaultColor).toUpperCase(), k = typeof S == "number" ? Math.max(0, Math.min(1, S)) : null;
	return {
		layout: _,
		size: v,
		sizeScale: e[v],
		font: y,
		fontFamily: t[y],
		fontWeight: n[y],
		resolvedColor: ee,
		colorOverride: b,
		opacityMultiplier: O,
		opacityOverride: k,
		isInvisible: C,
		isFull: w,
		isEnder: T,
		letterSpacing: E,
		lineHeight: D
	};
}, v = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, y = (e) => e.length === 1 ? e.repeat(2) : e, b = (e) => Number.parseInt(e, 16), x = (e) => !Number.isFinite(e) || e <= 0 ? 0 : e >= 1 ? 1 : e, S = (e, t) => {
	let n = v.exec(e);
	if (!n) return e;
	let r = n[1], i, a, o, s = 1;
	r.length === 3 || r.length === 4 ? (i = b(y(r[0])), a = b(y(r[1])), o = b(y(r[2])), r.length === 4 && (s = b(y(r[3])) / 255)) : (i = b(r.slice(0, 2)), a = b(r.slice(2, 4)), o = b(r.slice(4, 6)), r.length === 8 && (s = b(r.slice(6, 8)) / 255));
	let c = x(s * x(t));
	return `rgba(${i}, ${a}, ${o}, ${c})`;
}, C = () => ({ now: () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now() }), w = () => C(), T = (e) => e * 1e3, E = (e) => !Number.isFinite(e) || e < 0 ? null : Math.round(e), D = 6e3, O = 2700, ee = .35, k = 3e3, A = 9e3, te = .001, ne = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
}, re = (e, t, n) => {
	let r = [`[${t}]`, ...n];
	switch (e) {
		case "debug":
			console.debug(...r);
			break;
		case "info":
			console.info(...r);
			break;
		case "warn":
			console.warn(...r);
			break;
		case "error":
			console.error(...r);
			break;
		default: console.log(...r);
	}
}, j = (e, t = {}) => {
	let { level: n = "info", emitter: r = re } = t, i = ne[n], a = (t, n) => {
		ne[t] < i || r(t, e, n);
	};
	return {
		debug: (...e) => a("debug", e),
		info: (...e) => a("info", e),
		warn: (...e) => a("warn", e),
		error: (...e) => a("error", e)
	};
}, M = j("CommentEngine:Comment"), ie = /* @__PURE__ */ new WeakMap(), ae = (e) => {
	let t = ie.get(e);
	return t || (t = /* @__PURE__ */ new Map(), ie.set(e, t)), t;
}, N = (e, t) => {
	if (!e) return 0;
	let n = `${e.font ?? ""}::${t}`, r = ae(e), i = r.get(n);
	if (i !== void 0) return i;
	let a = e.measureText(t).width;
	return r.set(n, a), a;
}, oe = 768, se = .1, P = (e) => Math.max(1, e) / oe * se, ce = {
	small: {
		resizeAtLineCount: 7,
		normal: {
			fontSize: 36,
			blockHeight: 46.4650603532791,
			lineAdvance: 36.0867458283901
		},
		resized: {
			fontSize: 20,
			blockHeight: 25.9252893924713,
			lineAdvance: 20.065746307373
		}
	},
	medium: {
		resizeAtLineCount: 5,
		normal: {
			fontSize: 54,
			blockHeight: 68.1645984649658,
			lineAdvance: 57.8541674613953
		},
		resized: {
			fontSize: 28,
			blockHeight: 35.4883227944374,
			lineAdvance: 30.0388290286064
		}
	},
	big: {
		resizeAtLineCount: 3,
		normal: {
			fontSize: 78,
			blockHeight: 98.6615376472473,
			lineAdvance: 90.4781694412232
		},
		resized: {
			fontSize: 40,
			blockHeight: 52.1674284785986,
			lineAdvance: 47.7538447529078
		}
	}
}, F = ({ canvasHeight: e, size: t, lineCount: n, isEnder: r, lineHeightMultiplier: i }) => {
	let a = Math.max(1, e), o = Math.max(1, Math.floor(n)), s = ce[t], c = !r && o >= s.resizeAtLineCount, l = c ? s.resized : s.normal, u = a / oe, d = Math.max(1, l.fontSize * u), f = Math.abs(i - 1) > 2 ** -52, p = f ? Math.max(1, d * i) : Math.max(1, l.lineAdvance * u), m = d + (o - 1) * p, h = (l.blockHeight + (o - 1) * l.lineAdvance) * u;
	return {
		fontSize: d,
		lineAdvance: p,
		textHeight: m,
		slotHeight: f ? m : Math.max(1, h - P(a)),
		wasResizedForLineCount: c
	};
}, le = 1364, ue = 1024, I = 4e3, de = 2e3, fe = 1e3, L = (e) => Math.max(0, e) / 2 + 3, pe = ({ visibleWidth: e, inkWidth: t, texturePaddingX: n, direction: r, traversalDurationMs: i = I }) => {
	let a = Math.max(1, e), o = Math.max(0, t), s = Math.max(0, n), c = Math.max(1, i), l = ue / le * a, u = (a - l) / 2, d = (l + o) / c, f = d * fe, p = r === "rtl" ? u + l + s + f : u - o - s - f, m = r === "rtl" ? -o - s : a + s, h = Math.abs(m - p) / Math.max(d, 2 ** -52);
	return {
		renderLeft: u,
		renderWidth: l,
		pixelsPerMs: d,
		startX: p,
		exitX: m,
		collisionDurationMs: o / Math.max(d, 2 ** -52),
		totalDurationMs: h
	};
}, me = 768, he = .75, ge = 2, _e = (e, t) => Math.floor((e + 2 ** -52) / t) * t, ve = ({ visibleWidth: e, canvasHeight: t, isFull: n, isEnder: r, lineCount: i, verticalFontSize: a, verticalTextWidth: o, originalFontSize: s, originalTextWidth: c }) => {
	let l = Math.max(.01, t / me), u = ge * l, d = 20 * l, f = Math.max(1, e * (n ? 1 : he)), p = !r && i > 1 && o > f, m = p ? s : a, h = p ? c : o, g = p ? f * 2 : f, _ = m;
	h > g && (_ = _e(g / h * m, u)), p && !n && (_ -= u), _ = Math.max(d, Math.min(m, _));
	let v = m > 0 ? _ / m * h : 0, y = 1;
	return v > g && _ <= d + 2 ** -52 && (y = Math.max(.1, Math.floor(g / v * 10) / 10)), {
		fontSize: _,
		drawScale: y,
		useOriginalMetrics: p,
		targetWidth: g
	};
}, R = (e) => `${e.fontWeight ? `${e.fontWeight} ` : ""}${e.fontSize}px ${e.fontFamily}`, ye = "  ", be = (e) => e.replaceAll("	", ye), xe = (e) => {
	let t = be(e);
	if (t.includes("\n")) {
		let e = t.split(/\r?\n/);
		return e.length > 0 ? e : [""];
	}
	return [t];
}, Se = (e, t, n = Math.max(1, e.fontSize * e.lineHeightMultiplier)) => {
	let r = 0, i = e.letterSpacing;
	for (let n of e.lines) {
		let e = N(t, n), a = n.length > 1 ? i * (n.length - 1) : 0, o = Math.max(0, e + a);
		o > r && (r = o);
	}
	e.width = r, e.lineHeightPx = Math.max(1, n);
	let a = e.lines.length > 1 ? (e.lines.length - 1) * e.lineHeightPx : 0;
	e.height = e.fontSize + a;
}, Ce = (e, t, n) => (t.font = `${e.fontWeight ? `${e.fontWeight} ` : ""}${n}px ${e.fontFamily}`, Math.max(0, ...e.lines.map((n) => {
	let r = n.length > 1 ? e.letterSpacing * (n.length - 1) : 0;
	return Math.max(0, N(t, n) + r);
}))), we = (e, t, n, r, i) => {
	try {
		if (!t) throw Error("Canvas context is required");
		if (!Number.isFinite(n) || !Number.isFinite(r)) throw Error("Canvas dimensions must be numbers");
		if (!i) throw Error("Prepare options are required");
		let a = Math.max(n, 1);
		e.lines = xe(e.text);
		let o = F({
			canvasHeight: r,
			size: e.size,
			lineCount: e.lines.length,
			isEnder: e.isEnder,
			lineHeightMultiplier: e.lineHeightMultiplier
		});
		if (e.fontSize = o.fontSize, e.slotHeight = o.slotHeight, e.staticWidthScale = 1, t.font = R(e), Se(e, t, o.lineAdvance), !e.isScrolling) {
			let n = e.width, i = F({
				canvasHeight: r,
				size: e.size,
				lineCount: e.lines.length,
				isEnder: !0,
				lineHeightMultiplier: e.lineHeightMultiplier
			}), s = Ce(e, t, i.fontSize), c = ve({
				visibleWidth: a,
				canvasHeight: r,
				isFull: e.isFull,
				isEnder: e.isEnder,
				lineCount: e.lines.length,
				verticalFontSize: o.fontSize,
				verticalTextWidth: n,
				originalFontSize: i.fontSize,
				originalTextWidth: s
			}), l = c.useOriginalMetrics ? i : o, u = c.fontSize / Math.max(1, l.fontSize);
			e.fontSize = c.fontSize, e.staticWidthScale = c.drawScale, t.font = R(e), Se(e, t, l.lineAdvance * u), e.slotHeight = Math.max(1, l.slotHeight * u * c.drawScale);
		}
		if (!e.isScrolling) {
			e.bufferWidth = 0;
			let t = (a - e.width) / 2;
			e.virtualStartX = t, e.x = t, e.baseSpeed = 0, e.speed = 0, e.speedPixelsPerMs = 0, e.visibleDurationMs = k, e.preCollisionDurationMs = k, e.totalDurationMs = k, e.reservationWidth = e.width * e.staticWidthScale, e.staticExpiryTimeMs = e.vposMs + k, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
			return;
		}
		e.staticExpiryTimeMs = null;
		let s = i.maxVisibleDurationMs === i.minVisibleDurationMs ? i.maxVisibleDurationMs : I, c = L(e.fontSize), l = pe({
			visibleWidth: a,
			inkWidth: e.width,
			texturePaddingX: c,
			direction: e.scrollDirection,
			traversalDurationMs: s
		});
		e.bufferWidth = 0, e.virtualStartX = l.startX, e.x = l.startX, e.exitThreshold = l.exitX, e.baseSpeed = l.pixelsPerMs * 1e3 / 60, e.speed = e.baseSpeed, e.speedPixelsPerMs = l.pixelsPerMs, e.visibleDurationMs = s, e.preCollisionDurationMs = Math.ceil(l.collisionDurationMs), e.totalDurationMs = Math.ceil(l.totalDurationMs), e.reservationWidth = e.width, e.lastUpdateTime = e.getTimeSource().now(), e.isPaused = !1;
	} catch (i) {
		throw M.error("Comment.prepare", i, {
			text: e.text,
			visibleWidth: n,
			canvasHeight: r,
			hasContext: !!t
		}), i;
	}
}, Te = 5, z = {
	enabled: !1,
	maxLogsPerCategory: Te
}, B = /* @__PURE__ */ new Map(), Ee = (e) => e === void 0 || !Number.isFinite(e) ? Te : Math.min(1e4, Math.max(1, Math.floor(e))), V = (e) => {
	z.enabled = !!e.enabled, z.maxLogsPerCategory = Ee(e.maxLogsPerCategory), z.enabled || B.clear();
}, De = () => {
	B.clear();
}, H = () => z.enabled, Oe = (e) => {
	let t = B.get(e) ?? 0;
	return t >= z.maxLogsPerCategory ? (t === z.maxLogsPerCategory && (console.debug(`[CommentOverlay][${e}]`, "Further logs suppressed."), B.set(e, t + 1)), !1) : (B.set(e, t + 1), !0);
}, U = (e, ...t) => {
	z.enabled && Oe(e) && console.debug(`[CommentOverlay][${e}]`, ...t);
}, W = (e, t = 32) => e.length <= t ? e : `${e.slice(0, t)}…`, G = (e, t) => {
	z.enabled && (console.group(`[CommentOverlay][state-dump] ${e}`), console.table({
		"Current Time": `${t.currentTime.toFixed(2)}ms`,
		Duration: `${t.duration.toFixed(2)}ms`,
		"Is Playing": t.isPlaying,
		"Epoch ID": t.epochId,
		"Total Comments": t.totalComments,
		"Active Comments": t.activeComments,
		"Reserved Lanes": t.reservedLanes,
		"Final Phase": t.finalPhaseActive,
		"Playback Begun": t.playbackHasBegun,
		"Is Stalled": t.isStalled
	}), console.groupEnd());
}, K = (e, t, n) => {
	z.enabled && U("epoch-change", `Epoch changed: ${e} → ${t} (reason: ${n})`);
}, q = (e) => {
	if (typeof e == "string") return e;
	if (e != null) return String(e);
}, ke = () => typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), Ae = (e) => {
	if (typeof e.getTransform != "function") return;
	let t = e.getTransform();
	return [
		t.a,
		t.b,
		t.c,
		t.d,
		t.e,
		t.f
	];
}, je = (e) => {
	let t = e.canvas;
	return t ? {
		canvasWidth: t.width,
		canvasHeight: t.height
	} : {};
}, Me = (e) => e ? {
	...e.no === void 0 ? {} : { no: e.no },
	...e.fork === void 0 ? {} : { fork: e.fork },
	...e.source === void 0 ? {} : { source: e.source },
	...e.threadId === void 0 ? {} : { threadId: e.threadId },
	...e.date === void 0 ? {} : { date: e.date },
	...e.userIdHash === void 0 ? {} : { userIdHash: e.userIdHash }
} : {}, Ne = (e) => ({
	text: e.text,
	vposMs: e.vposMs,
	...Me(e.meta),
	layout: e.layout,
	lane: e.lane,
	fontSize: e.fontSize,
	width: e.width,
	height: e.height,
	lineHeightPx: e.lineHeightPx,
	slotHeight: e.slotHeight,
	color: e.color,
	opacity: e.opacity,
	creationIndex: e.creationIndex
}), J = (e, t, n, r) => {
	let i = globalThis.__COMMENT_OVERLAY_TRACE__;
	globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ === !0 && typeof i == "function" && i({
		source: "comment-overlay",
		op: e,
		timestampMs: ke(),
		font: t.font,
		fillStyle: q(t.fillStyle),
		strokeStyle: q(t.strokeStyle),
		lineWidth: t.lineWidth,
		lineJoin: t.lineJoin,
		globalAlpha: t.globalAlpha,
		shadowColor: t.shadowColor,
		shadowBlur: t.shadowBlur,
		shadowOffsetX: t.shadowOffsetX,
		shadowOffsetY: t.shadowOffsetY,
		transform: Ae(t),
		...je(t),
		comment: Ne(n),
		...r
	});
}, Pe = (e, t, n) => {
	let r = globalThis.__COMMENT_OVERLAY_TRACE__;
	globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ === !0 && typeof r == "function" && r({
		source: "comment-overlay",
		op: e,
		timestampMs: ke(),
		comment: Ne(t),
		...n
	});
}, Y = {
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
}, Fe = () => {
	if (!H()) return;
	let e = performance.now();
	if (e - Y.lastReported <= 5e3) return;
	let t = Y.hits + Y.misses, n = t > 0 ? Y.hits / t * 100 : 0, r = Y.creates > 0 ? (Y.totalCharactersDrawn / Y.creates).toFixed(1) : "0", i = Y.outlineCallsInCache + Y.outlineCallsInFallback, a = Y.fillCallsInCache + Y.fillCallsInFallback;
	console.log("[TextureCache Stats]", `\n  Cache: Hits=${Y.hits}, Misses=${Y.misses}, Hit Rate=${n.toFixed(1)}%`, `\n  Creates: ${Y.creates}, Fallbacks: ${Y.fallbacks}`, `\n  Comments: Normal=${Y.normalComments}, LetterSpacing=${Y.letterSpacingComments}, MultiLine=${Y.multiLineComments}`, `\n  Draw Calls: Outline=${i}, Fill=${a}`, `\n  Avg Characters/Comment: ${r}`), Y.lastReported = e;
}, Ie = () => typeof OffscreenCanvas < "u", Le = (e, t, n) => {
	if (e === "none") return {
		blur: 0,
		alpha: 0
	};
	let r = {
		light: .06,
		medium: .1,
		strong: .15
	}[e], i = {
		light: .6,
		medium: .8,
		strong: .95
	}[e];
	return {
		blur: Math.max(2, t * r),
		alpha: x(n * i)
	};
}, Re = () => 2.8, ze = .5, Be = (e) => {
	let t = e.trim().toLowerCase();
	if (t === "black") return !0;
	let n = t.match(/^#([0-9a-f]{3,8})$/i);
	if (!n) return !1;
	let r = n[1], i = r.length === 3 || r.length === 4, a = (e) => e.length === 1 ? `${e}${e}` : e, o = Number.parseInt(a(i ? r[0] : r.slice(0, 2)), 16), s = Number.parseInt(a(i ? r[1] : r.slice(2, 4)), 16), c = Number.parseInt(a(i ? r[2] : r.slice(4, 6)), 16);
	return o === 0 && s === 0 && c === 0;
}, Ve = (e) => Be(e.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)", He = (e, t) => {
	if (!e.isScrolling) return t + e.fontSize;
	let n = e.fontSize <= 18 ? e.fontSize * .08 : 0;
	return e.fontSize * 1.5 + n;
}, Ue = (e) => {
	if (e.isScrolling && e.lines.length > 1) {
		let t = L(e.fontSize);
		return {
			paddingX: t,
			paddingY: e.fontSize * .5,
			textureWidth: Math.ceil(e.width + t * 2),
			textureHeight: Math.ceil(e.height + e.fontSize * 1.25)
		};
	}
	if (!e.isScrolling) {
		let t = Math.ceil(e.lines.length > 1 ? e.height : e.height + e.fontSize / 3);
		return {
			paddingX: 0,
			paddingY: Math.max(0, (t - e.height) / 2),
			textureWidth: Math.ceil(e.width + 0),
			textureHeight: t
		};
	}
	let t = e.isScrolling ? L(e.fontSize) : Math.max(10, e.fontSize * .5), n = e.fontSize, r = e.isScrolling ? Math.round(20 / 9 * n) : e.height + e.fontSize / 3, i = Math.ceil(Math.max(e.height + Math.max(10, e.fontSize), r));
	return {
		paddingX: t,
		paddingY: e.isScrolling ? e.fontSize * .5 : Math.max(0, (i - e.height) / 2),
		textureWidth: Math.ceil(e.width + t * 2),
		textureHeight: i
	};
}, We = (e) => e.isScrolling ? 1 : e.staticWidthScale, Ge = (e, t) => e.isScrolling ? 1 : t, Ke = (e, t, n, r, i) => {
	let a = Ge(e, i), o = !e.isScrolling && a !== 1 ? t.width * (1 - a) * ze : 0;
	return {
		x: n - r + o,
		scaleX: a,
		scaleY: i
	};
}, qe = (e, t, n, r, i) => (a, o, s, c = 0) => {
	if (a.length === 0) return;
	let l = i + c, u = () => {
		r === "cache" ? s === "outline" ? Y.outlineCallsInCache++ : Y.fillCallsInCache++ : s === "outline" ? Y.outlineCallsInFallback++ : Y.fillCallsInFallback++;
	}, d = (n, i, a) => {
		if (u(), s === "outline") {
			t.strokeText(n, i, o), J("strokeText", t, e, {
				text: n,
				x: i,
				y: o,
				meta: {
					statsTarget: r,
					mode: s,
					...a
				}
			});
			return;
		}
		t.fillText(n, i, o), J("fillText", t, e, {
			text: n,
			x: i,
			y: o,
			meta: {
				statsTarget: r,
				mode: s,
				...a
			}
		});
	};
	if (Math.abs(e.letterSpacing) < 2 ** -52) {
		d(a, l);
		return;
	}
	let f = l;
	for (let t = 0; t < a.length; t += 1) {
		let r = a[t];
		d(r, f, { characterIndex: t });
		let i = N(n, r);
		f += i, t < a.length - 1 && (f += e.letterSpacing);
	}
}, Je = (e) => `v9::${e.text}::${e.fontSize}::${e.fontFamily}::${e.fontWeight}::${e.color}::${e.opacity}::${e.renderStyle}::${e.letterSpacing}::${e.lineHeightPx}::${e.width}::${e.height}::${e.staticWidthScale}::${e.lines.length}`, Ye = (e, t) => {
	if (!Ie()) return null;
	let n = Math.abs(e.letterSpacing) >= 2 ** -52, r = e.lines.length > 1;
	n && Y.letterSpacingComments++, r && Y.multiLineComments++, !n && !r && Y.normalComments++, Y.totalCharactersDrawn += e.text.length;
	let { paddingX: i, paddingY: a, textureWidth: o, textureHeight: s } = Ue(e), c = new OffscreenCanvas(o, s), l = c.getContext("2d");
	if (!l) return null;
	l.save(), l.font = R(e);
	let u = x(e.opacity), d = i, f = e.lines.length > 0 ? e.lines : [e.text], p = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, m = He(e, a), h = qe(e, l, t, "cache", d), g = S(e.color, u), _ = e.renderStyle === "outline-only", v = _ ? {
		blur: 0,
		alpha: 0
	} : Le(e.shadowIntensity, e.fontSize, u);
	return H() && console.log("[Shadow Debug - Cache]", `\n  Text: "${e.text}"`, `\n  FontSize: ${e.fontSize}`, `\n  Shadow intensity: ${e.shadowIntensity}`, `\n  Shadow blur: ${v.blur}px`, `\n  Shadow alpha: ${v.alpha}`, `\n  Fill style: ${g}`), l.save(), l.shadowColor = `rgba(0, 0, 0, ${v.alpha})`, l.shadowBlur = v.blur, l.shadowOffsetX = 0, l.shadowOffsetY = 0, l.lineJoin = "round", l.lineWidth = Re(), l.strokeStyle = Ve(e), l.fillStyle = g, _ && f.forEach((e, t) => {
		let n = m + t * p;
		h(e, n, "outline");
	}), f.forEach((e, t) => {
		let n = m + t * p;
		h(e, n, "fill");
	}), l.restore(), l.restore(), c;
}, Xe = (e, t, n) => {
	Y.fallbacks++, t.save(), t.font = R(e);
	let r = x(e.opacity), i = n ?? e.x, a = e.lines.length > 0 ? e.lines : [e.text], o = e.lines.length > 1 && e.lineHeightPx > 0 ? e.lineHeightPx : e.fontSize, s = e.y + e.fontSize;
	if (!e.isScrolling && e.staticWidthScale !== 1) {
		let n = i + e.width / 2;
		t.translate(n, e.y), t.scale(e.staticWidthScale, e.staticWidthScale), i = -e.width / 2, s = e.fontSize;
	}
	let c = qe(e, t, t, "fallback", i), l = S(e.color, r), u = e.renderStyle === "outline-only", d = u ? {
		blur: 0,
		alpha: 0
	} : Le(e.shadowIntensity, e.fontSize, r);
	H() && console.log("[Shadow Debug - Fallback]", `\n  Text: "${e.text}"`, `\n  FontSize: ${e.fontSize}`, `\n  Shadow intensity: ${e.shadowIntensity}`, `\n  Shadow blur: ${d.blur}px`, `\n  Shadow alpha: ${d.alpha}`, `\n  Fill style: ${l}`), t.save(), t.shadowColor = `rgba(0, 0, 0, ${d.alpha})`, t.shadowBlur = d.blur, t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.lineJoin = "round", t.lineWidth = Re(), t.strokeStyle = Ve(e), t.fillStyle = l, u && a.forEach((e, t) => {
		let n = s + t * o;
		c(e, n, "outline");
	}), a.forEach((e, t) => {
		let n = s + t * o;
		c(e, n, "fill");
	}), t.restore(), t.restore();
}, Ze = (e, t, n) => {
	try {
		if (!e.isActive || !t) return;
		let r = Je(e), i = e.getCachedTexture();
		if (e.getTextureCacheKey() !== r || !i) {
			Y.misses++, Y.creates++;
			let n = Ye(e, t);
			e.setCachedTexture(n), e.setTextureCacheKey(r);
		} else Y.hits++;
		let a = e.getCachedTexture();
		if (a) {
			let r = n ?? e.x, { paddingX: i, paddingY: o } = Ue(e), s = We(e), c = Ke(e, a, r, i, s), l = c.x, u = e.y - o;
			c.scaleX === 1 && c.scaleY === 1 ? t.drawImage(a, l, u) : t.drawImage(a, l, u, a.width * c.scaleX, a.height * c.scaleY), J("drawImage", t, e, {
				x: l,
				y: u,
				width: a.width * c.scaleX,
				height: a.height * c.scaleY,
				sourceWidth: a.width,
				sourceHeight: a.height,
				meta: {
					statsTarget: "cache",
					paddingX: i,
					paddingY: o,
					drawScale: s,
					drawScaleX: c.scaleX,
					drawScaleY: c.scaleY
				}
			}), Fe();
			return;
		}
		Xe(e, t, n), Fe();
	} catch (r) {
		M.error("Comment.draw", r, {
			text: e.text,
			isActive: e.isActive,
			hasContext: !!t,
			interpolatedX: n
		});
	}
}, Qe = (e) => e === "ltr" ? "ltr" : "rtl", $e = (e) => e === "ltr" ? 1 : -1, et = class {
	text;
	vposMs;
	commands;
	layout;
	isScrolling;
	size;
	sizeScale;
	opacityMultiplier;
	opacityOverride;
	colorOverride;
	isInvisible;
	isFull;
	isEnder;
	meta;
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
	fontWeight;
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
	shadowIntensity = "medium";
	creationIndex = 0;
	letterSpacing = 0;
	lineHeightMultiplier = 1;
	lineHeightPx = 0;
	slotHeight = 0;
	staticWidthScale = 1;
	lines = [];
	epochId = 0;
	directionSign = -1;
	timeSource;
	lastSyncedSettingsVersion = -1;
	cachedTexture = null;
	textureCacheKey = "";
	constructor(e, t, n, r, i = {}, a = null) {
		if (typeof e != "string") throw Error("Comment text must be a string");
		if (!Number.isFinite(t) || t < 0) throw Error("Comment vposMs must be a non-negative number");
		this.text = e, this.vposMs = t, this.commands = Array.isArray(n) ? [...n] : [], this.meta = a ? { ...a } : null;
		let o = _(this.commands, { defaultColor: r.commentColor });
		this.layout = o.layout, this.isScrolling = this.layout === "naka", this.size = o.size, this.sizeScale = o.sizeScale, this.opacityMultiplier = o.opacityMultiplier, this.opacityOverride = o.opacityOverride, this.colorOverride = o.colorOverride, this.isInvisible = o.isInvisible, this.isFull = o.isFull, this.isEnder = o.isEnder, this.fontFamily = o.fontFamily, this.fontWeight = o.fontWeight, this.color = o.resolvedColor, this.opacity = this.getEffectiveOpacity(r.commentOpacity), this.renderStyle = r.renderStyle, this.shadowIntensity = r.shadowIntensity, this.letterSpacing = o.letterSpacing, this.lineHeightMultiplier = o.lineHeight, this.timeSource = i.timeSource ?? w(), this.applyScrollDirection(r.scrollDirection), this.syncWithSettings(r, i.settingsVersion);
	}
	prepare(e, t, n, r) {
		we(this, e, t, n, r);
	}
	draw(e, t = null) {
		Ze(this, e, t);
	}
	update(e = 1, t = !1) {
		try {
			if (!this.isActive) {
				this.isPaused = t;
				return;
			}
			let n = this.timeSource.now();
			if (!this.isScrolling) {
				this.isPaused = t, this.lastUpdateTime = n;
				return;
			}
			if (t) {
				this.isPaused = !0, this.lastUpdateTime = n;
				return;
			}
			let r = (n - this.lastUpdateTime) / (1e3 / 60);
			this.speed = this.baseSpeed * e, this.x += this.speed * r * this.directionSign, (this.scrollDirection === "rtl" && this.x <= this.exitThreshold || this.scrollDirection === "ltr" && this.x >= this.exitThreshold) && (this.isActive = !1), this.lastUpdateTime = n, this.isPaused = !1;
		} catch (n) {
			M.error("Comment.update", n, {
				text: this.text,
				playbackRate: e,
				isPaused: t,
				isActive: this.isActive
			});
		}
	}
	syncWithSettings(e, t) {
		(typeof t != "number" || t !== this.lastSyncedSettingsVersion) && (this.color = this.getEffectiveColor(e.commentColor), this.opacity = this.getEffectiveOpacity(e.commentOpacity), this.applyScrollDirection(e.scrollDirection), this.renderStyle = e.renderStyle, this.shadowIntensity = e.shadowIntensity, typeof t == "number" && (this.lastSyncedSettingsVersion = t));
	}
	getEffectiveColor(e) {
		let t = this.colorOverride ?? e;
		return typeof t != "string" || t.length === 0 ? e : t.toUpperCase();
	}
	getEffectiveOpacity(e) {
		if (typeof this.opacityOverride == "number") return x(this.opacityOverride);
		let t = e * this.opacityMultiplier;
		return Number.isFinite(t) ? x(t) : 0;
	}
	markActivated(e) {
		this.activationTimeMs = e;
	}
	clearActivation() {
		this.activationTimeMs = null, this.isScrolling || (this.staticExpiryTimeMs = null), this.resetTextureCache();
	}
	hasStaticExpired(e) {
		return this.isScrolling || this.staticExpiryTimeMs === null ? !1 : e >= this.staticExpiryTimeMs;
	}
	getDirectionSign() {
		return this.directionSign;
	}
	getTimeSource() {
		return this.timeSource;
	}
	getTextureCacheKey() {
		return this.textureCacheKey;
	}
	setTextureCacheKey(e) {
		this.textureCacheKey = e;
	}
	getCachedTexture() {
		return this.cachedTexture;
	}
	setCachedTexture(e) {
		this.cachedTexture = e;
	}
	resetTextureCache() {
		this.cachedTexture = null, this.textureCacheKey = "";
	}
	applyScrollDirection(e) {
		let t = Qe(e);
		this.scrollDirection = t, this.directionSign = $e(t);
	}
}, X = {
	commentColor: "#FFFFFF",
	commentOpacity: 1,
	isCommentVisible: !0,
	useContainerResizeObserver: !0,
	ngWords: [],
	ngRegexps: [],
	scrollDirection: "rtl",
	renderStyle: "outline-only",
	syncMode: "raf",
	scrollVisibleDurationMs: null,
	useFixedLaneCount: !1,
	fixedLaneCount: 12,
	useDprScaling: !0,
	shadowIntensity: "medium"
}, tt = X, nt = () => ({
	...X,
	ngWords: [...X.ngWords],
	ngRegexps: [...X.ngRegexps]
}), rt = "v4.1.6", it = (e) => Number.isFinite(e) ? e <= 0 ? 0 : e >= 1 ? 1 : e : 1, Z = (e) => {
	let t = e.scrollVisibleDurationMs, n = t == null ? null : Number.isFinite(t) ? Math.max(1, Math.floor(t)) : null;
	return {
		...e,
		scrollDirection: e.scrollDirection === "ltr" ? "ltr" : "rtl",
		commentOpacity: it(e.commentOpacity),
		renderStyle: e.renderStyle === "classic" ? "classic" : "outline-only",
		scrollVisibleDurationMs: n,
		syncMode: e.syncMode === "video-frame" ? "video-frame" : "raf",
		useDprScaling: !!e.useDprScaling
	};
}, at = (e) => typeof window < "u" && typeof window.requestAnimationFrame == "function" && typeof window.cancelAnimationFrame == "function" ? {
	request: (e) => window.requestAnimationFrame(e),
	cancel: (e) => window.cancelAnimationFrame(Number(e))
} : {
	request: (t) => globalThis.setTimeout(() => {
		t(e.now());
	}, 16),
	cancel: (e) => {
		globalThis.clearTimeout(e);
	}
}, ot = () => typeof document > "u" ? () => {
	throw Error("Document is not available. Provide a custom createCanvasElement implementation.");
} : () => document.createElement("canvas"), st = (e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.commentColor == "string" && typeof t.commentOpacity == "number" && typeof t.isCommentVisible == "boolean";
}, ct = (e) => {
	let t = e.meta?.no;
	return typeof t == "number" && Number.isFinite(t) ? t : null;
}, lt = function(e) {
	if (!Array.isArray(e) || e.length === 0) return [];
	let t = [];
	this.commentDependencies.settingsVersion = this.settingsVersion;
	for (let n of e) {
		let { text: e, vposMs: r, commands: i = [], meta: a = null } = n, o = W(e);
		if (this.isNGComment(e)) {
			U("comment-skip-ng", {
				preview: o,
				vposMs: r
			});
			continue;
		}
		let s = E(r);
		if (s === null) {
			this.log.warn("CommentRenderer.addComment.invalidVpos", {
				text: e,
				vposMs: r
			}), U("comment-skip-invalid-vpos", {
				preview: o,
				vposMs: r
			});
			continue;
		}
		let c = a?.no === void 0 ? `fallback:${e}\0${s}` : `no:${a.source ?? ""}:${a.fork ?? ""}:${a.threadId ?? ""}:${a.no}`, l = (e) => e.meta?.no === void 0 ? `fallback:${e.text}\0${e.vposMs}` : `no:${e.meta.source ?? ""}:${e.meta.fork ?? ""}:${e.meta.threadId ?? ""}:${e.meta.no}`;
		if (this.comments.some((e) => l(e) === c) || t.some((e) => l(e) === c)) {
			U("comment-skip-duplicate", {
				preview: o,
				vposMs: s
			});
			continue;
		}
		let u = new et(e, s, i, this._settings, this.commentDependencies, a);
		u.creationIndex = this.commentSequence++, u.epochId = this.epochId, t.push(u), U("comment-added", {
			preview: o,
			vposMs: s,
			commands: u.commands.length,
			layout: u.layout,
			isScrolling: u.isScrolling,
			invisible: u.isInvisible
		});
	}
	return t.length === 0 ? [] : (this.comments.push(...t), this.comments.sort((e, t) => {
		let n = e.vposMs - t.vposMs;
		if (Math.abs(n) > .001) return n;
		let r = ct(e), i = ct(t);
		return r !== null && i !== null && Math.abs(r - i) > .001 ? r - i : e.creationIndex - t.creationIndex;
	}), t);
}, ut = function(e, t, n = [], r = null) {
	let [i] = this.addComments([{
		text: e,
		vposMs: t,
		commands: n,
		meta: r
	}]);
	return i ?? null;
}, dt = function() {
	if (this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.commentSequence = 0, this.ctx && this.canvas) {
		let e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / e, n = this.displayHeight > 0 ? this.displayHeight : this.canvas.height / e;
		this.ctx.clearRect(0, 0, t, n);
	}
}, ft = function() {
	this.clearComments(), this.currentTime = 0, this.resetFinalPhaseState(), this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, Q = function() {
	let e = this._settings, t = Array.isArray(e.ngWords) ? e.ngWords : [];
	this.normalizedNgWords = t.filter((e) => typeof e == "string");
	let n = Array.isArray(e.ngRegexps) ? e.ngRegexps : [];
	this.compiledNgRegexps = n.map((e) => {
		if (typeof e != "string") return null;
		try {
			return new RegExp(e, "i");
		} catch (t) {
			return this.log.warn("CommentRenderer.invalidNgRegexp", t, { entry: e }), null;
		}
	}).filter((e) => !!e);
}, pt = function(e) {
	return typeof e != "string" || e.length === 0 ? !1 : this.normalizedNgWords.some((t) => t.length > 0 && e.includes(t)) ? !0 : this.compiledNgRegexps.some((t) => t.test(e));
}, mt = (e) => {
	e.prototype.addComments = lt, e.prototype.addComment = ut, e.prototype.clearComments = dt, e.prototype.resetState = ft, e.prototype.rebuildNgMatchers = Q, e.prototype.isNGComment = pt;
}, ht = ({ vposMs: e, durationMs: t, isScrolling: n }) => {
	let r = Number.isFinite(t) && t > 0 ? Math.max(0, t - k) : e, i = Math.min(e, r);
	return {
		displayVposMs: i,
		activationVposMs: n ? Math.max(0, i - de) : i
	};
}, gt = function() {
	this.finalPhaseActive = !1, this.finalPhaseStartTime = null, this.finalPhaseScheduleDirty = !1, this.finalPhaseVposOverrides.clear();
}, _t = function(e) {
	let t = this.epochId;
	if (this.epochId += 1, K(t, this.epochId, e), this.eventHooks.onEpochChange) {
		let n = {
			previousEpochId: t,
			newEpochId: this.epochId,
			reason: e,
			timestamp: this.timeSource.now()
		};
		try {
			this.eventHooks.onEpochChange(n);
		} catch (e) {
			this.log.error("CommentRenderer.incrementEpoch.callback", e, { info: n });
		}
	}
	this.comments.forEach((e) => {
		e.epochId = this.epochId;
	});
}, vt = function(e) {
	let t = this.timeSource.now();
	if (t - this.lastSnapshotEmitTime < this.snapshotEmitThrottleMs) return;
	let n = {
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
	if (G(e, n), this.eventHooks.onStateSnapshot) try {
		this.eventHooks.onStateSnapshot(n);
	} catch (e) {
		this.log.error("CommentRenderer.emitStateSnapshot.callback", e);
	}
	this.lastSnapshotEmitTime = t;
}, yt = function(e) {
	return ht({
		vposMs: e.vposMs,
		durationMs: this.duration,
		isScrolling: e.isScrolling
	}).activationVposMs;
}, bt = function(e) {
	if (!e.isScrolling) return k;
	let t = [];
	return Number.isFinite(e.visibleDurationMs) && e.visibleDurationMs > 0 && t.push(e.visibleDurationMs), Number.isFinite(e.totalDurationMs) && e.totalDurationMs > 0 && t.push(e.totalDurationMs), t.length > 0 ? Math.max(...t) : D;
}, xt = function(e) {
	return this.getEffectiveCommentVpos(e);
}, St = function() {
	this.finalPhaseVposOverrides.clear(), this.finalPhaseScheduleDirty = !1;
}, Ct = (e) => {
	e.prototype.resetFinalPhaseState = gt, e.prototype.incrementEpoch = _t, e.prototype.emitStateSnapshot = vt, e.prototype.getEffectiveCommentVpos = yt, e.prototype.getFinalPhaseDisplayDuration = bt, e.prototype.resolveFinalPhaseVpos = xt, e.prototype.recomputeFinalPhaseTimeline = St;
}, wt = function() {
	return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= 50;
}, Tt = function() {
	this.playbackHasBegun || (this.isPlaying || this.currentTime > 50) && (this.playbackHasBegun = !0);
}, Et = (e) => {
	e.prototype.shouldSuppressRendering = wt, e.prototype.updatePlaybackProgressState = Tt;
}, Dt = function(e) {
	let t = this.videoElement, n = this.canvas, r = this.ctx;
	if (!t || !n || !r) return;
	let i = typeof e == "number" ? e : T(t.currentTime);
	if (this.currentTime = i, this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.updatePlaybackProgressState(), this.skipDrawingForCurrentFrame = this.shouldSuppressRendering(), this.skipDrawingForCurrentFrame) return;
	let a = this.canvasDpr > 0 ? this.canvasDpr : 1, o = this.displayWidth > 0 ? this.displayWidth : n.width / a, s = this.displayHeight > 0 ? this.displayHeight : n.height / a, c = this.buildPrepareOptions(o);
	this.pruneStaticLaneReservations(this.currentTime);
	for (let e of Array.from(this.activeComments)) {
		let t = this.getEffectiveCommentVpos(e), n = t < this.currentTime - A, r = t > this.currentTime + A;
		if (n || r) {
			e.isActive = !1, this.activeComments.delete(e), e.clearActivation(), e.lane >= 0 && (e.layout === "ue" ? this.releaseStaticLane("ue", e.lane) : e.layout === "shita" && this.releaseStaticLane("shita", e.lane));
			continue;
		}
		e.isScrolling && e.hasShown && (e.scrollDirection === "rtl" && e.x <= e.exitThreshold || e.scrollDirection === "ltr" && e.x >= e.exitThreshold) && (e.isActive = !1, this.activeComments.delete(e), e.clearActivation());
	}
	let l = this.getCommentsInTimeWindow(this.currentTime, A);
	for (let e of l) {
		let t = H(), n = t ? W(e.text) : "";
		if (t && U("comment-evaluate", {
			stage: "update",
			preview: n,
			vposMs: e.vposMs,
			effectiveVposMs: this.getEffectiveCommentVpos(e),
			currentTime: this.currentTime,
			isActive: e.isActive,
			hasShown: e.hasShown
		}), this.isNGComment(e.text)) {
			t && U("comment-eval-skip", {
				preview: n,
				vposMs: e.vposMs,
				effectiveVposMs: this.getEffectiveCommentVpos(e),
				reason: "ng-runtime"
			});
			continue;
		}
		if (e.isInvisible) {
			t && U("comment-eval-skip", {
				preview: n,
				vposMs: e.vposMs,
				effectiveVposMs: this.getEffectiveCommentVpos(e),
				reason: "invisible"
			}), e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation();
			continue;
		}
		if (e.syncWithSettings(this._settings, this.settingsVersion), this.shouldActivateCommentAtTime(e, this.currentTime, n) && this.activateComment(e, r, o, s, c, this.currentTime), e.isActive) {
			if (e.layout !== "naka" && e.hasStaticExpired(this.currentTime)) {
				let t = e.layout === "ue" ? "ue" : "shita";
				this.releaseStaticLane(t, e.lane), e.isActive = !1, this.activeComments.delete(e), e.clearActivation();
				continue;
			}
			if (e.layout === "naka" && this.getEffectiveCommentVpos(e) > this.currentTime + 50) {
				e.x = e.virtualStartX, e.lastUpdateTime = this.timeSource.now();
				continue;
			}
			if (e.hasShown = !0, e.update(this.playbackRate, !this.isPlaying), !e.isScrolling && e.hasStaticExpired(this.currentTime)) {
				let t = e.layout === "ue" ? "ue" : "shita";
				this.releaseStaticLane(t, e.lane), e.isActive = !1, this.activeComments.delete(e), e.clearActivation();
			}
		}
	}
}, Ot = function(e) {
	let t = this._settings.scrollVisibleDurationMs, n = D, r = O;
	return t !== null && (n = t, r = t), {
		visibleWidth: e,
		virtualExtension: 240,
		maxVisibleDurationMs: n,
		minVisibleDurationMs: r,
		maxWidthRatio: 3,
		bufferRatio: ee,
		baseBufferPx: 48,
		entryBufferPx: 48
	};
}, kt = function(e) {
	let t = this.currentTime;
	this.pruneLaneReservations(t), this.pruneStaticLaneReservations(t);
	let n = this.createLaneReservation(e, t), r = [...this.reservedLanes.values()].flat().filter((e) => this.areReservationsConflicting(e, n)).sort((e, t) => e.verticalStart - t.verticalStart), i = Math.max(1, e.slotHeight || e.height), a = Math.max(1, this.displayHeight || this.canvas?.height || i), o = this._settings.useFixedLaneCount ? Math.min(a, Math.max(i, this.laneCount * this.laneHeight)) : a, s = P(a), c = [], l = [], u = 0, d = !1;
	for (;;) {
		c.push(u);
		let e = u + i, t = r.find((t) => !(t.verticalEnd < u || e < t.verticalStart));
		if (!t) break;
		if (l.push(`${t.comment.creationIndex}@${t.comment.vposMs}:${t.verticalStart.toFixed(3)}-${t.verticalEnd.toFixed(3)}`), u = t.verticalEnd + s, u + i >= o) {
			d = !0, u = Math.random() * (o - i);
			break;
		}
	}
	return n.verticalStart = u, n.verticalEnd = u + i, this.storeLaneReservation(u, n), Pe("laneDecision", e, { meta: {
		currentTimeMs: t,
		selectedLane: u,
		selectedTop: u,
		selectedBottom: u + i,
		slotHeight: i,
		usedFallback: d,
		candidateLanes: c.map((e) => e.toFixed(3)).join(","),
		availableLanes: u.toFixed(3),
		nextAvailableTimes: "",
		blockedBy: l.join(","),
		reservationStartTimeMs: Math.round(n.startTime),
		reservationEndTimeMs: Math.round(n.endTime),
		reservationTotalEndTimeMs: Math.round(n.totalEndTime),
		reservationWidth: Math.round(n.width)
	} }), u;
}, At = (e) => {
	e.prototype.updateComments = Dt, e.prototype.buildPrepareOptions = Ot, e.prototype.findAvailableLane = kt;
}, jt = function(e, t) {
	let n = 0, r = e.length;
	for (; n < r;) {
		let i = Math.floor((n + r) / 2), a = e[i];
		a !== void 0 && a.totalEndTime + 0 <= t ? n = i + 1 : r = i;
	}
	return n;
}, Mt = function(e) {
	for (let [t, n] of this.reservedLanes.entries()) {
		let r = this.findFirstValidReservationIndex(n, e);
		r >= n.length ? this.reservedLanes.delete(t) : r > 0 && this.reservedLanes.set(t, n.slice(r));
	}
}, Nt = function(e) {
	let t = (t) => t.filter((t) => t.releaseTime > e), n = t(this.topStaticLaneReservations), r = t(this.bottomStaticLaneReservations);
	this.topStaticLaneReservations.length = 0, this.topStaticLaneReservations.push(...n), this.bottomStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.push(...r);
}, Pt = (e) => {
	e.prototype.findFirstValidReservationIndex = jt, e.prototype.pruneLaneReservations = Mt, e.prototype.pruneStaticLaneReservations = Nt;
}, Ft = function(e) {
	let t = 0, n = this.comments.length;
	for (; t < n;) {
		let r = Math.floor((t + n) / 2), i = this.comments[r];
		i !== void 0 && i.vposMs < e ? t = r + 1 : n = r;
	}
	return t;
}, It = function(e, t) {
	if (this.comments.length === 0) return [];
	let n = e - t, r = e + t, i = Math.max(0, this.duration - k - de), a = this.duration > 0 && r >= i, o = this.findCommentIndexAtOrAfter(n), s = [];
	for (let e = o; e < this.comments.length; e++) {
		let t = this.comments[e];
		if (!t) continue;
		if (!a && t.vposMs > r) break;
		let i = this.getEffectiveCommentVpos(t);
		i >= n && i <= r && s.push(t);
	}
	return s;
}, Lt = function(e) {
	return e === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
}, Rt = function(e) {
	return e === "ue" ? this.topStaticLaneReservations.length : this.bottomStaticLaneReservations.length;
}, zt = function(e) {
	let t = e === "ue" ? "shita" : "ue", n = this.getStaticLaneDepth(t), r = this.laneCount - n;
	return r <= 0 ? -1 : r - 1;
}, Bt = function(e) {
	return Math.max(0, this.laneCount - 1 - e);
}, Vt = function(e, t, n, r) {
	let i = this.pendingStaticPlacementOffsets.get(r);
	if (i !== void 0) return this.pendingStaticPlacementOffsets.delete(r), i;
	let a = Math.max(1, n), o = Math.max(1, r.slotHeight || r.height), s = P(a);
	if (e === "ue") {
		let n = 0, r = this.getStaticReservations(e).filter((e) => e.lane < t).sort((e, t) => e.lane - t.lane);
		for (let e of r) {
			let t = e.yEnd - e.yStart;
			n += t + s;
		}
		return n;
	}
	let c = a, l = this.getStaticReservations(e).filter((e) => e.lane < t).sort((e, t) => e.lane - t.lane);
	for (let e of l) {
		let t = e.yEnd - e.yStart;
		c -= t + s;
	}
	let u = c - o;
	return Math.max(0, u);
}, Ht = function() {
	let e = /* @__PURE__ */ new Set();
	for (let t of this.topStaticLaneReservations) e.add(t.lane);
	for (let t of this.bottomStaticLaneReservations) e.add(this.getGlobalLaneIndexForBottom(t.lane));
	return e;
}, Ut = (e) => {
	e.prototype.findCommentIndexAtOrAfter = Ft, e.prototype.getCommentsInTimeWindow = It, e.prototype.getStaticReservations = Lt, e.prototype.getStaticLaneDepth = Rt, e.prototype.getStaticLaneLimit = zt, e.prototype.getGlobalLaneIndexForBottom = Bt, e.prototype.resolveStaticCommentOffset = Vt, e.prototype.getStaticReservedLaneSet = Ht;
}, Wt = (e) => Math.max(1, e.slotHeight || e.height), Gt = ({ position: e, reservationHeight: t, displayHeight: n, reservations: r, currentTime: i, random: a = Math.random }) => {
	let o = Math.max(1, n), s = Math.max(1, t), c = P(o), l = r.filter((e) => e.releaseTime > i), u = e === "ue" ? [0, ...l.sort((e, t) => e.yEnd - t.yEnd).map((e) => e.yEnd + c)] : [o - s, ...l.sort((e, t) => t.yStart - e.yStart).map((e) => e.yStart - c - s)];
	if (s < o) {
		for (let e of u) if (!(e < 0 || e + s > o) && !l.some((t) => !(e + s <= t.yStart || e >= t.yEnd))) return {
			y: e,
			usedFallback: !1
		};
		return {
			y: a() * (o - s),
			usedFallback: !0
		};
	}
	return {
		y: e === "ue" ? 0 : o - s,
		usedFallback: l.length > 0
	};
}, Kt = function(e, t, n = "") {
	let r = n.length > 0 && H(), i = this.resolveFinalPhaseVpos(e);
	return e.isInvisible ? (r && U("comment-eval-skip", {
		preview: n,
		vposMs: e.vposMs,
		effectiveVposMs: i,
		reason: "invisible"
	}), !1) : e.isActive ? (r && U("comment-eval-skip", {
		preview: n,
		vposMs: e.vposMs,
		effectiveVposMs: i,
		reason: "already-active"
	}), !1) : e.hasShown && i <= t ? (r && U("comment-eval-skip", {
		preview: n,
		vposMs: e.vposMs,
		effectiveVposMs: i,
		reason: "already-shown",
		currentTime: t
	}), !1) : i > t + 50 ? (r && U("comment-eval-pending", {
		preview: n,
		vposMs: e.vposMs,
		effectiveVposMs: i,
		reason: "future",
		currentTime: t
	}), !1) : i < t - 9e3 ? (r && U("comment-eval-skip", {
		preview: n,
		vposMs: e.vposMs,
		effectiveVposMs: i,
		reason: "expired-window",
		currentTime: t
	}), !1) : !e.isScrolling && i + 3e3 <= t ? (r && U("comment-eval-skip", {
		preview: n,
		vposMs: e.vposMs,
		effectiveVposMs: i,
		reason: "static-expired",
		currentTime: t
	}), !1) : (r && U("comment-eval-ready", {
		preview: n,
		vposMs: e.vposMs,
		effectiveVposMs: i,
		currentTime: t
	}), !0);
}, qt = function(e, t, n, r, i, a) {
	e.prepare(t, n, r, i);
	let o = this.resolveFinalPhaseVpos(e);
	if (H() && U("comment-prepared", {
		preview: W(e.text),
		layout: e.layout,
		isScrolling: e.isScrolling,
		width: e.width,
		height: e.height,
		bufferWidth: e.bufferWidth,
		visibleDurationMs: e.visibleDurationMs,
		effectiveVposMs: o
	}), e.layout === "naka") {
		let t = Math.max(0, a - o), n = e.speedPixelsPerMs * t;
		e.x = e.scrollDirection === "rtl" ? e.virtualStartX - n : e.virtualStartX + n;
		let i = this.findAvailableLane(e), s = Math.max(1, this.laneHeight);
		e.lane = Math.max(0, Math.round(i / s));
		let c = Math.max(0, r - e.height);
		e.y = Math.max(0, Math.min(i, c));
	} else {
		let t = e.layout === "ue" ? "ue" : "shita", n = this.assignStaticLane(t, e, r, a), i = this.resolveStaticCommentOffset(t, n, r, e);
		e.x = e.virtualStartX, e.y = i, e.lane = t === "ue" ? n : this.getGlobalLaneIndexForBottom(n), e.speed = 0, e.baseSpeed = 0, e.speedPixelsPerMs = 0;
		let s = o + k;
		e.visibleDurationMs = Math.max(0, s - a), this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now(), e.staticExpiryTimeMs = s, this.reserveStaticLane(t, e, n, s), H() && U("comment-activate-static", {
			preview: W(e.text),
			lane: e.lane,
			position: t,
			displayEnd: s,
			effectiveVposMs: o
		});
		return;
	}
	this.activeComments.add(e), e.isActive = !0, e.hasShown = !0, e.isPaused = !this.isPlaying, e.markActivated(a), e.lastUpdateTime = this.timeSource.now();
}, Jt = function(e, t, n, r) {
	let i = this.getStaticReservations(e), a = Gt({
		position: e,
		reservationHeight: Wt(t),
		displayHeight: n,
		reservations: i,
		currentTime: r
	});
	this.pendingStaticPlacementOffsets.set(t, a.y);
	let o = new Set(i.map((e) => e.lane)), s = 0;
	for (; o.has(s);) s++;
	return s;
}, Yt = function(e, t, n, r) {
	let i = this.getStaticReservations(e), a = t.y, o = t.y + Wt(t);
	i.push({
		comment: t,
		releaseTime: r,
		yStart: a,
		yEnd: o,
		lane: n
	});
}, Xt = function(e, t) {
	if (t < 0) return;
	let n = this.getStaticReservations(e), r = n.findIndex((n) => e === "shita" ? this.getGlobalLaneIndexForBottom(n.lane) === t : n.lane === t);
	r >= 0 && n.splice(r, 1);
}, Zt = (e) => {
	e.prototype.shouldActivateCommentAtTime = Kt, e.prototype.activateComment = qt, e.prototype.assignStaticLane = Jt, e.prototype.reserveStaticLane = Yt, e.prototype.releaseStaticLane = Xt;
}, Qt = .001, $t = function() {
	return Array.from({ length: this.laneCount }, (e, t) => t);
}, en = function(e, t) {
	let n = this.reservedLanes.get(e);
	if (!n || n.length === 0) return t;
	let r = n[this.findFirstValidReservationIndex(n, t)];
	return r ? Math.max(t, r.endTime + 0) : t;
}, tn = function(e, t) {
	let n = Math.max(e.speedPixelsPerMs, te), r = this.getEffectiveCommentVpos(e), i = Math.max(0, Number.isFinite(r) ? r : t), a = Number.isFinite(e.width) && e.width > 0 ? e.width : e.reservationWidth, o = i + (n > 0 ? Math.max(a, 0) / n : e.preCollisionDurationMs) + 0, s = i + e.totalDurationMs + 0;
	return {
		comment: e,
		startTime: i,
		endTime: Math.max(i, o),
		totalEndTime: Math.max(i, s),
		startLeft: e.virtualStartX,
		width: a,
		speed: n,
		buffer: 0,
		directionSign: e.getDirectionSign(),
		verticalStart: 0,
		verticalEnd: Math.max(1, e.slotHeight || e.height)
	};
}, nn = function(e, t, n) {
	let r = Math.max(1, t.verticalEnd - t.verticalStart);
	return t.verticalStart = e, t.verticalEnd = e + r, [...this.reservedLanes.values()].flat().every((e) => e.totalEndTime <= n || e.verticalEnd < t.verticalStart || t.verticalEnd < e.verticalStart || !this.areReservationsConflicting(e, t));
}, rn = function(e, t) {
	let n = [...this.reservedLanes.get(e) ?? [], t].sort((e, t) => e.totalEndTime - t.totalEndTime);
	this.reservedLanes.set(e, n);
}, an = function(e, t) {
	if (e.directionSign === t.directionSign) {
		let n = e.speed > 0 ? Math.max(e.width, 0) / e.speed : 0, r = t.speed > 0 ? Math.max(t.width, 0) / t.speed : 0, i = Math.max(n, r);
		return Math.abs(t.startTime - e.startTime) + Qt < i;
	}
	let n = Math.max(e.startTime, t.startTime), r = Math.min(e.endTime, t.endTime);
	if (n >= r) return !1;
	let i = /* @__PURE__ */ new Set([
		n,
		r,
		n + (r - n) / 2
	]), a = this.solveLeftRightEqualityTime(e, t);
	a !== null && a >= n - .001 && a <= r + .001 && i.add(a);
	let o = this.solveLeftRightEqualityTime(t, e);
	o !== null && o >= n - .001 && o <= r + .001 && i.add(o);
	for (let a of i) {
		if (a < n - .001 || a > r + .001) continue;
		let i = this.computeForwardGap(e, t, a), o = this.computeForwardGap(t, e, a);
		if (i <= -24 && o <= -24) return !0;
	}
	return !1;
}, on = function(e, t, n) {
	let r = this.getBufferedEdges(e, n), i = this.getBufferedEdges(t, n);
	return r.left - i.right;
}, sn = function(e, t) {
	let n = Math.max(0, t - e.startTime), r = e.speed * n, i = e.startLeft + e.directionSign * r;
	return {
		left: i - e.buffer,
		right: i + e.width + e.buffer
	};
}, cn = function(e, t) {
	let n = e.directionSign, r = t.directionSign, i = r * t.speed - n * e.speed;
	if (Math.abs(i) < .001) return null;
	let a = (t.startLeft + r * t.speed * t.startTime + t.width + t.buffer - e.startLeft - n * e.speed * e.startTime + e.buffer) / i;
	return Number.isFinite(a) ? a : null;
}, ln = (e) => {
	e.prototype.getLanePriorityOrder = $t, e.prototype.getLaneNextAvailableTime = en, e.prototype.createLaneReservation = tn, e.prototype.isLaneAvailable = nn, e.prototype.storeLaneReservation = rn, e.prototype.areReservationsConflicting = an, e.prototype.computeForwardGap = on, e.prototype.getBufferedEdges = sn, e.prototype.solveLeftRightEqualityTime = cn;
}, un = function() {
	let e = this.canvas, t = this.ctx;
	if (!e || !t) return;
	let n = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : e.width / n, i = this.displayHeight > 0 ? this.displayHeight : e.height / n, a = this.timeSource.now();
	if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering() || this.isStalled) {
		t.clearRect(0, 0, r, i), this.lastDrawTime = a;
		return;
	}
	t.clearRect(0, 0, r, i);
	let o = Array.from(this.activeComments);
	if (this._settings.isCommentVisible) {
		let e = (a - this.lastDrawTime) / (1e3 / 60);
		o.sort((e, t) => {
			let n = this.getEffectiveCommentVpos(e) - this.getEffectiveCommentVpos(t);
			return Math.abs(n) > .001 ? n : e.isScrolling === t.isScrolling ? e.creationIndex - t.creationIndex : e.isScrolling ? 1 : -1;
		}), o.forEach((n) => {
			let r = this.isPlaying && !n.isPaused ? n.x + n.getDirectionSign() * n.speed * e : n.x;
			n.draw(t, r);
		});
	}
	this.lastDrawTime = a;
}, dn = function(e) {
	let t = this.videoElement, n = this.canvas, r = this.ctx;
	if (!t || !n || !r) return;
	let i = typeof e == "number" ? e : T(t.currentTime);
	this.currentTime = i, this.lastDrawTime = this.timeSource.now();
	let a = this.canvasDpr > 0 ? this.canvasDpr : 1, o = this.displayWidth > 0 ? this.displayWidth : n.width / a, s = this.displayHeight > 0 ? this.displayHeight : n.height / a, c = this.buildPrepareOptions(o);
	this.activeComments.forEach((e) => {
		e.isActive = !1, e.clearActivation();
	}), this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.getCommentsInTimeWindow(this.currentTime, A).forEach((e) => {
		if (this.isNGComment(e.text) || e.isInvisible) {
			e.isActive = !1, this.activeComments.delete(e), e.clearActivation();
			return;
		}
		if (e.syncWithSettings(this._settings, this.settingsVersion), e.isActive = !1, this.activeComments.delete(e), e.lane = -1, e.hasShown = !1, e.clearActivation(), this.shouldActivateCommentAtTime(e, this.currentTime)) {
			this.activateComment(e, r, o, s, c, this.currentTime);
			return;
		}
		e.hasShown = this.getEffectiveCommentVpos(e) < this.currentTime - 9e3;
	});
}, fn = (e) => {
	e.prototype.draw = un, e.prototype.performInitialSync = dn;
}, pn = function(e) {
	this.videoElement && this._settings.isCommentVisible && (this.pendingInitialSync &&= (this.performInitialSync(e), !1), this.updateComments(e), this.draw());
}, mn = function() {
	let e = this.frameId;
	this.frameId = null, e !== null && this.animationFrameProvider.cancel(e), this.processFrame(), this.scheduleNextFrame();
}, hn = function(e, t) {
	this.videoFrameHandle = null;
	let n = typeof t?.mediaTime == "number" ? t.mediaTime * 1e3 : void 0;
	this.processFrame(typeof n == "number" ? n : void 0), this.scheduleNextFrame();
}, gn = function() {
	if (this._settings.syncMode !== "video-frame") return !1;
	let e = this.videoElement;
	return !!e && typeof e.requestVideoFrameCallback == "function" && typeof e.cancelVideoFrameCallback == "function";
}, _n = function() {
	let e = this.videoElement;
	if (e) {
		if (this.shouldUseVideoFrameCallback()) {
			this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
			let t = e.requestVideoFrameCallback;
			typeof t == "function" && (this.videoFrameHandle = t.call(e, this.handleVideoFrame));
			return;
		}
		this.cancelVideoFrameCallback(), this.frameId = this.animationFrameProvider.request(this.handleAnimationFrame);
	}
}, vn = function() {
	this.frameId !== null && (this.animationFrameProvider.cancel(this.frameId), this.frameId = null);
}, yn = function() {
	if (this.videoFrameHandle === null) return;
	let e = this.videoElement;
	e && typeof e.cancelVideoFrameCallback == "function" && e.cancelVideoFrameCallback(this.videoFrameHandle), this.videoFrameHandle = null;
}, bn = function() {
	this.stopAnimation(), this.scheduleNextFrame();
}, xn = function() {
	this.cancelAnimationFrameRequest(), this.cancelVideoFrameCallback();
}, Sn = function() {
	let e = this.canvas, t = this.ctx, n = this.videoElement;
	if (!e || !t || !n) return;
	let r = T(n.currentTime), i = Math.abs(r - this.currentTime), a = this.timeSource.now();
	if (a - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs) {
		this.currentTime = r, this._settings.isCommentVisible && (this.lastDrawTime = a, this.draw());
		return;
	}
	let o = i > 50;
	if (this.currentTime = r, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), !o) {
		this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
		return;
	}
	this.activeComments.clear(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
	let s = this.canvasDpr > 0 ? this.canvasDpr : 1, c = this.displayWidth > 0 ? this.displayWidth : e.width / s, l = this.displayHeight > 0 ? this.displayHeight : e.height / s, u = this.buildPrepareOptions(c);
	this.getCommentsInTimeWindow(this.currentTime, A).forEach((e) => {
		let n = H(), r = n ? W(e.text) : "";
		if (n && U("comment-evaluate", {
			stage: "seek",
			preview: r,
			vposMs: e.vposMs,
			effectiveVposMs: this.getEffectiveCommentVpos(e),
			currentTime: this.currentTime,
			isActive: e.isActive,
			hasShown: e.hasShown
		}), this.isNGComment(e.text)) {
			n && U("comment-eval-skip", {
				preview: r,
				vposMs: e.vposMs,
				effectiveVposMs: this.getEffectiveCommentVpos(e),
				reason: "ng-runtime"
			}), e.isActive = !1, this.activeComments.delete(e), e.clearActivation();
			return;
		}
		if (e.isInvisible) {
			n && U("comment-eval-skip", {
				preview: r,
				vposMs: e.vposMs,
				effectiveVposMs: this.getEffectiveCommentVpos(e),
				reason: "invisible"
			}), e.isActive = !1, this.activeComments.delete(e), e.hasShown = !0, e.clearActivation();
			return;
		}
		if (e.syncWithSettings(this._settings, this.settingsVersion), e.isActive = !1, this.activeComments.delete(e), e.lane = -1, e.hasShown = !1, e.clearActivation(), this.shouldActivateCommentAtTime(e, this.currentTime, r)) {
			this.activateComment(e, t, c, l, u, this.currentTime);
			return;
		}
		e.hasShown = this.getEffectiveCommentVpos(e) < this.currentTime - 9e3;
	}), this._settings.isCommentVisible && (this.lastDrawTime = this.timeSource.now(), this.draw());
}, Cn = (e) => {
	e.prototype.processFrame = pn, e.prototype.handleAnimationFrame = mn, e.prototype.handleVideoFrame = hn, e.prototype.shouldUseVideoFrameCallback = gn, e.prototype.scheduleNextFrame = _n, e.prototype.cancelAnimationFrameRequest = vn, e.prototype.cancelVideoFrameCallback = yn, e.prototype.startAnimation = bn, e.prototype.stopAnimation = xn, e.prototype.onSeek = Sn;
}, wn = function(e, t) {
	if (e) return e;
	if (t.parentElement) return t.parentElement;
	if (typeof document < "u" && document.body) return document.body;
	throw Error("Cannot resolve container element. Provide container explicitly when DOM is unavailable.");
}, Tn = function(e) {
	if (typeof getComputedStyle == "function") {
		getComputedStyle(e).position === "static" && (e.style.position = "relative");
		return;
	}
	e.style.position || (e.style.position = "relative");
}, En = function(e) {
	try {
		this.destroyCanvasOnly();
		let t = e instanceof HTMLVideoElement ? e : e.video, n = e instanceof HTMLVideoElement ? e.parentElement : e.container ?? e.video.parentElement, r = this.resolveContainer(n ?? null, t);
		this.videoElement = t, this.containerElement = r, this.lastVideoSource = this.getCurrentVideoSource(), this.duration = Number.isFinite(t.duration) ? T(t.duration) : 0, this.currentTime = T(t.currentTime), this.playbackRate = t.playbackRate, this.isPlaying = !t.paused, this.isStalled = !1, this.lastDrawTime = this.timeSource.now(), this.playbackHasBegun = this.isPlaying || this.currentTime > 50, this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
		let i = this.createCanvasElement(), a = i.getContext("2d");
		if (!a) throw Error("Failed to acquire 2D canvas context");
		i.style.position = "absolute", i.style.top = "0", i.style.left = "0", i.style.right = "0", i.style.bottom = "0", i.style.display = "block", i.style.pointerEvents = "none", i.style.zIndex = "2147483647";
		let o = this.containerElement;
		o instanceof HTMLElement && (this.ensureContainerPositioning(o), o.appendChild(i)), this.canvas = i, this.ctx = a, this.resize(), this.calculateLaneMetrics(), this.setupVideoEventListeners(t), this.setupResizeHandling(t), this.setupFullscreenHandling(), this.setupVideoChangeDetection(t, r), this.startAnimation(), this.setupVisibilityHandling();
	} catch (e) {
		throw this.log.error("CommentRenderer.initialize", e), e;
	}
}, Dn = function() {
	this.stopAnimation(), this.cleanupResizeHandling(), this.runCleanupTasks(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.videoElement = null, this.containerElement = null, this.comments.length = 0, this.activeComments.clear(), this.reservedLanes.clear(), this.resetFinalPhaseState(), this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.commentSequence = 0, this.playbackHasBegun = !1, this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1;
}, On = function() {
	this.stopAnimation(), this.canvas && this.canvas.remove(), this.canvas = null, this.ctx = null, this.displayWidth = 0, this.displayHeight = 0, this.canvasDpr = 1, this.fullscreenActive = !1;
}, kn = (e) => {
	e.prototype.resolveContainer = wn, e.prototype.ensureContainerPositioning = Tn, e.prototype.initialize = En, e.prototype.destroy = Dn, e.prototype.destroyCanvasOnly = On;
}, An = function(e) {
	try {
		let t = () => {
			this.isPlaying = !0, this.playbackHasBegun = !0;
			let e = this.timeSource.now();
			this.lastDrawTime = e, this.lastPlayResumeTime = e, this.comments.forEach((t) => {
				t.lastUpdateTime = e, t.isPaused = !1;
			});
		}, n = () => {
			this.isPlaying = !1;
			let e = this.timeSource.now();
			this.comments.forEach((t) => {
				t.lastUpdateTime = e, t.isPaused = !0;
			});
		}, r = () => {
			this.onSeek();
		}, i = () => {
			this.onSeek();
		}, a = () => {
			this.playbackRate = e.playbackRate;
			let t = this.timeSource.now();
			this.comments.forEach((e) => {
				e.lastUpdateTime = t;
			});
		}, o = () => {
			this.handleVideoMetadataLoaded(e);
		}, s = () => {
			this.duration = Number.isFinite(e.duration) ? T(e.duration) : 0;
		}, c = () => {
			this.handleVideoSourceChange();
		}, l = () => {
			this.handleVideoStalled();
		}, u = () => {
			this.handleVideoCanPlay();
		}, d = () => {
			this.handleVideoCanPlay();
		};
		e.addEventListener("play", t), e.addEventListener("pause", n), e.addEventListener("seeking", r), e.addEventListener("seeked", i), e.addEventListener("ratechange", a), e.addEventListener("loadedmetadata", o), e.addEventListener("durationchange", s), e.addEventListener("emptied", c), e.addEventListener("waiting", l), e.addEventListener("canplay", u), e.addEventListener("playing", d), this.addCleanup(() => e.removeEventListener("play", t)), this.addCleanup(() => e.removeEventListener("pause", n)), this.addCleanup(() => e.removeEventListener("seeking", r)), this.addCleanup(() => e.removeEventListener("seeked", i)), this.addCleanup(() => e.removeEventListener("ratechange", a)), this.addCleanup(() => e.removeEventListener("loadedmetadata", o)), this.addCleanup(() => e.removeEventListener("durationchange", s)), this.addCleanup(() => e.removeEventListener("emptied", c)), this.addCleanup(() => e.removeEventListener("waiting", l)), this.addCleanup(() => e.removeEventListener("canplay", u)), this.addCleanup(() => e.removeEventListener("playing", d));
	} catch (e) {
		throw this.log.error("CommentRenderer.setupVideoEventListeners", e), e;
	}
}, jn = function(e) {
	this.lastVideoSource = this.getCurrentVideoSource(), this.incrementEpoch("metadata-loaded"), this.handleVideoSourceChange(e), this.resize(), this.calculateLaneMetrics(), this.onSeek(), this.emitStateSnapshot("metadata-loaded");
}, Mn = function() {
	let e = this.canvas, t = this.ctx;
	if (!e || !t) return;
	this.isStalled = !0;
	let n = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : e.width / n, i = this.displayHeight > 0 ? this.displayHeight : e.height / n;
	t.clearRect(0, 0, r, i), this.comments.forEach((e) => {
		e.isActive && (e.lastUpdateTime = this.timeSource.now());
	});
}, Nn = function() {
	this.isStalled && (this.isStalled = !1, this.videoElement && (this.currentTime = T(this.videoElement.currentTime), this.isPlaying = !this.videoElement.paused), this.lastDrawTime = this.timeSource.now());
}, Pn = function(e) {
	let t = e ?? this.videoElement;
	if (!t) {
		this.lastVideoSource = null, this.isPlaying = !1, this.resetFinalPhaseState(), this.resetCommentActivity();
		return;
	}
	let n = this.getCurrentVideoSource();
	n !== this.lastVideoSource && (this.lastVideoSource = n, this.incrementEpoch("source-change"), this.syncVideoState(t), this.resetFinalPhaseState(), this.resetCommentActivity(), this.emitStateSnapshot("source-change"));
}, Fn = function(e) {
	this.duration = Number.isFinite(e.duration) ? T(e.duration) : 0, this.currentTime = T(e.currentTime), this.playbackRate = e.playbackRate, this.isPlaying = !e.paused, this.isStalled = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > 50, this.lastDrawTime = this.timeSource.now();
}, In = function() {
	let e = this.timeSource.now(), t = this.canvas, n = this.ctx;
	if (this.resetFinalPhaseState(), this.skipDrawingForCurrentFrame = !1, this.isStalled = !1, this.pendingInitialSync = !1, this.playbackHasBegun = this.isPlaying || this.currentTime > 50, t && n) {
		let e = this.canvasDpr > 0 ? this.canvasDpr : 1, r = this.displayWidth > 0 ? this.displayWidth : t.width / e, i = this.displayHeight > 0 ? this.displayHeight : t.height / e;
		n.clearRect(0, 0, r, i);
	}
	this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.comments.forEach((t) => {
		t.isActive = !1, t.isPaused = !this.isPlaying, t.hasShown = !1, t.lane = -1, t.x = t.virtualStartX, t.speed = t.baseSpeed, t.lastUpdateTime = e, t.clearActivation();
	}), this.activeComments.clear();
}, Ln = function(e, t) {
	if (typeof MutationObserver > "u") {
		this.log.debug("MutationObserver is not available in this environment. Video change detection is disabled.");
		return;
	}
	let n = new MutationObserver((t) => {
		for (let n of t) {
			if (n.type === "attributes" && n.attributeName === "src") {
				let t = n.target, r = null, i = null;
				if ((t instanceof HTMLVideoElement || t instanceof HTMLSourceElement) && (r = typeof n.oldValue == "string" ? n.oldValue : null, i = t.getAttribute("src")), r === i) continue;
				this.handleVideoSourceChange(e);
				return;
			}
			if (n.type === "childList") {
				for (let t of n.addedNodes) if (t instanceof HTMLSourceElement) {
					this.handleVideoSourceChange(e);
					return;
				}
				for (let t of n.removedNodes) if (t instanceof HTMLSourceElement) {
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
	let r = new MutationObserver((e) => {
		for (let t of e) if (t.type === "childList") {
			for (let e of t.addedNodes) {
				let t = this.extractVideoElement(e);
				if (t && t !== this.videoElement) {
					this.initialize(t);
					return;
				}
			}
			for (let e of t.removedNodes) {
				if (e === this.videoElement) {
					this.videoElement = null, this.handleVideoSourceChange(null);
					return;
				}
				if (e instanceof Element) {
					let t = e.querySelector("video");
					if (t && t === this.videoElement) {
						this.videoElement = null, this.handleVideoSourceChange(null);
						return;
					}
				}
			}
		}
	});
	r.observe(t, {
		childList: !0,
		subtree: !0
	}), this.addCleanup(() => r.disconnect());
}, Rn = function(e) {
	if (e instanceof HTMLVideoElement) return e;
	if (e instanceof Element) {
		let t = e.querySelector("video");
		if (t instanceof HTMLVideoElement) return t;
	}
	return null;
}, zn = (e) => {
	e.prototype.setupVideoEventListeners = An, e.prototype.handleVideoMetadataLoaded = jn, e.prototype.handleVideoStalled = Mn, e.prototype.handleVideoCanPlay = Nn, e.prototype.handleVideoSourceChange = Pn, e.prototype.syncVideoState = Fn, e.prototype.resetCommentActivity = In, e.prototype.setupVideoChangeDetection = Ln, e.prototype.extractVideoElement = Rn;
}, Bn = function() {
	if (typeof document > "u" || typeof document.addEventListener != "function" || typeof document.removeEventListener != "function") return;
	let e = () => {
		if (document.visibilityState !== "visible") {
			this.stopAnimation();
			return;
		}
		this._settings.isCommentVisible && (this.handleVisibilityRestore(), this.startAnimation());
	};
	document.addEventListener("visibilitychange", e), this.addCleanup(() => document.removeEventListener("visibilitychange", e)), document.visibilityState !== "visible" && this.stopAnimation();
}, Vn = function() {
	let e = this.canvas, t = this.ctx, n = this.videoElement;
	e && t && n && (this.currentTime = T(n.currentTime), this.lastDrawTime = this.timeSource.now(), this.isPlaying = !n.paused, this.isStalled = !1, this.pendingInitialSync = !0, this.resetFinalPhaseState(), this.updatePlaybackProgressState(), this.draw());
}, Hn = function(e) {
	let t = this._settings.isCommentVisible;
	if (this._settings.isCommentVisible = e, t === e) return;
	this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion;
	let n = this.canvas, r = this.ctx;
	if (n && r) {
		if (e) this.lastDrawTime = this.timeSource.now(), this.pendingInitialSync = !0, this.scheduleNextFrame();
		else {
			let e = this.canvasDpr > 0 ? this.canvasDpr : 1, t = this.displayWidth > 0 ? this.displayWidth : n.width / e, i = this.displayHeight > 0 ? this.displayHeight : n.height / e;
			r.clearRect(0, 0, t, i);
		}
	}
}, Un = (e) => {
	e.prototype.setupVisibilityHandling = Bn, e.prototype.handleVisibilityRestore = Vn, e.prototype.setCommentVisibility = Hn;
}, Wn = 768, Gn = 68.1645984649658, Kn = function(e, t) {
	let n = this.videoElement, r = this.canvas, i = this.ctx;
	if (!n || !r) return;
	let a = (this.fullscreenActive && r.parentElement instanceof HTMLElement ? r.parentElement.getBoundingClientRect() : null) ?? n.getBoundingClientRect(), o = this.canvasDpr > 0 ? this.canvasDpr : 1, s = this.displayWidth > 0 ? this.displayWidth : r.width / o, c = this.displayHeight > 0 ? this.displayHeight : r.height / o, l = e ?? a.width ?? s, u = t ?? a.height ?? c;
	if (!Number.isFinite(l) || !Number.isFinite(u) || l <= 0 || u <= 0) return;
	let d = Math.max(1, Math.floor(l)), f = Math.max(1, Math.floor(u)), p = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1, m = Math.max(1, Math.round(d * p)), h = Math.max(1, Math.round(f * p));
	(this.displayWidth !== d || this.displayHeight !== f || Math.abs(this.canvasDpr - p) > 2 ** -52 || r.width !== m || r.height !== h) && (this.displayWidth = d, this.displayHeight = f, this.canvasDpr = p, r.width = m, r.height = h, r.style.width = `${d}px`, r.style.height = `${f}px`, i && (i.setTransform(1, 0, 0, 1, 0, 0), this._settings.useDprScaling && i.scale(p, p)), this.calculateLaneMetrics(), this.reservedLanes.clear(), this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0, this.performInitialSync(T(n.currentTime)), this.draw());
}, qn = function() {
	if (typeof window > "u") return 1;
	let e = Number(window.devicePixelRatio);
	return !Number.isFinite(e) || e <= 0 ? 1 : e;
}, Jn = function() {
	let e = this.canvas;
	if (!e) return;
	let t = this.displayHeight > 0 ? this.displayHeight : e.height / Math.max(this.canvasDpr, 1);
	this.laneHeight = Gn / Wn * t;
	let n = Math.max(this.laneHeight, 1), r = Math.floor(Math.max(0, t - n) / n);
	if (this._settings.useFixedLaneCount) {
		let e = Number.isFinite(this._settings.fixedLaneCount) ? Math.floor(this._settings.fixedLaneCount) : 12, t = Math.max(1, Math.min(r, e));
		this.laneCount = t;
	} else this.laneCount = Math.max(1, r);
	this.topStaticLaneReservations.length = 0, this.bottomStaticLaneReservations.length = 0;
}, Yn = function(e) {
	this.cleanupResizeHandling();
	let t = !1, n = () => {
		if (t) return;
		t = !0;
		let e = () => {
			t = !1, this.resize();
		};
		if (typeof requestAnimationFrame == "function") {
			requestAnimationFrame(e);
			return;
		}
		e();
	};
	if (this._settings.useContainerResizeObserver && this.isResizeObserverAvailable) {
		let t = this.resolveResizeObserverTarget(e), n = new ResizeObserver((e) => {
			for (let t of e) {
				let { width: e, height: n } = t.contentRect;
				e > 0 && n > 0 ? this.resize(e, n) : this.resize();
			}
		});
		n.observe(t), this.resizeObserver = n, this.resizeObserverTarget = t;
	} else this.log.debug("Resize handling is disabled because neither ResizeObserver nor window APIs are available.");
	typeof window < "u" && typeof window.addEventListener == "function" && (window.addEventListener("resize", n), this.addCleanup(() => window.removeEventListener("resize", n)));
	let r = typeof window < "u" ? window.visualViewport : void 0;
	r && typeof r.addEventListener == "function" && (r.addEventListener("resize", n), r.addEventListener("scroll", n), this.addCleanup(() => {
		r.removeEventListener("resize", n), r.removeEventListener("scroll", n);
	}));
}, Xn = function() {
	this.resizeObserver && this.resizeObserverTarget && this.resizeObserver.unobserve(this.resizeObserverTarget), this.resizeObserver?.disconnect(), this.resizeObserver = null, this.resizeObserverTarget = null;
}, Zn = (e) => {
	e.prototype.resize = Kn, e.prototype.resolveDevicePixelRatio = qn, e.prototype.calculateLaneMetrics = Jn, e.prototype.setupResizeHandling = Yn, e.prototype.cleanupResizeHandling = Xn;
}, Qn = function() {
	if (typeof document > "u" || typeof document.addEventListener != "function" || typeof document.removeEventListener != "function") return;
	let e = () => {
		this.handleFullscreenChange();
	};
	[
		"fullscreenchange",
		"webkitfullscreenchange",
		"mozfullscreenchange",
		"MSFullscreenChange"
	].forEach((t) => {
		document.addEventListener(t, e), this.addCleanup(() => document.removeEventListener(t, e));
	}), this.handleFullscreenChange();
}, $n = (e) => {
	let t = () => {
		let t = e.getFullscreenElement();
		if (t instanceof HTMLElement) {
			let n = t.getBoundingClientRect();
			e.resize(n.width, n.height);
			return;
		}
		e.resize();
	};
	typeof requestAnimationFrame == "function" && requestAnimationFrame(t), typeof setTimeout == "function" && setTimeout(t, 80);
}, er = function(e) {
	return this.resolveFullscreenContainer(e) || (e.parentElement ?? e);
}, tr = async function() {
	let e = this.canvas, t = this.videoElement;
	if (!e || !t) return;
	let n = this.containerElement ?? t.parentElement ?? null, r = this.getFullscreenElement(), i = this.resolveActiveOverlayContainer(t, n, r);
	if (!(i instanceof HTMLElement)) return;
	e.parentElement === i ? this.ensureContainerPositioning(i) : (this.ensureContainerPositioning(i), i.appendChild(e));
	let a = r instanceof HTMLElement && r.contains(t) ? r : null, o = a !== null;
	if (this.fullscreenActive !== o && (this.fullscreenActive = o, this.setupResizeHandling(t)), e.style.position = "absolute", e.style.top = "0", e.style.left = "0", e.style.right = "0", e.style.bottom = "0", e.style.display = "block", e.style.pointerEvents = "none", e.style.zIndex = "2147483647", a) {
		let e = a.getBoundingClientRect();
		this.resize(e.width, e.height), $n(this);
		return;
	}
	this.resize(), $n(this);
}, nr = function(e) {
	let t = this.getFullscreenElement();
	return t instanceof HTMLElement && (t === e || t.contains(e)) ? t : null;
}, rr = function(e, t, n) {
	return n instanceof HTMLElement && n.contains(e) ? n instanceof HTMLVideoElement && t instanceof HTMLElement ? t : n : t ?? null;
}, ir = function() {
	if (typeof document > "u") return null;
	let e = document;
	return document.fullscreenElement ?? e.webkitFullscreenElement ?? e.mozFullScreenElement ?? e.msFullscreenElement ?? null;
}, ar = (e) => {
	e.prototype.setupFullscreenHandling = Qn, e.prototype.resolveResizeObserverTarget = er, e.prototype.handleFullscreenChange = tr, e.prototype.resolveFullscreenContainer = nr, e.prototype.resolveActiveOverlayContainer = rr, e.prototype.getFullscreenElement = ir;
}, or = function(e) {
	this.cleanupTasks.push(e);
}, sr = function() {
	for (; this.cleanupTasks.length > 0;) {
		let e = this.cleanupTasks.pop();
		try {
			e?.();
		} catch (e) {
			this.log.error("CommentRenderer.cleanupTask", e);
		}
	}
}, cr = (e) => {
	e.prototype.addCleanup = or, e.prototype.runCleanupTasks = sr;
}, $ = class {
	_settings;
	comments = [];
	activeComments = /* @__PURE__ */ new Set();
	reservedLanes = /* @__PURE__ */ new Map();
	topStaticLaneReservations = [];
	bottomStaticLaneReservations = [];
	pendingStaticPlacementOffsets = /* @__PURE__ */ new WeakMap();
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
	laneCount = 12;
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
	rebuildNgMatchers() {
		Q.call(this);
	}
	constructor(e = null, t = void 0) {
		let n, r;
		if (st(e)) n = Z({ ...e }), r = t ?? {};
		else {
			let i = e ?? t ?? {};
			r = typeof i == "object" ? i : {}, n = Z(nt());
		}
		this._settings = Z(n), this.timeSource = r.timeSource ?? w(), this.animationFrameProvider = r.animationFrameProvider ?? at(this.timeSource), this.createCanvasElement = r.createCanvasElement ?? ot(), this.commentDependencies = {
			timeSource: this.timeSource,
			settingsVersion: this.settingsVersion
		}, this.log = j(r.loggerNamespace ?? "CommentRenderer"), this.eventHooks = r.eventHooks ?? {}, this.handleAnimationFrame = this.handleAnimationFrame.bind(this), this.handleVideoFrame = this.handleVideoFrame.bind(this), this.rebuildNgMatchers(), r.debug && V(r.debug);
	}
	get settings() {
		return this._settings;
	}
	set settings(e) {
		this._settings = Z(e), this.settingsVersion += 1, this.commentDependencies.settingsVersion = this.settingsVersion, this.rebuildNgMatchers();
	}
	getVideoElement() {
		return this.videoElement;
	}
	getCurrentVideoSource() {
		let e = this.videoElement;
		if (!e) return null;
		if (typeof e.currentSrc == "string" && e.currentSrc.length > 0) return e.currentSrc;
		let t = e.getAttribute("src");
		if (t && t.length > 0) return t;
		let n = e.querySelector("source[src]");
		return n && typeof n.src == "string" ? n.src : null;
	}
	getCommentsSnapshot() {
		return [...this.comments];
	}
};
mt($), Ct($), Et($), At($), Pt($), Ut($), Zt($), ln($), fn($), Cn($), kn($), zn($), Un($), Zn($), ar($), cr($);
//#endregion
//#region src/shared/calibration-debug.ts
var lr = (e) => ({
	text: e.text,
	vposMs: e.vposMs,
	...e.meta?.no === void 0 ? {} : { no: e.meta.no },
	...e.meta?.fork === void 0 ? {} : { fork: e.meta.fork },
	...e.meta?.source === void 0 ? {} : { source: e.meta.source },
	...e.meta?.threadId === void 0 ? {} : { threadId: e.meta.threadId },
	...e.meta?.date === void 0 ? {} : { date: e.meta.date },
	...e.meta?.userIdHash === void 0 ? {} : { userIdHash: e.meta.userIdHash },
	commands: e.commands,
	layout: e.layout,
	lane: e.lane,
	x: e.x,
	y: e.y,
	width: e.width,
	height: e.height,
	fontSize: e.fontSize,
	lineHeightPx: e.lineHeightPx,
	slotHeight: e.slotHeight,
	fontFamily: e.fontFamily,
	color: e.color,
	opacity: e.opacity,
	visibleDurationMs: e.visibleDurationMs,
	totalDurationMs: e.totalDurationMs,
	preCollisionDurationMs: e.preCollisionDurationMs,
	speedPixelsPerMs: e.speedPixelsPerMs,
	virtualStartX: e.virtualStartX,
	exitThreshold: e.exitThreshold,
	bufferWidth: e.bufferWidth,
	reservationWidth: e.reservationWidth,
	creationIndex: e.creationIndex
}), ur = (e) => {
	let t = e.canvas;
	if (!t) return null;
	let n = e.canvasDpr > 0 ? e.canvasDpr : 1;
	return {
		width: t.width,
		height: t.height,
		cssWidth: e.displayWidth > 0 ? e.displayWidth : t.width / n,
		cssHeight: e.displayHeight > 0 ? e.displayHeight : t.height / n,
		dpr: n
	};
}, dr = (e, t, n = {}) => {
	let r = [], i = globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__, a = globalThis.__COMMENT_OVERLAY_TRACE__;
	if (n.collectTrace === !0) {
		let e = n.traceOps && n.traceOps.length > 0 ? new Set(n.traceOps) : null;
		globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = !0, globalThis.__COMMENT_OVERLAY_TRACE__ = ((t) => {
			(!e || e.has(t.op)) && r.push(t);
		});
	}
	try {
		e.processFrame(t);
	} finally {
		n.collectTrace === !0 && (globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = i, globalThis.__COMMENT_OVERLAY_TRACE__ = a);
	}
	return {
		frameTimeMs: t,
		canvas: ur(e),
		activeComments: Array.from(e.activeComments, lr),
		records: r
	};
};
//#endregion
export { rt as COMMENT_OVERLAY_VERSION, et as Comment, $ as CommentRenderer, tt as DEFAULT_RENDERER_SETTINGS, dr as captureRendererCalibrationFrame, nt as cloneDefaultSettings, V as configureDebugLogging, at as createDefaultAnimationFrameProvider, w as createDefaultTimeSource, j as createLogger, U as debugLog, G as dumpRendererState, H as isDebugLoggingEnabled, K as logEpochChange, De as resetDebugCounters };

//# sourceMappingURL=comment-overlay.es.js.map