import { NextRequest } from "next/server";
import { resolveV3 } from "@/lib/auth/resolvers/v3";
import { orderSchema, formatZodError } from "@/lib/validation/order";
import { createOrder, orderResultToResponse } from "@/lib/handlers/orders";
import { apiError } from "@/lib/http";

export async function POST(req: NextRequest) {
  const auth = await resolveV3(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  if (body === null) {
    return apiError(400, "invalid_json", "Request body must be valid JSON.");
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "validation_failed", "Order payload is invalid.", formatZodError(parsed.error));
  }

  const result = await createOrder(auth.merchantId, "v3", parsed.data);
  return orderResultToResponse(result);
}
