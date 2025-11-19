import type {
  CommentLayoutCommand,
  RenderStyle,
  RendererSettings,
  ScrollDirection,
  CommentDependencies,
  CommentPrepareOptions,
  TimeSource,
} from "@/shared/types";
import { parseCommentCommands } from "@/comment/comment-commands";
import { clampOpacity } from "@/comment/color";
import { createDefaultTimeSource } from "@/comment/time-source";
import { prepareComment } from "@/comment/prepare";
import { drawComment } from "@/comment/render";
import { resolveScrollDirection, getDirectionSign } from "@/comment/direction";
import { commentLogger as logger } from "@/comment/logger";

export class Comment {
  readonly text: string;
  readonly vposMs: number;
  readonly commands: string[];
  readonly layout: CommentLayoutCommand;
  readonly isScrolling: boolean;
  readonly sizeScale: number;
  readonly opacityMultiplier: number;
  readonly opacityOverride: number | null;
  readonly colorOverride: string | null;
  readonly isInvisible: boolean;

  x = 0;
  y = 0;
  width = 0;
  height = 0;
  baseSpeed = 0;
  speed = 0;
  lane = -1;
  color: string;
  fontSize = 0;
  fontFamily: string;
  opacity: number;
  activationTimeMs: number | null = null;
  staticExpiryTimeMs: number | null = null;
  isActive = false;
  hasShown = false;
  isPaused = false;
  lastUpdateTime = 0;
  reservationWidth = 0;
  bufferWidth = 0;
  visibleDurationMs = 0;
  totalDurationMs = 0;
  preCollisionDurationMs = 0;
  speedPixelsPerMs = 0;
  virtualStartX = 0;
  exitThreshold = 0;
  scrollDirection: ScrollDirection = "rtl";
  renderStyle: RenderStyle = "outline-only";
  shadowIntensity: import("@/shared/types").ShadowIntensity = "medium";
  creationIndex = 0;
  letterSpacing = 0;
  lineHeightMultiplier = 1;
  lineHeightPx = 0;
  lines: string[] = [];
  epochId = 0;
  private directionSign: -1 | 1 = -1;
  private readonly timeSource: TimeSource;
  private lastSyncedSettingsVersion = -1;
  private cachedTexture: OffscreenCanvas | null = null;
  private textureCacheKey = "";

  constructor(
    text: string,
    vposMs: number,
    commands: string[] | undefined,
    settings: RendererSettings,
    dependencies: CommentDependencies = {},
  ) {
    if (typeof text !== "string") {
      throw new Error("Comment text must be a string");
    }
    if (!Number.isFinite(vposMs) || vposMs < 0) {
      throw new Error("Comment vposMs must be a non-negative number");
    }

    this.text = text;
    this.vposMs = vposMs;
    this.commands = Array.isArray(commands) ? [...commands] : [];

    const parsedCommands = parseCommentCommands(this.commands, {
      defaultColor: settings.commentColor,
    });

    this.layout = parsedCommands.layout;
    this.isScrolling = this.layout === "naka";
    this.sizeScale = parsedCommands.sizeScale;
    this.opacityMultiplier = parsedCommands.opacityMultiplier;
    this.opacityOverride = parsedCommands.opacityOverride;
    this.colorOverride = parsedCommands.colorOverride;
    this.isInvisible = parsedCommands.isInvisible;
    this.fontFamily = parsedCommands.fontFamily;
    this.color = parsedCommands.resolvedColor;
    this.opacity = this.getEffectiveOpacity(settings.commentOpacity);
    this.renderStyle = settings.renderStyle;
    this.shadowIntensity = settings.shadowIntensity;
    this.letterSpacing = parsedCommands.letterSpacing;
    this.lineHeightMultiplier = parsedCommands.lineHeight;

    this.timeSource = dependencies.timeSource ?? createDefaultTimeSource();
    this.applyScrollDirection(settings.scrollDirection);
    this.syncWithSettings(settings, dependencies.settingsVersion);
  }

  prepare(
    ctx: CanvasRenderingContext2D,
    visibleWidth: number,
    canvasHeight: number,
    options: CommentPrepareOptions,
  ): void {
    prepareComment(this, ctx, visibleWidth, canvasHeight, options);
  }

