import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuestionsService } from './questions.service';

@Module({
  imports: [QuestionsModule],
  providers: [PrismaService, QuestionsService],
  controllers: [QuestionsController],
})
export class QuestionsModule {}
