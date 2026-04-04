import crypto from "crypto";
import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

const transporter =
  gmailUser && gmailPass
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      })
    : null;

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function sendOtp(email: string, code: string) {
  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`  OTP for ${email}: ${code}`);
    console.log(`========================================\n`);
    return;
  }

  await transporter.sendMail({
    from: `"MitroStart" <${gmailUser}>`,
    to: email,
    subject: `Your MitroStart login code: ${code}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1e1b4b; margin-bottom: 8px;">MitroStart</h2>
        <p style="color: #64748b; margin-bottom: 24px;">Enter this code to sign in:</p>
        <div style="background: #f0f0ff; border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 24px; text-align: center;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
