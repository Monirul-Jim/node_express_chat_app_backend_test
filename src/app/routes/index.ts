import express from "express";
import { RegisterRoutes } from "../modules/Register/user.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: RegisterRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
