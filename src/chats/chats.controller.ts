import {
  Body,
  Controller,
  Post,
  UseGuards,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindMessagesDto } from './dto/find-messages.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post(':roomId/messages')
  createMessage(
    @Param('roomId') roomId: string,
    @GetUser() user: { id: string },
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatsService.createMessage(roomId, user.id, createMessageDto);
  }

  @Get(':roomId/messages')
  findMessages(
    @Param('roomId') roomId: string,
    @GetUser() user: { id: string },
    @Query() query: FindMessagesDto,
  ) {
    return this.chatsService.findMessages(roomId, user.id, query);
  }
}
