import { envVars } from "../../config/env.config";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;
  const userExist = await User.findOne({ email });

  if (userExist) {
    throw new Error("A user already already exist with this email");
  }

  if (password) {
    const hashedPassword = await bcrypt.hash(
      password,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );
    payload.password = hashedPassword;
  }

  const user = await User.create(payload);

  if (!user) throw new Error("User creation failed");

  return user;
};
const updateUser = async (payload: Partial<IUser>) => {

};
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
  createUser,
  updateUser,
  getUsers,
  getSingleUser,
};
