// models/Message.ts
import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  sender: string;
  recipient: string;
  text: string;
  audioUrl: string;
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    text: { type: String, default: null },
    audioUrl: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
