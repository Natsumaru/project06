import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@ApiTags('質問')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @ApiOperation({ summary: '質問一覧取得' })
  @ApiResponse({
    status: 200,
    description: '質問一覧取得成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '質問ID' },
          text: { type: 'string', description: '質問文' },
          order: { type: 'number', description: '質問の順序' },
          choices: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: '選択肢ID' },
                text: { type: 'string', description: '選択肢テキスト' },
                questionId: { type: 'string', description: '質問ID' },
              },
            },
          },
        },
      },
    },
  })
  // 質問一覧を取得するAPI
  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @ApiOperation({ summary: 'ユーザーの回答履歴取得' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'ユーザー回答履歴取得成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '回答ID' },
          userId: { type: 'string', description: 'ユーザーID' },
          questionId: { type: 'string', description: '質問ID' },
          choiceId: { type: 'string', description: '選択された選択肢ID' },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '回答作成日時',
          },
          question: {
            type: 'object',
            properties: {
              text: { type: 'string', description: '質問文' },
            },
          },
          choice: {
            type: 'object',
            properties: {
              text: { type: 'string', description: '選択肢テキスト' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @UseGuards(AuthGuard('jwt'))
  @Get('my-answers')
  findMyAnswers(@GetUser() user: { id: string }) {
    return this.questionsService.findUserAnswers(user.id);
  }

  @ApiOperation({ summary: '回答送信' })
  @ApiBearerAuth()
  @ApiBody({ type: SubmitAnswersDto })
  @ApiResponse({
    status: 201,
    description: '回答送信成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '回答ID' },
          userId: { type: 'string', description: 'ユーザーID' },
          questionId: { type: 'string', description: '質問ID' },
          choiceId: { type: 'string', description: '選択された選択肢ID' },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '回答作成日時',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @ApiResponse({ status: 400, description: 'バリデーションエラー' })
  // 回答を送信するAPI
  @UseGuards(AuthGuard('jwt'))
  @Post('submit')
  submit(
    @GetUser() user: { id: string },
    @Body() SubmitAnswersDto: SubmitAnswersDto,
  ) {
    return this.questionsService.submitAnswers(user.id, SubmitAnswersDto);
  }
}
