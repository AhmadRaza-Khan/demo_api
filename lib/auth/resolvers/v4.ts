import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Merchant from "@/lib/models/Merchant";
import { apiError } from "@/lib/http";
import { ResolveResult } from "./types";

export async function resolveV4(req: NextRequest): Promise<ResolveResult> {
  await connectDB();

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return {
      ok: false,
      response: apiError(401, "missing_api_key", "Missing 'X-Api-Key' header."),
    };
  }

  const merchant = await Merchant.findOne({ apiKey });
  if (!merchant) {
    return {
      ok: false,
      response: apiError(401, "invalid_api_key", "Unknown API key."),
    };
  }

  return { ok: true, merchantId: merchant.clientId };
}
