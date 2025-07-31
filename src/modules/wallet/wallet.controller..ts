import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { walletService } from "./wallet.service";
import { sendResponse } from "../../utils/sendResponse";

const myWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const wallet = await walletService.myWallet(userId);
    
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Wallet details fetched successfully",
      data: wallet,
    });
  }
);
const addMoney = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const { amount } = req.body;
    const result = await walletService.addMoney({ userId, amount });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Tk ${amount} Cash in successful`,
      data: result,
    });
  }
);
const withdrawMoney = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const { amount } = req.body;
    const result = await walletService.withdrawMoney({ userId, amount });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Tk ${amount} withdraw successful`,
      data: result,
    });
  }
);
export const walletController = {
  addMoney,
  withdrawMoney,
  myWallet,
};
