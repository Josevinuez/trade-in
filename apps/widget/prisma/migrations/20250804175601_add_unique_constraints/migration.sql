/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `device_brands` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `device_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `device_conditions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `device_models` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `payment_methods` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "device_brands_name_key" ON "public"."device_brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "device_categories_name_key" ON "public"."device_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "device_conditions_name_key" ON "public"."device_conditions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "device_models_name_key" ON "public"."device_models"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_name_key" ON "public"."payment_methods"("name");
