import express from "express";
import { RegisterRoutes } from "../modules/Register/user.routes";
import { LoginRoutes } from "../modules/Login/login.routes";
import { AddedUserRoutes } from "../modules/AddedUser/addedUser.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: RegisterRoutes,
  },
  {
    path: "/auth",
    route: LoginRoutes,
  },
  {
    path: "/added",
    route: AddedUserRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
