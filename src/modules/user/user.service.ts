import mongoose from "mongoose";
import { envVars } from "../../config/env.config";
import { Wallet } from "../wallet/wallet.model";
import { IAuth, IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";


const updateUser = async (payload: Partial<IUser>) => {};
const getUsers = async () => {
  const users = await User.find({});

  if (users.length === 0) throw new Error("No user found");

  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};
const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return user;
};

export const userService = {
  updateUser,
  getUsers,
  getSingleUser,
};
