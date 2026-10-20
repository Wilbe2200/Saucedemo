import { apiResponse } from "@/lib/api";
import { cartService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const cartId = new URL(request.url).searchParams.get("cartId") ?? "";
  return apiResponse(() => cartService.get(cartId));
}

export async function POST(request: Request): Promise<Response> {
  return apiResponse(async () => cartService.add(await request.json()), 201);
}
