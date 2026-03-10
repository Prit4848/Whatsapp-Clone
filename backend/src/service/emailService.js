import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_SMTP_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ email, otp }) => {
  try {
    await apiInstance.sendTransacEmail({
      sender: {
        email: process.env.BREVO_EMAIL,
        name: "WhatsApp Clone",
      },
      to: [{ email: email.trim() }],
      subject: "Your WhatsApp verification code",
      htmlContent: `
        <div style="font-family: Arial, sans-serif;">
          <h2>🔐 Verification Code</h2>
          <p>Your OTP is:</p>
          <h1 style="background:#e0f7fa;padding:10px;">${otp}</h1>
          <p>Valid for 5 minutes.</p>
        </div>
      `,
    });

  } catch (err) {
    console.error("Email failed:", err);
    throw err;
  }
};

export { sendEmail };