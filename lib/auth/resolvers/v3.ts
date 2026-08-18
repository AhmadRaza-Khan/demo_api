import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Merchant from "@/lib/models/Merchant";
import { apiError } from "@/lib/http";
import { ResolveResult } from "./types";

export async function resolveV3(req: NextRequest): Promise<ResolveResult> {
  await connectDB();

  const clientId = req.headers.get("x-client-id");
  const clientSecret = req.headers.get("x-client-secret");

  if (clientId && clientSecret) {
    const merchant = await Merchant.findOne({ clientId, clientSecret });
    if (!merchant) {
      return {
        ok: false,
        response: apiError(401, "invalid_credentials", "Unknown client id / secret pair."),
      };
    }
    return { ok: true, merchantId: merchant.clientId };
  }

  const basic = req.headers.get("authorization") ?? "";
  const basicMatch = basic.match(/^Basic\s+(.+)$/i);
  if (basicMatch) {
    const decoded = Buffer.from(basicMatch[1], "base64").toString("utf-8");
    const [username, password] = decoded.split(":");
    const merchant = await Merchant.findOne({ username, password });
    if (!merchant) {
      return {
        ok: false,
        response: apiError(401, "invalid_credentials", "Unknown username / password pair."),
      };
    }
    return { ok: true, merchantId: merchant.clientId };
  }

  return {
    ok: false,
    response: apiError(
      401,
      "missing_credentials",
      "Provide 'X-Client-Id' + 'X-Client-Secret' headers, or 'Authorization: Basic <base64(username:password)>'."
    ),
  };
}
