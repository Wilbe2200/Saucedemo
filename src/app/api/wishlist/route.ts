import { apiResponse } from "@/lib/api";
import { wishListService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const sessionId = new URL(request.url).searchParams.get("sessionId") ?? "";
  return apiResponse(() => wishListService.get(sessionId));
}

export async function POST(request: Request): Promise<Response> {
  return apiResponse(async () => wishListService.add(await request.json()), 201);
}