  draw(ctx: CanvasRenderingContext2D, interpolatedX: number | null = null): void {
    drawComment(this, ctx, interpolatedX);
  }

  update(playbackRate = 1.0, isPaused = false): void {
    try {
      if (!this.isActive) {
        this.isPaused = isPaused;
        return;
      }

      const currentTime = this.timeSource.now();

      if (!this.isScrolling) {
        this.isPaused = isPaused;
        this.lastUpdateTime = currentTime;
        return;
      }

      if (isPaused) {
        this.isPaused = true;
        this.lastUpdateTime = currentTime;
        return;
      }

      const deltaTime = (currentTime - this.lastUpdateTime) / (1000 / 60);
      this.speed = this.baseSpeed * playbackRate;
      this.x += this.speed * deltaTime * this.directionSign;
      const hasExited =
        (this.scrollDirection === "rtl" && this.x <= this.exitThreshold) ||
        (this.scrollDirection === "ltr" && this.x >= this.exitThreshold);
      if (hasExited) {
        this.isActive = false;
      }
      this.lastUpdateTime = currentTime;
      this.isPaused = false;
    } catch (error) {
      logger.error("Comment.update", error as Error, {
        text: this.text,
        playbackRate,
        isPaused,
        isActive: this.isActive,
      });
    }
  }

  syncWithSettings(settings: RendererSettings, settingsVersion?: number): void {
    const hasSyncedVersion =
      typeof settingsVersion === "number" && settingsVersion === this.lastSyncedSettingsVersion;
    if (hasSyncedVersion) {
      return;
    }
    this.color = this.getEffectiveColor(settings.commentColor);
    this.opacity = this.getEffectiveOpacity(settings.commentOpacity);
    this.applyScrollDirection(settings.scrollDirection);
    this.renderStyle = settings.renderStyle;
    this.shadowIntensity = settings.shadowIntensity;
    if (typeof settingsVersion === "number") {
      this.lastSyncedSettingsVersion = settingsVersion;
    }
  }

  getEffectiveColor(defaultColor: string): string {
    const candidate = this.colorOverride ?? defaultColor;
    if (typeof candidate !== "string" || candidate.length === 0) {
      return defaultColor;
    }
    return candidate.toUpperCase();
  }

  getEffectiveOpacity(defaultOpacity: number): number {
    if (typeof this.opacityOverride === "number") {
      return clampOpacity(this.opacityOverride);
    }
    const scaled = defaultOpacity * this.opacityMultiplier;
    if (!Number.isFinite(scaled)) {
      return 0;
    }
    return clampOpacity(scaled);
  }

  markActivated(atTimeMs: number): void {
    this.activationTimeMs = atTimeMs;
  }

  clearActivation(): void {
    this.activationTimeMs = null;
    if (!this.isScrolling) {
      this.staticExpiryTimeMs = null;
    }
    this.resetTextureCache();
  }

  hasStaticExpired(currentTimeMs: number): boolean {
    if (this.isScrolling) {
      return false;
    }
    if (this.staticExpiryTimeMs === null) {
      return false;
    }
    return currentTimeMs >= this.staticExpiryTimeMs;
  }

  getDirectionSign(): -1 | 1 {
    return this.directionSign;
  }

  getTimeSource(): TimeSource {
    return this.timeSource;
  }

  getTextureCacheKey(): string {
    return this.textureCacheKey;
  }

  setTextureCacheKey(value: string): void {
    this.textureCacheKey = value;
  }

  getCachedTexture(): OffscreenCanvas | null {
    return this.cachedTexture;
  }

  setCachedTexture(texture: OffscreenCanvas | null): void {
    this.cachedTexture = texture;
  }

  resetTextureCache(): void {
    this.cachedTexture = null;
    this.textureCacheKey = "";
  }

  private applyScrollDirection(direction: ScrollDirection | string): void {
    const resolved = resolveScrollDirection(direction);
    this.scrollDirection = resolved;
    this.directionSign = getDirectionSign(resolved);
  }
}
