import AppError from "../../errors/AppError";
import { RegistrationModel } from "../Register/user.model";
import { TUserLogin } from "./login.interface";
import bcrypt from "bcrypt";
import { createToken } from "./login.utils";
import config from "../../config/config";
const loginUser = async (payload: TUserLogin) => {
  const { email, password } = payload;

  const user = await RegistrationModel.findOne({ email });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const userIsDeleted = user?.isDeleted;
  if (userIsDeleted) {
    throw new AppError(403, "This user is deleted");
  }
  const isUserBlocked = user?.status;
  if (isUserBlocked === "blocked") {
    throw new AppError(403, "This user is blocked by admin");
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Your password does not match");
  }
  const jwtPayload = {
    _id: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    role: user?.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );
  return {
    accessToken,
    refreshToken,
  };
};
const searchUsersService = async (searchUser?: string) => {
  const query: any = {};

  if (searchUser) {
    // Use a regex search to match any of the fields (firstName, lastName, or email)
    query.$or = [
      { firstName: { $regex: searchUser, $options: "i" } },
      { lastName: { $regex: searchUser, $options: "i" } },
      { email: { $regex: searchUser, $options: "i" } },
    ];
  }

  const users = await RegistrationModel.find(query);

  if (!users || users.length === 0) {
    throw new AppError(404, "No users found matching your criteria");
  }

  return users;
};

export const LoginServices = {
  loginUser,
  searchUsersService,
};
