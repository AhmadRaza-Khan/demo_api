import mongoose, { Schema, models, model } from "mongoose";

export interface InventoryDoc {
  productId: string;
  quantity: number;
  updatedAt: Date;
}

const InventorySchema = new Schema<InventoryDoc>({
  productId: { type: String, required: true, unique: true, index: true },
  quantity: { type: Number, required: true, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default (models.Inventory as mongoose.Model<InventoryDoc>) ||
  model<InventoryDoc>("Inventory", InventorySchema);
