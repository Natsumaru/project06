import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: 'メッセージ内容',
    example: 'こんにちは！',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
