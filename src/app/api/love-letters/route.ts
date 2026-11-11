import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withPrismaRetry } from "@/lib/prisma-retry";

export const dynamic = "force-dynamic";

const createLetterSchema = z.object({
  requestId: z.string().uuid(),
  title: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(1000),
});

function serializeLetter(letter: {
  id: string;
  title: string;
  preview: string;
  message: string;
  createdAt: Date;
}) {
  return {
    id: letter.id,
    title: letter.title,
    preview: letter.preview,
    message: letter.message,
    date: letter.createdAt.toISOString(),
  };
}

export async function GET(): Promise<Response> {
  try {
    const letters = await withPrismaRetry(
      () => prisma.loveLetter.findMany({ orderBy: { createdAt: "asc" } }),
      "list love letters",
    );
    return NextResponse.json({ letters: letters.map(serializeLetter) });
  } catch (error) {
    console.error("Could not load Megan's love letters from PostgreSQL.", error);
    return NextResponse.json(
      {
        error:
          "Neon está despertando o no responde por el momento. Tus cartitas iniciales siguen disponibles; inténtalo de nuevo en unos segundos.",
      },
      { status: 503, headers: { "Retry-After": "3" } },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 });
  }

  const parsed = createLetterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La cartita necesita un título (máximo 80 caracteres) y un mensaje (máximo 1000)." },
      { status: 400 },
    );
  }

  const title = parsed.data.title;
  const message = parsed.data.message;
  const requestId = parsed.data.requestId;
  try {
    const letter = await withPrismaRetry(
      () =>
        prisma.loveLetter.upsert({
          where: { requestId },
          create: {
            requestId,
            title,
            message,
            preview: message.length > 72 ? `${message.slice(0, 69).trimEnd()}…` : message,
          },
          update: {},
        }),
      "save love letter",
    );
    return NextResponse.json({ letter: serializeLetter(letter) }, { status: 200 });
  } catch (error) {
    console.error("Could not save Megan's love letter to PostgreSQL.", error);
    return NextResponse.json(
      {
        error:
          "Neon está tardando más de lo esperado y la cartita no se guardó. No cierres el formulario; inténtalo de nuevo en unos segundos.",
      },
      { status: 503, headers: { "Retry-After": "3" } },
    );
  }
}
