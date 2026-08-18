import { NextRequest } from "next/server";
import { resolveV2 } from "@/lib/auth/resolvers/v2";
import { listProducts } from "@/lib/handlers/catalog";
import { apiSuccess } from "@/lib/http";

export async function GET(req: NextRequest) {
  const auth = await resolveV2(req);
  if (!auth.ok) return auth.response;

  const products = await listProducts();
  return apiSuccess(200, "Products fetched successfully", { products });
}
