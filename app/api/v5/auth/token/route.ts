import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Merchant from "@/lib/models/Merchant";
import RefreshToken from "@/lib/models/RefreshToken";
import { signAccessToken } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/http";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// v5: OAuth2-style client_credentials grant. Returns a 5-min access token
// plus a longer-lived, revocable refresh token stored in the DB.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (body?.grant_type !== "client_credentials") {
    return apiError(400, "unsupported_grant_type", "grant_type must be 'client_credentials'.");
  }

  const clientId = body?.client_id;
  const clientSecret = body?.client_secret;
  if (!clientId || !clientSecret) {
    return apiError(400, "missing_credentials", "Body must include client_id and client_secret.");
  }

  await connectDB();
  const merchant = await Merchant.findOne({ clientId, clientSecret });
  if (!merchant) {
    return apiError(401, "invalid_credentials", "Unknown client_id / client_secret pair.");
  }

  const { token, expiresAt } = signAccessToken({ merchantId: merchant.clientId, clientId: merchant.clientId });
  const refresh_token = crypto.randomBytes(32).toString("hex");

  await RefreshToken.create({
    token: refresh_token,
    merchantId: merchant.clientId,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return apiSuccess(200, "Token issued", {
    access_token: token,
    refresh_token,
    token_type: "Bearer",
    expires_at: expiresAt,
  });
}
