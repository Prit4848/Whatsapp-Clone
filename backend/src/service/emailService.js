import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,             // Port 587 is more reliable on Render
  secure: false,         // Must be false for port 587
  requireTLS: true,      // Forces the connection to use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Reminder: Use App Password!
  },
  // Increase timeout settings for cloud environments
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Render Email Connection Error:', error.message);
  } else {
    console.log('✅ Render Email System Ready');
  }
});

const sendEmail = async ({ email, otp }) => {
  if (!email || !email.trim()) {
    throw new Error('Invalid email address');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #075e54; text-align: center;">🔐 Verification Code</h2>
      <p>Your one-time password (OTP) is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="background: #e0f7fa; color: #000; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 5px;">
          ${otp}
        </span>
      </div>
      <p>This code expires in 5 minutes.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"WhatsApp Web Security" <${process.env.EMAIL_USER}>`,
      to: email.trim(),
      subject: "Your WhatsApp verification code",
      html,
    });
    return info;
  } catch (error) {
    // Log the full error to Render logs so you can see exactly why it failed
    console.error("Nodemailer Error:", error.code, error.message);
    throw new Error("Could not send verification email.");
  }
};

export { sendEmail };