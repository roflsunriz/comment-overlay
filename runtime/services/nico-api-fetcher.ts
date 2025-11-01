import { createLogger } from "@/shared/logger";
import { buildNicovideoWatchUrl } from "@/shared/constants/urls";
import { gmRequest } from "@/shared/network/gmHttp";

const logger = createLogger("dAnime:NicoApiFetcher");

interface NvCommentParams {
  server?: string;
  params?: unknown;
  threadKey?: string;
}

interface NicoApiVideo {
  id: string;
  title: string;
  count?: {
    view?: number;
    mylist?: number;
    comment?: number;
  };
  registeredAt?: string;
  thumbnail?: {
    url?: string;
  };
  description?: string;
}

interface NicoApiOwner {
  nickname?: string;
  name?: string;
}

interface NicoApiChannel {
  name?: string;
}

interface NicoApiSeriesVideoItem {
  id?: string;
}

interface NicoApiSeriesVideo {
  next?: NicoApiSeriesVideoItem;
}

interface NicoApiSeries {
  video?: NicoApiSeriesVideo;
}

export interface NicoApiResponseBody {
  comment?: {
    nvComment?: NvCommentParams;
  };
  video?: NicoApiVideo;
  owner?: NicoApiOwner;
  channel?: NicoApiChannel;
  series?: NicoApiSeries;
}

interface NicoApiResponseWrapper {
  data?: {
    response?: NicoApiResponseBody;
  };
}

interface NicoCommentItem {
  body?: string;
  vposMs?: number;
  commands?: string[];
}

interface NicoThreadItem {
  fork?: string;
  commentCount?: number;
  comments?: NicoCommentItem[];
}

interface NicoCommentResponse {
  data?: {
    threads?: NicoThreadItem[];
  };
}

export interface FetcherCommentResult {
  text: string;
  vpos: number;
  commands: string[];
}

export class NicoApiFetcher {
  private apiData: NicoApiResponseBody | null = null;
  private comments: FetcherCommentResult[] | null = null;

  get lastApiData(): NicoApiResponseBody | null {
    return this.apiData;
  }

  get cachedComments(): FetcherCommentResult[] | null {
    return this.comments;
  }

  async fetchApiData(videoId: string): Promise<NicoApiResponseBody> {
    try {
      const safeVideoId = this.sanitizeVideoId(videoId);
      const response = await gmRequest({
        method: "GET",
        url: buildNicovideoWatchUrl(safeVideoId),
        headers: { Accept: "text/html" },
      });

      const html = response.response as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const apiDataElement = doc.querySelector('meta[name="server-response"]');
      if (!apiDataElement) {
        throw new Error("API data element not found in response");
      }

      const encodedData = apiDataElement.getAttribute("content");
      if (!encodedData) {
        throw new Error("API data content is empty");
      }

      const decodedData = this.decodeServerResponse(encodedData);
      const parsed = JSON.parse(decodedData) as NicoApiResponseWrapper;
      const payload = parsed.data?.response;
      if (!payload) {
        throw new Error("Invalid API data structure");
      }

      this.apiData = payload;
      return payload;
    } catch (error) {
      logger.error("NicoApiFetcher.fetchApiData", error as Error);
      throw error;
    }
  }

  async fetchComments(): Promise<FetcherCommentResult[]> {
    try {
      if (!this.apiData) {
        throw new Error("API data must be fetched first");
      }

      const nvComment = this.apiData.comment?.nvComment;
      if (!nvComment?.server || !nvComment.params || !nvComment.threadKey) {
        throw new Error("Required comment server data is missing");
      }

      const response = await gmRequest({
        method: "POST",
        url: `${nvComment.server}/v1/threads`,
        headers: {
          "Content-Type": "application/json",
          "x-client-os-type": "others",
          "X-Frontend-Id": "6",
          "X-Frontend-Version": "0",
        },
        data: JSON.stringify({
          params: nvComment.params,
          threadKey: nvComment.threadKey,
          additionals: {},
        }),
      });

      const payload = JSON.parse(
        response.response as string,
      ) as NicoCommentResponse;
      const threads = payload.data?.threads ?? [];
      const mainThread = threads
        .filter((thread) => thread.fork === "main")
        .sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))[0];

      if (!mainThread) {
        throw new Error("Main thread not found in comment response");
      }

      const result = (mainThread.comments ?? []).map<FetcherCommentResult>(
        (comment) => ({
          text: comment.body ?? "",
          vpos: comment.vposMs ?? 0,
          commands: comment.commands ?? [],
        }),
      );

      this.comments = result;
      return result;
    } catch (error) {
      logger.error("NicoApiFetcher.fetchComments", error as Error);
      throw error;
    }
  }

  async fetchAllData(videoId: string): Promise<FetcherCommentResult[]> {
    await this.fetchApiData(videoId);
    return this.fetchComments();
  }

  private sanitizeVideoId(videoId: string): string {
    try {
      let safeVideoId = encodeURIComponent(videoId);
      safeVideoId = safeVideoId.replace(/%([0-9A-F]{2})/gi, (match, p1) => {
        const code = parseInt(p1, 16);
        const isSafe =
          (code >= 65 && code <= 90) ||
          (code >= 97 && code <= 122) ||
          (code >= 48 && code <= 57) ||
          code === 45 ||
          code === 95 ||
          code === 46 ||
          code === 126;
        return isSafe ? String.fromCharCode(code) : match;
      });
      return safeVideoId;
    } catch (error) {
      logger.error("NicoApiFetcher.sanitizeVideoId", error as Error, {
        videoId,
      });
      return videoId;
    }
  }

  private decodeServerResponse(encoded: string): string {
    try {
      return decodeURIComponent(encoded);
    } catch (error) {
      try {
        const escaped = encoded.replace(/%(?![0-9A-F]{2})/gi, "%25");
        return decodeURIComponent(escaped);
      } catch {
        throw new Error(`API data decode failed: ${(error as Error).message}`);
      }
    }
  }
}
