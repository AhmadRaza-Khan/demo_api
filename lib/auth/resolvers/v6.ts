import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Merchant from "@/lib/models/Merchant";
import { apiError } from "@/lib/http";
import { computeSignature, signaturesMatch, HMAC_TIMESTAMP_WINDOW_MS } from "@/lib/auth/hmac";
import { ResolveResult } from "./types";

export async function resolveV6(req: NextRequest, rawBody: string): Promise<ResolveResult> {
  await connectDB();

  const clientId = req.headers.get("x-client-id");
  const timestamp = req.headers.get("x-timestamp");
  const signature = req.headers.get("x-signature");

  if (!clientId || !timestamp || !signature) {
    return {
      ok: false,
      response: apiError(
        401,
        "missing_signature",
        "Provide 'X-Client-Id', 'X-Timestamp' (unix ms), and 'X-Signature' (HMAC-SHA256) headers."
      ),
    };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > HMAC_TIMESTAMP_WINDOW_MS) {
    return {
      ok: false,
      response: apiError(
        401,
        "timestamp_out_of_range",
        "X-Timestamp is missing/invalid or outside the 5-minute allowed window (replay protection)."
      ),
    };
  }

  const merchant = await Merchant.findOne({ clientId });
  if (!merchant) {
    return {
      ok: false,
      response: apiError(401, "invalid_client_id", "Unknown client id."),
    };
  }

  const expected = computeSignature(
    merchant.clientSecret,
    timestamp,
    req.method,
    req.nextUrl.pathname,
    rawBody
  );

  if (!signaturesMatch(expected, signature)) {
    return {
      ok: false,
      response: apiError(
        401,
        "invalid_signature",
        "Signature does not match. Recompute HMAC-SHA256(clientSecret, `${timestamp}.${method}.${path}.${body}`)."
      ),
    };
  }

  return { ok: true, merchantId: merchant.clientId };
}
