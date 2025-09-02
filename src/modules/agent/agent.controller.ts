import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { agentService } from "./agent.service";

const cashIn = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.user;
    const { receiverId, amount } = req.body;
    const payload = {
      userId,
      amount,
      receiverId,
    };
    const transactionInfo = await agentService.cashIn(payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "CashIn successfull",
      data: transactionInfo,
    });
  }
);
const cashOut = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.user;
    const { receiverId, amount } = req.body;
    const payload = {
      userId,
      amount,
      receiverId,
    };
    const transactionInfo = await agentService.cashOut(payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "CashOut successfull",
      data: transactionInfo,
    });
  }
);
export const AgentController = {
  cashIn,
  cashOut,
};
