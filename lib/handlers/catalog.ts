import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Inventory from "@/lib/models/Inventory";
import { ensureProductsSynced } from "@/lib/dummyjson";

export async function listProducts() {
  await connectDB();
  await ensureProductsSynced();
  return Product.find().sort({ productId: 1 }).lean();
}

export async function getProductById(id: string) {
  await connectDB();
  await ensureProductsSynced();
  return Product.findOne({ productId: id }).lean();
}

// Every call nudges each product's stock by a random amount, simulating a
// live warehouse feed, and persists the new snapshot.
export async function listInventory() {
  await connectDB();
  await ensureProductsSynced();

  const items = await Inventory.find();
  await Promise.all(
    items.map((item) => {
      const jitter = Math.floor(Math.random() * 21) - 10; // -10..+10
      item.quantity = Math.max(0, item.quantity + jitter);
      item.updatedAt = new Date();
      return item.save();
    })
  );

  const products = await Product.find().lean();
  const titleById = new Map(products.map((p) => [p.productId, p.title]));

  return items
    .sort((a, b) => a.productId.localeCompare(b.productId))
    .map((item) => ({
      productId: item.productId,
      title: titleById.get(item.productId) ?? "Unknown product",
      quantity: item.quantity,
      updatedAt: item.updatedAt,
    }));
}
