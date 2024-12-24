import config from "../../config/config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { LoginServices } from "./login.service";

const loginUser = catchAsync(async (req, res) => {
  const result = await LoginServices.loginUser(req.body);
  const { refreshToken, accessToken } = result;
  res.cookie("refreshToken", refreshToken, {
    secure: config.node_env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User is logged in successfully!",
    data: {
      accessToken,
    },
  });
});
const searchUsers = catchAsync(async (req, res) => {
  const { searchUser } = req.query; // Get `searchUser` from query parameters
  console.log(searchUser);

  // Call the search service
  const users = await LoginServices.searchUsersService(searchUser as string);

  // Send the response with the found users
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users found",
    data: users,
  });
});

export const LoginController = {
  loginUser,
  searchUsers,
};
