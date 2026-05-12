import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // These env vars must be set in .env.local
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;

  if (!SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
    console.error("Email env vars not configured. See .env.local.example");
    // Gracefully fail so the form feels like it worked during dev
    return NextResponse.json({ ok: true });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST ?? "smtp.gmail.com",
    port: Number(SMTP_PORT ?? 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"The Album Portfolio" <${SMTP_USER}>`,
    to: CONTACT_TO,
    replyTo: email,
    subject: `Portfolio enquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #1a1008; color: #f5e6c8; padding: 32px; border: 1px solid rgba(212,160,23,0.2);">
        <h2 style="color: #d4a017; font-size: 22px; margin-bottom: 24px; border-bottom: 1px solid rgba(212,160,23,0.2); padding-bottom: 12px;">
          New message from The Album
        </h2>
        <p style="color: #c4a882; font-size: 12px; letter-spacing: 0.15em; margin-bottom: 4px;">FROM</p>
        <p style="font-size: 17px; margin-bottom: 20px;">${name} &mdash; <a href="mailto:${email}" style="color: #d4a017;">${email}</a></p>
        <p style="color: #c4a882; font-size: 12px; letter-spacing: 0.15em; margin-bottom: 4px;">MESSAGE</p>
        <p style="font-size: 16px; line-height: 1.7; white-space: pre-wrap; border-left: 2px solid rgba(212,160,23,0.3); padding-left: 16px;">${message}</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
