import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FindMessagesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20; // デフォルト20件

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0; // デフォルト0

  @IsOptional()
  @IsDateString()
  startDate?: string; // ISO 8601形式の日付文字列

  @IsOptional()
  @IsDateString()
  endDate?: string; // ISO 8601形式の日付文字列

  @IsOptional()
  @IsString()
  cursor?: string; // カーソルベースページネーション用（メッセージID）
}
