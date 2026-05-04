import { Injectable } from '@nestjs/common';
import { Notification } from '../domain/notification.entity';
import { NotificationProducer } from '../infra/queue/notification.producer';

export interface SendNotificationDto {
  event: string;
  recipientEmail: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class SendNotificationUseCase {
  constructor(
    // Injeçao de dependencia
    private readonly producer: NotificationProducer,
  ) {}

  async execute(dto: SendNotificationDto): Promise<void> {
    // Cria a entidade
    const notification = new Notification({
      event: dto.event,
      recipientEmail: dto.recipientEmail,
      payload: dto.payload,
    });

    // Publica na fila
    await this.producer.publish(notification);
  }
}
