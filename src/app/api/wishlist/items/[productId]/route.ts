import { apiResponse } from "@/lib/api";
import { wishListService } from "@/lib/services";
import { attachStoreSession, getStoreSession } from "@/lib/store-session";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, context: { params: Promise<{ productId: string }> }): Promise<Response> {
  const session = getStoreSession(request);
  const { productId } = await context.params;
  return attachStoreSession(await apiResponse(() => wishListService.remove({
    sessionId: session.ownerId,
    productId,
  })), session);
}
