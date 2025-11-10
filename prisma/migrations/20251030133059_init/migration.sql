/*
  Warnings:

  - You are about to drop the column `imagePath` on the `kos_img` table. All the data in the column will be lost.
  - You are about to drop the column `isThumbnail` on the `kos_img` table. All the data in the column will be lost.
  - Added the required column `file` to the `Kos_img` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kos_img` DROP COLUMN `imagePath`,
    DROP COLUMN `isThumbnail`,
    ADD COLUMN `file` VARCHAR(191) NOT NULL;
