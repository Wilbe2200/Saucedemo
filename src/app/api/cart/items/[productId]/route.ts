import { apiResponse } from "@/lib/api";
import { cartService } from "@/lib/services";
import { attachStoreSession, getStoreSession } from "@/lib/store-session";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ productId: string }> }): Promise<Response> {
  const session = getStoreSession(request);
  return attachStoreSession(await apiResponse(async () => {
    const { productId } = await context.params;
    const body: unknown = await request.json();
    const input = typeof body === "object" && body !== null && !Array.isArray(body)
      ? { ...body, cartId: session.ownerId }
      : body;
    return cartService.setQuantity(productId, input);
  }), session);
}

export async function DELETE(request: Request, context: { params: Promise<{ productId: string }> }): Promise<Response> {
  const session = getStoreSession(request);
  const { productId } = await context.params;
  return attachStoreSession(await apiResponse(() => cartService.remove(session.ownerId, productId)), session);
}
