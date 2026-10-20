import { NextResponse } from "next/server";
import { ApplicationError } from "@/domain/errors";

/** Convierte errores conocidos y fallos inesperados a una respuesta JSON uniforme. */
export async function apiResponse<T>(operation: () => Promise<T>, status = 200): Promise<NextResponse> {
  try {
    return NextResponse.json(await operation(), { status });
  } catch (error: unknown) {
    if (error instanceof ApplicationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    console.error("Unexpected API error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
