import {
  IsOptional,
  IsString,
  IsEnum,
  MinLength,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sex, Gender, AgeGroup } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    description: 'メールアドレス',
    example: 'adam@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @ApiProperty({
    description: 'ニックネーム',
    example: 'Adam',
    required: false,
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({
    description: 'プロフィール画像URL',
    example: 'https://picsum.photos/id/237/200/300',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({
    description: '自己紹介',
    example: 'よろしくお願いします！',
    required: false,
  })
  @IsOptional()
  @IsString()
  introduction?: string;

  @ApiProperty({
    description: '性別',
    enum: Sex,
    example: 'MALE',
    required: false,
  })
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @ApiProperty({
    description: 'ジェンダー',
    enum: Gender,
    example: 'MALE',
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: '年齢層',
    enum: AgeGroup,
    example: 'TWENTIES_EARLY',
    required: false,
  })
  @IsOptional()
  @IsEnum(AgeGroup)
  ageGroup?: AgeGroup;

  @ApiProperty({
    description: '新しいパスワード',
    example: 'AdamPassword',
    minLength: 8,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;
}
