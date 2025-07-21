import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'nickname is required' })
  nickname: string;

  @IsEnum(Sex)
  @IsNotEmpty({ message: 'sex is required' })
  sex: Sex;
}
