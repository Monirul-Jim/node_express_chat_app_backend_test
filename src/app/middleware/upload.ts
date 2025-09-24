// socket/uploadHandler.ts
import { Socket } from "socket.io";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";

export const registerUploadHandlers = (socket: Socket) => {
  // Listen for file upload
  socket.on("upload_file", async (data, callback) => {
    try {
      const { fileBuffer, mimetype } = data;

      let resource_type: "auto" | "image" | "video" | "raw" = "auto";
      if (mimetype.startsWith("image/")) {
        resource_type = "image";
      } else if (mimetype.startsWith("audio/")) {
        resource_type = "video"; // Cloudinary treats audio as video
      } else {
        resource_type = "raw";
      }

      // Upload to Cloudinary from buffer
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "chat_uploads",
          resource_type,
          public_id: Date.now().toString(),
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return callback({ success: false, error: error.message });
          }
          return callback({
            success: true,
            url: result?.secure_url,
            public_id: result?.public_id,
          });
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    } catch (err: any) {
      callback({ success: false, error: err.message });
    }
  });
};
