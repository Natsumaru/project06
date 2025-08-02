import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindMessagesDto } from './dto/find-messages.dto';
import { Prisma } from '@prisma/client';
// TODO: 支払いが完了したかどうかのチェックを行う必要あり
// TODO: anonymousNameプロパティを作る必要あり

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(
    roomId: string,
    userId: string,
    createMessageDto: CreateMessageDto,
  ) {
    // ユーザーがチャットルームにアクセスする権限があるかチェック
    const room = await this.checkUserAccessToRoom(roomId, userId);

    // メッセージを作成
    const message = await this.prisma.chatMessage.create({
      data: {
        message: createMessageDto.message,
        senderId: userId,
        roomId: roomId,
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

    // isOwnerフラグを追加
    const ownerId =
      room?.preJoinEvent?.owner?.id || room?.postJoinEvent?.owner?.id;

    if (room?.roomType === 'PRE_JOIN') {
      return {
        ...message,
        sender: {
          id: message.sender.id,
          isOwner: message.senderId === ownerId,
        },
      };
    } else {
      return {
        ...message,
        sender: {
          ...message.sender,
          isOwner: message.senderId === ownerId,
        },
      };
    }
  }

  async findMessages(roomId: string, userId: string, query: FindMessagesDto) {
    const room = await this.checkUserAccessToRoom(roomId, userId);

    const includeConfig =
      room?.roomType === 'PRE_JOIN'
        ? {
            sender: {
              select: {
                id: true,
              },
            },
          }
        : {
            sender: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
              },
            },
          };

    // 日付フィルター条件を構築
    const whereCondition: Prisma.ChatMessageWhereInput = { roomId: roomId };

    if (query.startDate || query.endDate) {
      whereCondition.sentAt = {};
      if (query.startDate) {
        whereCondition.sentAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        whereCondition.sentAt.lte = new Date(query.endDate);
      }
    }

    // カーソルベースページネーション
    if (query.cursor) {
      whereCondition.id = {
        lt: query.cursor, // カーソルより前のメッセージを取得
      };
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: whereCondition,
      include: includeConfig,
      orderBy: { sentAt: 'desc' }, // 新しいメッセージから順に
      take: query.limit || 20,
      skip: query.cursor ? 0 : query.offset || 0, // カーソルが指定されている場合はoffsetを無視
    });

    // isOwnerフラグを追加
    let processedMessages = messages;
    const ownerId =
      room?.preJoinEvent?.owner?.id || room?.postJoinEvent?.owner?.id;

    processedMessages = messages.map((message) => ({
      ...message,
      sender: {
        ...message.sender,
        isOwner: message.senderId === ownerId,
      },
    }));

    // 次のページが存在するかチェック
    const hasMore = messages.length === (query.limit || 20);
    const nextCursor =
      hasMore && messages.length > 0 ? messages[messages.length - 1].id : null;

    return {
      messages: processedMessages,
      pagination: {
        hasMore,
        nextCursor,
        limit: query.limit || 20,
        offset: query.offset || 0,
      },
    };
  }

  // ユーザーがチャットルームにアクセセスする権利があるかを確認する共通メソッド
  async checkUserAccessToRoom(roomId: string, userId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: true,
        preJoinEvent: {
          include: {
            owner: {
              select: { id: true },
            },
          },
        },
        postJoinEvent: {
          include: {
            owner: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    if (room.roomType === 'PRE_JOIN') {
      // 参加前チャットルームの場合、誰でもアクセス可能
      return room;
    }
    if (room.roomType === 'POST_JOIN') {
      // 参加後チャットルームの場合、イベントのオーナーまたは参加者のみアクセス可能
      const isParticipant = room.participants.some((p) => p.id === userId);
      const isOwner = room.postJoinEvent?.owner.id === userId;
      if (!isParticipant && !isOwner) {
        throw new ForbiddenException(
          'You do not have permission to access this chat room.',
        );
      }
      return room;
    }
  }
}
