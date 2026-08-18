import { listProducts } from "@/lib/handlers/catalog";
import { apiSuccess } from "@/lib/http";

// v1: no auth at all.
export async function GET() {
  const products = await listProducts();
  return apiSuccess(200, "Products fetched successfully", { products });
}
