import { NextRequest } from "next/server";
import { resolveV2 } from "@/lib/auth/resolvers/v2";
import { getProductById } from "@/lib/handlers/catalog";
import { apiError, apiSuccess } from "@/lib/http";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await resolveV2(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return apiError(400, "invalid_id", "Product id must be an integer.");
  }

  const product = await getProductById(productId);
  if (!product) {
    return apiError(404, "not_found", `No product with id ${productId}`);
  }

  return apiSuccess(200, "Product fetched successfully", { product });
}
