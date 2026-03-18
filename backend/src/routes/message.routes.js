import {Router} from 'express'
import authUser from '../middleware/authUser.js'
import {multerMiddleware} from "../middleware/multerMiddleware.js"
import * as messageController from '../controller/message.controller.js'

const router = Router()

router.route('/send-message').post(authUser,multerMiddleware,messageController.sendMessage)
router.route('/:conversationId').get(authUser,messageController.getMessages)
// router.route('/read').put(authUser,messageController.markasRead)
router.route('/:messageId').delete(authUser,messageController.deleteMessage)
router.route("/:messageId").put(authUser,messageController.editMessage);
router.route("/send-poll").post(authUser,messageController.sendPoll)
router.route("/vote").post(authUser,messageController.votePoll)
router.route("/react").post(authUser,messageController.reactToMessage)
router.route("/reply").post(authUser,messageController.replyMessage)
router.route("/read").put(authUser,messageController.markMessagesAsRead)

export default router