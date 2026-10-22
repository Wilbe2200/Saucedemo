import { apiResponse } from "@/lib/api";
import { wishListService } from "@/lib/services";
import { attachStoreSession, getStoreSession } from "@/lib/store-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const session = getStoreSession(request);
  return attachStoreSession(await apiResponse(() => wishListService.get(session.ownerId)), session);
}

export async function POST(request: Request): Promise<Response> {
  const session = getStoreSession(request);
  return attachStoreSession(await apiResponse(async () => {
    const body: unknown = await request.json();
    const input = typeof body === "object" && body !== null && !Array.isArray(body)
      ? { ...body, sessionId: session.ownerId }
      : body;
    return wishListService.add(input);
  }, 201), session);
}
