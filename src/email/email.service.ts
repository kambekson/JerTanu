import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAILTRAP_HOST'), // Используйте host для Mailtrap
      port: this.configService.get<number>('MAILTRAP_PORT'),               // Порт для Mailtrap
      auth: {
        user: this.configService.get<string>('MAILTRAP_USER'),  // Добавьте в .env MAILTRAP_USER

        pass: process.env.MAILTRAP_PASS,  // Добавьте в .env MAILTRAP_PASS
      },
    });
  }

  async onModuleInit() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get<string>('EMAIL_USER'),
        clientId: this.configService.get<string>('EMAIL_CLIENT_ID'),
        clientSecret: this.configService.get<string>('EMAIL_CLIENT_SECRET'),
        refreshToken: this.configService.get<string>('EMAIL_REFRESH_TOKEN'),
      },
    });

    // Проверка подключения
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Ошибка подключения к почтовому серверу:', error);
      } else {
        this.logger.log('Подключение к почтовому серверу успешно');
      }
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const appUrl = this.configService.get<string>('APP_URL');
    // const verificationLink = `${appUrl}/api/auth/verify-email/${token}`;
    const verificationLink = `${process.env.APP_URL}/api/auth/verify-email/${token}`;


    await this.transporter.sendMail({
      // from: `"My App" <${this.configService.get<string>('EMAIL_USER')}>`,
      from: process.env.MAILTRAP_USER,  // Укажите ваш адрес отправителя

      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await this.transporter.sendMail({
      from: process.env.MAILTRAP_USER,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <h1>Password Reset</h1>
        <p>Your password reset code is: <strong>${token}</strong></p>
        <p>This code will expire in 30 minutes.</p>
        <p>If you did not request this reset, please ignore this email.</p>
      `,
    });
  }
}
