import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { env } from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    // If no real SMTP credentials are provided, we can either use Ethereal (fake SMTP)
    // or simply skip configuring a transporter and fallback to console logs.
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT) || 587,
        secure: Number(env.SMTP_PORT) === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      this.isInitialized = true;
      logger.info('Email service initialized with real SMTP credentials');
    } else {
      logger.warn('No SMTP credentials found. Emails will be logged to the console instead of sent.');
    }
  }

  async sendRegistrationOTP(to: string, otp: string) {
    const subject = 'VoltEdge - Your Verification Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2 style="color: #6C63FF;">Welcome to VoltEdge!</h2>
        <p style="font-size: 16px; color: #333;">Please use the following 6-digit code to verify your email address and complete your registration:</p>
        <div style="background-color: #f4f4f4; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
        <p style="font-size: 14px; color: #777;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    if (this.isInitialized && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"VoltEdge" <${env.SMTP_USER}>`,
          to,
          subject,
          html,
        });
        logger.info(`OTP email sent to ${to}`);
      } catch (error) {
        logger.error(`Failed to send OTP email to ${to}:`, error);
      }
    } else {
      // Fallback: log the OTP so the developer can see it during development
      logger.info('==========================================');
      logger.info(`✉️  MOCK EMAIL SENT TO: ${to}`);
      logger.info(`🔑 OTP CODE: ${otp}`);
      logger.info('==========================================');
    }
  }
}

export const emailService = new EmailService();
