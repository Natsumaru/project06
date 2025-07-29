import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  // 全ての質問と選択肢を取得
  findAll() {
    return this.prisma.question.findMany({
      include: {
        choices: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  // ユーザーの回答を登録・更新
  async submitAnswers(userId: string, submitAnswersDto: SubmitAnswersDto) {
    const { answers } = submitAnswersDto;

    // 各回答の質問IDと選択肢IDが関連しているかをチェック
    for (const answer of answers) {
      const choice = await this.prisma.choice.findFirst({
        where: {
          id: answer.choiceId,
          questionId: answer.questionId,
        },
      });
      if (!choice) {
        throw new BadRequestException(
          `Choice  ${answer.choiceId} does not belong to question ${answer.questionId}`,
        );
      }
    }

    const upsertPromises = answers.map((answer) =>
      this.prisma.answer.upsert({
        where: {
          userId_questionId: {
            userId,
            questionId: answer.questionId,
          },
        },
        update: { choiceId: answer.choiceId },
        create: {
          userId,
          questionId: answer.questionId,
          choiceId: answer.choiceId,
        },
      }),
    );
    return this.prisma.$transaction(upsertPromises);
  }

  // 特定のユーザーの回答を取得
  findUserAnswers(userId: string) {
    return this.prisma.answer.findMany({
      where: { userId },
      include: {
        question: {
          select: { text: true },
        },
        choice: { select: { text: true } },
      },
    });
  }
}
