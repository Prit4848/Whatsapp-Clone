import {Router} from "express"
import authUser from "../middleware/authUser.js"
import {multerMiddleware} from "../middleware/multerMiddleware.js"
import * as conversationController from "../controller/conversation.controller.js"

const router = Router()

//For Direct Chat
router.route("/").get(authUser,conversationController.getConversations)
router.route("/").post(authUser,conversationController.createConversation)
router.route("/:conversationId").delete(authUser,conversationController.deleteChat)
router.route("/:conversationId/clear-chat").delete(authUser,conversationController.clearChat)

//For Group chat
router.route("/create-group").post(authUser,multerMiddleware,conversationController.createGroup)
router.route("/:conversationId/update-group").put(authUser,multerMiddleware,conversationController.updateGroup)
router.route("/:conversationId/remove-member").post(authUser,conversationController.removeMemberFromGroup)
router.route("/:conversationId/leave").post(authUser,conversationController.leaveGroup)
router.route("/:conversationId/remove-admin").post(authUser,conversationController.removeAdmin)
router.route("/:conversationId/permissions").put(authUser,conversationController.updateGroupPermissions)
router.route("/:conversationId/announcement-mode").post(authUser,conversationController.setAnnouncementMode)
export default router