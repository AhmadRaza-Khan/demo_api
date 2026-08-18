import { NextRequest } from "next/server";
import { resolveV6 } from "@/lib/auth/resolvers/v6";
import { listInventory } from "@/lib/handlers/catalog";
import { apiSuccess } from "@/lib/http";

export async function GET(req: NextRequest) {
  const rawBody = await req.text();
  const auth = await resolveV6(req, rawBody);
  if (!auth.ok) return auth.response;

  const inventory = await listInventory();
  return apiSuccess(200, "Inventory fetched successfully", { inventory });
}
