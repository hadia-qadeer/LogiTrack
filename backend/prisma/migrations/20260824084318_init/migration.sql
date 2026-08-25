/*
  Warnings:

  - You are about to drop the column `notes` on the `shipment` table. All the data in the column will be lost.
  - You are about to alter the column `value` on the `shipment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(65,30)`.
  - You are about to drop the column `updatedBy` on the `shipmenttracking` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `ShipmentTracking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `shipment` DROP FOREIGN KEY `Shipment_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `shipmenttracking` DROP FOREIGN KEY `ShipmentTracking_updatedBy_fkey`;

-- DropIndex
DROP INDEX `ShipmentTracking_updatedBy_idx` ON `shipmenttracking`;

-- AlterTable
ALTER TABLE `shipment` DROP COLUMN `notes`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `value` DECIMAL(65, 30) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    MODIFY `expectedDelivery` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `shipmenttracking` DROP COLUMN `updatedBy`,
    ADD COLUMN `updatedById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'MANAGER', 'DRIVER') NOT NULL DEFAULT 'MANAGER';

-- CreateIndex
CREATE INDEX `Shipment_createdAt_idx` ON `Shipment`(`createdAt`);

-- CreateIndex
CREATE INDEX `ShipmentTracking_updatedAt_idx` ON `ShipmentTracking`(`updatedAt`);

-- AddForeignKey
ALTER TABLE `Shipment` ADD CONSTRAINT `Shipment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentTracking` ADD CONSTRAINT `ShipmentTracking_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
