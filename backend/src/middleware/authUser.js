import jwt from 'jsonwebtoken'
import User from "../models/User.js"
import { response } from '../utils/responseHandler.js'

const authUser = async (req,res,next)=>{
  const token = req.cookies?.token
  if(!token){
    return response(res,400,"Unauthorized request")
  }
  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRED)
    const user = await User.findOne({_id:decoded.id}).select("-password")

    req.user = user;
    next()
  } catch (error) {
    return response(res,500,`${error.message}`)
  }
}

export default authUser;