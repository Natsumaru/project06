import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // 質問一覧を取得するAPI
  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-answers')
  findMyAnswers(@GetUser() user: { id: string }) {
    return this.questionsService.findUserAnswers(user.id);
  }

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
