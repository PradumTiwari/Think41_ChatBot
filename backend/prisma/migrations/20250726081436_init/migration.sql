-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "street_address" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "traffic_source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionCenter" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DistributionCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "retail_price" DOUBLE PRECISION NOT NULL,
    "department" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "distribution_center_id" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "sold_at" TIMESTAMP(3),
    "cost" DOUBLE PRECISION NOT NULL,
    "product_category" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_brand" TEXT NOT NULL,
    "product_retail_price" DOUBLE PRECISION NOT NULL,
    "product_department" TEXT NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_distribution_center_id" INTEGER NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "order_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "returned_at" TIMESTAMP(3),
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "num_of_item" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "inventory_item_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "returned_at" TIMESTAMP(3),

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_distribution_center_id_fkey" FOREIGN KEY ("distribution_center_id") REFERENCES "DistributionCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
