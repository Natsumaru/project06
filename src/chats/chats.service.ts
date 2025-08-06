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

  // 匿名名の候補リスト
  private readonly anonymousNames = [
    'りんご',
    'みかん',
    'ばなな',
    'いちご',
    'ぶどう',
    'もも',
    'なし',
    'すいか',
    'めろん',
    'かき',
    'きうい',
    'まんご',
    'ぱいん',
    'れもん',
    'ゆず',
    'うめ',
    'さくら',
    'あんず',
    'いちじく',
    'ざくろ',
    'びわ',
    'あけび',
    'くり',
    'かぼす',
    'すだち',
  ];

  // 使用可能な匿名名を取得
  private async getAvailableAnonymousName(chatRoomId: string): Promise<string> {
    const usedNames = await this.prisma.preJoinChatParticipant.findMany({
      where: { chatRoomId },
      select: { anonymousName: true },
    });

    const usedNameSet = new Set(usedNames.map((p) => p.anonymousName));
    const availableNames = this.anonymousNames.filter(
      (name) => !usedNameSet.has(name),
    );

    if (availableNames.length === 0) {
      // 全ての名前が使用済みの場合は、番号付きで生成
      const baseNames = this.anonymousNames;
      for (let i = 2; i <= 10; i++) {
        for (const baseName of baseNames) {
          const numberedName = `${baseName}${i}`;
          if (!usedNameSet.has(numberedName)) {
            return numberedName;
          }
        }
      }
      // それでも見つからない場合はランダム文字列
      return `ユーザー${Math.random().toString(36).substr(2, 6)}`;
    }

    return availableNames[Math.floor(Math.random() * availableNames.length)];
  }

  async createMessage(
    roomId: string,
    userId: string,
    createMessageDto: CreateMessageDto,
  ) {
    // ユーザーがチャットルームにアクセスする権限があるかチェック
    const room = await this.checkUserAccessToRoom(roomId, userId);

    // PRE_JOINの場合、匿名参加者の処理
    if (room?.roomType === 'PRE_JOIN') {
      const isOwner = room.preJoinEvent?.owner?.id === userId;

      if (!isOwner) {
        // 一般ユーザーの場合、匿名参加者として登録または取得
        let participant = await this.prisma.preJoinChatParticipant.findUnique({
          where: {
            userId_chatRoomId: {
              userId,
              chatRoomId: roomId,
            },
          },
        });

        if (!participant) {
          // 初回投稿の場合、匿名名を生成して登録
          const anonymousName = await this.getAvailableAnonymousName(roomId);
          participant = await this.prisma.preJoinChatParticipant.create({
            data: {
              userId,
              chatRoomId: roomId,
              anonymousName,
            },
          });
        }

        // メッセージを作成
        const message = await this.prisma.chatMessage.create({
          data: {
            message: createMessageDto.message,
            senderId: userId,
            roomId: roomId,
          },
        });

        return {
          id: message.id,
          message: message.message,
          isAnnouncement: message.isAnnouncement,
          sentAt: message.sentAt,
          roomId: message.roomId,
          sender: {
            id: 'anonymous',
            nickname: participant.anonymousName,
            isOwner: false,
          },
        };
      } else {
        // オーナーの場合
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

        return {
          ...message,
          sender: {
            ...message.sender,
            isOwner: true,
          },
        };
      }
    }

    // POST_JOINまたはDMの場合は従来通り
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

    return {
      ...message,
      sender: {
        ...message.sender,
        isOwner: message.senderId === ownerId,
      },
    };
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

    // メッセージを処理
    let processedMessages: any = messages;
    const ownerId =
      room?.preJoinEvent?.owner?.id || room?.postJoinEvent?.owner?.id;

    if (room?.roomType === 'PRE_JOIN') {
      // PRE_JOINの場合、匿名参加者情報を取得
      const participants = await this.prisma.preJoinChatParticipant.findMany({
        where: { chatRoomId: roomId },
      });

      const participantMap = new Map(
        participants.map((p) => [p.userId, p.anonymousName]),
      );

      // オーナーの情報を取得
      const ownerInfo = ownerId
        ? await this.prisma.user.findUnique({
            where: { id: ownerId },
            select: {
              id: true,
              nickname: true,
              profileImage: true,
            },
          })
        : null;

      processedMessages = messages.map((message) => {
        const isOwner = message.senderId === ownerId;
        const isMyMessage = message.senderId === userId;

        if (isOwner && ownerInfo) {
          return {
            ...message,
            isMyMessage,
            isPinned: message.isPinned,
            sender: {
              id: ownerInfo.id,
              nickname: ownerInfo.nickname,
              profileImage: ownerInfo.profileImage,
              isOwner: true,
            },
          };
        } else {
          const anonymousName =
            participantMap.get(message.senderId) || 'ゲスト';
          return {
            id: message.id,
            message: message.message,
            isAnnouncement: message.isAnnouncement,
            sentAt: message.sentAt,
            roomId: message.roomId,
            isMyMessage,
            isPinned: message.isPinned,
            sender: {
              id: 'anonymous',
              nickname: anonymousName,
              isOwner: false,
            },
          };
        }
      });
    } else {
      // POST_JOINまたはDMの場合
      processedMessages = messages.map((message) => ({
        ...message,
        isMyMessage: message.senderId === userId,
        isPinned: message.isPinned,
        sender: {
          ...message.sender,
          isOwner: message.senderId === ownerId,
        },
      }));
    }

    // 次のページが存在するかチェック
    const hasMore = messages.length === (query.limit || 20);
    const nextCursor =
      hasMore && messages.length > 0 ? messages[messages.length - 1].id : null;

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      messages: processedMessages,
      pagination: {
        hasMore,
        nextCursor,
        limit: query.limit || 20,
        offset: query.offset || 0,
      },
    };
  }

  async togglePinMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        room: {
          select: {
            preJoinEvent: { select: { owner: { select: { id: true } } } },
            postJoinEvent: { select: { owner: { select: { id: true } } } },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // オーナーかチェック
    const ownerId =
      message.room.preJoinEvent?.owner?.id ||
      message.room.postJoinEvent?.owner?.id;
    if (ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to pin this message.',
      );
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isPinned: !message.isPinned, // トグル
      },
    });
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
