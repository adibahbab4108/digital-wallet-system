import { envVars } from "../../config/env.config";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
const createUser = async (payload: Partial<IUser>) => {
  console.log(payload);
  const { email, password, ...rest } = payload;
  const userExist = await User.findOne({ email });

  if (userExist) {
    throw new Error("User already exist");
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
export const userService = {
  createUser,
};
