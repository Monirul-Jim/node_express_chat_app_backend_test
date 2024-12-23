import AppError from "../../errors/AppError";
import { TUserRegistration } from "./user.interface";
import { RegistrationModel } from "./user.model";

const registerIntoDB = async (payload: TUserRegistration) => {
  const existingUser = await RegistrationModel.findOne({
    email: payload.email,
  });
  if (existingUser) {
    throw new AppError(
      409,
      "This email already exists. Please choose another one."
    );
  }
  const result = await RegistrationModel.create(payload);
  return result;
};
// Update isDeleted
const updateIsDeleted = async (userId: string, isDeleted: boolean) => {
  const user = await RegistrationModel.findByIdAndUpdate(
    userId,
    { isDeleted },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
};

// Update role
const updateRole = async (userId: string, role: TUserRegistration["role"]) => {
  const user = await RegistrationModel.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
};

// Update status
const updateStatus = async (
  userId: string,
  status: TUserRegistration["status"]
) => {
  const user = await RegistrationModel.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
};
const getAllUserFromDB = async () => {
  const result = await RegistrationModel.find().select("-password");
  return result;
};
export const RegisterServices = {
  registerIntoDB,
  updateIsDeleted,
  updateRole,
  updateStatus,
  getAllUserFromDB,
};
