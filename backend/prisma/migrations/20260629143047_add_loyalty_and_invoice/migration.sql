-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "subtotal" DECIMAL NOT NULL,
    "shippingFee" DECIMAL NOT NULL,
    "discountAmount" DECIMAL NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "couponId" TEXT,
    "deliveryAddress" JSONB NOT NULL,
    "deliveryLat" REAL NOT NULL,
    "deliveryLng" REAL NOT NULL,
    "note" TEXT,
    "cancelReason" TEXT,
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "pointsDiscount" DECIMAL NOT NULL DEFAULT 0,
    "requestInvoice" BOOLEAN NOT NULL DEFAULT false,
    "shipperId" TEXT,
    "paidAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_shipperId_fkey" FOREIGN KEY ("shipperId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("cancelReason", "couponId", "createdAt", "deliveredAt", "deliveryAddress", "deliveryLat", "deliveryLng", "discountAmount", "id", "note", "orderNumber", "paidAt", "paymentMethod", "paymentStatus", "shipperId", "shippingFee", "status", "subtotal", "totalAmount", "updatedAt", "userId") SELECT "cancelReason", "couponId", "createdAt", "deliveredAt", "deliveryAddress", "deliveryLat", "deliveryLng", "discountAmount", "id", "note", "orderNumber", "paidAt", "paymentMethod", "paymentStatus", "shipperId", "shippingFee", "status", "subtotal", "totalAmount", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
