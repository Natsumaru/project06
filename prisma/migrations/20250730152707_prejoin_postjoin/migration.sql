/*
  Warnings:

  - The values [EVENT] on the enum `RoomType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `eventId` on the `chat_rooms` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[preJoinChatRoomId]` on the table `events` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postJoinChatRoomId]` on the table `events` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoomType_new" AS ENUM ('DM', 'PRE_JOIN', 'POST_JOIN');
ALTER TABLE "chat_rooms" ALTER COLUMN "roomType" TYPE "RoomType_new" USING ("roomType"::text::"RoomType_new");
ALTER TYPE "RoomType" RENAME TO "RoomType_old";
ALTER TYPE "RoomType_new" RENAME TO "RoomType";
DROP TYPE "RoomType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "chat_rooms" DROP CONSTRAINT "chat_rooms_eventId_fkey";

-- DropIndex
DROP INDEX "chat_rooms_eventId_key";

-- AlterTable
ALTER TABLE "chat_rooms" DROP COLUMN "eventId";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "postJoinChatRoomId" TEXT,
ADD COLUMN     "preJoinChatRoomId" TEXT;

-- CreateTable
CREATE TABLE "PreJoinChatParticipant" (
    "id" TEXT NOT NULL,
    "anonymousName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,

    CONSTRAINT "PreJoinChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_preJoinChatRoomId_key" ON "events"("preJoinChatRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "events_postJoinChatRoomId_key" ON "events"("postJoinChatRoomId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_preJoinChatRoomId_fkey" FOREIGN KEY ("preJoinChatRoomId") REFERENCES "chat_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_postJoinChatRoomId_fkey" FOREIGN KEY ("postJoinChatRoomId") REFERENCES "chat_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreJoinChatParticipant" ADD CONSTRAINT "PreJoinChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreJoinChatParticipant" ADD CONSTRAINT "PreJoinChatParticipant_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
