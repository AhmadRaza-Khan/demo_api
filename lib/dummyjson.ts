import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Inventory from "@/lib/models/Inventory";

interface DummyJsonProduct {
  id: number;
  sku: string;
  title: string;
  description: string;
  category: string;
  price: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  stock: number;
}

async function fetchFromDummyJson(): Promise<DummyJsonProduct[]> {
  const res = await fetch("https://dummyjson.com/products?limit=100", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`DummyJSON fetch failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.products as DummyJsonProduct[];
}

export async function syncProductsFromDummyJson() {
  await connectDB();
  const products = await fetchFromDummyJson();

  await Promise.all(
    products.map((p) =>
      Product.findOneAndUpdate(
        { productId: p.sku },
        {
          productId: p.sku,
          title: p.title,
          description: p.description,
          category: p.category,
          price: p.price,
          brand: p.brand ?? "",
          thumbnail: p.thumbnail,
          images: p.images ?? [],
        },
        { upsert: true }
      )
    )
  );

  await Promise.all(
    products.map((p) =>
      Inventory.findOneAndUpdate(
        { productId: p.sku },
        { $setOnInsert: { productId: p.sku, quantity: p.stock, updatedAt: new Date() } },
        { upsert: true }
      )
    )
  );

  return products.length;
}

export async function ensureProductsSynced() {
  await connectDB();
  const count = await Product.countDocuments();
  if (count === 0) {
    await syncProductsFromDummyJson();
  }
}
