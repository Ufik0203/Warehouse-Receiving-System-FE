import { z } from "zod";
import { environment } from "./env";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
  ) {
    super(message);
  }
}
let csrf: string | undefined;
let generation = 0;
let controller = new AbortController();
let onLost: (() => void) | undefined;
let bootstrap: Promise<string> | undefined;
export const authEpoch = () => generation;
export const setAuthLost = (handler: () => void) => {
  onLost = handler;
  return () => {
    if (onLost === handler) onLost = undefined;
  };
};
export function resetHttp(token?: string) {
  generation++;
  controller.abort();
  controller = new AbortController();
  csrf = token;
  bootstrap = undefined;
}
export function trustedUrl(path: string) {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("..") ||
    path.includes("\\") ||
    path.includes("://")
  )
    throw new Error("Untrusted API path.");
  const url = new URL(
    environment.VITE_API_BASE_URL + path,
    window.location.origin,
  );
  if (
    url.origin !== window.location.origin ||
    !url.pathname.startsWith(environment.VITE_API_BASE_URL + "/")
  )
    throw new Error("Untrusted API URL.");
  return url;
}
const csrfSchema = z.object({
  data: z.object({ csrfToken: z.string().min(32) }),
});
export async function ensureCsrf(): Promise<string> {
  if (csrf) return csrf;
  if (!bootstrap) {
    const epoch = generation;
    const request = http("/auth/csrf-token", csrfSchema)
      .then((result) => {
        if (epoch !== generation)
          throw new ApiError(0, "SESSION_CHANGED", "Session telah berubah.");
        csrf = result.data.csrfToken;
        return csrf;
      })
      .finally(() => {
        if (bootstrap === request) bootstrap = undefined;
      });
    bootstrap = request;
  }
  return bootstrap;
}
type Options = {
  method?: "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  key?: string;
  anonymous?: boolean;
};
export async function http<T>(
  path: string,
  schema: z.ZodType<T>,
  options: Options = {},
  retried = false,
): Promise<T> {
  const url = trustedUrl(path);
  const epoch = generation;
  const sessionSignal = controller.signal;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.method) {
    headers["Content-Type"] = "application/json";
    headers["X-CSRF-Token"] = await ensureCsrf();
    if (options.key) headers["Idempotency-Key"] = options.key;
  }
  if (epoch !== generation)
    throw new ApiError(0, "SESSION_CHANGED", "Session telah berubah.");
  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      credentials: "same-origin",
      redirect: "error",
      signal: options.signal
        ? AbortSignal.any([sessionSignal, options.signal])
        : sessionSignal,
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
    });
  } catch (error: unknown) {
    if (sessionSignal.aborted || options.signal?.aborted) throw error;
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Respons belum diterima. Periksa koneksi sebelum mencoba lagi.",
    );
  }
  const raw: unknown =
    response.status === 204
      ? undefined
      : await response.json().catch(() => undefined);
  if (epoch !== generation)
    throw new ApiError(
      0,
      "SESSION_CHANGED",
      "Respons dari session lama diabaikan.",
    );
  if (!response.ok) {
    const parsed = z
      .object({
        error: z.object({
          code: z.string(),
          message: z.string(),
          requestId: z.string().optional(),
        }),
      })
      .safeParse(raw);
    const error = new ApiError(
      response.status,
      parsed.success ? parsed.data.error.code : "HTTP_ERROR",
      parsed.success
        ? parsed.data.error.message
        : "Permintaan tidak dapat diproses.",
      parsed.success ? parsed.data.error.requestId : undefined,
    );
    if (error.code === "CSRF_INVALID" && options.method && !retried) {
      csrf = undefined;
      await ensureCsrf();
      return http(path, schema, options, true);
    }
    if (response.status === 401 && !options.anonymous) onLost?.();
    throw error;
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success)
    throw new ApiError(
      0,
      "INVALID_RESPONSE",
      "Format respons API tidak sesuai kontrak.",
    );
  return parsed.data;
}
