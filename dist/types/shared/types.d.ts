export interface RendererSettings {
    commentColor: string;
    commentOpacity: number;
    isCommentVisible: boolean;
    useContainerResizeObserver: boolean;
    ngWords: string[];
    ngRegexps: string[];
}
export interface VideoMetadata {
    videoId: string;
    title: string;
    viewCount: number;
    commentCount: number;
    mylistCount: number;
    postedAt: string;
    thumbnail: string;
    owner?: {
        nickname?: string;
        name?: string;
    } | null;
    channel?: {
        name?: string;
    } | null;
}
//# sourceMappingURL=types.d.ts.map