import express from "express";
import validateRequest from "../../middleware/validateRequest";
import { userRegistrationValidationSchema } from "./user.validation";
import { registerController } from "./user.controller";
const router = express.Router();
router.post(
  "/create-academic-department",
  validateRequest(
    userRegistrationValidationSchema.createUserRegistrationSchema
  ),
  registerController.createUserIntoDB
);

export const RegisterRoutes = router;
