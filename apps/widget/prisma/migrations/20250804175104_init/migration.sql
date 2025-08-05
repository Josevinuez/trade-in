-- CreateEnum
CREATE TYPE "public"."StaffRole" AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR', 'INSPECTOR');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('EMAIL', 'SMS', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."AddressType" AS ENUM ('SHIPPING', 'BILLING');

-- CreateTable
CREATE TABLE "public"."staff" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "public"."StaffRole" NOT NULL DEFAULT 'OPERATOR',
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postal_code" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Canada',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auth_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_type" "public"."UserType" NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_brands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_models" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "model_number" TEXT,
    "releaseYear" INTEGER,
    "base_price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_conditions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trade_in_orders" (
    "id" SERIAL NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "device_model_id" INTEGER NOT NULL,
    "device_condition_id" INTEGER NOT NULL,
    "quoted_amount" DECIMAL(10,2) NOT NULL,
    "final_amount" DECIMAL(10,2),
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_in_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_status_history" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "status" "public"."OrderStatus" NOT NULL,
    "notes" TEXT,
    "updated_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shipping_labels" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "label_url" TEXT,
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shipping_addresses" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "address_type" "public"."AddressType" NOT NULL DEFAULT 'SHIPPING',
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Canada',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_methods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "transaction_id" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_messages" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "message_type" "public"."MessageType" NOT NULL,
    "status" "public"."MessageStatus" NOT NULL DEFAULT 'SENT',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_statistics" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "completed_orders" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "average_order_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "public"."staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "public"."customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_token_key" ON "public"."auth_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "trade_in_orders_order_number_key" ON "public"."trade_in_orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_labels_tracking_number_key" ON "public"."shipping_labels"("tracking_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "public"."payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_statistics_date_key" ON "public"."daily_statistics"("date");

-- AddForeignKey
ALTER TABLE "public"."device_models" ADD CONSTRAINT "device_models_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."device_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_models" ADD CONSTRAINT "device_models_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."device_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_in_orders" ADD CONSTRAINT "trade_in_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_in_orders" ADD CONSTRAINT "trade_in_orders_device_model_id_fkey" FOREIGN KEY ("device_model_id") REFERENCES "public"."device_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_in_orders" ADD CONSTRAINT "trade_in_orders_device_condition_id_fkey" FOREIGN KEY ("device_condition_id") REFERENCES "public"."device_conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."trade_in_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_status_history" ADD CONSTRAINT "order_status_history_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipping_labels" ADD CONSTRAINT "shipping_labels_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."trade_in_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipping_addresses" ADD CONSTRAINT "shipping_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."trade_in_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_messages" ADD CONSTRAINT "customer_messages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_messages" ADD CONSTRAINT "customer_messages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."trade_in_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
