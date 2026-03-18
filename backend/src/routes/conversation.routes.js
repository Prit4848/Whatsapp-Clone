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
router.route("/:id/update-group").put(authUser,multerMiddleware,conversationController.updateGroup)
router.route("/:id/remove-member").post(authUser,conversationController.removeMemberFromGroup)
router.route("/:id/leave").post(authUser,conversationController.leaveGroup)
router.route("/:id/make-admin").put(authUser,conversationController.makeAdmin)
router.route("/:id/remove-admin").post(authUser,conversationController.removeAdmin)
router.route("/:id/permissions").put(authUser,conversationController.updateGroupPermissions)
router.route("/:id/announcement-mode").post(authUser,conversationController.setAnnouncementMode)

export default router