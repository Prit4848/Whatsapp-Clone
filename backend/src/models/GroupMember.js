import mongoose from "mongoose"

const groupMemberSchema = new mongoose.Schema({
  conversation:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"conversation"
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  role:{
    type:String,
    enum:["member","admin","moderator","editor"],
    default:"member"
  }
})

const GroupMember = mongoose.model("groupmember",groupMemberSchema)
export default GroupMember;
