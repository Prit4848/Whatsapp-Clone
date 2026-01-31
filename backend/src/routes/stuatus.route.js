import { Router } from "express";
import authUser from "../middleware/authUser.js";
import {createStatus,viewStatus,deleteStatus,getStatus} from "../controller/status.controller.js"

const router = Router()

router.route("/").post(authUser,createStatus)
router.route("/:statusId/view").get(authUser,viewStatus)
router.route("/:statusId/delete").delete(authUser,deleteStatus)
router.route("/").get(authUser,getStatus)

export default router