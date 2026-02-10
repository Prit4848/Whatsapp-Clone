import Conversation from "../models/Conversation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "../utils/responseHandler.js";

export const getConversations = asyncHandler(async (req,res)=>{
    const userId = req.user._id;

    const conversations = await Conversation.find({participants:userId})
    .populate("participants","username profilePicture isOnline lastSeen phoneNumber phoneSuffix email")
    .populate({path:"lastMessage",
        populate:{
            path:"sender receiver",
            select:"username profilePicture"
        }
    }).sort({updatedAt:-1}).lean()

    const formatedParticipant = conversations.map((conversation)=>{
        const otherUser = conversation.participants.find((user)=> user._id !== userId)

        return {
            ...conversation,
            otherUser
        }
    })
   return response(res,200,'get Conversations Successfully',{conversations:formatedParticipant})
})

export const createConversation = asyncHandler(async (req,res)=>{
    const userId = res.user._id;
    const {participant} = req.body;

    if(!participant){
        return response(res,404,'All Fields Are Required')
    }

    const participants = [userId,participant].sort()

    const isExist = await Conversation.findOne({participants});

    if(isExist){
        return response(res,400,"Conversation Alredy Exist")
    }
    let conversation 
    conversation = new Conversation({
        participants:participants
    })

    await conversation.save()

    return response(res,200,"Conversation Create Succesfully!",conversation)
})

