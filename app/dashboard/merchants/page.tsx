"use client";

import { useEffect, useState } from "react";

interface Merchant {
  _id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  apiKey: string;
  username: string;
  password: string;
  createdAt: string;
}

function CopyableCode({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="font-mono text-xs rounded bg-black/5 px-2 py-1 text-left hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
      title="Click to copy"
    >
      {copied ? "copied!" : value}
    </button>
  );
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMerchants() {
    setLoading(true);
    const res = await fetch("/api/admin/merchants");
    const data = await res.json();
    setMerchants(data.merchants ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;

    (async () => {
      const res = await fetch("/api/admin/merchants");
      const data = await res.json();
      if (!ignore) {
        setMerchants(data.merchants ?? []);
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);

    const res = await fetch("/api/admin/merchants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? "Failed to create merchant");
    } else {
      setName("");
      await loadMerchants();
    }
    setCreating(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Merchants</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Credentials are generated once and stay visible here permanently — this is a
          teaching sandbox, not a production credential store.
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="merchant-name" className="text-sm font-medium">
            New merchant name
          </label>
          <input
            id="merchant-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="rounded border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create merchant"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left dark:border-white/10">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Client ID</th>
              <th className="py-2 pr-4">Client Secret</th>
              <th className="py-2 pr-4">API Key</th>
              <th className="py-2 pr-4">Username</th>
              <th className="py-2 pr-4">Password</th>
              <th className="py-2 pr-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-4 text-zinc-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && merchants.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-zinc-500">
                  No merchants yet — create one above.
                </td>
              </tr>
            )}
            {merchants.map((m) => (
              <tr key={m._id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4 font-medium">{m.name}</td>
                <td className="py-2 pr-4">
                  <CopyableCode value={m.clientId} />
                </td>
                <td className="py-2 pr-4">
                  <CopyableCode value={m.clientSecret} />
                </td>
                <td className="py-2 pr-4">
                  <CopyableCode value={m.apiKey} />
                </td>
                <td className="py-2 pr-4">
                  <CopyableCode value={m.username} />
                </td>
                <td className="py-2 pr-4">
                  <CopyableCode value={m.password} />
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-zinc-500">
                  {new Date(m.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
