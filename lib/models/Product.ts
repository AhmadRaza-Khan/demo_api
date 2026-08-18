import mongoose, { Schema, models, model } from "mongoose";

export interface ProductDoc {
  productId: number;
  title: string;
  description: string;
  category: string;
  price: number;
  brand: string;
  thumbnail: string;
  images: string[];
}

const ProductSchema = new Schema<ProductDoc>({
  productId: { type: Number, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "" },
  price: { type: Number, required: true },
  brand: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
  images: { type: [String], default: [] },
});

export default (models.Product as mongoose.Model<ProductDoc>) ||
  model<ProductDoc>("Product", ProductSchema);
