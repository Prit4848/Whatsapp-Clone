import {Router} from 'express'
import authUser from '../middleware/authUser.js'
import * as messageController from '../controller/message.controller.js'

const router = Router()

router.route('/send-message').post(authUser,messageController.sendMessage)
router.route('/:conversationId').get(authUser,messageController.getMessages)
router.route('/read').put(authUser,messageController.markasRead)
router.route('/:messageId').delete(authUser,messageController.deleteMessage)
router.route("/:messageId").put(authUser,messageController.editMessage);

export default router