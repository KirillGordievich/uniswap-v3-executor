-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('SUBMITTED', 'DELAYED', 'EXPIRED', 'CANCELED', 'PARTIALLY_FILLED', 'FILLED');

-- CreateTable
CREATE TABLE "token" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" BYTEA NOT NULL,
    "decimals" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pool" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" BYTEA NOT NULL,
    "token0_id" UUID NOT NULL,
    "token1_id" UUID NOT NULL,
    "fee" DECIMAL NOT NULL,
    "enabled" BOOLEAN NOT NULL,

    CONSTRAINT "pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token_sell_id" UUID NOT NULL,
    "token_buy_id" UUID NOT NULL,
    "quantity_sell_ordered" DECIMAL NOT NULL,
    "quantity_buy_ordered" DECIMAL NOT NULL,
    "deadline" TIMESTAMPTZ NOT NULL,
    "description" TEXT NOT NULL,
    "authorized" BOOLEAN NOT NULL,
    "finalized" BOOLEAN NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "quantity_sell_traded" DECIMAL NOT NULL,
    "quantity_buy_traded" DECIMAL NOT NULL,
    "quantity_fee_traded" DECIMAL NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from_address" BYTEA NOT NULL,
    "to_address" BYTEA NOT NULL,
    "nonce" DECIMAL NOT NULL,
    "value" DECIMAL NOT NULL,
    "data" BYTEA NOT NULL,
    "payload" TEXT NOT NULL,
    "gas_limit" DECIMAL NOT NULL,
    "max_priority_fee_per_gas" DECIMAL NOT NULL,
    "max_fee_per_gas" DECIMAL NOT NULL,
    "hash" BYTEA NOT NULL,
    "confirmed" BOOLEAN NOT NULL,
    "fee" DECIMAL NOT NULL,
    "successful" BOOLEAN NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_transaction" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,

    CONSTRAINT "order_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_transaction" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,

    CONSTRAINT "transfer_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_address_key" ON "token"("address");

-- CreateIndex
CREATE UNIQUE INDEX "pool_address_key" ON "pool"("address");

-- CreateIndex
CREATE UNIQUE INDEX "pool_token0_id_token1_id_fee_key" ON "pool"("token0_id", "token1_id", "fee");

-- CreateIndex
CREATE INDEX "order_token_sell_id_token_buy_id_idx" ON "order"("token_sell_id", "token_buy_id");

-- CreateIndex
CREATE INDEX "order_updated_at_status_idx" ON "order"("updated_at" DESC, "status");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_hash_key" ON "transaction"("hash");

-- CreateIndex
CREATE INDEX "transaction_created_at_idx" ON "transaction"("created_at" DESC);

-- CreateIndex
CREATE INDEX "transaction_from_address_nonce_confirmed_idx" ON "transaction"("from_address", "nonce" DESC, "confirmed");

-- CreateIndex
CREATE INDEX "order_transaction_order_id_idx" ON "order_transaction"("order_id");

-- CreateIndex
CREATE INDEX "transfer_transaction_order_id_idx" ON "transfer_transaction"("order_id");

-- AddForeignKey
ALTER TABLE "pool" ADD CONSTRAINT "pool_token0_id_fkey" FOREIGN KEY ("token0_id") REFERENCES "token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool" ADD CONSTRAINT "pool_token1_id_fkey" FOREIGN KEY ("token1_id") REFERENCES "token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_token_sell_id_fkey" FOREIGN KEY ("token_sell_id") REFERENCES "token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_token_buy_id_fkey" FOREIGN KEY ("token_buy_id") REFERENCES "token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_transaction" ADD CONSTRAINT "order_transaction_id_fkey" FOREIGN KEY ("id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_transaction" ADD CONSTRAINT "order_transaction_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_transaction" ADD CONSTRAINT "transfer_transaction_id_fkey" FOREIGN KEY ("id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_transaction" ADD CONSTRAINT "transfer_transaction_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
