/*
  Warnings:

  - A unique constraint covering the columns `[userId,forkedFromId]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Template_userId_forkedFromId_key" ON "Template"("userId", "forkedFromId");
