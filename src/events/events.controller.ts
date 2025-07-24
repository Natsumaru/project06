import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateEventDto } from './dto/create-event.dto';
import { FindAllEventsDto } from './dto/find-all-events.dto';
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

  @Get()
  findAll(@Query() query: FindAllEventsDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/join')
  join(
    @Param('id') eventId: string,
    @GetUser() user: { id: string; email: string },
  ) {
    return this.eventsService.join(eventId, user.id);
  }
}
