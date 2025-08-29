/*
  Warnings:

  - A unique constraint covering the columns `[userId,title]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Template_userId_title_key" ON "Template"("userId", "title");
