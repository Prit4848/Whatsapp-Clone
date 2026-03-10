import * as SibApiV3Sdk from 'sib-api-v3-sdk';

const sendEmail = async ({ email, otp }) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  
  // Configure API key authorization
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_SMTP_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "Your WhatsApp verification code";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2>🔐 Verification Code</h2>
      <p>Your OTP is:</p>
      <h1 style="background:#e0f7fa;padding:10px;">${otp}</h1>
      <p>Valid for 5 minutes.</p>
    </div>
  `;
  sendSmtpEmail.sender = { "name": "WhatsApp Clone", "email": process.env.BREVO_EMAIL };
  sendSmtpEmail.to = [{ "email": email.trim() }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Brevo API Error Details:", error.response?.text || error.message);
    throw error;
  }
};

export { sendEmail };