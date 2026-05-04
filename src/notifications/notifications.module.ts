import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { SendNotificationUseCase } from './use-cases/send-notification.use-case';
import {
  NOTIFICATION_QUEUE,
  NotificationProducer,
} from './infra/queue/notification.producer';
import { NotificationWorker } from './infra/queue/notification.worker';
import { MailService } from './infra/mail/mail.service';

@Module({
  imports: [
    // Registra a fila
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE, // 'notifications'
    }),
  ],
  controllers: [NotificationController],
  providers: [
    SendNotificationUseCase,
    NotificationProducer,
    NotificationWorker, // o worker é um provider — NestJS gerencia o ciclo de vida
    MailService,
  ],
})
export class NotificationsModule {}
