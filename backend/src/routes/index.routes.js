import { Router } from "express";
import authRouter from './auth.routes.js'
import userRouter from './user.routes.js'
import messageRouter from './message.routes.js'
import statusRouter from './stuatus.route.js'
import conversationRouter from './conversation.routes.js'

const router = Router()

router.use('/auth',authRouter)
router.use('/user',userRouter)
router.use('/message',messageRouter)
router.use("/status",statusRouter)
router.use("/conversation",conversationRouter)

export default router;