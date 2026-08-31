import { env } from '../config/env';

export class EmailService {
  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    if (env.EMAIL_PROVIDER === 'mock') {
      console.log('\n----------------------------------------');
      console.log(`[MOCK EMAIL] To: ${to}`);
      console.log(`[MOCK EMAIL] Subject: ${subject}`);
      console.log(`[MOCK EMAIL] HTML Body:\n${html}`);
      console.log(`[MOCK EMAIL] Text Body:\n${text}`);
      console.log('----------------------------------------\n');
      return;
    }

    if (!env.RESEND_API_KEY) {
      console.warn('⚠️ Resend API Key is missing. Falling back to mock logging.');
      console.log(`[MOCK EMAIL] To: ${to} (Fallback)`);
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`📧 Email successfully sent via Resend to ${to}. Message ID:`, (data as { id?: string }).id);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    const subject = 'Verify your Algora account';
    
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e293b; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Welcome to Algora AI!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
          Thank you for joining our coding learning platform. Please verify your email address to get started.
        </p>
        <div style="margin-bottom: 24px;">
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #4f46e5; border-radius: 8px; text-decoration: none;">
            Verify Email
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">
          If the button above does not work, copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; margin-bottom: 24px;">
          <a href="${verifyLink}" style="color: #4f46e5; text-decoration: underline;">${verifyLink}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 16px;" />
        <p style="color: #94a3b8; font-size: 12px; line-height: 18px;">
          This link will expire in 24 hours. If you did not sign up for an Algora account, please ignore this email.
        </p>
      </div>
    `;

    const text = `Welcome to Algora AI!\n\nPlease verify your email address by clicking the link below:\n\n${verifyLink}\n\nThis link will expire in 24 hours.`;

    await this.sendEmail(to, subject, html, text);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = 'Reset your Algora password';

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e293b; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Reset Password Requested</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to choose a new password.
        </p>
        <div style="margin-bottom: 24px;">
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #4f46e5; border-radius: 8px; text-decoration: none;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">
          If the button above does not work, copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; margin-bottom: 24px;">
          <a href="${resetLink}" style="color: #4f46e5; text-decoration: underline;">${resetLink}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 16px;" />
        <p style="color: #94a3b8; font-size: 12px; line-height: 18px;">
          This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    const text = `Reset your Algora password\n\nPlease reset your password by clicking the link below:\n\n${resetLink}\n\nThis link will expire in 1 hour.`;

    await this.sendEmail(to, subject, html, text);
  }

  async sendEmailChangeVerification(to: string, token: string): Promise<void> {
    const verifyLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    const subject = 'Verify your new Algora email address';

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e293b; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Verify New Email Address</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
          You requested to change your email address on Algora AI. Please click the button below to verify this new address.
        </p>
        <div style="margin-bottom: 24px;">
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #4f46e5; border-radius: 8px; text-decoration: none;">
            Verify Email
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">
          If the button above does not work, copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; margin-bottom: 24px;">
          <a href="${verifyLink}" style="color: #4f46e5; text-decoration: underline;">${verifyLink}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 16px;" />
        <p style="color: #94a3b8; font-size: 12px; line-height: 18px;">
          This link will expire in 24 hours. If you did not request this email change, please ignore this email.
        </p>
      </div>
    `;

    const text = `Verify your new Algora email address\n\nPlease verify your email by clicking the link below:\n\n${verifyLink}\n\nThis link will expire in 24 hours.`;

    await this.sendEmail(to, subject, html, text);
  }
}

export const emailService = new EmailService();
