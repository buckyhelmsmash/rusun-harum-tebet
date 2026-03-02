import { account } from "@/lib/appwrite/client";

// Since FE and API routes are in the same Next.js app, we rely on relative paths by default
const API_BASE_URL =
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL || "";

interface ApiRequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  skipAuth?: boolean;
  customUrl?: string;
}

function joinUrl(base: string, path: string): string {
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!cleanBase) return cleanPath;
  return `${cleanBase}${cleanPath}`;
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = options.customUrl || joinUrl(API_BASE_URL, endpoint);
  const {
    headers = {},
    skipAuth = false,
    customUrl: _customUrl,
    ...restOptions
  } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (!skipAuth && typeof window !== "undefined") {
    try {
      // Create Appwrite JWT for server-side verification using Node SDK
      const session = await account.createJWT();
      if (session.jwt) {
        finalHeaders.Authorization = `Bearer ${session.jwt}`;
      }
    } catch (_error) {
      // User is likely not logged in, proceed without token
    }
  }

  const config: RequestInit = {
    headers: finalHeaders,
    ...restOptions,
  };

  const response = await fetch(url, config);
  const contentType = response.headers.get("content-type");

  let res: Record<string, unknown> | null = null;
  if (contentType?.includes("application/json")) {
    res = (await response.json()) as Record<string, unknown>;
  }

  if (!response.ok) {
    const errorMessage =
      (res?.error as string) ||
      (res?.message as string) ||
      `API Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return (res?.result !== undefined ? res.result : res) as T;
}

export const ApiClient = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { method: "GET", ...options }),
  post: <TRequest, TResponse = unknown>(
    endpoint: string,
    data?: TRequest,
    options?: ApiRequestOptions,
  ) =>
    apiRequest<TResponse>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),
  patch: <TRequest, TResponse = unknown>(
    endpoint: string,
    data?: TRequest,
    options?: ApiRequestOptions,
  ) =>
    apiRequest<TResponse>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),
  delete: <TResponse = unknown>(
    endpoint: string,
    options?: ApiRequestOptions,
  ) => apiRequest<TResponse>(endpoint, { method: "DELETE", ...options }),
};
