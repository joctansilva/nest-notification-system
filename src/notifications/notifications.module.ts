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
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { NOTIFICATION_DLQ } from './infra/queue/notification.dlq';

@Module({
  imports: [
    // Registra a fila
    BullModule.registerQueue(
      {
        name: NOTIFICATION_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      },
      { name: NOTIFICATION_DLQ },
    ),
    BullBoardModule.forFeature(
      { name: NOTIFICATION_QUEUE, adapter: BullMQAdapter },
      { name: NOTIFICATION_DLQ, adapter: BullMQAdapter },
    ),
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
