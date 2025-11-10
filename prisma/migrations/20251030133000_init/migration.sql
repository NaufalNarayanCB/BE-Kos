/*
  Warnings:

  - You are about to drop the column `file` on the `kos_img` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `kos_img` DROP COLUMN `file`,
    ADD COLUMN `isThumbnail` BOOLEAN NOT NULL DEFAULT false;
