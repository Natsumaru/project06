import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DmsService } from './dms.service';
import { CreateDmDto } from './dto/create-dm.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
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
}
