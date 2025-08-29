/*
  Warnings:

  - You are about to drop the column `errors` on the `CodeExecution` table. All the data in the column will be lost.
  - You are about to drop the column `input` on the `CodeExecution` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `CodeExecution` table. All the data in the column will be lost.
  - You are about to drop the column `warnings` on the `CodeExecution` table. All the data in the column will be lost.
  - Added the required column `stderr` to the `CodeExecution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stdout` to the `CodeExecution` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CodeExecution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stdin" TEXT,
    "compileStdout" TEXT,
    "compileStderr" TEXT,
    "stdout" TEXT NOT NULL,
    "stderr" TEXT NOT NULL,
    "executionTimeMs" INTEGER,
    "compilationTimeMs" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodeExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CodeExecution" ("code", "createdAt", "executionTimeMs", "id", "language", "status", "userId") SELECT "code", "createdAt", "executionTimeMs", "id", "language", "status", "userId" FROM "CodeExecution";
DROP TABLE "CodeExecution";
ALTER TABLE "new_CodeExecution" RENAME TO "CodeExecution";
CREATE INDEX "CodeExecution_createdAt_idx" ON "CodeExecution"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
