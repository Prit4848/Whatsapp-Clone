import {Router} from "express"
import authUser from "../middleware/authUser.js"
import * as conversationController from "../controller/conversation.controller.js"

const router = Router()

router.route("/").get(authUser,conversationController.getConversations)
router.route("/").post(authUser,conversationController.createConversation)
router.route("/:conversationId").delete(authUser,conversationController.deleteChat)
router.route("/:conversationId/clear-chat").delete(authUser,conversationController.clearChat)

export default router