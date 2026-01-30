import {Router} from 'express'
import * as userController from '../controller/user.controller.js'
import {multerMiddleware} from '../middleware/multerMiddleware.js'
import authUser from '../middleware/authUser.js'

const route = Router()

route.route("/update-profile").put(authUser,multerMiddleware,userController.updateProfile)
route.route("/profile").get(authUser,userController.authorizedUser)
route.route("/users").get(authUser,userController.allUsers)

export default route