"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  productId: number;
  title: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  _id: string;
  merchantId: string;
  merchantName: string;
  orderId?: string;
  apiVersion: string;
  customer: { name: string; email: string };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

const VERSION_COLORS: Record<string, string> = {
  v1: "bg-red-500/10 text-red-600 dark:text-red-400",
  v2: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  v3: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  v4: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  v5: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  v6: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Every order is attached to the merchant that authenticated it, tagged with the
          API version used to place it.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left dark:border-white/10">
              <th className="py-2 pr-4">Merchant</th>
              <th className="py-2 pr-4">Order Id</th>
              <th className="py-2 pr-4">Version</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Items</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Placed</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="py-4 text-zinc-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-zinc-500">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-black/5 align-top dark:border-white/5">
                <td className="py-2 pr-4 font-medium">{o.merchantName}</td>
                <td className="py-2 pr-4 font-mono text-xs">{o.orderId ?? "—"}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      VERSION_COLORS[o.apiVersion] ?? "bg-zinc-500/10"
                    }`}
                  >
                    {o.apiVersion}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <div>{o.customer.name}</div>
                  <div className="text-xs text-zinc-500">{o.customer.email}</div>
                </td>
                <td className="py-2 pr-4">
                  <ul className="space-y-0.5">
                    {o.items.map((item) => (
                      <li key={item.productId} className="text-xs">
                        {item.quantity}× {item.title}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 pr-4">${o.total.toFixed(2)}</td>
                <td className="py-2 pr-4 capitalize">{o.status}</td>
                <td className="py-2 pr-4 whitespace-nowrap text-zinc-500">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
