-- AlterTable
ALTER TABLE "public"."device_models" ADD COLUMN     "image_url" TEXT;

-- CreateTable
CREATE TABLE "public"."device_condition_pricing" (
    "id" SERIAL NOT NULL,
    "model_id" INTEGER NOT NULL,
    "condition_id" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_condition_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_condition_pricing_model_id_condition_id_key" ON "public"."device_condition_pricing"("model_id", "condition_id");

-- AddForeignKey
ALTER TABLE "public"."device_condition_pricing" ADD CONSTRAINT "device_condition_pricing_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."device_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_condition_pricing" ADD CONSTRAINT "device_condition_pricing_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "public"."device_conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
