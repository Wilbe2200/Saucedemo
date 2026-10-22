import { NextResponse } from "next/server";
import { attachStoreSession, getStoreSession } from "@/lib/store-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const session = getStoreSession(request);
  return attachStoreSession(NextResponse.json({ ready: true }), session);
}
