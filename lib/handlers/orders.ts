import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Order from "@/lib/models/Order";
import { OrderInput } from "@/lib/validation/order";

export type CreateOrderResult =
  | { ok: true; order: InstanceType<typeof Order> }
  | { ok: false; details: { field: string; message: string }[] };

export async function createOrder(
  merchantId: string,
  apiVersion: string,
  input: OrderInput
): Promise<CreateOrderResult> {
  await connectDB();

  const productIds = input.items.map((i) => i.productId);
  const products = await Product.find({ productId: { $in: productIds } }).lean();
  const productById = new Map(products.map((p) => [p.productId, p]));

  const missing = productIds.filter((id) => !productById.has(id));
  if (missing.length > 0) {
    return {
      ok: false,
      details: missing.map((id) => ({
        field: "items.productId",
        message: `No product with id ${id}`,
      })),
    };
  }

  const items = input.items.map((i) => {
    const product = productById.get(i.productId)!;
    return {
      productId: product.productId,
      title: product.title,
      quantity: i.quantity,
      unitPrice: product.price,
    };
  });

  const total = Math.round(
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100
  ) / 100;

  const order = await Order.create({
    merchantId,
    apiVersion,
    customer: input.customer,
    items,
    total,
    status: "pending",
  });

  return { ok: true, order };
}
