import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    contentType: { type: String, enum: ["text", "image", "video"] },
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiredAt: { type: Date, required: true },
  },
  { timestamps: true },
);


const Status = mongoose.model('Status',statusSchema)

export default Status;