-- AlterTable
ALTER TABLE "public"."device_models" ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."device_storage_options" (
    "id" SERIAL NOT NULL,
    "model_id" INTEGER NOT NULL,
    "storage" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_storage_options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."device_storage_options" ADD CONSTRAINT "device_storage_options_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."device_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
