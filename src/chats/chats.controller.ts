import {
  Body,
  Controller,
  Post,
  UseGuards,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindMessagesDto } from './dto/find-messages.dto';

@ApiTags('チャット')
@UseGuards(AuthGuard('jwt'))
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @ApiOperation({ summary: 'メッセージ送信' })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', description: 'チャットルームID' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'メッセージ送信成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'メッセージID' },
        message: { type: 'string', description: 'メッセージ内容' },
        isAnnouncement: {
          type: 'boolean',
          description: 'アナウンスメッセージか',
        },
        sentAt: {
          type: 'string',
          format: 'date-time',
          description: '送信日時',
        },
        roomId: { type: 'string', description: 'チャットルームID' },
        senderId: { type: 'string', description: '送信者ID' },
        sender: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '送信者ID' },
            nickname: { type: 'string', description: '送信者ニックネーム' },
            profileImage: {
              type: 'string',
              nullable: true,
              description: 'プロフィール画像',
            },
            isOwner: { type: 'boolean', description: 'イベントオーナーか' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @ApiResponse({ status: 404, description: 'チャットルームが見つかりません' })
  @Post(':roomId/messages')
  createMessage(
    @Param('roomId') roomId: string,
    @GetUser() user: { id: string },
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatsService.createMessage(roomId, user.id, createMessageDto);
  }

  @ApiOperation({ summary: 'メッセージ一覧取得' })
  @ApiBearerAuth()
  @ApiParam({ name: 'roomId', description: 'チャットルームID' })
  @ApiQuery({ type: FindMessagesDto })
  @ApiResponse({
    status: 200,
    description: 'メッセージ一覧取得成功',
    schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'メッセージID' },
              message: { type: 'string', description: 'メッセージ内容' },
              isAnnouncement: {
                type: 'boolean',
                description: 'アナウンスメッセージか',
              },
              sentAt: {
                type: 'string',
                format: 'date-time',
                description: '送信日時',
              },
              roomId: { type: 'string', description: 'チャットルームID' },
              senderId: {
                type: 'string',
                description: '送信者ID（匿名ユーザーの場合は含まれない）',
                nullable: true,
              },
              isPinned: {
                type: 'boolean',
                description: 'ピン留めされているか',
              },
              isMyMessage: {
                type: 'boolean',
                description: '自分のメッセージか',
              },
              sender: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: '送信者ID（匿名の場合は"anonymous"）',
                  },
                  nickname: {
                    type: 'string',
                    description: '送信者ニックネーム',
                  },
                  profileImage: {
                    type: 'string',
                    nullable: true,
                    description: 'プロフィール画像',
                  },
                  isOwner: {
                    type: 'boolean',
                    description: 'イベントオーナーか',
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            hasMore: { type: 'boolean', description: '次のページがあるか' },
            nextCursor: {
              type: 'string',
              nullable: true,
              description: '次のページのカーソル',
            },
            limit: { type: 'number', description: '1ページあたりの件数' },
            offset: { type: 'number', description: 'オフセット' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @ApiResponse({ status: 404, description: 'チャットルームが見つかりません' })
  @Get(':roomId/messages')
  findMessages(
    @Param('roomId') roomId: string,
    @GetUser() user: { id: string },
    @Query() query: FindMessagesDto,
  ) {
    return this.chatsService.findMessages(roomId, user.id, query);
  }

  @ApiOperation({ summary: 'メッセージピン留めトグル' })
  @ApiBearerAuth()
  @ApiParam({ name: 'messageId', description: 'メッセージID' })
  @ApiResponse({
    status: 200,
    description: 'ピン留め状態変更成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'メッセージID' },
        message: { type: 'string', description: 'メッセージ内容' },
        isAnnouncement: {
          type: 'boolean',
          description: 'アナウンスメッセージか',
        },
        isPinned: { type: 'boolean', description: 'ピン留めされているか' },
        sentAt: {
          type: 'string',
          format: 'date-time',
          description: '送信日時',
        },
        roomId: { type: 'string', description: 'チャットルームID' },
        senderId: { type: 'string', description: '送信者ID' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @ApiResponse({ status: 403, description: 'ピン留め権限がありません' })
  @ApiResponse({ status: 404, description: 'メッセージが見つかりません' })
  @UseGuards(AuthGuard('jwt'))
  @Post('message/:messageId/pin')
  togglePin(
    @Param('messageId') messageId: string,
    @GetUser() user: { id: string },
  ) {
    return this.chatsService.togglePinMessage(messageId, user.id);
  }
}
