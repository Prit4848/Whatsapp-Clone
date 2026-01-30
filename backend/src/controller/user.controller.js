import { uploadFiletoClodinary } from "../config/clodinaryConfig.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "../utils/responseHandler.js";

export const updateProfile = asyncHandler(async (req,res)=>{
  const {username,agreed,about} = req.body;
  const userId = req.user._id
  let user;
  user = await User.findOne({_id:userId})
  const file = req.file
  if(file){
    const uploadResult = await uploadFiletoClodinary(file)
    console.log(uploadResult);
    user.profilePicture = uploadResult.secure_url;
  }else if(req.body.profilePicture){
    user.profilePicture = req.body.profilePicture;
  }

  if(username) user.username = username;
  if(agreed) user.agreed = agreed;
  if(about) user.about = about;
   console.log(user);
   
  await user.save()

  return response(res,200,'Profile Updated',user)
})

export const authorizedUser = asyncHandler(async (req,res)=>{
    const userId = req.user._id
    if(!userId){
        return response(res,400,'Unathorized User')
    }
    const user = await User.findOne({_id:userId})
    if(!user){
        return response(res,404,'User Not Found')
    }
    return response(res,200,"Profile get Successfully",user)
})

export const allUsers = asyncHandler(async (req,res)=>{
    const userId = req.user._id;
    const users = await User.find({ _id: { $ne: userId } })
      .select(
        "ussername profilePicture lastSeen isOnline about phoneNumber phoneSuffix",
      )
      .lean();
    if(!users){
        return response(res,400,"Users Are Not Found")
    }
    const UsersAndConversations = await Promise.all(
      users.map(async (user) => {
        const conversation = await User.findOne({
          participants: { $all: [userId, user?._id] },
        })
          .populate("lastMessage", "sender receiver content content")
          .lean();

          return {
            ...user,conversation : conversation || null
          }
      }),
    );

    return response(res,200,"get all user and userconversations successfully",UsersAndConversations)
})