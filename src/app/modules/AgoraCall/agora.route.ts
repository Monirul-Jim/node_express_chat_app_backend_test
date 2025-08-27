import { Router } from "express";
import { generateAgoraToken } from "./agora.controller";

const router = Router();

router.get("/token", generateAgoraToken);

export const AgoraRoutes = router;
