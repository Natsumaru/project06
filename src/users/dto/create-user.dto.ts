import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sex } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'メールアドレス',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({
    description: 'パスワード',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'ニックネーム',
    example: '太郎',
  })
  @IsString()
  @IsNotEmpty({ message: 'nickname is required' })
  nickname: string;

  @ApiProperty({
    description: '性別',
    enum: Sex,
    example: 'MALE',
  })
  @IsEnum(Sex)
  @IsNotEmpty({ message: 'sex is required' })
  sex: Sex;
}
