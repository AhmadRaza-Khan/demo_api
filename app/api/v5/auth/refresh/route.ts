import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import RefreshToken from "@/lib/models/RefreshToken";
import { signAccessToken, ACCESS_TOKEN_TTL_SECONDS } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/http";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// v5: trade a still-valid refresh token for a new access token, rotating
// the refresh token so a leaked one can't be replayed indefinitely.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (body?.grant_type !== "refresh_token") {
    return apiError(400, "unsupported_grant_type", "grant_type must be 'refresh_token'.");
  }

  const token = body?.refresh_token;
  if (!token) {
    return apiError(400, "missing_refresh_token", "Body must include refresh_token.");
  }

  await connectDB();
  const stored = await RefreshToken.findOne({ token });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    return apiError(401, "invalid_refresh_token", "Refresh token is unknown, revoked, or expired.");
  }

  stored.revoked = true;
  await stored.save();

  const access_token = signAccessToken({ merchantId: stored.merchantId, clientId: stored.merchantId });
  const refresh_token = crypto.randomBytes(32).toString("hex");

  await RefreshToken.create({
    token: refresh_token,
    merchantId: stored.merchantId,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return apiSuccess(200, "Token refreshed", {
    access_token,
    refresh_token,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
  });
}
