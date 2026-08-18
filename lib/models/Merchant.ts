import mongoose, { Schema, models, model } from "mongoose";

export interface MerchantDoc {
  name: string;
  clientId: string;
  clientSecret: string;
  apiKey: string;
  username: string;
  password: string;
  createdAt: Date;
}

const MerchantSchema = new Schema<MerchantDoc>({
  name: { type: String, required: true },
  clientId: { type: String, required: true, unique: true, index: true },
  clientSecret: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default (models.Merchant as mongoose.Model<MerchantDoc>) ||
  model<MerchantDoc>("Merchant", MerchantSchema);
