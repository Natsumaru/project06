import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendDmMessageDto {
  @ApiProperty({
    description: '送信するメッセージ内容',
    example: 'こんにちは！元気ですか？',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty({ message: 'メッセージ内容は必須です' })
  @MaxLength(2000, { message: 'メッセージは2000文字以内で入力してください' })
  message: string;
}
