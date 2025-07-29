/*
  Warnings:

  - You are about to drop the `value_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "value_profiles" DROP CONSTRAINT "value_profiles_userId_fkey";

-- DropTable
DROP TABLE "value_profiles";
