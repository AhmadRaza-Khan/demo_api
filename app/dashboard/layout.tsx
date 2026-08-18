import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard/merchants", label: "Merchants" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/products", label: "Products & Inventory" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-4">
          <span className="text-lg font-semibold">Demo API Dashboard</span>
          <nav className="flex gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
