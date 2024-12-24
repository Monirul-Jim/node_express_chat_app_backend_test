// chat.interface.ts
export type TAddedUser = {
  participants: Array<{
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
};
