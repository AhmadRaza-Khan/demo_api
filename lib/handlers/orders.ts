import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Order from "@/lib/models/Order";
import { OrderInput } from "@/lib/validation/order";
import { apiError, apiSuccess } from "@/lib/http";

export type CreateOrderResult =
  | { ok: true; duplicate: false; order: InstanceType<typeof Order> }
  | { ok: true; duplicate: true; order: InstanceType<typeof Order> }
  | { ok: false; details: { field: string; message: string }[] };

const DUPLICATE_KEY_ERROR_CODE = 11000;

export async function createOrder(
  merchantId: string,
  apiVersion: string,
  input: OrderInput
): Promise<CreateOrderResult> {
  await connectDB();

  const existing = await Order.findOne({ merchantId, orderId: input.orderId });
  if (existing) {
    return { ok: true, duplicate: true, order: existing };
  }

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

  try {
    const order = await Order.create({
      merchantId,
      orderId: input.orderId,
      apiVersion,
      customer: input.customer,
      items,
      total,
      status: "pending",
    });
    return { ok: true, duplicate: false, order };
  } catch (err: unknown) {
    // Two requests for the same orderId raced past the findOne check above —
    // the unique index caught it. Treat it the same as a normal duplicate.
    if (typeof err === "object" && err !== null && "code" in err && err.code === DUPLICATE_KEY_ERROR_CODE) {
      const raceWinner = await Order.findOne({ merchantId, orderId: input.orderId });
      if (raceWinner) return { ok: true, duplicate: true, order: raceWinner };
    }
    throw err;
  }
}

// Shared by every version's order route so the duplicate-order response
// (a warning, not an error — the merchant already has this order recorded)
// stays identical everywhere.
export function orderResultToResponse(result: CreateOrderResult) {
  if (!result.ok) {
    return apiError(400, "validation_failed", "Order payload is invalid.", result.details);
  }

  if (result.duplicate) {
    return apiSuccess(200, `Order "${result.order.orderId}" already exists for this merchant.`, {
      warning: "order_already_exists",
      order: result.order,
    });
  }

  return apiSuccess(201, "Order placed successfully", { order: result.order });
}
