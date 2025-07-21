import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

export class FindAllEventsDto {
  @IsOptional()
  @Type(() => Number) // クエリパラメータは文字列で来るので数値に変換
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Date) // 日付文字列をDateオブジェクトに変換
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
