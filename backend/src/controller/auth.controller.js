import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateOtp } from "../utils/otpGenerator.js";
import { response } from "../utils/responseHandler.js";
import * as twilloService from "../service/twilloService.js";
import { generateToken } from "../utils/generateTokens.js";
import { sendEmail } from "../service/emailService.js";

export const sendOtp = asyncHandler(async (req, res) => {
  const { phoneNumber, phoneSuffix, email } = req.body;
  const otp = generateOtp();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  let user;
  if (email) {
    user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }
    await sendEmail({ email, otp });
    user.emailOtpExpiry = expiry;
    user.emailOtp = otp;
    await user.save();

    return response(res, 200, "Otp send to your email", { email });
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
    if (String(user.emailOtp) !== String(otp) || now > user.emailOtpExpiry) {
      return response(res, 400, "Otp Invalid or Expired");
    }
    user.emailOtpExpiry = null;
    user.emailOtp = null;
    user.isVarified = true;
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
    user.isVarified = true;
    await user.save();
  }

  const token = generateToken(user._id);

  const isProd = process.env.NODE_ENV === "production";
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
