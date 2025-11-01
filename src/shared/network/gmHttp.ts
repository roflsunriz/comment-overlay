export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type ResponseType = "text" | "json" | "blob" | "arraybuffer";

export interface GmRequestOptions<TBody = string | undefined> {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  data?: TBody;
  responseType?: ResponseType;
  credentials?: RequestCredentials;
}

export interface GmHttpResponse<T = unknown> {
  status: number;
  statusText: string;
  finalUrl: string;
  responseHeaders: Record<string, string>;
  response: T;
}

const parseHeaders = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

const consumeBody = async (
  response: Response,
  responseType: ResponseType,
): Promise<unknown> => {
  switch (responseType) {
    case "json":
      return response.json();
    case "blob":
      return response.blob();
    case "arraybuffer":
      return response.arrayBuffer();
    case "text":
    default:
      return response.text();
  }
};

export const gmRequest = async <TBody = string | undefined, TResponse = unknown>(
  options: GmRequestOptions<TBody>,
): Promise<GmHttpResponse<TResponse>> => {
  const { method, url, headers, data, responseType = "text", credentials } = options;

  const fetchResponse = await fetch(url, {
    method,
    headers,
    body: (data as BodyInit | null | undefined) ?? null,
    credentials,
  });

  const body = (await consumeBody(fetchResponse, responseType)) as TResponse;

  return {
    status: fetchResponse.status,
    statusText: fetchResponse.statusText,
    finalUrl: fetchResponse.url,
    responseHeaders: parseHeaders(fetchResponse.headers),
    response: body,
  };
};
