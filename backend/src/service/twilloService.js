import twillo from 'twilio'

const authtoken = process.env.TWILLO_AUTH_TOKEN
const acoountSid = process.env.TWILLO_ACCOUNT_SID
const servicesid = process.env.TWILLO_SERVICE_SID

const client = twillo(acoountSid,authtoken)

const sendOtpToPhoneNumbser = async (phoneNumber)=>{
  try {
    console.log(`send otp to phone number:${phoneNumber}`);
    const response = await client.verify.v2.services(servicesid).verifications.create({
        to:phoneNumber,
        channel:'sms'
    })
    console.log('this is my otp response',response);
    return response
  } catch (error) {
    console.error(error.mesaage);
    throw new Error("Failed to send otp")
    
  }
}

const verifyOtp = async (phoneNumber,otp)=>{
    try {
    
        const response = await client.verify.v2.services(servicesid).verificationChecks.create({
            to:phoneNumber,
            code:otp
        })
        return response;
    } catch (error) {
         console.error(error.mesaage);
    throw new Error("Failed to otp Verification")
    }
}

export {sendOtpToPhoneNumbser,verifyOtp}