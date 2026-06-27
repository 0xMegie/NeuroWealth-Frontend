import { NextRequest, NextResponse } from "next/server";
import {
  parseStrategyKind,
  StrategyPreference,
} from "@/lib/strategies";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import {
  ERROR_CODE,
  HTTP_STATUS,
  errorResponse,
  readJsonBody,
  successResponse,
} from "@/lib/api-response";
import { strategyUpdateSchema, zodErrorToDetails } from "@/lib/validation/api";

const STRATEGY_COOKIE_KEY = STORAGE_KEYS.STRATEGY_PREFERENCE;

function resolveEndpoint(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, normalizedBase).toString();
}

export async function GET(request: NextRequest) {
  const apiBaseUrl = process.env.NEUROWEALTH_API_BASE_URL;
  const strategyPath =
    process.env.NEUROWEALTH_STRATEGY_PATH ?? "/strategy/preference";

  if (apiBaseUrl) {
    try {
      const res = await fetch(resolveEndpoint(apiBaseUrl, strategyPath), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = (await res.json()) as StrategyPreference;
        return NextResponse.json(successResponse(data), {
          headers: { "Cache-Control": "no-store" },
        });
      }
    } catch {
      // fall through to local fallback
    }
  }

  const strategy = parseStrategyKind(
    request.cookies.get(STRATEGY_COOKIE_KEY)?.value ?? null,
  );
  return NextResponse.json(successResponse<StrategyPreference>({ strategy }), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest) {
  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = strategyUpdateSchema.safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(
        ERROR_CODE.VALIDATION_ERROR,
        "Invalid strategy value. Must be conservative, balanced, or growth.",
        zodErrorToDetails(parsed.error),
      ),
      { status: HTTP_STATUS.UNPROCESSABLE_ENTITY },
    );
  }

  const { strategy } = parsed.data;

  const apiBaseUrl = process.env.NEUROWEALTH_API_BASE_URL;
  const strategyPath =
    process.env.NEUROWEALTH_STRATEGY_PATH ?? "/strategy/preference";

  if (apiBaseUrl) {
    try {
      const res = await fetch(resolveEndpoint(apiBaseUrl, strategyPath), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ strategy }),
        cache: "no-store",
      });

      if (!res.ok) {
        return NextResponse.json(
          errorResponse(ERROR_CODE.BACKEND_ERROR, "Strategy service temporarily unavailable."),
          { status: HTTP_STATUS.SERVICE_UNAVAILABLE, headers: { "Cache-Control": "no-store" } },
        );
      }
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("Content-Type") ?? "application/json",
          "Cache-Control": "no-store",
        },
      });
    } catch {
      // fall through to local fallback
    }
  }

  const responseBody = successResponse<StrategyPreference>({ strategy });
  const response = NextResponse.json(responseBody, {
    headers: { "Cache-Control": "no-store" },
  });
  response.cookies.set(STRATEGY_COOKIE_KEY, strategy, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}
