import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { NOTIFICATION_QUEUE } from './notification.producer';
import { NOTIFICATION_DLQ } from './notification.dlq';

@Processor(NOTIFICATION_QUEUE, { concurrency: 5 }) // O nome da fila que esse worker vai processar
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(
    private readonly mailService: MailService,
    @InjectQueue(NOTIFICATION_DLQ) private readonly dlq: Queue,
  ) {
    super();
  }
  // process() é chamado automaticamente quando chega um job na fila
  async process(job: Job): Promise<void> {
    this.logger.log(`Processando job: ${job.name} | ID: ${job.id}`);

    // job.name é o nome do evento que você passou no producer
    switch (job.name) {
      case 'user.registered':
        await this.handleUserRegistered(job.data);
        break;

      case 'order.confirmed':
        await this.handleOrderConfirmed(job.data);
        break;

      case 'force.fail':
        throw new Error(
          `Falha forçada para teste de DLQ (tentativa ${job.attemptsMade + 1})`,
        );

      default:
        // Se vier um evento desconhecido, loga mas não lança erro
        this.logger.warn(`Evento desconhecido: ${job.name}`);
    }
  }

  //Chamado atomaticamente após falhas
  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error): Promise<void> {
    if (job.attemptsMade < (job.opts.attempts ?? 1)) return;

    this.logger.error(
      `Job ${job.id} falhou após ${job.attemptsMade} tentativas. Movendo para DLQ. Erro: ${error.message}`,
    );

    await this.dlq.add(
      job.name,
      {
        ...job.data,
        _failedAt: new Date().toISOString(),
        _error: error.message,
        _originalJobId: job.id,
      },
      { removeOnFail: false },
    );
  }

  // Handler específico para o evento de cadastro de usuário
  private async handleUserRegistered(data: {
    recipientEmail: string;
    payload: { name: string };
  }): Promise<void> {
    await this.mailService.send({
      to: data.recipientEmail,
      subject: 'Bem-vindo!',
      // Template simples — num projeto real você usaria Handlebars ou similar
      html: `<h1>Olá, ${data.payload.name}! Seu cadastro foi confirmado.</h1>`,
    });
  }

  // Handler específico para o evento de pedido confirmado
  private async handleOrderConfirmed(data: {
    recipientEmail: string;
    payload: { orderId: string; total: number };
  }): Promise<void> {
    await this.mailService.send({
      to: data.recipientEmail,
      subject: `Pedido #${data.payload.orderId} confirmado!`,
      html: `<p>Seu pedido foi confirmado. Total: R$ ${data.payload.total}</p>`,
    });
  }
}
