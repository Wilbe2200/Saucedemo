import { test, expect } from "@playwright/test";
import { Prisma } from "@prisma/client";
import { withPrismaRetry } from "@/lib/prisma-retry";

test("Megan's page opens letters, plays Milo J, calculates capybaras, and saves to PostgreSQL", async ({ page }) => {
  test.setTimeout(60_000);
  const savedLetters: {
    id: string;
    requestId: string;
    title: string;
    preview: string;
    message: string;
    date: string;
  }[] = [];
  const savedNotes: { id: string; requestId: string; message: string; date: string }[] = [];
  let submittedLetter: { requestId: string; title: string; message: string } | null = null;
  await page.route("**/api/love-notes", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { notes: savedNotes } });
      return;
    }

    const body = route.request().postDataJSON() as { requestId: string; message: string };
    let note = savedNotes.find((saved) => saved.requestId === body.requestId);
    if (!note) {
      note = {
        id: "note-test-1",
        requestId: body.requestId,
        message: body.message,
        date: "2026-11-09T06:00:00.000Z",
      };
      savedNotes.push(note);
    }
    await route.fulfill({ status: 200, json: { note } });
  });
  await page.route("**/api/love-letters", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { letters: savedLetters.map(({ requestId: _requestId, ...letter }) => letter) } });
      return;
    }

    const body = route.request().postDataJSON() as { requestId: string; title: string; message: string };
    submittedLetter = body;
    let letter = savedLetters.find((saved) => saved.requestId === body.requestId);
    if (!letter) {
      letter = {
        id: "letter-test-1",
        requestId: body.requestId,
        title: body.title,
        preview: body.message,
        message: body.message,
        date: "2026-11-09T06:00:00.000Z",
      };
      savedLetters.push(letter);
    }
    const { requestId: _requestId, ...responseLetter } = letter;
    await route.fulfill({ status: 200, json: { letter: responseLetter } });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Hola, Megan/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /abrir sobre/i })).toHaveCount(4);
  await expect(page.getByRole("img", { name: /capibara cupido/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /abrazando una rosa/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /Para Megan, mi novia hermosa/i })).toBeVisible();
  const cupidCapybara = page.getByRole("button", { name: /Capibara cupido/i });
  await cupidCapybara.click();
  await expect(cupidCapybara.locator(".love-capybara-burst")).toBeVisible();
  const musicPlayer = page.getByTitle("Milo J - Rara Vez (reproductor oficial de YouTube)");
  await expect(musicPlayer).toBeVisible();
  await expect(musicPlayer).toHaveAttribute("src", /loop=1.*playlist=aBSkvI0CkgU.*playsinline=1/);
  await expect(page.getByRole("button", { name: "Pausar música de Milo J" })).toContainText("Música activada");
  await page.locator(".love-letters-section").click({ position: { x: 20, y: 20 } });
  await expect(musicPlayer).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Pausar música de Milo J" })).toContainText("Música activada");
  await page.getByRole("button", { name: "Pausar música de Milo J" }).click();
  await expect(musicPlayer).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reproducir música de Milo J" })).toContainText("Silencio");

  const databaseButton = page.getByRole("button", { name: /Neon PostgreSQL: conectada/ });
  await expect(databaseButton).toBeVisible();
  await page.getByRole("button", { name: "Reproducir música de Milo J" }).click();
  await expect(musicPlayer).toBeVisible();
  await expect(musicPlayer).toHaveAttribute("src", /loop=1.*playlist=aBSkvI0CkgU.*playsinline=1/);
  await page.getByRole("button", { name: "Pausar música de Milo J" }).click();
  await expect(musicPlayer).toHaveCount(0);

  await page.getByRole("button", { name: /abrir sobre/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("slider", { name: /Estatura de Megan/ }).fill("175");
  await expect(page.locator(".love-calculation-result > strong")).toHaveText("3.6 capibaras");

  await databaseButton.click();
  await expect(page.getByRole("dialog")).toContainText("Escríbele algo bonito");
  await page.getByLabel("Título de la cartita").fill("Un abrazo para hoy");
  await page.getByLabel("Tu mensaje para Megan").fill("Eres mi alegría, Megan");
  await page.getByRole("button", { name: "Guardar cartita" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Un abrazo para hoy/ })).toBeVisible();
  expect(savedLetters).toHaveLength(1);
  expect(submittedLetter).not.toBeNull();
  const repeatedResponse = await page.evaluate(async (body) => {
    const response = await fetch("/api/love-letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  }, submittedLetter);
  expect(repeatedResponse.letter.id).toBe("letter-test-1");
  expect(savedLetters).toHaveLength(1);

  await page.reload();
  await expect(page.getByRole("button", { name: /Un abrazo para hoy/ })).toBeVisible();
  await page.getByRole("button", { name: /Un abrazo para hoy/ }).click();
  await expect(page.getByRole("dialog", { name: "Un abrazo para hoy" })).toContainText("Eres mi alegría, Megan");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByLabel("¿Qué te gustaría dejarle a Megan?").fill("Te amo, mi vida");
  await page.getByRole("button", { name: "Guardar notita" }).click();
  await expect(page.getByText("Te amo, mi vida")).toBeVisible();
  expect(savedNotes).toHaveLength(1);
  await page.reload();
  await expect(page.getByText("Te amo, mi vida")).toBeVisible();
});

test("Megan's page fits a mobile viewport without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(390);
  await expect(page.getByRole("button", { name: /abrir sobre/i }).first()).toBeVisible();
});

test("music starts on the first mobile interaction and the header keeps it under control", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/love-letters", (route) => route.fulfill({ json: { letters: [] } }));
  await page.route("**/api/love-notes", (route) => route.fulfill({ json: { notes: [] } }));
  await page.goto("/");

  const musicButton = page.getByRole("button", { name: "Reproducir música de Milo J" });
  await expect(musicButton).toContainText("Silencio");
  await musicButton.click();

  const musicPlayer = page.getByTitle("Milo J - Rara Vez (reproductor oficial de YouTube)");
  await expect(musicPlayer).toBeVisible();
  await expect(musicPlayer).toHaveAttribute("src", /autoplay=1&loop=1&playlist=aBSkvI0CkgU.*playsinline=1/);
  await expect(page.getByRole("button", { name: "Pausar música de Milo J" })).toContainText("Música activada");
  await expect(page.getByRole("button", { name: "Pausar música de Milo J" })).toHaveAttribute("aria-pressed", "true");

  await page.locator(".love-letters-section").click({ position: { x: 20, y: 20 } });
  await expect(musicPlayer).toHaveCount(1);
  await page.getByRole("button", { name: "Pausar música de Milo J" }).click();
  await expect(musicPlayer).toHaveCount(0);
  await expect(musicButton).toContainText("Silencio");
  await expect(musicButton).toHaveAttribute("aria-pressed", "false");
});

