import {Router} from 'express'
import * as authController from '../controller/auth.controller.js';

const router = Router()

router.route('/send-otp').post(authController.sendOtp)
router.route('/verify-otp').post(authController.verifyOtp)

export default router;