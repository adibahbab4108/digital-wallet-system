import dotenv from "dotenv";
dotenv.config();

export const envVars = {
  PORT: process.env.PORT as string,
  MONGO_URI: process.env.MONGODB_URI as string,
  NODE_ENV: process.env.NODE_ENV as string,

  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,

  JWT_ACCESS_SECRET_KEY: process.env.JWT_ACCESS_SECRET_KEY as string,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN as string,
  JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY as string,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,

  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
};
