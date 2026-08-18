import { NextRequest } from "next/server";
import { apiError } from "@/lib/http";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ResolveResult } from "./types";

export async function resolveV2(req: NextRequest): Promise<ResolveResult> {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return {
      ok: false,
      response: apiError(
        401,
        "missing_token",
        "Missing 'Authorization: Bearer <token>' header. Get one from POST /api/v2/auth."
      ),
    };
  }

  const result = verifyAccessToken(match[1]);
  if (!result.ok) {
    return {
      ok: false,
      response:
        result.reason === "expired"
          ? apiError(
              401,
              "token_expired",
              "Access token expired (tokens last 5 minutes). Request a new one via POST /api/v2/auth."
            )
          : apiError(401, "invalid_token", "Access token is invalid."),
    };
  }

  return { ok: true, merchantId: result.payload.merchantId };
}
