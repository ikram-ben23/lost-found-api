-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('LOST', 'FOUND');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('OPEN', 'RECOVERED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemReport" (
    "id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "itemDate" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'OPEN',
    "recoveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "ItemReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ItemReport_type_status_idx" ON "ItemReport"("type", "status");

-- CreateIndex
CREATE INDEX "ItemReport_category_idx" ON "ItemReport"("category");

-- CreateIndex
CREATE INDEX "ItemReport_location_idx" ON "ItemReport"("location");

-- CreateIndex
CREATE INDEX "ItemReport_itemDate_idx" ON "ItemReport"("itemDate");

-- CreateIndex
CREATE INDEX "ItemReport_ownerId_idx" ON "ItemReport"("ownerId");

-- AddForeignKey
ALTER TABLE "ItemReport" ADD CONSTRAINT "ItemReport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
