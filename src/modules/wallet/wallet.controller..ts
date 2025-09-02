import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { walletService } from "./wallet.service";
import { sendResponse } from "../../utils/sendResponse";

const addMoney = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.user;
    const { amount } = req.body;
    const result = await walletService.addMoney({ userId, amount });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Tk ${amount} add money successful`,
      data: result,
    });
  }
);

const withdrawMoney = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
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

const sendMoney = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.user;
    const { receiverId, amount } = req.body;
    const payload = {
      userId,
      amount,
      receiverId,
    };
    const transactionInfo = await walletService.sendMoney(payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Tk ${amount} sent successfully`,
      data: transactionInfo,
    });
  }
);



const myWallet = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.user;
    const result = await walletService.myWallet(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Acount retrieved successfull",
      data: result,
    });
  }
);
export const walletController = {
  myWallet,
  addMoney,
  sendMoney,
  withdrawMoney
};
