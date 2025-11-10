/*
  Warnings:

  - Added the required column `status` to the `book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `book` ADD COLUMN `status` ENUM('PENDING', 'ACCEPT', 'REJECT') NOT NULL;
