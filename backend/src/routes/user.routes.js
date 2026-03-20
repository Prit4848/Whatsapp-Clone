import {Router} from 'express'
import * as userController from '../controller/user.controller.js'
import {multerMiddleware} from '../middleware/multerMiddleware.js'
import authUser from '../middleware/authUser.js'

const router = Router()

router.route("/update-profile").put(authUser,multerMiddleware,userController.updateProfile)
router.route("/profile").get(authUser,userController.authorizedUser)
router.route("/users").get(authUser,userController.allUsers)
router.route("/users-group").get(authUser,userController.allUserGroupChat)

export default router