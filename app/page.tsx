import Link from "next/link";

const VERSIONS = [
  { v: "v1", scheme: "No auth", detail: "merchantId passed directly in the order body" },
  { v: "v2", scheme: "Bearer JWT", detail: "POST /api/v2/auth issues a 5-minute token" },
  { v: "v3", scheme: "Client credential headers", detail: "X-Client-Id / X-Client-Secret, or HTTP Basic auth" },
  { v: "v4", scheme: "API key", detail: "single X-Api-Key header" },
  { v: "v5", scheme: "OAuth2 client_credentials", detail: "5-min access token + 7-day refresh token" },
  { v: "v6", scheme: "HMAC request signing", detail: "X-Client-Id / X-Timestamp / X-Signature" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">API Auth Teaching Demo</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Same products/inventory/order API, exposed six times over — one auth scheme per
          version — so you can compare how each one actually works.
        </p>

        <ul className="mt-8 flex flex-col divide-y divide-black/10 rounded border border-black/10 dark:divide-white/10 dark:border-white/10">
          {VERSIONS.map((item) => (
            <li key={item.v} className="flex items-baseline gap-4 px-4 py-3">
              <span className="w-8 shrink-0 font-mono text-sm font-semibold">{item.v}</span>
              <div>
                <div className="text-sm font-medium">{item.scheme}</div>
                <div className="text-xs text-zinc-500">{item.detail}</div>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
        >
          Open dashboard
        </Link>
      </div>
    </div>
  );
}
