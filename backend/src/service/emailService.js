import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",
    pass: process.env.BREVO_SMTP_KEY,
  },
});

const sendEmail = async ({ email, otp }) => {
  try {
    const info = await transporter.sendMail({
      from: `"WhatsApp Clone" <${process.env.BREVO_EMAIL}>`,
      to: email.trim(),
      subject: "Your WhatsApp verification code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #075e54;">🔐 Verification Code</h2>
          <p>Your OTP is:</p>
          <h1 style="background: #e0f7fa; display: inline-block; padding: 10px;">${otp}</h1>
          <p>Valid for 5 minutes.</p>
        </div>
      `,
    });

    return info;
  } catch (err) {
    console.error("Email failed:", err.message);
    throw err;
  }
};

export { sendEmail };