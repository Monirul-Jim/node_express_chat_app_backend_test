// import { ErrorRequestHandler } from "express";
// import { TErrorSource } from "../../interface/error";

// const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
//   let statusCode = 500;
//   let message = "Something went wrong";

//   let errorSources: TErrorSource = [
//     {
//       path: "",
//       message: "Something went wrong",
//     },
//   ];
//   res.status(statusCode).json({
//     success: false,
//     message,
//     errorSources,
//   });
// };
// export default globalErrorHandler;

import { ErrorRequestHandler } from "express";
import AppError from "../errors/AppError";
import { TErrorSource } from "../../interface/error";
import { ZodError } from "zod";
import handleZodError from "../errors/handleZodError";
import handleValidationError from "../errors/handleValidationError";
import handleCastError from "../errors/handleCastError";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Default values
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSource = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    // Handle known AppError
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    // Handle generic errors
    console.error("Unexpected error:", err);
    message = err.message;
    errorSources = [
      {
        path: "",
        message: message,
      },
    ];
  }

  // Send the response
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
  });
  return;
};

export default globalErrorHandler;
