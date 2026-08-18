import { syncProductsFromDummyJson } from "@/lib/dummyjson";
import { apiSuccess } from "@/lib/http";

export async function POST() {
  const count = await syncProductsFromDummyJson();
  return apiSuccess(200, "Products synced from DummyJSON", { count });
}
