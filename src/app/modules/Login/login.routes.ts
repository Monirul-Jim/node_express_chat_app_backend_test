import express from "express";
import { LoginController } from "./login.controller";

const router = express.Router();

router.post(
  "/login",
  //   validateRequest(AuthValidation.loginValidationSchema),
  LoginController.loginUser
);
router.get("/search", LoginController.searchUsers);

export const LoginRoutes = router;
