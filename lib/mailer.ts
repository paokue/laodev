import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(to: string, otp: string, name: string) {
  await transporter.sendMail({
    from: `"LaoDev" <${process.env.SMTP_USER}>`,
    to,
    subject: "LaoDev - Verify Your Email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0a; border-radius: 12px; border: 1px solid #1a1a1a;">
        <h2 style="color: #22c55e; margin: 0 0 8px;">LaoDev</h2>
        <p style="color: #e5e5e5; margin: 0 0 24px;">Hello ${name},</p>
        <p style="color: #a3a3a3; margin: 0 0 24px;">Your verification code is:</p>
        <div style="background: #111; border: 1px solid #22c55e33; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #22c55e;">${otp}</span>
        </div>
        <p style="color: #a3a3a3; margin: 0 0 8px;">This code expires in <strong style="color: #e5e5e5;">10 minutes</strong>.</p>
        <p style="color: #666; font-size: 12px; margin: 24px 0 0;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(to: string, resetToken: string, name: string) {
  const resetUrl = `${process.env.APP_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"LaoDev" <${process.env.SMTP_USER}>`,
    to,
    subject: "LaoDev - Reset Your Password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0a; border-radius: 12px; border: 1px solid #1a1a1a;">
        <h2 style="color: #22c55e; margin: 0 0 8px;">LaoDev</h2>
        <p style="color: #e5e5e5; margin: 0 0 24px;">Hello ${name},</p>
        <p style="color: #a3a3a3; margin: 0 0 24px;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: #22c55e; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #a3a3a3; margin: 0 0 8px;">This link expires in <strong style="color: #e5e5e5;">1 hour</strong>.</p>
        <p style="color: #666; font-size: 12px; margin: 24px 0 0;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}
