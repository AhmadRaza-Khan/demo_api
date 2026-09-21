import { getProductById } from "@/lib/handlers/catalog";
import { apiError, apiSuccess } from "@/lib/http";

// v1: no auth at all.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  const product = await getProductById(productId);
  if (!product) {
    return apiError(404, "not_found", `No product with id ${productId}`);
  }

  return apiSuccess(200, "Product fetched successfully", { product });
}
