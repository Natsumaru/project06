import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

class AnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  chocedId: string;
}

export class SubmitAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
