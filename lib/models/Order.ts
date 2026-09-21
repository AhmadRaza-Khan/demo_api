import mongoose, { Schema, models, model } from "mongoose";

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDoc {
  merchantId: string;
  orderId: string;
  apiVersion: string;
  customer: { name: string; email: string };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDoc>({
  merchantId: { type: String, required: true, index: true },
  // The merchant's own order reference. Unique per merchant, so a merchant
  // can never accidentally (or maliciously) submit the same order twice.
  orderId: { type: String, required: true },
  apiVersion: { type: String, required: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

OrderSchema.index({ merchantId: 1, orderId: 1 }, { unique: true });

export default (models.Order as mongoose.Model<OrderDoc>) ||
  model<OrderDoc>("Order", OrderSchema);
