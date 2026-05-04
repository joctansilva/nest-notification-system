import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async send(options: MailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: '"App De Notificações" <no-reply@app.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`Email enviado: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha ao enviar e-mail: ${message}`);
      throw error;
    }
  }
}
