import { queryClient } from "./queryClient";

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

/**
 * Helper function for making API requests
 */
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: ApiRequestOptions
): Promise<T> {
  const defaultOptions: ApiRequestOptions = {
    headers: data ? { "Content-Type": "application/json" } : {},
    withCredentials: true,
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options?.headers,
    },
  };

  const res = await fetch(url, {
    method,
    headers: mergedOptions.headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: mergedOptions.withCredentials ? "include" : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }

  // For DELETE requests or other requests that don't return content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export function invalidateQueries(queryKeys: string | string[]) {
  if (Array.isArray(queryKeys)) {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  } else {
    queryClient.invalidateQueries({ queryKey: [queryKeys] });
  }
}
