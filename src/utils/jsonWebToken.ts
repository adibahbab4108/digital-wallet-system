import { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { envVars } from "../config/env.config";

const generateToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};

export const createUserToken = (payload: JwtPayload) => {
  const accessToken = generateToken(
    payload,
    envVars.JWT_ACCESS_SECRET_KEY,
    envVars.JWT_ACCESS_EXPIRES_IN
  );
  const refreshToken = generateToken(
    payload,
    envVars.JWT_REFRESH_SECRET_KEY,
    envVars.JWT_REFRESH_EXPIRES_IN
  );

  return {
    accessToken,
    refreshToken,
  }
};
