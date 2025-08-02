/*
  Warnings:

  - You are about to drop the `PreJoinChatParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PreJoinChatParticipant" DROP CONSTRAINT "PreJoinChatParticipant_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "PreJoinChatParticipant" DROP CONSTRAINT "PreJoinChatParticipant_userId_fkey";

-- DropTable
DROP TABLE "PreJoinChatParticipant";

-- CreateTable
CREATE TABLE "pre_join_chat_participants" (
    "id" TEXT NOT NULL,
    "anonymousName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,

    CONSTRAINT "pre_join_chat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pre_join_chat_participants_userId_chatRoomId_key" ON "pre_join_chat_participants"("userId", "chatRoomId");

-- AddForeignKey
ALTER TABLE "pre_join_chat_participants" ADD CONSTRAINT "pre_join_chat_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_join_chat_participants" ADD CONSTRAINT "pre_join_chat_participants_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
