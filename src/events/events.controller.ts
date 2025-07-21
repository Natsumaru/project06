import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateEventDto } from './dto/create-event.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: { id: string; email: string },
  ) {
    return this.eventsService.create(createEventDto, user.id);
  }
}
