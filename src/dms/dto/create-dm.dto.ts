import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDmDto {
  @ApiProperty({
    description: '受信者のユーザーID',
    example: 'cmduaq13s0002p991xq07auqv',
  })
  @IsString()
  @IsNotEmpty()
  recipientId: string;
}
