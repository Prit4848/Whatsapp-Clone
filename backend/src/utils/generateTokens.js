import jwt from 'jsonwebtoken'

export const generateToken = (id)=>{
   const token = jwt.sign({id},process.env.JWT_SECRED,{expiresIn:process.env.JWT_EXPIRED})
   return token;
}