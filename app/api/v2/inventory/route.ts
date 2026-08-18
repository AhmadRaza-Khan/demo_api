import { NextRequest } from "next/server";
import { resolveV2 } from "@/lib/auth/resolvers/v2";
import { listInventory } from "@/lib/handlers/catalog";
import { apiSuccess } from "@/lib/http";

export async function GET(req: NextRequest) {
  const auth = await resolveV2(req);
  if (!auth.ok) return auth.response;

  const inventory = await listInventory();
  return apiSuccess(200, "Inventory fetched successfully", { inventory });
}
