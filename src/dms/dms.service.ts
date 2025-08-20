import { BadRequestException, Injectable } from '@nestjs/common';
import { RoomType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DmsService {
  constructor(private readonly prisma: PrismaService) {}
  async findOrCreate(initiatorId: string, recipientId: string) {
    if (initiatorId === recipientId) {
      throw new BadRequestException('You cannot create a DM with yourself.');
    }

    const existingRoom = await this.prisma.chatRoom.findFirst({
      where: {
        roomType: RoomType.DM,
        AND: [
          { participants: { some: { id: initiatorId } } },
          { participants: { some: { id: recipientId } } },
        ],
      },
    });
    if (existingRoom) {
      return existingRoom;
    }

    // DMルームが存在しない場合は新規作成
    return this.prisma.chatRoom.create({
      data: {
        roomType: RoomType.DM,
        participants: {
          connect: [{ id: initiatorId }, { id: recipientId }],
        },
      },
    });
  }
}
