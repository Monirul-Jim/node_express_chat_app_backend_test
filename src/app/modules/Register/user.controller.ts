import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RegisterServices } from "./user.service";

const createUserIntoDB = catchAsync(async (req, res) => {
  const result = await RegisterServices.registerIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user is created successfully",
    data: result,
  });
});
const updateIsDeletedController = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { isDeleted } = req.body;

  const result = await RegisterServices.updateIsDeleted(userId, isDeleted);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User's isDeleted status updated successfully",
    data: result,
  });
});

const updateRoleController = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const result = await RegisterServices.updateRole(userId, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User role updated successfully",
    data: result,
  });
});

const updateStatusController = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const result = await RegisterServices.updateStatus(userId, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const result = await RegisterServices.getAllUserFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user get successfully",
    data: result,
  });
});
export const registerController = {
  createUserIntoDB,
  updateIsDeletedController,
  updateRoleController,
  updateStatusController,
  getAllUser,
};
