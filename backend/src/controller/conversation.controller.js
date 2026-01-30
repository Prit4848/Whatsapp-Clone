import Conversation from "../models/Conversation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "../utils/responseHandler.js";

export const getConversations = asyncHandler(async (req,res)=>{
    const userId = req.user._id;

    const conversations = await Conversation.find({participants:userId})
    .populate("participants","username profilePicture isOnline lastSeen")
    .populate({path:"lastMessage",
        populate:{
            path:"sender receiver",
            select:"username profilePicture"
        }
    }).sort({updatedAt:-1})

   return response(res,200,'get Conversations Successfully',conversations)
})

