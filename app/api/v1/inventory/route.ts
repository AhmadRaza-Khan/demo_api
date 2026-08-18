import { listInventory } from "@/lib/handlers/catalog";
import { apiSuccess } from "@/lib/http";

// v1: no auth at all. Inventory shifts a little on every call.
export async function GET() {
  const inventory = await listInventory();
  return apiSuccess(200, "Inventory fetched successfully", { inventory });
}
