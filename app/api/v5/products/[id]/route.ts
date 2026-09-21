import { NextRequest } from "next/server";
import { resolveV5 } from "@/lib/auth/resolvers/v5";
import { getProductById } from "@/lib/handlers/catalog";
import { apiError, apiSuccess } from "@/lib/http";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await resolveV5(req);
  if (!auth.ok) return auth.response;

  const { id: productId } = await params;

  const product = await getProductById(productId);
  if (!product) {
    return apiError(404, "not_found", `No product with id ${productId}`);
  }

  return apiSuccess(200, "Product fetched successfully", { product });
}
