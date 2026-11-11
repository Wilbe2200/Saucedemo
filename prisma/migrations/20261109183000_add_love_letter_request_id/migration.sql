ALTER TABLE "love_letters" ADD COLUMN "request_id" TEXT;

UPDATE "love_letters"
SET "request_id" = "id"
WHERE "request_id" IS NULL;

ALTER TABLE "love_letters" ALTER COLUMN "request_id" SET NOT NULL;

CREATE UNIQUE INDEX "love_letters_request_id_key" ON "love_letters"("request_id");
