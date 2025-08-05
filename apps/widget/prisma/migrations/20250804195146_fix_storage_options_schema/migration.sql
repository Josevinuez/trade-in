/*
  Warnings:

  - You are about to drop the column `price` on the `device_storage_options` table. All the data in the column will be lost.
  - You are about to drop the `device_condition_pricing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."device_condition_pricing" DROP CONSTRAINT "device_condition_pricing_condition_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."device_condition_pricing" DROP CONSTRAINT "device_condition_pricing_model_id_fkey";

-- AlterTable
ALTER TABLE "public"."device_storage_options" DROP COLUMN "price";

-- DropTable
DROP TABLE "public"."device_condition_pricing";

-- CreateTable
CREATE TABLE "public"."storage_condition_pricing" (
    "id" SERIAL NOT NULL,
    "storage_option_id" INTEGER NOT NULL,
    "condition_id" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storage_condition_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "storage_condition_pricing_storage_option_id_condition_id_key" ON "public"."storage_condition_pricing"("storage_option_id", "condition_id");

-- AddForeignKey
ALTER TABLE "public"."storage_condition_pricing" ADD CONSTRAINT "storage_condition_pricing_storage_option_id_fkey" FOREIGN KEY ("storage_option_id") REFERENCES "public"."device_storage_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."storage_condition_pricing" ADD CONSTRAINT "storage_condition_pricing_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "public"."device_conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