test("Neon status reflects the configured PostgreSQL connection", async ({ page }) => {
  test.setTimeout(60_000);
  await page.route("**/api/love-letters", async (route) => {
    await route.fulfill({ json: { letters: [] } });
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Neon PostgreSQL: conectada/ })).toBeVisible({
    timeout: 5_000,
  });
});

test("notes and letters preserve form data and idempotency when Neon retries are needed", async ({ page }) => {
  const letterRequestIds: string[] = [];
  const noteRequestIds: string[] = [];
  let letterSaveAttempts = 0;
  let noteSaveAttempts = 0;
  const savedNotes: { id: string; requestId: string; message: string; date: string }[] = [];
  await page.route("**/api/love-notes", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { notes: savedNotes } });
      return;
    }
    const body = route.request().postDataJSON() as { requestId: string; message: string };
    noteRequestIds.push(body.requestId);
    noteSaveAttempts += 1;
    if (noteSaveAttempts === 1) {
      await route.fulfill({ status: 503, json: { error: "Neon está despertando." } });
      return;
    }
    const note = {
      id: "note-retried",
      requestId: body.requestId,
      message: body.message,
      date: "2026-11-09T06:00:00.000Z",
    };
    savedNotes.push(note);
    await route.fulfill({ status: 200, json: { note } });
  });
  await page.route("**/api/love-letters", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { letters: [] } });
      return;
    }

    const body = route.request().postDataJSON() as { requestId: string; title: string; message: string };
    letterRequestIds.push(body.requestId);
    letterSaveAttempts += 1;
    if (letterSaveAttempts === 1) {
      await route.fulfill({
        status: 503,
        json: { error: "No se pudo guardar la cartita en PostgreSQL." },
      });
      return;
    }

    await route.fulfill({
      status: 200,
      json: {
        letter: {
          id: "letter-retried",
          title: body.title,
          preview: body.message,
          message: body.message,
          date: "2026-11-09T06:00:00.000Z",
        },
      },
    });
  });

  await page.goto("/");
  await page.getByLabel("¿Qué te gustaría dejarle a Megan?").fill("Un abrazo para hoy");
  await page.getByRole("button", { name: "Guardar notita" }).click();
  await expect(page.locator(".love-note-form .love-storage-error")).toHaveText("Neon está despertando.");
  await expect(page.getByLabel("¿Qué te gustaría dejarle a Megan?")).toHaveValue("Un abrazo para hoy");
  await page.getByRole("button", { name: "Guardar notita" }).click();
  await expect(page.getByText("Un abrazo para hoy")).toBeVisible();
  expect(noteRequestIds).toHaveLength(2);
  expect(noteRequestIds[0]).toBe(noteRequestIds[1]);

  await page.getByRole("button", { name: /Neon PostgreSQL: conectada/i }).click();
  await page.getByLabel("Título de la cartita").fill("Un mensaje especial");
  await page.getByLabel("Tu mensaje para Megan").fill("Siempre estoy contigo.");
  await page.getByRole("button", { name: "Guardar cartita" }).click();
  await expect(page.locator(".love-compose-form .love-storage-error")).toHaveText(
    "No se pudo guardar la cartita en PostgreSQL.",
  );
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Guardar cartita" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(letterRequestIds).toHaveLength(2);
  expect(letterRequestIds[0]).toBe(letterRequestIds[1]);
  await expect(page.getByRole("button", { name: /Un mensaje especial/ })).toBeVisible();
  expect(savedNotes).toHaveLength(1);
});

test("transient Neon connection errors are retried", async () => {
  let attempts = 0;
  const result = await withPrismaRetry(async () => {
    attempts += 1;
    if (attempts < 3) {
      throw new Prisma.PrismaClientInitializationError(
        "Can't reach database server; connection reset by peer",
        "test",
        "P1001",
      );
    }
    return "connected";
  }, "retry test");

  expect(result).toBe("connected");
  expect(attempts).toBe(3);
});

test("non-transient database errors are not retried", async () => {
  let attempts = 0;
  await expect(
    withPrismaRetry(async () => {
      attempts += 1;
      throw new Error("Invalid input");
    }, "validation test"),
  ).rejects.toThrow("Invalid input");

  expect(attempts).toBe(1);
});
