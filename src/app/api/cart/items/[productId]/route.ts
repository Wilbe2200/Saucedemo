import { apiResponse } from "@/lib/api";
import { cartService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ productId: string }> }): Promise<Response> {
  return apiResponse(async () => {
    const { productId } = await context.params;
    return cartService.setQuantity(productId, await request.json());
  });
}

export async function DELETE(request: Request, context: { params: Promise<{ productId: string }> }): Promise<Response> {
  const { productId } = await context.params;
  const url = new URL(request.url);
  return apiResponse(() => cartService.remove(url.searchParams.get("cartId") ?? "", productId));
}
