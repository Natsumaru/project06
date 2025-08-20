import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoomType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindDmMessagesDto } from './dto/find-dm-messages.dto';
import { SendDmMessageDto } from './dto/send-dm-message.dto';

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

  async findMyDmRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        roomType: RoomType.DM,
        participants: {
          some: { id: userId },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findDmMessages(
    roomId: string,
    userId: string,
    query: FindDmMessagesDto,
  ) {
    // まず、ユーザーがこのDMルームの参加者かチェック
    const dmRoom = await this.prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        roomType: RoomType.DM,
        participants: {
          some: { id: userId },
        },
      },
    });

    if (!dmRoom) {
      throw new NotFoundException(
        'DM room not found or you are not a participant',
      );
    }

    const { cursor, limit = 20 } = query;

    // カーソルベースページネーション
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        roomId: roomId,
        ...(cursor && {
          id: {
            lt: cursor, // カーソル（メッセージID）より小さいID = より古いメッセージ
          },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc', // 新しいメッセージから古いメッセージの順
      },
      take: limit + 1, // 次のページがあるかチェックするため+1
    });

    // 次のページがあるかチェック
    const hasMore = messages.length > limit;
    const messageList = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? messageList[messageList.length - 1].id : null;

    return {
      messages: messageList,
      pagination: {
        hasMore,
        nextCursor,
        limit,
      },
    };
  }

  async sendDmMessage(
    roomId: string,
    userId: string,
    sendDmMessageDto: SendDmMessageDto,
  ) {
    // まず、ユーザーがこのDMルームの参加者かチェック
    const dmRoom = await this.prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        roomType: RoomType.DM,
        participants: {
          some: { id: userId },
        },
      },
    });

    if (!dmRoom) {
      throw new NotFoundException(
        'DM room not found or you are not a participant',
      );
    }

    // メッセージを作成
    const message = await this.prisma.chatMessage.create({
      data: {
        message: sendDmMessageDto.message,
        roomId: roomId,
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
    });

    return message;
  }
}
