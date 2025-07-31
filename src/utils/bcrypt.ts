import { envVars } from "../config/env.config";
import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );
  return hashedPassword;
};

export const comparePassword=async(currentPassword:string, DBPassword:string)=>{
    const isMatch = await bcrypt.compare(currentPassword, DBPassword);
    return isMatch;
}