/*
  Warnings:

  - You are about to drop the `storage_condition_pricing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."storage_condition_pricing" DROP CONSTRAINT "storage_condition_pricing_condition_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."storage_condition_pricing" DROP CONSTRAINT "storage_condition_pricing_storage_option_id_fkey";

-- AlterTable
ALTER TABLE "public"."device_storage_options" ADD COLUMN     "excellent_price" DECIMAL(10,2),
ADD COLUMN     "fair_price" DECIMAL(10,2),
ADD COLUMN     "good_price" DECIMAL(10,2),
ADD COLUMN     "poor_price" DECIMAL(10,2);

-- DropTable
DROP TABLE "public"."storage_condition_pricing";
