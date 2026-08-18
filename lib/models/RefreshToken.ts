import mongoose, { Schema, models, model } from "mongoose";

export interface RefreshTokenDoc {
  token: string;
  merchantId: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<RefreshTokenDoc>({
  token: { type: String, required: true, unique: true, index: true },
  merchantId: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default (models.RefreshToken as mongoose.Model<RefreshTokenDoc>) ||
  model<RefreshTokenDoc>("RefreshToken", RefreshTokenSchema);
