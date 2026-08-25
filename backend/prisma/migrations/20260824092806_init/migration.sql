/*
  Warnings:

  - You are about to alter the column `value` on the `shipment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `shipment` MODIFY `fromCity` VARCHAR(255) NOT NULL,
    MODIFY `toCity` VARCHAR(255) NOT NULL,
    MODIFY `value` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `shipmenttracking` MODIFY `location` VARCHAR(255) NOT NULL,
    MODIFY `notes` TEXT NULL;

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);
