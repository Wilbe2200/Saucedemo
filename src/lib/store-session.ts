import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "sauce-store-session";
const GUEST_SESSION_AGE = 60 * 60 * 24 * 365;
const USER_SESSION_AGE = 60 * 60 * 24 * 30;

interface SessionPayload {
  guestId?: string;
  userId?: string;
  expiresAt: number;
}

export interface StoreSession {
  ownerId: string;
  cookie?: string;
}

function signingSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (secret) throw new Error("AUTH_SECRET must be at least 32 characters long.");
  if (process.env.NODE_ENV !== "production") return "sauce-demo-local-development-secret";
  throw new Error("AUTH_SECRET must be configured in production.");
}

function sign(value: string): string {
  return createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

function serializeSession(payload: SessionPayload, maxAge: number): string {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${value}.${sign(value)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function readPayload(request: Request): SessionPayload | null {
  const cookies = request.headers.get("cookie") ?? "";
  const token = cookies.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return null;

  const [value, signature] = token.split(".");
  if (!value || !signature) return null;

  try {
    const expected = Buffer.from(sign(value));
    const supplied = Buffer.from(signature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload;
    if (payload.expiresAt <= Date.now()) return null;
    if (payload.userId && typeof payload.userId === "string") return payload;
    if (payload.guestId && typeof payload.guestId === "string") return payload;
  } catch {
    return null;
  }
  return null;
}

export function getStoreSession(request: Request): StoreSession {
  const payload = readPayload(request);
  if (payload?.userId) return { ownerId: `user:${payload.userId}` };
  if (payload?.guestId) return { ownerId: `guest:${payload.guestId}` };

  const guestId = randomUUID();
  return {
    ownerId: `guest:${guestId}`,
    cookie: serializeSession(
      { guestId, expiresAt: Date.now() + GUEST_SESSION_AGE * 1000 },
      GUEST_SESSION_AGE,
    ),
  };
}

export function setUserSession(response: Response, userId: string): Response {
  const cookie = serializeSession(
    { userId, expiresAt: Date.now() + USER_SESSION_AGE * 1000 },
    USER_SESSION_AGE,
  );
  response.headers.append("Set-Cookie", cookie);
  return response;
}

export function attachStoreSession(response: Response, session: StoreSession): Response {
  if (session.cookie) response.headers.append("Set-Cookie", session.cookie);
  return response;
}
