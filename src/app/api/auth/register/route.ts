import { apiResponse } from "@/lib/api";
import { authService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return apiResponse(async () => authService.register(await request.json()), 201);
}
