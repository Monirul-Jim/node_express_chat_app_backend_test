export type TUserRegistration = {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "blocked";
  isDeleted: boolean;
  password: string;
};
