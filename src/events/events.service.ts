import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FindAllEventsDto } from './dto/find-all-events.dto';
import { Prisma } from '@prisma/client';

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

  async findAll(query: FindAllEventsDto) {
    const { page = 1, limit = 10, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};

    // 型安全な日付フィルタリング
    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // dateFilterに条件がある場合のみ設定
    if (Object.keys(dateFilter).length > 0) {
      where.eventDatetime = dateFilter;
    }

    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        take: limit,
        skip,
        include: {
          owner: {
            select: {
              nickname: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.event.count({ where }),
    ]);
    return {
      data: events,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
