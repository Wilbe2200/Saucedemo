CREATE TABLE "love_notes" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "love_notes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "love_notes_request_id_key" ON "love_notes"("request_id");
CREATE INDEX "love_notes_created_at_idx" ON "love_notes"("created_at");
