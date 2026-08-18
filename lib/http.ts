import { NextResponse } from "next/server";

export function apiError(
  status: number,
  error: string,
  message: string,
  details?: unknown
) {
  return NextResponse.json(
    { error, message, ...(details ? { details } : {}) },
    { status }
  );
}

export function apiSuccess<T extends object>(
  status: number,
  message: string,
  data?: T
) {
  return NextResponse.json({ message, ...(data ?? {}) }, { status });
}
