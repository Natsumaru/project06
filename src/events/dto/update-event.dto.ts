import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RevealPolicy } from '@prisma/client';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiProperty({
    description: 'イベントタイトル',
    example: 'Adamの飲み会（update)',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'イベント説明',
    example: '仕事終わりにちょっと一杯どうですか？',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'イベント日時',
    example: '2025-07-30T18:30:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  eventDatetime?: string;

  @ApiProperty({
    description: '開催場所',
    example: '秘密',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  locationText?: string;

  @ApiProperty({
    description: '参加費',
    example: 5000,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  fee?: number;

  @ApiProperty({
    description: '定員',
    example: 6,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: '最小参加者数',
    example: 3,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  minParticipants?: number;

  @ApiProperty({
    description: 'プロフィール公開ポリシー',
    enum: RevealPolicy,
    example: 'OPEN',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileRevealPolicy?: RevealPolicy;
}
