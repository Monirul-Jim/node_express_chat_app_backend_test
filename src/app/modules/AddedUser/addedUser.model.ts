// chat.model.ts
import { Schema, model } from "mongoose";
import { TAddedUser } from "./addedUser.interface";

const ChatSchema = new Schema<TAddedUser>(
  {
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "RegistrationModel", // Reference to the User model
          required: true,
        },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

export const AddedUser = model<TAddedUser>("AddedUser", ChatSchema);
