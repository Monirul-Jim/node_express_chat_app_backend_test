import express from "express";
import { RegisterRoutes } from "../modules/Register/user.routes";
import { LoginRoutes } from "../modules/Login/login.routes";
import { AddedUserRoutes } from "../modules/AddedUser/addedUser.routes";
import { AgoraRoutes } from "../modules/AgoraCall/agora.route";

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
  {
    path: "/agora",
    route: AgoraRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
