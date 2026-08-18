import { connectDB } from "@/lib/db";
import Merchant from "@/lib/models/Merchant";
import { apiError, apiSuccess } from "@/lib/http";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await connectDB();
  const merchant = await Merchant.findByIdAndDelete(id);

  if (!merchant) {
    return apiError(404, "not_found", `No merchant with id ${id}`);
  }

  return apiSuccess(200, "Merchant deleted successfully", { merchant });
}
