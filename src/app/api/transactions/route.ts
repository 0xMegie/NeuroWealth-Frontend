import {
  buildPendingTransaction,
  buildTransactionQuote,
  parseTransactionKind,
  validateTransactionValues,
} from "@/lib/transactions";
import {
  ERROR_CODE,
  HTTP_STATUS,
  errorResponse,
  readJsonBody,
  successResponse,
} from "@/lib/api-response";
import {
  transactionRequestSchema,
  zodErrorToDetails,
} from "@/lib/validation/api";
import { NextRequest, NextResponse } from "next/server";
import { isSandboxScenario, resolveSandboxScenario } from "@/lib/api-sandbox";

function resolveEndpoint(baseUrl: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl.slice(1)
    : pathOrUrl;

  return new URL(normalizedPath, normalizedBase).toString();
}

export async function POST(request: NextRequest) {
  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const rawPayload = bodyResult.data;

  const parsedPayload = transactionRequestSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return NextResponse.json(
      errorResponse(
        ERROR_CODE.VALIDATION_ERROR,
        "Request body validation failed.",
        zodErrorToDetails(parsedPayload.error),
      ),
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const payload = parsedPayload.data;
  const kind = parseTransactionKind(payload.kind);
  const values = payload.values;
  const apiBaseUrl = process.env.NEUROWEALTH_API_BASE_URL;
  const transactionPath =
    process.env.NEUROWEALTH_TRANSACTIONS_PATH ?? "/transactions";
  const scenario = resolveSandboxScenario(
    request.nextUrl.searchParams.get("scenario"),
  );

  if (apiBaseUrl && !isSandboxScenario(scenario)) {
    try {
      const response = await fetch(
        resolveEndpoint(apiBaseUrl, transactionPath),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...payload,
            kind,
            values,
          }),
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return NextResponse.json(
          errorResponse(ERROR_CODE.BACKEND_ERROR, "Transaction service temporarily unavailable."),
          { status: HTTP_STATUS.SERVICE_UNAVAILABLE },
        );
      }
      const text = await response.text();

      return new NextResponse(text, {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") ?? "application/json",
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Backend request failed";

      return NextResponse.json(
        errorResponse(
          ERROR_CODE.BACKEND_ERROR,
          "Transaction service temporarily unavailable",
          { details: message },
        ),
        { status: HTTP_STATUS.SERVICE_UNAVAILABLE },
      );
    }
  }

  const errors = validateTransactionValues(kind, values);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      errorResponse(
        ERROR_CODE.VALIDATION_ERROR,
        "Fix the highlighted fields and try again.",
        errors,
      ),
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  if (payload.intent === "submit") {
    const outcome = payload.simulation === "failure" ? "failure" : "success";

    return NextResponse.json(
      successResponse({
        pending: buildPendingTransaction(kind, values, outcome),
      }),
    );
  }

  return NextResponse.json(
    successResponse({
      quote: buildTransactionQuote(kind, values),
    }),
  );
}
