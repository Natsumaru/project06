import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DmsService } from './dms.service';
import { CreateDmDto } from './dto/create-dm.dto';
import { FindDmMessagesDto } from './dto/find-dm-messages.dto';
import { SendDmMessageDto } from './dto/send-dm-message.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('ダイレクトメッセージ')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT')
@Controller('dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  @ApiOperation({
    summary: 'DMルームの検索または作成',
    description:
      '指定されたユーザーとのDMルームを検索し、存在しない場合は新規作成します。',
  })
  @ApiBody({ type: CreateDmDto })
  @ApiResponse({
    status: 200,
    description: 'DMルーム取得成功（既存ルーム）',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'チャットルームID' },
        roomType: {
          type: 'string',
          enum: ['DM'],
          description: 'ルームタイプ',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '作成日時',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'DMルーム作成成功（新規ルーム）',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'チャットルームID' },
        roomType: {
          type: 'string',
          enum: ['DM'],
          description: 'ルームタイプ',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '作成日時',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '不正なリクエスト（自分自身とのDM作成など）',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'You cannot create a DM with yourself.',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '認証が必要',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @Post()
  findOrCreateDmRoom(
    @GetUser() user: { id: string },
    @Body() CreateDmDto: CreateDmDto,
  ) {
    return this.dmsService.findOrCreate(user.id, CreateDmDto.recipientId);
  }

  @ApiOperation({
    summary: '自分が参加しているDM一覧取得',
    description:
      '自分が参加しているすべてのDMルームの一覧を取得します。各DMの最新メッセージも含まれます。',
  })
  @ApiResponse({
    status: 200,
    description: 'DM一覧取得成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'DMルームID' },
          roomType: {
            type: 'string',
            enum: ['DM'],
            description: 'ルームタイプ',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'ルーム作成日時',
          },
          participants: {
            type: 'array',
            description: 'DMの参加者（相手とあなた）',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'ユーザーID' },
                nickname: { type: 'string', description: 'ニックネーム' },
                profileImage: {
                  type: 'string',
                  nullable: true,
                  description: 'プロフィール画像',
                },
              },
            },
          },
          messages: {
            type: 'array',
            description: '最新のメッセージ（1件）',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'メッセージID' },
                message: { type: 'string', description: 'メッセージ内容' },
                isAnnouncement: {
                  type: 'boolean',
                  description: 'アナウンスメッセージか',
                },
                isPinned: {
                  type: 'boolean',
                  description: 'ピン留めされているか',
                },
                sentAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'メッセージ送信日時',
                },
                sender: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'string', description: '送信者ID' },
                    nickname: {
                      type: 'string',
                      description: '送信者ニックネーム',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '認証が必要',
  })
  @Get()
  findMyDmRooms(@GetUser() user: { id: string }) {
    return this.dmsService.findMyDmRooms(user.id);
  }

  @ApiOperation({
    summary: '特定のDMルームのメッセージ履歴取得',
    description:
      'DMルーム内のメッセージ履歴をページネーション付きで取得します。最新のメッセージから古いメッセージの順で返されます。',
  })
  @ApiParam({
    name: 'roomId',
    description: 'DMルームID',
    example: 'clm1234567890abcdef',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'ページネーション用のカーソル（メッセージID）',
    example: 'msg_123456789',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '1ページあたりの取得件数（1-100）',
    example: 20,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'メッセージ履歴取得成功',
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
              isPinned: {
                type: 'boolean',
                description: 'ピン留めされているか',
              },
              sentAt: {
                type: 'string',
                format: 'date-time',
                description: '送信日時',
              },
              sender: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string', description: '送信者ID' },
                  nickname: {
                    type: 'string',
                    description: '送信者ニックネーム',
                  },
                  profileImage: {
                    type: 'string',
                    nullable: true,
                    description: 'プロフィール画像',
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
              description: '次のページ取得用カーソル（メッセージID）',
            },
            limit: { type: 'number', description: '1ページあたりの件数' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '認証が必要',
  })
  @ApiResponse({
    status: 404,
    description: 'DMルームが見つからない、または参加者ではない',
  })
  @Get(':roomId/messages')
  findDmMessages(
    @Param('roomId') roomId: string,
    @GetUser() user: { id: string },
    @Query() query: FindDmMessagesDto,
  ) {
    return this.dmsService.findDmMessages(roomId, user.id, query);
  }

  @ApiOperation({
    summary: 'DMにメッセージ送信',
    description: '指定されたDMルームにメッセージを送信します。',
  })
  @ApiParam({
    name: 'roomId',
    description: 'DMルームID',
    example: 'clm1234567890abcdef',
  })
  @ApiBody({ type: SendDmMessageDto })
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
        isPinned: { type: 'boolean', description: 'ピン留めされているか' },
        sentAt: {
          type: 'string',
          format: 'date-time',
          description: '送信日時',
        },
        roomId: { type: 'string', description: 'DMルームID' },
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
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'バリデーションエラー',
  })
  @ApiResponse({
    status: 401,
    description: '認証が必要',
  })
  @ApiResponse({
    status: 404,
    description: 'DMルームが見つからない、または参加者ではない',
  })
  @Post(':roomId/messages')
  sendDmMessage(
    @Param('roomId') roomId: string,
    @GetUser() user: { id: string },
    @Body() sendDmMessageDto: SendDmMessageDto,
  ) {
    return this.dmsService.sendDmMessage(roomId, user.id, sendDmMessageDto);
  }
}
