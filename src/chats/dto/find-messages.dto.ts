import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindMessagesDto {
  @ApiPropertyOptional({
    description: '取得件数（1-100）',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20; // デフォルト20件

  @ApiPropertyOptional({
    description: 'オフセット（0以上）',
    minimum: 0,
    default: 0,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0; // デフォルト0

  @ApiPropertyOptional({
    description: '開始日時（ISO 8601形式）',
    format: 'date-time',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string; // ISO 8601形式の日付文字列

  @ApiPropertyOptional({
    description: '終了日時（ISO 8601形式）',
    format: 'date-time',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string; // ISO 8601形式の日付文字列

  @ApiPropertyOptional({
    description: 'カーソルベースページネーション用（メッセージID）',
    example: 'message-id-12345',
  })
  @IsOptional()
  @IsString()
  cursor?: string; // カーソルベースページネーション用（メッセージID）
}
