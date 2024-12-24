import AppError from "../../errors/AppError";
import { RegistrationModel } from "../Register/user.model";
import { AddedUser } from "./addedUser.model";

const createChat = async (currentUserId: string, otherUserId: string) => {
  const existingChat = await AddedUser.findOne({
    "participants.userId": { $all: [currentUserId, otherUserId] },
  });

  if (existingChat) {
    throw new AppError(400, "Chat already exists between these users");
  }
  // Fetch user details from the database
  const currentUser = await RegistrationModel.findById(currentUserId);
  const otherUser = await RegistrationModel.findById(otherUserId);

  if (!currentUser || !otherUser) {
    throw new AppError(404, "One or both users not found");
  }

  // Create a new chat
  const chat = await AddedUser.create({
    participants: [
      {
        userId: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
      },
      {
        userId: otherUser._id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        email: otherUser.email,
      },
    ],
  });

  return chat;
};

const getAddedUsers = async (userId: string) => {
  // Fetch all chats where the given user is a participant
  const chats = await AddedUser.find({
    "participants.userId": userId,
  });

  if (!chats || chats.length === 0) {
    throw new AppError(404, "No chats found for this user");
  }

  // Collect users added by the specific user (exclude the current user)
  const addedUsers = chats.flatMap((chat) =>
    chat.participants.filter(
      (participant) => participant.userId.toString() !== userId
    )
  );

  // If no users were added, throw an error
  if (addedUsers.length === 0) {
    throw new AppError(404, "No users added by this user");
  }

  return addedUsers;
};

export const AddedUserServices = {
  createChat,
  getAddedUsers,
};
