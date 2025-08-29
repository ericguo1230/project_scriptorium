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
    "isCompiled" BOOLEAN NOT NULL DEFAULT false,
    "stdout" TEXT,
    "stderr" TEXT,
    "executionTimeMs" INTEGER,
    "compileTimeMs" INTEGER,
    "exitCode" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodeExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CodeExecution" ("code", "compileStderr", "compileStdout", "compileTimeMs", "createdAt", "executionTimeMs", "exitCode", "id", "language", "status", "stderr", "stdin", "stdout", "userId") SELECT "code", "compileStderr", "compileStdout", "compileTimeMs", "createdAt", "executionTimeMs", "exitCode", "id", "language", "status", "stderr", "stdin", "stdout", "userId" FROM "CodeExecution";
DROP TABLE "CodeExecution";
ALTER TABLE "new_CodeExecution" RENAME TO "CodeExecution";
CREATE INDEX "CodeExecution_createdAt_idx" ON "CodeExecution"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
