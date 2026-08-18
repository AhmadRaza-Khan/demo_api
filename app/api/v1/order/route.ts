import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Merchant from "@/lib/models/Merchant";
import { orderSchema, formatZodError } from "@/lib/validation/order";
import { createOrder, orderResultToResponse } from "@/lib/handlers/orders";
import { apiError } from "@/lib/http";

// v1: no auth at all. Because there is nothing to authenticate the caller,
// the merchant has to be identified explicitly in the body — which means
// anyone who knows (or guesses) a merchant's public clientId can place an
// order "as" them. This is the exact problem v2+ fix.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (body === null) {
    return apiError(400, "invalid_json", "Request body must be valid JSON.");
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "validation_failed", "Order payload is invalid.", formatZodError(parsed.error));
  }

  if (!parsed.data.merchantId) {
    return apiError(
      400,
      "validation_failed",
      "Order payload is invalid.",
      [{ field: "merchantId", message: "merchantId is required on v1 (no auth to infer it from)" }]
    );
  }

  await connectDB();
  const merchant = await Merchant.findOne({ clientId: parsed.data.merchantId });
  if (!merchant) {
    return apiError(400, "unknown_merchant", `No merchant with clientId ${parsed.data.merchantId}`);
  }

  const result = await createOrder(merchant.clientId, "v1", parsed.data);
  return orderResultToResponse(result);
}
