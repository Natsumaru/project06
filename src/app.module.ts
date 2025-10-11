import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { QuestionsModule } from './questions/questions.module';
import { ChatsModule } from './chats/chats.module';
import { DmsModule } from './dms/dms.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    EventsModule,
    QuestionsModule,
    ChatsModule,
    DmsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
