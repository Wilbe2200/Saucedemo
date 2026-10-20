import { apiResponse } from "@/lib/api";
import { wishListService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, context: { params: Promise<{ productId: string }> }): Promise<Response> {
  const { productId } = await context.params;
  const sessionId = new URL(request.url).searchParams.get("sessionId") ?? "";
  return apiResponse(() => wishListService.remove({ sessionId, productId }));
}
