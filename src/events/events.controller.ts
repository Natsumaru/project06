import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
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
import { EventsService } from './events.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateEventDto } from './dto/create-event.dto';
import { FindAllEventsDto } from './dto/find-all-events.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('イベント')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: 'イベント作成' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: 201,
    description: 'イベント作成成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'イベントID' },
        title: { type: 'string', description: 'イベントタイトル' },
        description: { type: 'string', description: 'イベント説明' },
        eventImage: {
          type: 'string',
          nullable: true,
          description: 'イベント画像',
        },
        eventDatetime: {
          type: 'string',
          format: 'date-time',
          description: 'イベント日時',
        },
        locationText: { type: 'string', description: '開催場所' },
        fee: { type: 'number', description: '参加費' },
        capacity: { type: 'number', description: '定員' },
        minParticipants: {
          type: 'number',
          nullable: true,
          description: '最小参加者数',
        },
        status: {
          type: 'string',
          enum: ['PUBLISHED', 'HELD', 'CANCELLED'],
          description: 'イベントステータス',
        },
        profileRevealPolicy: {
          type: 'string',
          enum: ['OPEN', 'OPTIONAL', 'CONDITIONAL'],
          description: 'ユーザー間プロフィール公開ポリシー',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '作成日時',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: '更新日時',
        },
        ownerId: { type: 'string', description: '主催者ID' },
        preJoinChatRoomId: {
          type: 'string',
          description: '参加前チャットルームID',
        },
        postJoinChatRoomId: {
          type: 'string',
          description: '参加後チャットルームID',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: { id: string; email: string },
  ) {
    return this.eventsService.create(createEventDto, user.id);
  }

  @ApiOperation({ summary: 'イベント一覧取得' })
  @ApiQuery({ type: FindAllEventsDto })
  @ApiResponse({
    status: 200,
    description: 'イベント一覧取得成功',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'イベントID' },
              title: { type: 'string', description: 'イベントタイトル' },
              description: { type: 'string', description: 'イベント説明' },
              eventImage: {
                type: 'string',
                nullable: true,
                description: 'イベント画像',
              },
              eventDatetime: {
                type: 'string',
                format: 'date-time',
                description: 'イベント日時',
              },
              locationText: { type: 'string', description: '開催場所' },
              fee: { type: 'number', description: '参加費' },
              capacity: { type: 'number', description: '定員' },
              minParticipants: {
                type: 'number',
                nullable: true,
                description: '最小参加者数',
              },
              status: {
                type: 'string',
                enum: ['PUBLISHED', 'HELD', 'CANCELLED'],
                description: 'イベントステータス',
              },
              profileRevealPolicy: {
                type: 'string',
                enum: ['OPEN', 'OPTIONAL', 'CONDITIONAL'],
                description: 'プロフィール公開ポリシー',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: '作成日時',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: '更新日時',
              },
              ownerId: { type: 'string', description: '主催者ID' },
              preJoinChatRoomId: {
                type: 'string',
                nullable: true,
                description: '参加前チャットルームID',
              },
              postJoinChatRoomId: {
                type: 'string',
                nullable: true,
                description: '参加後チャットルームID',
              },
              owner: {
                type: 'object',
                properties: {
                  nickname: {
                    type: 'string',
                    description: '主催者ニックネーム',
                  },
                },
              },
            },
          },
        },
        total: { type: 'number', description: '総件数' },
        page: { type: 'number', description: '現在のページ' },
        lastPage: { type: 'number', description: '最後のページ' },
      },
    },
  })
  @Get()
  findAll(@Query() query: FindAllEventsDto) {
    return this.eventsService.findAll(query);
  }

  @ApiOperation({ summary: 'イベント詳細取得' })
  @ApiParam({ name: 'id', description: 'イベントID' })
  @ApiResponse({
    status: 200,
    description: 'イベント詳細取得成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'イベントID' },
        title: { type: 'string', description: 'イベントタイトル' },
        description: { type: 'string', description: 'イベント説明' },
        eventImage: {
          type: 'string',
          nullable: true,
          description: 'イベント画像',
        },
        eventDatetime: {
          type: 'string',
          format: 'date-time',
          description: 'イベント日時',
        },
        locationText: { type: 'string', description: '開催場所' },
        fee: { type: 'number', description: '参加費' },
        capacity: { type: 'number', description: '定員' },
        minParticipants: {
          type: 'number',
          nullable: true,
          description: '最小参加者数',
        },
        status: {
          type: 'string',
          enum: ['PUBLISHED', 'HELD', 'CANCELLED'],
          description: 'イベントステータス',
        },
        profileRevealPolicy: {
          type: 'string',
          enum: ['OPEN', 'OPTIONAL', 'CONDITIONAL'],
          description: 'プロフィール公開ポリシー',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '作成日時',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: '更新日時',
        },
        ownerId: { type: 'string', description: '主催者ID' },
        preJoinChatRoomId: {
          type: 'string',
          nullable: true,
          description: '参加前チャットルームID',
        },
        postJoinChatRoomId: {
          type: 'string',
          nullable: true,
          description: '参加後チャットルームID',
        },
        owner: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '主催者ID' },
            nickname: { type: 'string', description: '主催者ニックネーム' },
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
  @ApiResponse({ status: 404, description: 'イベントが見つかりません' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @ApiOperation({ summary: 'イベント参加' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'イベントID' })
  @ApiResponse({
    status: 201,
    description: 'イベント参加成功',
    schema: {
      type: 'object',
      properties: {
        paymentStatus: {
          type: 'string',
          enum: ['UNPAID', 'PAID', 'REFUNDED'],
          description: '参加ID',
        },
        eventId: { type: 'string', description: 'イベントID' },
        userId: { type: 'string', description: 'ユーザーID' },
        joinedAt: {
          type: 'string',
          format: 'date-time',
          description: '参加日時',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @ApiResponse({ status: 404, description: 'イベントが見つかりません' })
  @ApiResponse({
    status: 409,
    description: '既に参加済み、または定員に達しています',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/join')
  join(
    @Param('id') eventId: string,
    @GetUser() user: { id: string; email: string },
  ) {
    return this.eventsService.join(eventId, user.id);
  }

  @ApiOperation({ summary: 'イベント更新' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'イベントID' })
  @ApiBody({
    type: UpdateEventDto,
    examples: {
      example1: {
        summary: 'イベント更新例',
        description: 'イベント情報を部分的に更新する例',
        value: {
          title: 'Adamの飲み会（update)',
          description: '仕事終わりにちょっと一杯どうですか？',
          eventDatetime: '2025-07-30T18:30:00.000Z',
          locationText: '秘密',
          fee: 5000,
          capacity: 6,
          profileRevealPolicy: 'OPEN',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'イベント更新成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'イベントID' },
        title: { type: 'string', description: 'イベントタイトル' },
        description: { type: 'string', description: 'イベント説明' },
        eventImage: {
          type: 'string',
          nullable: true,
          description: 'イベント画像',
        },
        eventDatetime: {
          type: 'string',
          format: 'date-time',
          description: 'イベント日時',
        },
        locationText: { type: 'string', description: '開催場所' },
        fee: { type: 'number', description: '参加費' },
        capacity: { type: 'number', description: '定員' },
        minParticipants: {
          type: 'number',
          nullable: true,
          description: '最小参加者数',
        },
        status: {
          type: 'string',
          enum: ['PUBLISHED', 'HELD', 'CANCELLED'],
          description: 'イベントステータス',
        },
        profileRevealPolicy: {
          type: 'string',
          enum: ['OPEN', 'OPTIONAL', 'CONDITIONAL'],
          description: 'プロフィール公開ポリシー',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '作成日時',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: '更新日時',
        },
        ownerId: { type: 'string', description: '主催者ID' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @ApiResponse({ status: 403, description: '更新権限がありません' })
  @ApiResponse({ status: 404, description: 'イベントが見つかりません' })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') eventId: string,
    @GetUser() user: { id: string },
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(eventId, user.id, updateEventDto);
  }

  @ApiOperation({ summary: 'イベント削除' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'イベントID' })
  @ApiResponse({ status: 204, description: 'イベント削除成功' })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @ApiResponse({ status: 403, description: '削除権限がありません' })
  @ApiResponse({ status: 404, description: 'イベントが見つかりません' })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') eventId: string, @GetUser() user: { id: string }) {
    return this.eventsService.remove(eventId, user.id);
  }
}
