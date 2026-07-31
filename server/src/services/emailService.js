const nodemailer = require('nodemailer');

// Cached across requests so we don't create a brand new fake Ethereal
// inbox on every single password reset — one test account per server run.
let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  // If real SMTP credentials are provided, use them (production path).
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  // Otherwise, auto-generate a free Ethereal test inbox. Nothing is
  // ever really delivered to a real person — Ethereal just captures
  // the email and gives us a preview link, which is perfect for local
  // development and demos without needing any real email account.
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 Using Ethereal test email account (dev mode) — nothing is sent to real inboxes.');

  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return cachedTransporter;
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  const transporter = await getTransporter();

  // When using real SMTP (e.g. Gmail), the "From" address must match
  // the authenticated account, or the provider will reject/flag the
  // email as spoofed. Ethereal doesn't care, so this only matters once
  // real credentials are configured.
  const fromAddress = process.env.SMTP_USER
    ? `"NutriVibe" <${process.env.SMTP_USER}>`
    : '"NutriVibe" <no-reply@nutrivibe.app>';

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: 'Reset your NutriVibe password',
    text: `You requested a password reset. Click this link to set a new password (expires in 10 minutes): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your NutriVibe account.</p>
        <p><a href="${resetUrl}" style="background:#0d9488;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
        <p style="color:#666;font-size:13px;">This link expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  // If we're on Ethereal, this logs a preview URL you can open in a
  // browser to see the actual email that "sent."
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('📧 Preview the password reset email here:', previewUrl);
  }

  return { previewUrl };
}

module.exports = { sendPasswordResetEmail };