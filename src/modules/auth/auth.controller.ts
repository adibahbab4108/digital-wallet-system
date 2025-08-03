import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const createUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {

    //delegating to userService
    const user = await authService.createUser(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: user,
    });
  }
);

const loginWithCredentials = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userJwtToken = await authService.loginWithCredentials(req.body);

    res.cookie("accessToken", userJwtToken.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite:"none"
    });
    res.cookie("refreshToken", userJwtToken.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite:"none"
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User logged in successfully",
      data: userJwtToken,
    });
  }
);

export const authController = {
  createUser,
  loginWithCredentials,
};
