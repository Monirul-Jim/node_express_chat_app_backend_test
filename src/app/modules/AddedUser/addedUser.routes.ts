import express from "express";
import { AddedUserController } from "./addedUser.controller";

const router = express.Router();

// Route to create a chat
router.post("/added-user", AddedUserController.createChat);
router.get("/:userId/added-users", AddedUserController.getAddedUsers);

export const AddedUserRoutes = router;
