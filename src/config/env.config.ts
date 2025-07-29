import dotenv from "dotenv";
dotenv.config();

export const envVars = {
  PORT: process.env.PORT as string,
  MONGO_URI: process.env.MONGODB_URI as string,
  NODE_ENV: process.env.NODE_ENV as string,

  BCRYPT_SALT_ROUNDS:process.env.BCRYPT_SALT_ROUNDS,
};