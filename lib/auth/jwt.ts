import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me";
export const ACCESS_TOKEN_TTL_SECONDS = 5 * 60;

export interface AccessTokenPayload {
  merchantId: string;
  clientId: string;
}

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
}

export type VerifyResult =
  | { ok: true; payload: AccessTokenPayload }
  | { ok: false; reason: "expired" | "invalid" };

export function verifyAccessToken(token: string): VerifyResult {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload & jwt.JwtPayload;
    return { ok: true, payload };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return { ok: false, reason: "expired" };
    }
    return { ok: false, reason: "invalid" };
  }
}
