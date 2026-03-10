import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ email, otp }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'WhatsApp Security <onboarding@resend.dev>',
            to: email.trim(),
            subject: 'Your WhatsApp verification code',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #075e54;">🔐 Verification Code</h2>
                  <p>Your OTP is:</p>
                  <h1 style="background: #e0f7fa; display: inline-block; padding: 10px;">${otp}</h1>
                  <p>Valid for 5 minutes.</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend Error:", error);
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        console.error("Email failed:", err.message);
        throw err;
    }
};


export {sendEmail}