import mongoose, { Schema, models, model } from "mongoose";

export interface OrderItem {
  productId: number;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDoc {
  merchantId: string;
  apiVersion: string;
  customer: { name: string; email: string };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Number, required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDoc>({
  merchantId: { type: String, required: true, index: true },
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

export default (models.Order as mongoose.Model<OrderDoc>) ||
  model<OrderDoc>("Order", OrderSchema);
