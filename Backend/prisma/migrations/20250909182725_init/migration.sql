/*
  Warnings:

  - A unique constraint covering the columns `[name,universityId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Department_name_universityId_key" ON "public"."Department"("name", "universityId");
