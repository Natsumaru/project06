import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FindAllEventsDto } from './dto/find-all-events.dto';
import { Prisma } from '@prisma/client';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEventDto: CreateEventDto, ownerId: string) {
    // 過去の日時のイベントは作成できない
    const eventDate = new Date(createEventDto.eventDatetime);
    if (eventDate < new Date()) {
      throw new BadRequestException(
        'You cannot create an event with a past date and time.',
      );
    }

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

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async join(eventId: string, userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: {
              participations: true,
            },
          },
        },
      });
      // イベントの存在チェック
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      // 定員チェック
      if (event.capacity <= event._count.participations) {
        throw new BadRequestException('This event has reached its capacity');
      }

      // 参加済みチェック
      const exisringParticipation = await prisma.participation.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });
      if (exisringParticipation) {
        throw new BadRequestException(
          `You are already participating in the event with ID ${eventId}.`,
        );
      }
      // オーナーは参加できない
      if (event.ownerId === userId) {
        throw new BadRequestException(
          `You cannot join your own event with ID ${eventId}, because you are the owner.`,
        );
      }

      // 過去のイベントへの参加はできない
      if (event.eventDatetime < new Date()) {
        throw new BadRequestException(
          `You cannot join the past event with ID ${eventId}.`,
        );
      }

      return prisma.participation.create({
        data: {
          eventId,
          userId,
          paymentStatus: 'UNPAID', // ここでは支払いを簡略化しているので後々追加する
        },
      });
    });
  }

  async update(
    eventId: string,
    userId: string,
    updateEventDto: UpdateEventDto,
  ) {
    const event = await this.findOne(eventId);

    if (event.ownerId !== userId) {
      throw new ForbiddenException(
        `You cannot update the event with ID ${eventId}, because you are not the owner.`,
      );
    }

    // 過去のイベントは更新できない
    if (event.eventDatetime < new Date()) {
      throw new BadRequestException(
        `You cannot update the past event with ID ${eventId}.`,
      );
    }

    // 更新時の日付が過去の日時でないかチェック
    if (updateEventDto.eventDatetime) {
      const newEventDate = new Date(updateEventDto.eventDatetime);
      if (newEventDate < new Date()) {
        throw new BadRequestException(
          'You cannot update an event with a past date and time.',
        );
      }
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: updateEventDto,
    });
  }

  async remove(eventId: string, userId: string) {
    const event = await this.findOne(eventId);

    if (event.ownerId !== userId) {
      throw new ForbiddenException(
        `You cannot delete the event with ID ${eventId}, because you are not the owner.`,
      );
    }

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    return;
  }
}
