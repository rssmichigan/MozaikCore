-- CreateTable
CREATE TABLE "public"."RateBucket" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateBucket_pkey" PRIMARY KEY ("key","windowStart")
);
