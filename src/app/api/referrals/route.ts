import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { attachStoreSession, getStoreSession } from "@/lib/store-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const session = getStoreSession(request);
  const code = `SAUCE-${createHash("sha256").update(session.ownerId).digest("hex").slice(0, 8).toUpperCase()}`;
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = configuredUrl ? new URL(configuredUrl).origin : new URL(request.url).origin;
  const referralUrl = new URL("/catalog", origin);
  referralUrl.searchParams.set("ref", code);

  return attachStoreSession(NextResponse.json({ code, url: referralUrl.toString() }), session);
}
