-- CreateTable
CREATE TABLE "CodeExecution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "input" TEXT,
    "output" TEXT,
    "errors" TEXT,
    "warnings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executionTimeMs" INTEGER,
    "status" TEXT NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "CodeExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CodeExecution_createdAt_idx" ON "CodeExecution"("createdAt");
