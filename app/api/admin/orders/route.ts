import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import Merchant from "@/lib/models/Merchant";
import { apiSuccess } from "@/lib/http";

export async function GET() {
  await connectDB();
  const [orders, merchants] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).lean(),
    Merchant.find().lean(),
  ]);

  const nameByClientId = new Map(merchants.map((m) => [m.clientId, m.name]));
  const enriched = orders.map((o) => ({
    ...o,
    merchantName: nameByClientId.get(o.merchantId) ?? "Unknown merchant",
  }));

  return apiSuccess(200, "Orders fetched successfully", { orders: enriched });
}
