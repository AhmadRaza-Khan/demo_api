import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Merchant from "@/lib/models/Merchant";
import { signAccessToken, ACCESS_TOKEN_TTL_SECONDS } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/http";

// v2: exchange client_id + client_secret for a short-lived (5 min) JWT.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
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

  const access_token = signAccessToken({ merchantId: merchant.clientId, clientId: merchant.clientId });

  return apiSuccess(200, "Token issued", {
    access_token,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
  });
}
