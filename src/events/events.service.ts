import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEventDto: CreateEventDto, ownerId: string) {
    return this.prisma.event.create({
      data: {
        ...createEventDto,
        owner: {
          connect: { id: ownerId },
        },
      },
    });
  }
}
