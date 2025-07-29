import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const user = await userService.createUser(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: user,
    });
  }
);
export const userController = {
  createUser,
};
