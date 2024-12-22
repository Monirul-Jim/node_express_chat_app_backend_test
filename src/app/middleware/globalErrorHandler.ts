import { ErrorRequestHandler } from "express";
import { TErrorSource } from "../../interface/error";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong";

  let errorSources: TErrorSource = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
  });
};
export default globalErrorHandler;
