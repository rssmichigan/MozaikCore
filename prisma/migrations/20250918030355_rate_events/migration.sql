-- CreateTable
CREATE TABLE "public"."RateEvent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateEvent_key_createdAt_idx" ON "public"."RateEvent"("key", "createdAt");
