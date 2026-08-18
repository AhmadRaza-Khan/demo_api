import crypto from "crypto";

function randomToken(byteLength: number) {
  return crypto.randomBytes(byteLength).toString("hex");
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateMerchantCredentials(name: string) {
  const suffix = crypto.randomInt(1000, 9999);
  return {
    clientId: `mch_${randomToken(8)}`,
    clientSecret: `sk_${randomToken(24)}`,
    apiKey: `ak_${randomToken(24)}`,
    username: `${slugify(name) || "merchant"}-${suffix}`,
    password: crypto.randomBytes(9).toString("base64url"),
  };
}
