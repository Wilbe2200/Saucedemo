import { Prisma } from "@prisma/client";

const MAX_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [300, 700, 1400];
const TRANSIENT_ERROR_CODES = new Set([
  "P1001",
  "P1002",
  "P1008",
  "P1017",
  "P2024",
  "10054",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
]);
const TRANSIENT_ERROR_MESSAGE =
  /connection reset|connection terminated|connection closed|server closed the connection|socket hang up|could not connect|can't reach database|connection timed out|timeout expired|ECONNRESET|ETIMEDOUT|10054/i;

function isTransientDatabaseError(error: unknown): boolean {
  const pending: unknown[] = [error];
  const visited = new Set<object>();

  while (pending.length > 0) {
    const current = pending.pop();
    if (typeof current !== "object" || current === null || visited.has(current)) continue;
    visited.add(current);

    if (current instanceof Prisma.PrismaClientInitializationError) {
      if (current.errorCode && TRANSIENT_ERROR_CODES.has(current.errorCode)) return true;
      if (TRANSIENT_ERROR_MESSAGE.test(current.message)) return true;
    }

    if (current instanceof Prisma.PrismaClientKnownRequestError) {
      if (TRANSIENT_ERROR_CODES.has(current.code)) return true;
      if (TRANSIENT_ERROR_MESSAGE.test(current.message)) return true;
    }

    if (current instanceof Error && TRANSIENT_ERROR_MESSAGE.test(current.message)) return true;

    const details = current as Record<string, unknown>;
    if (
      typeof details.code === "string" &&
      TRANSIENT_ERROR_CODES.has(details.code.toUpperCase())
    ) {
      return true;
    }
    if (
      typeof details.errorCode === "string" &&
      TRANSIENT_ERROR_CODES.has(details.errorCode.toUpperCase())
    ) {
      return true;
    }
    if (details.cause) pending.push(details.cause);
  }

  return false;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
): Promise<T> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const shouldRetry = attempt < MAX_ATTEMPTS && isTransientDatabaseError(error);
      if (!shouldRetry) throw error;

      const delay = RETRY_DELAYS_MS[attempt - 1];
      console.warn(
        `Transient PostgreSQL error during ${operationName}; retrying (${attempt + 1}/${MAX_ATTEMPTS}) in ${delay}ms.`,
      );
      await wait(delay);
    }
  }

  throw new Error(`PostgreSQL operation "${operationName}" exhausted its retry attempts.`);
}
