import { apiResponse } from "@/lib/api";
import { productService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return apiResponse(() => productService.list());
}
