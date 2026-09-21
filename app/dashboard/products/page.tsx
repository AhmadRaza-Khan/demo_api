"use client";

import { useEffect, useState } from "react";

interface Product {
  productId: string;
  title: string;
  category: string;
  price: number;
  brand: string;
}

interface InventoryItem {
  productId: string;
  title: string;
  quantity: number;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshingInventory, setRefreshingInventory] = useState(false);

  async function loadProducts() {
    const res = await fetch("/api/v1/products");
    const data = await res.json();
    setProducts(data.products ?? []);
  }

  async function loadInventory() {
    setRefreshingInventory(true);
    const res = await fetch("/api/v1/inventory");
    const data = await res.json();
    setInventory(data.inventory ?? []);
    setRefreshingInventory(false);
  }

  useEffect(() => {
    let ignore = false;

    (async () => {
      const [productsRes, inventoryRes] = await Promise.all([
        fetch("/api/v1/products"),
        fetch("/api/v1/inventory"),
      ]);
      const [productsData, inventoryData] = await Promise.all([
        productsRes.json(),
        inventoryRes.json(),
      ]);
      if (!ignore) {
        setProducts(productsData.products ?? []);
        setInventory(inventoryData.inventory ?? []);
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSync() {
    setSyncing(true);
    await fetch("/api/admin/products/sync", { method: "POST" });
    await Promise.all([loadProducts(), loadInventory()]);
    setSyncing(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products & Inventory</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Products are cached from DummyJSON. Inventory quantities shift a little every
            time they&apos;re fetched, simulating a live warehouse feed.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync from DummyJSON"}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-medium">Products ({products.length})</h2>
            <div className="max-h-[480px] overflow-y-auto rounded border border-black/10 dark:border-white/10">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-black/10 text-left dark:border-white/10">
                    <th className="py-2 pl-3 pr-2">ID</th>
                    <th className="py-2 pr-2">Title</th>
                    <th className="py-2 pr-2">Category</th>
                    <th className="py-2 pr-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.productId} className="border-b border-black/5 dark:border-white/5">
                      <td className="py-1.5 pl-3 pr-2 text-zinc-500">{p.productId}</td>
                      <td className="py-1.5 pr-2">{p.title}</td>
                      <td className="py-1.5 pr-2 text-zinc-500">{p.category}</td>
                      <td className="py-1.5 pr-3">${p.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-medium">Inventory</h2>
              <button
                type="button"
                onClick={loadInventory}
                disabled={refreshingInventory}
                className="text-sm text-zinc-600 underline hover:text-black disabled:opacity-50 dark:text-zinc-400 dark:hover:text-white"
              >
                {refreshingInventory ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="max-h-[480px] overflow-y-auto rounded border border-black/10 dark:border-white/10">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-black/10 text-left dark:border-white/10">
                    <th className="py-2 pl-3 pr-2">ID</th>
                    <th className="py-2 pr-2">Title</th>
                    <th className="py-2 pr-3">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.productId} className="border-b border-black/5 dark:border-white/5">
                      <td className="py-1.5 pl-3 pr-2 text-zinc-500">{item.productId}</td>
                      <td className="py-1.5 pr-2">{item.title}</td>
                      <td className="py-1.5 pr-3">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
