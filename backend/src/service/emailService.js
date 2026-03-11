import nodemailer from 'nodemailer';

/**
 * Sends an email using Nodemailer with a Promise wrapper.
 * Adapted from the pattern by Gour Chandra Saha.
 */
const sendEmail = async ({ email, otp }) => {
  // 1. Validation
  if (!email || !email.trim()) {
    throw new Error('Invalid email address');
  }

  // 2. Prepare HTML content (WhatsApp Clone Theme)
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #075e54; text-align: center;">🔐 Verification Code</h2>
      <p>Your one-time password (OTP) is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="background: #e0f7fa; color: #000; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 5px;">
          ${otp}
        </span>
      </div>
      <p>This code expires in 5 minutes. If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <small style="color: #888;">WhatsApp Clone Security Team</small>
    </div>
  `;

  // 3. Configure Transporter
  // Using Port 465 with secure: true as requested, 
  // but adding tls object to handle hosting handshake issues.
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // This helps bypass timeout/handshake issues on Render
      rejectUnauthorized: false, 
    },
  });

  const mailData = {
    from: `"WhatsApp Clone" <${process.env.EMAIL_USER}>`,
    to: email.trim(),
    subject: "Your WhatsApp verification code",
    html,
  };

  // 4. Wrap sendMail in a Promise for better async/await handling on Render
  return await new Promise((resolve, reject) => {
    transporter.sendMail(mailData, (err, info) => {
      if (err) {
        console.error("Nodemailer Error:", err);
        reject(err);
      } else {
        console.log("Email sent successfully:", info.messageId);
        resolve(info);
      }
    });
  });
};

export { sendEmail };