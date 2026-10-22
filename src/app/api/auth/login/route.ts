import { apiResponse } from "@/lib/api";
import { authService, cartService, wishListService } from "@/lib/services";
import { getStoreSession, setUserSession } from "@/lib/store-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const previousSession = getStoreSession(request);
  const response = await apiResponse(async () => {
    const user = await authService.login(await request.json());
    if (previousSession.ownerId.startsWith("guest:")) {
      const accountOwner = `user:${user.id}`;
      await Promise.all([
        cartService.merge(previousSession.ownerId, accountOwner),
        wishListService.merge(previousSession.ownerId, accountOwner),
      ]);
    }
    return user;
  });
  if (!response.ok) return response;
  const user = await response.clone().json() as { id: string };
  return setUserSession(response, user.id);
}
