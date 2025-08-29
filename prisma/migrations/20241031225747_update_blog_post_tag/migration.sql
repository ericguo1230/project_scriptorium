/*
  Warnings:

  - You are about to drop the column `blogPostId` on the `BlogPostTag` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_BlogPostToBlogPostTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BlogPostToBlogPostTag_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlogPostToBlogPostTag_B_fkey" FOREIGN KEY ("B") REFERENCES "BlogPostTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPostTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT NOT NULL
);
INSERT INTO "new_BlogPostTag" ("id", "tag") SELECT "id", "tag" FROM "BlogPostTag";
DROP TABLE "BlogPostTag";
ALTER TABLE "new_BlogPostTag" RENAME TO "BlogPostTag";
CREATE UNIQUE INDEX "BlogPostTag_tag_key" ON "BlogPostTag"("tag");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_BlogPostToBlogPostTag_AB_unique" ON "_BlogPostToBlogPostTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogPostToBlogPostTag_B_index" ON "_BlogPostToBlogPostTag"("B");
