import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import config from "./app/config/config";
import Message from "./app/routes/socket.model";

let httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://node-express-chat-app-frontend-test.onrender.com"],
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
    const activeChats: Record<string, string | null> = {}; // Tracks active chats (userId => chatWithUserId)

    io.on("connection", (socket) => {
      // Register user on connection
      socket.on("register", (userId) => {
        connectedUsers[userId] = socket.id; // Map userId to socketId
        // Check if the user is part of an active chat, and if so, notify the other user
        if (activeChats[userId]) {
          const otherUserId = activeChats[userId];
          io.to(connectedUsers[otherUserId]).emit("userStatus", {
            userId: userId,
            status: "online",
          });
        }
      });

      // socket.on("register", (userId) => {
      //   connectedUsers[userId] = socket.id; // Map userId to socketId
      // });

      // socket.on("startChat", ({ userId, selectedUserId }) => {
      //   activeChats[userId] = selectedUserId;
      //   activeChats[selectedUserId] = userId;

      //   // Emit status update for both users
      //   io.to(connectedUsers[userId]).emit("userStatus", {
      //     userId: userId,
      //     status: "online",
      //   });
      //   io.to(connectedUsers[selectedUserId]).emit("userStatus", {
      //     userId: selectedUserId,
      //     status: "online",
      //   });
      // });

      // socket.on("endChat", ({ userId, selectedUserId }) => {
      //   delete activeChats[userId];
      //   delete activeChats[selectedUserId];

      //   // Emit status update to "offline" for both users
      //   io.to(connectedUsers[userId]).emit("userStatus", {
      //     userId: userId,
      //     status: "offline",
      //   });
      //   io.to(connectedUsers[selectedUserId]).emit("userStatus", {
      //     userId: selectedUserId,
      //     status: "offline",
      //   });
      // });

      // Handle "offer" event for video/audio calls
      socket.on("offer", ({ offer, recipientId }) => {
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("offer", {
            offer,
            senderId: socket.id,
          });
        }
      });

      // Forward "typing" event to the recipient
      socket.on("typing", ({ senderId, recipientId }) => {
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("typing", senderId); // Send typing event to recipient
        }
      });

      // Forward "stoppedTyping" event to the recipient
      socket.on("stoppedTyping", ({ senderId, recipientId }) => {
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("stoppedTyping", senderId); // Send stoppedTyping event to recipient
        }
      });

      // Handle incoming messages
      socket.on("message", async (data) => {
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
          socket.emit("error", "Failed to fetch messages.");
        }
      });

      // // Emit status update for a selected user
      // socket.on("checkUserStatus", (userId) => {
      //   const status =
      //     connectedUsers[userId] && activeChats[userId] ? "online" : "offline";
      //   socket.emit("userStatus", { userId, status });
      // });

      // Handle starting and ending a chat
      socket.on("startChat", ({ userId, selectedUserId }) => {
        activeChats[userId] = selectedUserId;
        activeChats[selectedUserId] = userId;

        // Notify both users about each other's status (online)
        io.to(connectedUsers[userId]).emit("userStatus", {
          userId: selectedUserId,
          status: "online",
        });
        io.to(connectedUsers[selectedUserId]).emit("userStatus", {
          userId: userId,
          status: "online",
        });
      });

      socket.on("endChat", ({ userId, selectedUserId }) => {
        delete activeChats[userId];
        delete activeChats[selectedUserId];

        // Update status to offline for both users
        io.to(connectedUsers[userId]).emit("userStatus", {
          userId: selectedUserId,
          status: "offline",
        });
        io.to(connectedUsers[selectedUserId]).emit("userStatus", {
          userId: userId,
          status: "offline",
        });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        for (const userId in connectedUsers) {
          if (connectedUsers[userId] === socket.id) {
            delete connectedUsers[userId];

            // If the user was part of an active chat, update both users' status
            if (activeChats[userId]) {
              const otherUserId = activeChats[userId];
              // Notify the other user that their chat partner is now offline
              io.to(connectedUsers[otherUserId]).emit("userStatus", {
                userId: userId,
                status: "offline",
              });
            }

            // Remove from active chats if necessary
            for (const otherUserId in activeChats) {
              if (activeChats[otherUserId] === userId) {
                delete activeChats[otherUserId];
                break;
              }
            }
            break;
          }
        }
      });
      // Handle disconnection
      // socket.on("disconnect", () => {

      //   // Remove the user from the connectedUsers map
      //   for (const userId in connectedUsers) {
      //     if (connectedUsers[userId] === socket.id) {
      //       delete connectedUsers[userId];
      //       // Remove from active chats if necessary
      //       for (const otherUserId in activeChats) {
      //         if (activeChats[otherUserId] === userId) {
      //           delete activeChats[otherUserId];
      //         }
      //       }
      //       break;
      //     }
      //   }
      // });
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

