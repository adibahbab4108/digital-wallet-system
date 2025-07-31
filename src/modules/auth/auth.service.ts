import { envVars } from "../../config/env.config";
import { createUserToken } from "../../utils/jsonwebtoken";
import { IAuth, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from "bcryptjs";
const createUserWithCredentials = async (payload: Partial<IUser>) => {
  console.log(payload);

  const { email, password, ...rest } = payload;
  const userExist = await User.findOne({ email });

  if (userExist) {
    throw new Error("A user already exist with this email");
  }

  if (!password) throw new Error("Password must required");

  const hashedPassword = await bcrypt.hash(
    password!,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  payload.password = hashedPassword;
  const authProvider: IAuth = {
    provider: "credentials",
    providerId: email,
  };
  const user = await User.create({ ...payload, auths: [authProvider] });

  if (!user) throw new Error("User creation failed");

  return user;
};

const loginWithCredentials = async (payload: Partial<IUser>) => {
  const { email, password } = payload;
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("User not found");
  if (!user.password) throw new Error("Password is not set for the user");

  const isPasswordMathed = await bcrypt.compare(password!, user.password);

  if (!isPasswordMathed) throw new Error("Password is incorrect");

  const payloadForToken = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const userToken = createUserToken(payloadForToken);

  return {
    accessToken: userToken.accessToken,
    refreshToken: userToken.refreshToken,
  };
};

export const authService = {
  createUserWithCredentials,
  loginWithCredentials,
};
