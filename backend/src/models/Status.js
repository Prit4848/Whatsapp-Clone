import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: { type: String, required: true },
    contentType: { type: String, enum: ["text", "image", "video"] },
    viewer:[{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    expiredAt: { type: Date, required: true },
  },
  { timestamps: true },
);


const Status = mongoose.model('status',statusSchema)

export default Status;