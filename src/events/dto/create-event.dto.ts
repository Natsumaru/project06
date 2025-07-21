import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RevealPolicy } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  eventDatetime: string;

  @IsString()
  @IsNotEmpty()
  locationText: string;

  @IsInt()
  @Min(0)
  fee: number;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  minParticipants?: number;

  @IsString()
  profileRevealPolicy: RevealPolicy;
}
