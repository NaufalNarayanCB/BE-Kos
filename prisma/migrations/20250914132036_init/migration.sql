/*
  Warnings:

  - You are about to drop the column `alamat` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `available_rooms` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `gender_type` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `kos_picture` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `peraturan_kos` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `total_rooms` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `facility` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `room` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price_per_mont` to the `Kos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Kos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `facility` DROP FOREIGN KEY `Facility_kosId_fkey`;

-- DropForeignKey
ALTER TABLE `facility` DROP FOREIGN KEY `Facility_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `kos` DROP FOREIGN KEY `Kos_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_kosId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_userId_fkey`;

-- DropForeignKey
ALTER TABLE `room` DROP FOREIGN KEY `Room_kosId_fkey`;

-- DropIndex
DROP INDEX `Kos_uuid_key` ON `kos`;

-- DropIndex
DROP INDEX `User_uuid_key` ON `user`;

-- AlterTable
ALTER TABLE `kos` DROP COLUMN `alamat`,
    DROP COLUMN `available_rooms`,
    DROP COLUMN `gender_type`,
    DROP COLUMN `kos_picture`,
    DROP COLUMN `ownerId`,
    DROP COLUMN `peraturan_kos`,
    DROP COLUMN `total_rooms`,
    DROP COLUMN `uuid`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'ALL') NOT NULL DEFAULT 'ALL',
    ADD COLUMN `price_per_mont` INTEGER NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `phone_number`,
    DROP COLUMN `profile_picture`,
    DROP COLUMN `uuid`,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL DEFAULT '';

-- DropTable
DROP TABLE `booking`;

-- DropTable
DROP TABLE `facility`;

-- DropTable
DROP TABLE `review`;

-- DropTable
DROP TABLE `room`;

-- CreateTable
CREATE TABLE `Kos_img` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kos_id` INTEGER NOT NULL,
    `file` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kos_facilities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kos_id` INTEGER NOT NULL,
    `facility` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kos_id` INTEGER NOT NULL,
    `comment` VARCHAR(191) NOT NULL DEFAULT '',
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `books` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kos_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kos` ADD CONSTRAINT `Kos_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kos_img` ADD CONSTRAINT `Kos_img_kos_id_fkey` FOREIGN KEY (`kos_id`) REFERENCES `Kos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kos_facilities` ADD CONSTRAINT `Kos_facilities_kos_id_fkey` FOREIGN KEY (`kos_id`) REFERENCES `Kos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_kos_id_fkey` FOREIGN KEY (`kos_id`) REFERENCES `Kos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_kos_id_fkey` FOREIGN KEY (`kos_id`) REFERENCES `Kos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
