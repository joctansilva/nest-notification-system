import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Notification } from 'src/notifications/domain/notification.entity';

//Nome da fila
export const NOTIFICATION_QUEUE = 'notifications';

@Injectable()
export class NotificationProducer {
  constructor(
    //Injetando a instancia da fila
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly queue: Queue,
  ) {}

  // Recebe uma entidade de dominio e publica na fila
  async publish(notification: Notification): Promise<void> {
    await this.queue.add(
      notification.event, // Nome do Job
      {
        recipientEmail: notification.recipientEmail,
        payload: notification.payload,
        createdAt: notification.createdAt,
      },
      {
        attempts: 3, // Numero de tentativas se falhar
        backoff: {
          type: 'exponential',
          delay: 1000, // 1 Segundo para retry
        },
        removeOnComplete: true, //Remove quando concluído
        removeOnFail: false, // Mantem se falhar
      },
    );
  }
}
