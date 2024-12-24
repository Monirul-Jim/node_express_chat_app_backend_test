import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AddedUserServices } from "./addedUser.service";
import AppError from "../../errors/AppError";

const createChat = catchAsync(async (req, res) => {
  const { currentUserId, otherUserId } = req.body;

  if (!currentUserId || !otherUserId) {
    throw new AppError(400, "Both user IDs are required");
  }

  // Create a new chat
  const result = await AddedUserServices.createChat(currentUserId, otherUserId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Added successfully",
    data: result,
  });
});

const getAddedUsers = catchAsync(async (req, res) => {
  const { userId } = req.params; // Get the userId from request parameters

  if (!userId) {
    throw new AppError(400, "User ID is required");
  }

  // Get the list of users added by the given user
  const result = await AddedUserServices.getAddedUsers(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

export const AddedUserController = {
  createChat,
  getAddedUsers,
};
