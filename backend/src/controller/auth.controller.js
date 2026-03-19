import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateOtp } from "../utils/otpGenerator.js";
import { response } from "../utils/responseHandler.js";
import * as twilloService from "../service/twilloService.js";
import { generateToken } from "../utils/generateTokens.js";
import { sendEmail } from "../service/emailService.js";
import {OAuth2Client} from "google-auth-library"

export const sendOtp = asyncHandler(async (req, res) => {
  const { phoneNumber, phoneSuffix, email } = req.body;
  let user;
  if (email) {
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ email });
  }

  const otp =  generateOtp();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  user.emailOtp = otp;
  user.emailOtpExpiry = expiry;

  await user.save();

  await sendEmail({ email, otp });

  return response(res, 200, "Otp sent to your email", { email });
}
  if (!phoneNumber || !phoneSuffix) {
    return response(res, 400, "phone Number And Suffix Are Required");
  }
  const fullNumber = `${phoneSuffix}${phoneNumber}`;
  user = await User.findOne({ phoneNumber });
  if (!user) {
    user = new User({ phoneNumber, phoneSuffix });
  }
  await twilloService.sendOtpToPhoneNumbser(fullNumber);
  await user.save();

  return response(res, 200, "Otp send to your phone number", { fullNumber });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;
  let user;
  if (email) {
    user = await User.findOne({ email });
    if (!user) {
      return response(res, 404, "User Not Found");
    }
    const now = Date();
    console.log(user.emailOtp,otp);
    console.log(now > user.emailOtpExpiry);
    
    
    if (String(user.emailOtp) !== String(otp) || now > user.emailOtpExpiry) {
      return response(res, 400, "Otp Invalid or Expired");
    }
    user.emailOtpExpiry = null;
    user.emailOtp = null;
    user.isVerified = true;
    await user.save();
  } else {
    if (!phoneNumber || !phoneSuffix) {
      return response(res, 400, "phone Number And Suffix Are Required");
    }
    const fullNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber, phoneSuffix });
    }
    const result = await twilloService.verifyOtp(fullNumber, otp);

    if (result.status !== "approved") {
      return response(res, 400, "Invalid Otp");
    }
    user.isVerified = true;
    await user.save();
  }

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
  return response(res, 200, "Verify Otp Successfully", { token, user });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
  response(res, 200, "User logout successfully!");
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if(!token){
    return response(res,400,"token is required for login")
  }
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub, email, name, picture, email_verified } = payload;

  let user = await User.findOne({ email });
  
  if (!user) {
    user = await User.create({
      googleId: sub,
      username: name,
      email: email,
      profilePicture: picture,
      authProvider: "google",
      isVerified: email_verified,
    });
  } else if (!user.googleId) {
    user.googleId = sub;
    user.authProvider = "google";
    await user.save();
  }

  const JwtToken = generateToken(user._id);

  res.cookie("token", JwtToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });

   return response(res, 200, "Login Successfully Successfully", { token:JwtToken,user });
});