// Handle errors
process.on("unhandledRejection", (reason) => {
  if (httpServer) {
    httpServer.close(() => process.exit(1));
  }
});

process.on("uncaughtException", (error) => {
  process.exit(1);
});

main();
// import mongoose from "mongoose";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import app from "./app";
// import config from "./app/config/config";
// import Message from "./app/routes/socket.model";

// let httpServer = createServer(app); // Create an HTTP server
// const io = new Server(httpServer, {
//   cors: {
//     origin: ["http://localhost:5173"], // Frontend origin
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// async function main() {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(config.database_url as string);

//     // Start the server
//     httpServer.listen(config.port, () => {
//       console.log(`Server is running on port ${config.port}`);
//       console.log("Database connected! 😊");
//     });

//     const connectedUsers: Record<string, string> = {}; // Map to store userId => socketId

//     io.on("connection", (socket) => {
//       console.log("New client connected:", socket.id);

//       // Register user on connection
//       socket.on("register", (userId) => {
//         connectedUsers[userId] = socket.id; // Map userId to socketId
//         console.log(`User registered: ${userId} with socket ID ${socket.id}`);
//       });
//       socket.on("offer", ({ offer, recipientId }) => {
//         const recipientSocketId = connectedUsers[recipientId];
//         if (recipientSocketId) {
//           io.to(recipientSocketId).emit("offer", {
//             offer,
//             senderId: socket.id,
//           });
//         }
//       });

//       // Forward "typing" event to the recipient
//       socket.on("typing", ({ senderId, recipientId }) => {
//         console.log(
//           `Typing event received from senderId: ${senderId}, to recipientId: ${recipientId}`
//         );
//         const recipientSocketId = connectedUsers[recipientId];
//         if (recipientSocketId) {
//           io.to(recipientSocketId).emit("typing", senderId); // Send typing event to recipient
//         }
//       });

//       // Forward "stoppedTyping" event to the recipient
//       socket.on("stoppedTyping", ({ senderId, recipientId }) => {
//         console.log(
//           `Stopped typing event received from senderId: ${senderId}, to recipientId: ${recipientId}`
//         );
//         const recipientSocketId = connectedUsers[recipientId];
//         if (recipientSocketId) {
//           io.to(recipientSocketId).emit("stoppedTyping", senderId); // Send stoppedTyping event to recipient
//         }
//       });

//       // Handle incoming messages
//       socket.on("message", async (data) => {
//         console.log("Message received:", data);

//         try {
//           // Save the message to the database
//           const newMessage = new Message({
//             sender: data.sender,
//             recipient: data.recipient,
//             text: data.text,
//             audioUrl: data.audioUrl,
//           });
//           await newMessage.save();

//           // Send the message to the recipient's socket ID
//           const recipientSocketId = connectedUsers[data.recipient];
//           if (recipientSocketId) {
//             io.to(recipientSocketId).emit("message", data);
//           }

//           // Optionally send confirmation back to the sender
//           socket.emit("message", data);
//         } catch (error) {
//           console.error("Error while saving message:", error);
//           socket.emit("error", "Failed to send message.");
//         }
//       });

//       // Handle fetching previous messages
//       socket.on("fetchMessages", async ({ user, chatWith }) => {
//         try {
//           const messages = await Message.find({
//             $or: [
//               { sender: user, recipient: chatWith },
//               { sender: chatWith, recipient: user },
//             ],
//           }).sort({ timestamp: 1 });

//           socket.emit("previousMessages", messages);
//         } catch (error) {
//           console.error("Error fetching previous messages:", error);
//           socket.emit("error", "Failed to fetch messages.");
//         }
//       });
//       // Emit status update for a selected user
//       socket.on("checkUserStatus", (userId) => {
//         const status = connectedUsers[userId] ? "online" : "offline";
//         socket.emit("userStatus", { userId, status });
//       });

//       // Handle disconnection
//       socket.on("disconnect", () => {
//         console.log("Client disconnected:", socket.id);

//         // Remove the user from the connectedUsers map
//         for (const userId in connectedUsers) {
//           if (connectedUsers[userId] === socket.id) {
//             delete connectedUsers[userId];
//             console.log(`User ${userId} disconnected and removed from the map`);
//             break;
//           }
//         }
//       });
//     });
//   } catch (error) {
//     console.error("Error starting server:", error);
//   }
// }

// // Handle errors
// process.on("unhandledRejection", (reason) => {
//   console.log("Unhandled Rejection:", reason);
//   if (httpServer) {
//     httpServer.close(() => process.exit(1));
//   }
// });

// process.on("uncaughtException", (error) => {
//   console.log("Uncaught Exception:", error);
//   process.exit(1);
// });

// main();
