import { account } from "@/lib/appwrite/client";

// Since FE and API routes are in the same Next.js app, we rely on relative paths by default
const API_BASE_URL =
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL || "";

interface ApiRequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  skipAuth?: boolean;
  customUrl?: string;
}

export interface UploadProgressOptions {
  onProgress?: (event: { progress: number }) => void;
  abortSignal?: AbortSignal;
  skipAuth?: boolean;
  headers?: Record<string, string>;
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

  const isFormData = restOptions.body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

async function apiUploadWithProgress<T>(
  endpoint: string,
  formData: FormData,
  options: UploadProgressOptions = {},
): Promise<T> {
  const url = joinUrl(API_BASE_URL, endpoint);
  const { onProgress, abortSignal, skipAuth = false, headers = {} } = options;

  const finalHeaders: Record<string, string> = { ...headers };

  if (!skipAuth && typeof window !== "undefined") {
    try {
      const session = await account.createJWT();
      if (session.jwt) {
        finalHeaders.Authorization = `Bearer ${session.jwt}`;
      }
    } catch (_error) {}
  }

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    for (const [key, value] of Object.entries(finalHeaders)) {
      xhr.setRequestHeader(key, value);
    }

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress({ progress });
        }
      };
    }

    if (abortSignal) {
      abortSignal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Upload dibatalkan"));
      });
    }

    xhr.onload = () => {
      let res: Record<string, unknown> | null = null;
      try {
        if (xhr.responseText) {
          res = JSON.parse(xhr.responseText);
        }
      } catch (e) {
        // Not JSON
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve((res?.result !== undefined ? res.result : res) as T);
      } else {
        const errorMessage =
          (res?.error as string) ||
          (res?.message as string) ||
          `API Error: ${xhr.status} ${xhr.statusText}`;
        reject(new Error(errorMessage));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network Error"));
    };

    xhr.send(formData);
  });
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
  upload: <TResponse = unknown>(
    endpoint: string,
    formData: FormData,
    options?: ApiRequestOptions,
  ) =>
    apiRequest<TResponse>(endpoint, {
      method: "POST",
      body: formData,
      headers: {},
      ...options,
    }),
  uploadWithProgress: <TResponse = unknown>(
    endpoint: string,
    formData: FormData,
    options?: UploadProgressOptions,
  ) => apiUploadWithProgress<TResponse>(endpoint, formData, options),
};
