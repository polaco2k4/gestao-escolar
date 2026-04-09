import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import { emailQueue, smsQueue } from '../config/queue';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export class NotificationService {
  async sendEmail(to: string, subject: string, html: string) {
    try {
      if (emailQueue) {
        await emailQueue.add('send-email', { to, subject, html });
        logger.info(`Email enfileirado para: ${to}`);
      } else {
        logger.info(`Email directo para: ${to} (sem fila)`);
        await this.processEmailQueue({ data: { to, subject, html } });
      }
      return { success: true };
    } catch (error) {
      logger.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async sendSMS(phone: string, message: string) {
    try {
      if (smsQueue) {
        await smsQueue.add('send-sms', { phone, message });
        logger.info(`SMS enfileirado para: ${phone}`);
      } else {
        logger.info(`SMS directo para: ${phone} (sem fila)`);
        await this.processSMSQueue({ data: { phone, message } });
      }
      return { success: true };
    } catch (error) {
      logger.error('Erro ao enviar SMS:', error);
      throw error;
    }
  }

  async processEmailQueue(job: any) {
    const { to, subject, html } = job.data;
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      });
      logger.info(`Email enviado para: ${to}`);
    } catch (error) {
      logger.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async processSMSQueue(job: any) {
    const { phone, message } = job.data;
    logger.info(`SMS stub enviado para ${phone}: ${message}`);
  }
}

export default new NotificationService();
