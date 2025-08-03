import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "../auth/auth.service";

const createUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await authService.createUser(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: user,
    });
  }
);

const getUsers = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await userService.getUsers();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);
const getSingleUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.getSingleUser(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  }
);
const getMe = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.getSingleUser(req.user.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  }
);

export const userController = {
  createUser,
  getUsers,
  getSingleUser,
  getMe
};
