import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllEventsDto {
  @ApiProperty({
    description: 'ページ番号',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number) // クエリパラメータは文字列で来るので数値に変換
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '1ページあたりの件数',
    required: false,
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: '開始日時フィルター',
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date) // 日付文字列をDateオブジェクトに変換
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: '終了日時フィルター',
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
