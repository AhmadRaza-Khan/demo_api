import crypto from "crypto";

export const HMAC_TIMESTAMP_WINDOW_MS = 5 * 60 * 1000;

export function computeSignature(
  clientSecret: string,
  timestamp: string,
  method: string,
  path: string,
  body: string
) {
  const payload = `${timestamp}.${method.toUpperCase()}.${path}.${body}`;
  return crypto.createHmac("sha256", clientSecret).update(payload).digest("hex");
}

export function signaturesMatch(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
