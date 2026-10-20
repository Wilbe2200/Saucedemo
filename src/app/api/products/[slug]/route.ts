import { apiResponse } from "@/lib/api";
import { productService } from "@/lib/services";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }): Promise<Response> {
  return apiResponse(async () => productService.getBySlug((await context.params).slug));
}
