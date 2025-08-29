/*
  Warnings:

  - A unique constraint covering the columns `[tag]` on the table `TemplateTag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TemplateTag_tag_key" ON "TemplateTag"("tag");
