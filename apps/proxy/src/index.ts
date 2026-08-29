import { buildOutboundHeaders } from "./headers";
import { filterResponseHeaders } from "./response";
import { validateOutboundUrl } from "./ssrf";

interface Env {
  MAX_REQUEST_SIZE: string;
  MAX_RESPONSE_SIZE: string;
  PROXY_TIMEOUT_MS: string;
  PROXY_ALLOW_PRIVATE_NETWORKS?: string;
}

interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

interface HeaderInput {
  key: string;
  value: string;
  enabled?: boolean;
}

interface AuthInput {
  type: string;
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  location?: string;
}

interface FormDataField {
  key: string;
  value: string;
  enabled?: boolean;
}

interface ApiRequestInput {
  url: string;
  method: string;
  queryParams?: QueryParam[];
  headers?: HeaderInput[];
  body?: string | null;
  auth?: AuthInput;
  formData?: FormDataField[];
}

const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

function parseBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function buildTargetUrl(input: ApiRequestInput): string {
  const url = new URL(input.url);

  for (const param of input.queryParams ?? []) {
    if (param.enabled && param.key) {
      url.searchParams.set(param.key, param.value);
    }
  }

  if (
    input.auth?.type === "api-key" &&
    input.auth.location === "query" &&
    input.auth.key
  ) {
    url.searchParams.set(
      input.auth.key,
      input.auth.value ?? "",
    );
  }

  return url.toString();
}

function buildAuthHeaders(
  input: ApiRequestInput,
  headers: Headers,
): void {
  const auth = input.auth;

  if (!auth) {
    return;
  }

  if (auth.type === "bearer" && auth.token) {
    headers.set(
      "Authorization",
      `Bearer ${auth.token}`,
    );
  }

  if (auth.type === "basic") {
    const username = auth.username ?? "";
    const password = auth.password ?? "";

    const encoded = btoa(`${username}:${password}`);

    headers.set(
      "Authorization",
      `Basic ${encoded}`,
    );
  }

  if (
    auth.type === "api-key" &&
    auth.location === "header" &&
    auth.key
  ) {
    headers.set(
      auth.key,
      auth.value ?? "",
    );
  }
}

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}

function errorResponse(
  message: string,
  status = 400,
): Response {
  return jsonResponse(
    {
      success: false,
      status: 0,
      statusText: "",
      headers: {},
      body: "",
      contentType: "",
      size: 0,
      duration: 0,
      error: message,
    },
    status,
  );
}

async function readResponseBody(
  response: Response,
  maxBytes: number,
): Promise<{
  body: string;
  size: number;
  truncated: boolean;
}> {
  const buffer = await response.arrayBuffer();

  const size = buffer.byteLength;

  if (size > maxBytes) {
    return {
      body: "",
      size: maxBytes,
      truncated: true,
    };
  }

  return {
    body: new TextDecoder().decode(buffer),
    size,
    truncated: false,
  };
}

async function handleProxyRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  let input: ApiRequestInput;

  try {
    input = await request.json();
  } catch {
    return errorResponse(
      "Invalid JSON request body.",
    );
  }

  if (!input?.url || typeof input.url !== "string") {
    return errorResponse(
      "Please enter a valid HTTP or HTTPS URL.",
    );
  }

  if (
    !input.method ||
    typeof input.method !== "string"
  ) {
    return errorResponse(
      "Invalid request method.",
    );
  }

  const method = input.method.toUpperCase();

  const allowedMethods = new Set([
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ]);

  if (!allowedMethods.has(method)) {
    return errorResponse(
      "Unsupported HTTP method.",
    );
  }

  const ssrfCheck = validateOutboundUrl(
    input.url,
    {
      allowPrivateNetworks:
        parseBoolean(
          env.PROXY_ALLOW_PRIVATE_NETWORKS,
          false,
        ),
    },
  );

  if (!ssrfCheck.allowed) {
    return errorResponse(
      ssrfCheck.reason ??
        "This request target is not allowed.",
    );
  }

  let targetUrl: string;

  try {
    targetUrl = buildTargetUrl(input);
  } catch {
    return errorResponse(
      "Please enter a valid HTTP or HTTPS URL.",
    );
  }

  const headers = buildOutboundHeaders(
    input.headers,
  );

  buildAuthHeaders(input, headers);

  let body: BodyInit | undefined;

  if (!METHODS_WITHOUT_BODY.has(method)) {
    if (
      input.body !== null &&
      input.body !== undefined &&
      input.body !== ""
    ) {
      body = input.body;
    }
  }

  const timeoutMs = Math.min(
    Math.max(
      Number(env.PROXY_TIMEOUT_MS) || 15000,
      1000,
    ),
    30000,
  );

  const maxResponseSize = Math.min(
    Math.max(
      Number(env.MAX_RESPONSE_SIZE) || 5_000_000,
      1024,
    ),
    10_000_000,
  );

  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

  const startedAt = Date.now();

  try {
    const response = await fetch(
      targetUrl,
      {
        method,
        headers,
        body,
        redirect: "manual",
        signal: controller.signal,
      },
    );

    const result = await readResponseBody(
      response,
      maxResponseSize,
    );

    const duration =
      Date.now() - startedAt;

    if (result.truncated) {
      return jsonResponse(
        {
          success: false,
          status: response.status,
          statusText: response.statusText,
          headers:
            filterResponseHeaders(
              response.headers,
            ),
          body: "",
          contentType:
            response.headers.get(
              "content-type",
            ) ?? "",
          size: result.size,
          duration,
          error:
            "Response exceeded the maximum allowed size.",
        },
      );
    }

    return jsonResponse({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers:
        filterResponseHeaders(
          response.headers,
        ),
      body: result.body,
      contentType:
        response.headers.get(
          "content-type",
        ) ?? "",
      size: result.size,
      duration,
    });
  } catch (error) {
    const duration =
      Date.now() - startedAt;

    const isAbort =
      error instanceof Error &&
      error.name === "AbortError";

    return jsonResponse({
      success: false,
      status: 0,
      statusText: "",
      headers: {},
      body: "",
      contentType: "",
      size: 0,
      duration,
      error: isAbort
        ? "The request timed out."
        : "Unable to reach the target server.",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin") ?? "*";
  const requestedHeaders =
    request.headers.get(
      "Access-Control-Request-Headers",
    ) ?? "Content-Type";

  return {
    "Access-Control-Allow-Origin":
      origin,
    "Access-Control-Allow-Methods":
      "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      requestedHeaders,
    "Access-Control-Max-Age":
      "86400",
    Vary:
      "Origin, Access-Control-Request-Headers",
    "Cache-Control": "no-store",
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/api/request") {
      return new Response("Not Found", {
        status: 404,
      });
    }

    const cors = corsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: cors,
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: cors,
      });
    }

    const response =
      await handleProxyRequest(
        request,
        env,
      );

    const headers = new Headers(
      response.headers,
    );

    Object.entries(cors).forEach(
      ([key, value]) => {
        headers.set(key, value);
      },
    );

    return new Response(
      response.body,
      {
        status: response.status,
        headers,
      },
    );
  },
};