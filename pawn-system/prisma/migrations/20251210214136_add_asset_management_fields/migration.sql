/*
  Warnings:

  - The `category` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[ticketRef]` on the table `Loan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nationalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('JEWELRY', 'ELECTRONICS', 'VEHICLE', 'COLLECTIBLE', 'FURNITURE', 'OTHER');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('NEW', 'LIKE_NEW', 'USED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "ValuationStatus" AS ENUM ('PENDING', 'PENDING_MARKET_EVAL', 'MARKET_EVAL_COMPLETE', 'PENDING_FINAL_OFFER', 'OFFER_ACCEPTED', 'REJECTED');

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "chassisNumber" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "condition" "ItemCondition" NOT NULL DEFAULT 'USED',
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "engineNumber" TEXT,
ADD COLUMN     "finalValuation" DECIMAL(65,30),
ADD COLUMN     "marketValue" DECIMAL(65,30),
ADD COLUMN     "mileage" INTEGER,
ADD COLUMN     "provenance" TEXT,
ADD COLUMN     "purity" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "userEstimatedValue" DECIMAL(65,30),
ADD COLUMN     "valuationStatus" "ValuationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "vin" TEXT,
ADD COLUMN     "weight" DECIMAL(65,30),
ADD COLUMN     "yearOfPurchase" INTEGER,
DROP COLUMN "category",
ADD COLUMN     "category" "AssetType" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "ticketRef" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "nationalId" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "permissions" SET NOT NULL,
ALTER COLUMN "permissions" SET DEFAULT '',
ALTER COLUMN "permissions" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Loan_ticketRef_key" ON "Loan"("ticketRef");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_nationalId_key" ON "User"("nationalId");
