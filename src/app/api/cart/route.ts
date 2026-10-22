import { apiResponse } from "@/lib/api";
import { cartService } from "@/lib/services";
import { attachStoreSession, getStoreSession } from "@/lib/store-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const session = getStoreSession(request);
  return attachStoreSession(await apiResponse(() => cartService.get(session.ownerId)), session);
}

export async function POST(request: Request): Promise<Response> {
  const session = getStoreSession(request);
  return attachStoreSession(await apiResponse(async () => {
    const body: unknown = await request.json();
    const input = typeof body === "object" && body !== null && !Array.isArray(body)
      ? { ...body, cartId: session.ownerId }
      : body;
    return cartService.add(input);
  }, 201), session);
}

export async function DELETE(request: Request): Promise<Response> {
  const session = getStoreSession(request);
  return attachStoreSession(await apiResponse(() => cartService.clear(session.ownerId)), session);
}
