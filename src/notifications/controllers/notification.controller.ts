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
import { BulkTestDto, NotificationDto } from './notification.dto';

@Controller('notifications') // rota /notifications
export class NotificationController {
  constructor(
    //Só conhece o use case, nada alem disso
    private readonly sendNotification: SendNotificationUseCase,
  ) {}

  @Post() // POST /notifications
  @HttpCode(HttpStatus.ACCEPTED) // Retorna 202
  async handle(@Body() body: NotificationDto) {
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

  @Post('bulk-test')
  @HttpCode(HttpStatus.ACCEPTED)
  async bulkTest(@Body() body: BulkTestDto) {
    const { total, failCount } = body;

    const jobs: Promise<void>[] = [];
    for (let i = 0; i < total; i++) {
      const shouldFail = i < failCount;
      const dto: SendNotificationDto = shouldFail
        ? {
            event: 'force.fail',
            recipientEmail: `fail-test-${i}@test.com`,
            payload: {},
          }
        : {
            event: 'user.registered',
            recipientEmail: `user${i}@ethereal-test.com`,
            payload: { name: `Usuário ${i}` },
          };

      jobs.push(this.sendNotification.execute(dto));
    }

    await Promise.all(jobs);

    return {
      message: `${total} jobs enfileirados`,
      details: { total, willSucceed: total - failCount, willFail: failCount },
    };
  }
}
