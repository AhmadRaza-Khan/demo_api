import { NextResponse } from "next/server";

export type ResolveResult =
  | { ok: true; merchantId: string }
  | { ok: false; response: NextResponse };
