import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { NOTIFICATION_QUEUE } from './notification.producer';

@Processor(NOTIFICATION_QUEUE)
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(private readonly mailService: MailService) {
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

      default:
        // Se vier um evento desconhecido, loga mas não lança erro
        this.logger.warn(`Evento desconhecido: ${job.name}`);
    }
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
