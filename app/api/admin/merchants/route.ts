import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Merchant from "@/lib/models/Merchant";
import { generateMerchantCredentials } from "@/lib/auth/credentials";
import { apiError, apiSuccess } from "@/lib/http";

export async function GET() {
  await connectDB();
  const merchants = await Merchant.find().sort({ createdAt: -1 }).lean();
  return apiSuccess(200, "Merchants fetched successfully", { merchants });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();

  if (!name) {
    return apiError(400, "validation_failed", "Merchant name is required.");
  }

  await connectDB();
  const merchant = await Merchant.create({
    name,
    ...generateMerchantCredentials(name),
  });

  return apiSuccess(201, "Merchant created successfully", { merchant });
}
