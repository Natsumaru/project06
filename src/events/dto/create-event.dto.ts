import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RevealPolicy } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({
    description: 'イベントタイトル',
    example: 'Adamの飲み会（匿名確認）',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'イベント説明',
    example: '仕事終わりにちょっと一杯どうですか？',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'イベント日時',
    example: '2025-08-04T18:30:00.000Z',
  })
  @IsDateString()
  eventDatetime: string;

  @ApiProperty({ description: '開催場所', example: '東京' })
  @IsString()
  @IsNotEmpty()
  locationText: string;

  @ApiProperty({ description: '参加費', example: 5000 })
  @IsInt()
  @Min(0)
  fee: number;

  @ApiProperty({ description: '定員', example: 6 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ description: '最小参加者数', required: false, example: 3 })
  @IsInt()
  @Min(1)
  @IsOptional()
  minParticipants?: number;

  @ApiProperty({
    description: 'プロフィール公開ポリシー',
    enum: RevealPolicy,
    example: 'OPEN',
  })
  @IsString()
  profileRevealPolicy: RevealPolicy;
}
