import { envVars } from "../../config/env.config";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { createUserToken } from "../../utils/jsonWebToken";
import { IAuth, IUser } from "../user/user.interface";
import { User } from "../user/user.model";

import { Wallet } from "../wallet/wallet.model";
import mongoose from "mongoose";

//this is centralized createUser service
const createUser = async (payload: Partial<IUser>) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { email, password, ...rest } = payload;

    if (!email) {
      throw new Error("Email is required");
    }
    if (!password) {
      throw new Error("Password is required");
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      throw new Error("A user already already exist with this email");
    }

    payload.password = await hashPassword(password);

    const authProvider: IAuth = {
      provider: "credentials",
      providerId: email,
    };

    payload.auths = [authProvider];

    const [user] = await User.create([payload], { session });

    if (!user) throw new Error("User creation failed");

    await Wallet.create(
      [
        {
          user: user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return user;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

//   const { email, password, ...rest } = payload;
//   const userExist = await User.findOne({ email });

//   if (userExist) {
//     throw new Error("A user already exist with this email");
//   }

//   if (!password) throw new Error("Password must required");

//   const hashedPassword = await bcrypt.hash(
//     password!,
//     Number(envVars.BCRYPT_SALT_ROUNDS)
//   );

//   payload.password = hashedPassword;
//   const authProvider: IAuth = {
//     provider: "credentials",
//     providerId: email,
//   };
//   const user = await User.create({ ...payload, auths: [authProvider] });

//   if (!user) throw new Error("User creation failed");

//   return user;
// };

const loginWithCredentials = async (payload: Partial<IUser>) => {
  const { email, password } = payload;
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("User not found");
  if (!user.password) throw new Error("Password is not set for the user");

  const isPasswordMathed = await comparePassword(password!, user.password);

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
  createUser,
  loginWithCredentials,
};
