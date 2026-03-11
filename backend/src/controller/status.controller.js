import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "../utils/responseHandler.js";
import User from "../models/User.js";
import { uploadFiletoClodinary } from "../config/clodinaryConfig.js";
import Status from "../models/Status.js";

export const createStatus = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const userId = req.user._id;

  const user = await User.findOne({ _id: userId });
  if (!user) {
    return response(res, 404, "User Not Found");
  }
  let statusUrl = null;
  let initialContentType = null;
  const file = req.file;
  if (file) {
    const uploadFile = await uploadFiletoClodinary(file);

    if (!uploadFile.secure_url) {
      return response(res, 400, "failed to upload media");
    }

    statusUrl = uploadFile.secure_url;

    const mimeType = file.mimetype || file.mimeType || "";

    if (mimeType.startsWith("video")) {
      initialContentType = "video";
    } else if (mimeType.startsWith("image")) {
      initialContentType = "image";
    } else {
      return response(res, 400, "Unsupported File Type");
    }
  } else if (content) {
    initialContentType = "text";
  } else {
    return response(res, 400, "message Content is require");
  }

  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  const status = new Status({
    user,
    contentType: initialContentType,
    expiredAt: expiry,
    content: content ,
    statusUrl: statusUrl ? statusUrl : ""
  });

  await status.save();

  const populateStatus = await Status.findOne({ _id: status._id })
    .populate("user", "username profilePicture")
    .populate("viewer", "username profilePicture");

  if (req.io && req.socketUserMap) {
    for (const [connectedUserId, socketId] of req.socketUserMap) {
      if (connectedUserId !== userId.toString()) {
        req.io.to(socketId).emit("new_status", populateStatus);
      }
    }
  }

  return response(res, 200, "stauts Created", populateStatus);
});

export const getStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const status = await Status.find({ expiredAt: { $gt: new Date() }, user: { $ne: userId }, })
    .populate("user", "username profilePicture _id")
    .populate("viewer", "username profilePicture _id")
    .sort({ createdAt: -1 });

  return response(res, 200, "get status Succesfully", status);
});

export const getMyStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const status = await Status.find({ expiredAt: { $gt: new Date() }, user: userId , })
    .populate("user", "username profilePicture _id")
    .populate("viewer", "username profilePicture _id")
    .sort({ createdAt: -1 });

  return response(res, 200, "get status Succesfully", status);
});

export const viewStatus = asyncHandler(async (req, res) => {
  const { statusId } = req.params;
  const userId = req.user._id;

  const status = await Status.findOne({ _id: statusId });

  if (!status) {
    return response(res, 404, "staus not found");
  }
  let stautsmessage = null;
  let updatedStatus = null;
  if (!status.viewer.includes(userId)) {
    status.viewer.push(userId);
    await status.save();
    stautsmessage = "status view successfully";

    updatedStatus = await Status.findById(userId)
      .populate("user", "username profilePicture _id")
      .populate("viewer", "username profilePicture _id").sort({createdAt:1});

    if (req.io && req.socketUserMap) {
      const statusOwnerSocketId = req.socketUserMap.get(
        status.user._id.toString(),
      );
      if (statusOwnerSocketId) {
        const viewstatus = {
          statusId,
          viewerId: userId,
          totalViewer: updatedStatus.viewer.length,
          viewer: updatedStatus.viewer,
        };
        req.io.to(statusOwnerSocketId).emit("status_viewer", viewStatus);
      }
    }
  } else {
    stautsmessage = "user alredy view status";
  }

  return response(res, 200, stautsmessage, updatedStatus);
});

export const deleteStatus = asyncHandler(async (req, res) => {
  const { statusId } = req.params;
  const userId = req.user._id;

  const status = await Status.findById(statusId);

  if (!status) {
    return response(res, 404, "status not found");
  }

  if (userId.toString() !== status.user.toString()) {
    return response(res, 401, "You Dont have authorized Delete the Status");
  }

  await status.deleteOne();

  if (req.io && req.socketUserMap) {
    for (const [connectedUserId, socketId] of req.socketUserMap) {
      if (connectedUserId !== userId.toString()) {
        req.io.to(socketId).emit("delete_status", status._id);
      }
    }
  }

  return response(res, 200, "status delete succesfully");
});
