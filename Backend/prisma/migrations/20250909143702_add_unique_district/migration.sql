/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `District` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,provinceId]` on the table `District` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "public"."District"("name");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_provinceId_key" ON "public"."District"("name", "provinceId");
