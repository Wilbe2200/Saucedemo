CREATE TABLE "love_letters" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "love_letters_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "love_letters_created_at_idx" ON "love_letters"("created_at");
