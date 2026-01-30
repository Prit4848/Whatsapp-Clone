import { Router } from "express";
import authRouter from './auth.routes.js'
import userRouter from './user.routes.js'
import messageRouter from './message.routes.js'

const router = Router()

router.use('/auth',authRouter)
router.use('/user',userRouter)
router.use('/message',messageRouter)

export default router;