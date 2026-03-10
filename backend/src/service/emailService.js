import * as SibApiV3Sdk from "sib-api-v3-sdk"; // Change to * as

const sendEmail = async ({ email, otp }) => {
  try {
    // Initialize inside the function to ensure the client is fresh
    const client = SibApiV3Sdk.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_SMTP_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // It is safer to use the SendSmtpEmail constructor
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = { 
      email: process.env.BREVO_EMAIL, 
      name: "WhatsApp Clone" 
    };
    sendSmtpEmail.to = [{ email: email.trim() }];
    sendSmtpEmail.subject = "Your WhatsApp verification code";
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif;">
          <h2>🔐 Verification Code</h2>
          <p>Your OTP is:</p>
          <h1 style="background:#e0f7fa;padding:10px;">${otp}</h1>
          <p>Valid for 5 minutes.</p>
        </div>
      `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return result;

  } catch (err) {
    // If it's a Brevo API error, the message is hidden in err.response.text
    console.error("Email failed:", err.response?.text || err.message);
    throw err;
  }
};

export { sendEmail };