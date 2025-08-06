import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class AnswerDto {
  @ApiProperty({ description: '質問ID', example: 'cmdon604t0000p9ocnctbnmqk' })
  @IsString()
  questionId: string;

  @ApiProperty({
    description: '選択肢ID',
    example: 'cmdon604t0001p9oc26n15xht',
  })
  @IsString()
  choiceId: string;
}

export class SubmitAnswersDto {
  @ApiProperty({
    description: '回答配列',
    type: [AnswerDto],
    example: [
      {
        questionId: 'cmdon604t0000p9ocnctbnmqk',
        choiceId: 'cmdon604t0001p9oc26n15xht',
      },
      {
        questionId: 'cmdon604x0003p9ocrxopugre',
        choiceId: 'cmdon604x0004p9oc54keeyxx',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
