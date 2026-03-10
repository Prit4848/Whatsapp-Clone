import jwt from 'jsonwebtoken'
import User from "../models/User.js"
import { response } from '../utils/responseHandler.js'

const authUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    console.log(req);
    
    if (!token) {
      return response(res, 401, "Unauthorized: No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Note: Fix typo "SECRED" -> "SECRET"
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return response(res, 401, "Unauthorized: User no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    
    const message = error.name === "TokenExpiredError" ? "Session expired" : "Invalid token";
    return response(res, 401, message);
  }
};
export default authUser;