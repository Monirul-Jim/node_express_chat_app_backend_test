import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import config from "./app/config/config";
import Message from "./app/routes/socket.model";

let httpServer = createServer(app); // Create an HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"], // Frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);

    // Start the server
    httpServer.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log("Database connected! 😊");
    });

    const connectedUsers: Record<string, string> = {}; // Map to store userId => socketId

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      // Register user on connection
      socket.on("register", (userId) => {
        connectedUsers[userId] = socket.id; // Map userId to socketId
        console.log(`User registered: ${userId} with socket ID ${socket.id}`);
      });
      socket.on("offer", ({ offer, recipientId }) => {
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("offer", {
            offer,
            senderId: socket.id,
          });
        }
      });
      socket.on("answer", ({ answer, recipientId }) => {
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("answer", answer);
        }
      });

      socket.on("iceCandidate", ({ candidate, recipientId }) => {
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("iceCandidate", { candidate });
        }
      });
      // Handle video call initiation
      socket.on("videoCall", ({ callerId, recipientId }) => {
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("incomingCall", {
            callerId,
            callType: "video",
          });
        } else {
          io.to(socket.id).emit("callFailed", {
            message: "User not available.",
          });
        }
      });

      // Handle audio call initiation
      socket.on("audioCall", ({ callerId, recipientId }) => {
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("incomingCall", {
            callerId,
            callType: "audio",
          });
        } else {
          io.to(socket.id).emit("callFailed", {
            message: "User not available.",
          });
        }
      });

      // Handle call acceptance
      socket.on("callAccepted", ({ callerId, recipientId }) => {
        const callerSocketId = connectedUsers[callerId];
        if (callerSocketId) {
          io.to(callerSocketId).emit("callAccepted", { recipientId });
        }
      });

      // Handle call rejection
      socket.on("callRejected", ({ callerId, recipientId }) => {
        const callerSocketId = connectedUsers[callerId];
        if (callerSocketId) {
          io.to(callerSocketId).emit("callRejected", { recipientId });
        }
      });

      // Handle call end
      socket.on("endCall", (callerId, recipientId) => {
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("callEnded", callerId);
        }
        const callerSocketId = connectedUsers[callerId];
        if (callerSocketId) {
          io.to(callerSocketId).emit("callEnded", recipientId);
        }
      });

      // Forward "typing" event to the recipient
      socket.on("typing", ({ senderId, recipientId }) => {
        console.log(
          `Typing event received from senderId: ${senderId}, to recipientId: ${recipientId}`
        );
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("typing", senderId); // Send typing event to recipient
        }
      });

      // Forward "stoppedTyping" event to the recipient
      socket.on("stoppedTyping", ({ senderId, recipientId }) => {
        console.log(
          `Stopped typing event received from senderId: ${senderId}, to recipientId: ${recipientId}`
        );
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("stoppedTyping", senderId); // Send stoppedTyping event to recipient
        }
      });

      // Handle incoming messages
      socket.on("message", async (data) => {
        console.log("Message received:", data);

        try {
          // Save the message to the database
          const newMessage = new Message({
            sender: data.sender,
            recipient: data.recipient,
            text: data.text,
            audioUrl: data.audioUrl,
          });
          await newMessage.save();

          // Send the message to the recipient's socket ID
          const recipientSocketId = connectedUsers[data.recipient];
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("message", data);
          }

          // Optionally send confirmation back to the sender
          socket.emit("message", data);
        } catch (error) {
          console.error("Error while saving message:", error);
          socket.emit("error", "Failed to send message.");
        }
      });

      // Handle fetching previous messages
      socket.on("fetchMessages", async ({ user, chatWith }) => {
        try {
          const messages = await Message.find({
            $or: [
              { sender: user, recipient: chatWith },
              { sender: chatWith, recipient: user },
            ],
          }).sort({ timestamp: 1 });

          socket.emit("previousMessages", messages);
        } catch (error) {
          console.error("Error fetching previous messages:", error);
          socket.emit("error", "Failed to fetch messages.");
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        // Remove the user from the connectedUsers map
        for (const userId in connectedUsers) {
          if (connectedUsers[userId] === socket.id) {
            delete connectedUsers[userId];
            console.log(`User ${userId} disconnected and removed from the map`);
            break;
          }
        }
      });
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

// Handle errors
process.on("unhandledRejection", (reason) => {
  console.log("Unhandled Rejection:", reason);
  if (httpServer) {
    httpServer.close(() => process.exit(1));
  }
});

process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception:", error);
  process.exit(1);
});

main();
