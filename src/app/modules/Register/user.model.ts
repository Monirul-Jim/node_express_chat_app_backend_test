import { model, Schema } from "mongoose";
import { TUserRegistration } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config/config";
const UserStatus = ["active", "blocked"];
const userRegistrationSchema = new Schema<TUserRegistration>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: UserStatus,
    default: "active",
  },
  password: {
    type: String,
    required: true,
  },
});

userRegistrationSchema.pre("save", async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});
userRegistrationSchema.post("save", async function (doc, next) {
  (doc.password = ""), next();
});

export const RegistrationModel = model<TUserRegistration>(
  "RegisterUser",
  userRegistrationSchema
);
