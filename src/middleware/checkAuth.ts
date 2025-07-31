import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env.config";
import { User } from "../modules/user/user.model";
import { IUser, userStatus } from "../modules/user/user.interface";
export const checkAuth =
  (...UserRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;
      if (!accessToken) throw new Error("No token received");

      const decoded = jwt.verify(
        accessToken,
        envVars.JWT_ACCESS_SECRET_KEY
      ) as JwtPayload;
      console.log(UserRoles);
      if (!UserRoles.includes(decoded.role)) {
        throw new Error("You are not permitted to access this route");
      }
      const user = await User.findOne({ email: decoded.email });
      if (!user) throw new Error("User not found");

      //   if (!user.isDeleted) throw new Error("User is deleted");
      //   if (!user.isVerified) throw new Error("User is not verified");

      if (
        user.userStatus === userStatus.BLOCKED ||
        user.userStatus === userStatus.INACTIVE
      ) {
        throw new Error(`User is ${user.userStatus}`);
      }
      req.user = decoded;
      console.log("From authGuard",user);
      console.log("Decoded data",decoded);
      next();
    } catch (error) {
      next(error);
    }
  };
