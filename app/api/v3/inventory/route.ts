import { NextRequest } from "next/server";
import { resolveV3 } from "@/lib/auth/resolvers/v3";
import { listInventory } from "@/lib/handlers/catalog";
import { apiSuccess } from "@/lib/http";

export async function GET(req: NextRequest) {
  const auth = await resolveV3(req);
  if (!auth.ok) return auth.response;

  const inventory = await listInventory();
  return apiSuccess(200, "Inventory fetched successfully", { inventory });
}
