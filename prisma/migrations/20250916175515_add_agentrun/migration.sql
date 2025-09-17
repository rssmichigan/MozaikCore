-- CreateTable
CREATE TABLE "public"."AgentRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "goal" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);
