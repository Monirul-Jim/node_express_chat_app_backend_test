import catchAsync from "../../utils/catchAsync";

const createUserIntoDB = catchAsync(async (req, res) => {
  console.log("user ");
  // sendResponse(res, {
  //   statusCode: 200,
  //   success: true,
  //   message: "Academic department is created successfully",
  //   data: result,
  // });
});
export const registerController = {
  createUserIntoDB,
};
