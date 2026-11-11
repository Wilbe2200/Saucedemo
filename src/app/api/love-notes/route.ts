import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withPrismaRetry } from "@/lib/prisma-retry";

export const dynamic = "force-dynamic";

const createNoteSchema = z.object({
  requestId: z.string().uuid(),
  message: z.string().trim().min(1).max(500),
});

function serializeNote(note: {
  id: string;
  requestId: string;
  message: string;
  createdAt: Date;
}) {
  return {
    id: note.id,
    requestId: note.requestId,
    message: note.message,
    date: note.createdAt.toISOString(),
  };
}

export async function GET(): Promise<Response> {
  try {
    const notes = await withPrismaRetry(
      () => prisma.loveNote.findMany({ orderBy: { createdAt: "desc" } }),
      "list love notes",
    );
    return NextResponse.json({ notes: notes.map(serializeNote) });
  } catch (error) {
    console.error("Could not load Megan's love notes from PostgreSQL.", error);
    return NextResponse.json(
      {
        error:
          "Neon está despertando. Las notas no se pudieron cargar; inténtalo de nuevo en unos segundos.",
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
    return NextResponse.json(
      { error: "El cuerpo de la solicitud debe ser JSON válido." },
      { status: 400 },
    );
  }

  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La notita debe tener un identificador válido y hasta 500 caracteres." },
      { status: 400 },
    );
  }

  try {
    const note = await withPrismaRetry(
      () =>
        prisma.loveNote.upsert({
          where: { requestId: parsed.data.requestId },
          create: {
            requestId: parsed.data.requestId,
            message: parsed.data.message,
          },
          update: {},
        }),
      "save love note",
    );
    return NextResponse.json({ note: serializeNote(note) }, { status: 200 });
  } catch (error) {
    console.error("Could not save Megan's love note to PostgreSQL.", error);
    return NextResponse.json(
      {
        error:
          "Neon está tardando más de lo esperado y la notita no se guardó. Puedes volver a intentarlo sin perderla.",
      },
      { status: 503, headers: { "Retry-After": "3" } },
    );
  }
}
