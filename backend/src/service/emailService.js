import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service connection Failed:', error.message);
  } else {
    console.log('✅ Email service is configured and ready');
  }
});

const sendEmail = async ({ email, otp }) => {
  if (!email || !email.trim()) {
    throw new Error('Invalid email address');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #075e54; text-align: center;">🔐 WhatsApp Web Verification</h2>
      <p>Hi there,</p>
      <p>Your one-time password (OTP) to verify your WhatsApp Web account is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="background: #e0f7fa; color: #000; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 5px;">
          ${otp}
        </span>
      </div>
      <p><strong>This OTP is valid for the next 5 minutes.</strong> Please do not share this code with anyone.</p>
      <p>If you didn’t request this OTP, please ignore this email.</p>
      <p style="margin-top: 20px;">Thanks & Regards,<br/><strong>WhatsApp Web Security Team</strong></p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message. Please do not reply.</p>
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
    console.error("Error sending email:", error);
    throw new Error("Could not send verification email.");
  }
};

export { sendEmail };