import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FindDmMessagesDto {
  @ApiPropertyOptional({
    description: 'ページネーション用のカーソル（メッセージID）',
    example: 'cmejv76xs0000p9j2yeektlsn',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: '1ページあたりの取得件数',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: '取得件数は1以上である必要があります' })
  @Max(100, { message: '取得件数は100以下である必要があります' })
  limit?: number = 20;
}
