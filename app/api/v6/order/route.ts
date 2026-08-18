import { NextRequest } from "next/server";
import { resolveV6 } from "@/lib/auth/resolvers/v6";
import { orderSchema, formatZodError } from "@/lib/validation/order";
import { createOrder, orderResultToResponse } from "@/lib/handlers/orders";
import { apiError } from "@/lib/http";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const auth = await resolveV6(req, rawBody);
  if (!auth.ok) return auth.response;

  let body: unknown = null;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return apiError(400, "invalid_json", "Request body must be valid JSON.");
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "validation_failed", "Order payload is invalid.", formatZodError(parsed.error));
  }

  const result = await createOrder(auth.merchantId, "v6", parsed.data);
  return orderResultToResponse(result);
}
