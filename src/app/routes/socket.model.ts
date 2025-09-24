// models/Message.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  recipient: string;
  text?: string | null;
  audioUrl?: string | null;
  fileUrl?: string | null;       // Cloudinary URL
  fileType?: string | null;      // "image" | "audio" | "video" | "raw"
  publicId?: string | null;      // Cloudinary public_id (for deletion if needed)
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    text: { type: String, default: null },
    audioUrl: { type: String, default: null },

    // 🔹 New fields for file uploads
    fileUrl: { type: String, default: null },
    fileType: { type: String, default: null },
    publicId: { type: String, default: null },

    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;


// // models/Message.ts
// import mongoose, { Schema, Document } from "mongoose";

// interface IMessage extends Document {
//   sender: string;
//   recipient: string;
//   text: string;
//   audioUrl: string;
//   timestamp: Date;
// }

// const messageSchema = new Schema<IMessage>(
//   {
//     sender: { type: String, required: true },
//     recipient: { type: String, required: true },
//     text: { type: String, default: null },
//     audioUrl: { type: String, default: null },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// const Message = mongoose.model<IMessage>("Message", messageSchema);
// export default Message;
