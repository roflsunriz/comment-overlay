import { createLogger } from "@/shared/logger";
import { buildNicovideoSearchUrl } from "@/shared/constants/urls";
import { gmRequest } from "@/shared/network/gmHttp";

const logger = createLogger("dAnime:NicoVideoSearcher");

export interface NicoSearchResultItem {
  videoId: string;
  title: string;
  viewCount: number;
  commentCount: number;
  mylistCount: number;
  thumbnail: string;
  postedAt: string;
  owner?: { nickname?: string; name?: string } | null;
  channel?: { name?: string } | null;
  levenshteinDistance?: number;
  similarity?: number;
}

interface ServerResponseWrapper {
  data?: unknown;
}

interface NicoSearchApiItem {
  id?: string;
  contentId?: string;
  watchId?: string;
  title?: string;
  shortTitle?: string;
  count?: {
    view?: number;
    comment?: number;
    mylist?: number;
  };
  viewCounter?: number;
  commentCounter?: number;
  mylistCounter?: number;
  thumbnail?: {
    nHdUrl?: string;
    listingUrl?: string;
    largeUrl?: string;
    middleUrl?: string;
    url?: string;
  };
  thumbnailUrl?: string;
  registeredAt?: string;
  startTime?: string;
  postedDateTime?: string;
  owner?: { nickname?: string; name?: string; ownerType?: string } | null;
  isChannelVideo?: boolean;
}

export class NicoVideoSearcher {
  private readonly cache = new Map<string, NicoSearchResultItem[]>();

  async search(keyword: string): Promise<NicoSearchResultItem[]> {
    if (!keyword.trim()) {
      return [];
    }

    if (this.cache.has(keyword)) {
      return this.cache.get(keyword) ?? [];
    }

    const url = buildNicovideoSearchUrl(keyword);
    const html = await this.fetchText(url);
    const items = this.parseServerContext(html).map((item) => {
      const distance = this.calculateLevenshteinDistance(keyword, item.title);
      const maxLength = Math.max(keyword.length, item.title.length);
      const similarity = maxLength > 0 ? (1 - distance / maxLength) * 100 : 0;
      return {
        ...item,
        levenshteinDistance: distance,
        similarity,
      };
    });

    const unique: NicoSearchResultItem[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      if (!item?.videoId) {
        continue;
      }
      if (!seen.has(item.videoId)) {
        seen.add(item.videoId);
        unique.push(item);
      }
    }

    unique.sort((a, b) => {
      const simA = a.similarity ?? -1;
      const simB = b.similarity ?? -1;
      if (simA !== simB) {
        return simB - simA;
      }
      return b.viewCount - a.viewCount;
    });

    this.cache.set(keyword, unique);
    return unique;
  }

  private async fetchText(url: string): Promise<string> {
    const response = await gmRequest({ method: "GET", url });
    return response.response as string;
  }

  private parseServerContext(html: string): NicoSearchResultItem[] {
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const meta = doc.querySelector('meta[name="server-response"]');
      if (!meta) {
        return [];
      }
      const content = meta.getAttribute("content") ?? "";
      const decoded = this.decodeHtmlEntities(content);
      let data: ServerResponseWrapper | undefined;
      try {
        data = JSON.parse(decoded) as ServerResponseWrapper;
      } catch (error) {
        logger.error("NicoVideoSearcher.parseServerContext", error as Error);
        return [];
      }
      return this.extractVideoItems(data ?? {});
    } catch (error) {
      logger.error("NicoVideoSearcher.parseServerContext", error as Error);
      return [];
    }
  }

  private decodeHtmlEntities(str: string): string {
    if (!str) {
      return "";
    }
    let s = str
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    s = s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
    s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    );
    return s;
  }

  private extractVideoItems(root: unknown): NicoSearchResultItem[] {
    const results: NicoSearchResultItem[] = [];
    const pushItem = (o: NicoSearchApiItem): void => {
      const videoId = (o?.id ?? o?.contentId ?? o?.watchId ?? "").toString();
      if (!videoId) {
        return;
      }
      const title = (o?.title ?? o?.shortTitle ?? "").toString();
      const count = o?.count ?? {};
      const viewCount = Number(count.view ?? o?.viewCounter ?? 0) || 0;
      const commentCount = Number(count.comment ?? o?.commentCounter ?? 0) || 0;
      const mylistCount = Number(count.mylist ?? o?.mylistCounter ?? 0) || 0;
      const thumbObj = o?.thumbnail ?? {};
      const thumbnail = (
        thumbObj.nHdUrl ||
        thumbObj.listingUrl ||
        thumbObj.largeUrl ||
        thumbObj.middleUrl ||
        thumbObj.url ||
        o?.thumbnailUrl ||
        ""
      ).toString();
      const postedAt =
        (
          o?.registeredAt ||
          o?.startTime ||
          o?.postedDateTime ||
          ""
        )?.toString?.() ?? "";
      const owner =
        o?.owner && typeof o.owner === "object"
          ? {
              nickname: (o.owner.nickname ?? o.owner.name ?? "") || undefined,
              name: (o.owner.name ?? o.owner.nickname ?? "") || undefined,
            }
          : null;
      const channel =
        (o?.isChannelVideo || o?.owner?.ownerType === "channel") && o?.owner
          ? { name: o.owner.name ?? "" }
          : null;

      if (!title) {
        return;
      }

      results.push({
        videoId,
        title,
        viewCount,
        commentCount,
        mylistCount,
        thumbnail,
        postedAt,
        owner,
        channel,
      });
    };

    const traverse = (obj: unknown): void => {
      if (!obj) {
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach(traverse);
        return;
      }
      if (typeof obj !== "object" || obj === null) {
        return;
      }
      const item = obj as NicoSearchApiItem;
      if (item.id || item.contentId || item.watchId) {
        pushItem(item);
      }
      Object.values(obj).forEach(traverse);
    };

    traverse(root);
    return results;
  }

  private calculateLevenshteinDistance(a: string, b: string): number {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) {
      return bn;
    }
    if (bn === 0) {
      return an;
    }
    const matrix = new Array<number[]>(bn + 1);
    for (let i = 0; i <= bn; ++i) {
      const row = (matrix[i] = new Array<number>(an + 1));
      row[0] = i;
    }
    const firstRow = matrix[0];
    for (let j = 1; j <= an; ++j) {
      firstRow[j] = j;
    }
    for (let i = 1; i <= bn; ++i) {
      for (let j = 1; j <= an; ++j) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
      }
    }
    return matrix[bn][an];
  }
}
