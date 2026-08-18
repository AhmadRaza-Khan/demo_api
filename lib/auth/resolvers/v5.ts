import { NextRequest } from "next/server";
import { apiError } from "@/lib/http";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ResolveResult } from "./types";

export async function resolveV5(req: NextRequest): Promise<ResolveResult> {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return {
      ok: false,
      response: apiError(
        401,
        "missing_token",
        "Missing 'Authorization: Bearer <access_token>' header. Get one from POST /api/v5/auth/token."
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
              "Access token expired (5 minutes). Use POST /api/v5/auth/refresh with your refresh_token to get a new one."
            )
          : apiError(401, "invalid_token", "Access token is invalid."),
    };
  }

  return { ok: true, merchantId: result.payload.merchantId };
}
