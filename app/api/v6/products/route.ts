import { NextRequest } from "next/server";
import { resolveV6 } from "@/lib/auth/resolvers/v6";
import { listProducts } from "@/lib/handlers/catalog";
import { apiSuccess } from "@/lib/http";

export async function GET(req: NextRequest) {
  const rawBody = await req.text();
  const auth = await resolveV6(req, rawBody);
  if (!auth.ok) return auth.response;

  const products = await listProducts();
  return apiSuccess(200, "Products fetched successfully", { products });
}
