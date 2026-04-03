import crypto from "crypto";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function sendOtp(email: string, code: string) {
  if (!resend) {
    console.log(`\n========================================`);
    console.log(`  OTP for ${email}: ${code}`);
    console.log(`========================================\n`);
    return;
  }

  await resend.emails.send({
    from: "MitroStart <onboarding@resend.dev>",
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
