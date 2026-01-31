import { Router } from "express";
import authRouter from './auth.routes.js'
import userRouter from './user.routes.js'
import messageRouter from './message.routes.js'
import statusRouter from './stuatus.route.js'

const router = Router()

router.use('/auth',authRouter)
router.use('/user',userRouter)
router.use('/message',messageRouter)
router.use("/status",statusRouter)

export default router;