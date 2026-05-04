import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  SendNotificationDto,
  SendNotificationUseCase,
} from '../use-cases/send-notification.use-case';

class NotificationBody {
  event: string;
  recipientEmail: string;
  payload: Record<string, unknown>;
}

@Controller('notifications') // rota /notifications
export class NotificationController {
  constructor(
    //Só conhece o use case, nada alem disso
    private readonly sendNotification: SendNotificationUseCase,
  ) {}

  @Post() // POST /notifications
  @HttpCode(HttpStatus.ACCEPTED) // Retorna 202
  async handle(@Body() body: NotificationBody) {
    // Validaçao básica dos campos obrigatórios
    if (!body.event || !body.recipientEmail) {
      throw new BadRequestException(
        'Event and recipientEmail são obrigatórios',
      );
    }

    // Monta o DTO para o use case
    const dto: SendNotificationDto = {
      event: body.event,
      recipientEmail: body.recipientEmail,
      payload: body.payload ?? {},
    };

    await this.sendNotification.execute(dto);

    return { message: 'Notificação enviada para processamento' };
  }
}
