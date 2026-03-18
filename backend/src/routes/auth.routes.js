import {Router} from 'express'
import * as authController from '../controller/auth.controller.js';
import authUser from '../middleware/authUser.js';

const router = Router()

router.route('/send-otp').post(authController.sendOtp)
router.route('/verify-otp').post(authController.verifyOtp)
router.route('/logout').get(authUser,authController.logout)
router.route("/google").post(authController.googleLogin)

export default router;