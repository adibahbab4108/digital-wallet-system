import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { agentService } from "./agent.service";

const AddMoneyToUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.user;
    const { receiverEmail, amount } = req.body;
    const payload = {
      userId,
      amount,
      receiverEmail,
    };
    const transactionInfo = await agentService.AddMoneyToUser(payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "AddMoneyToUser successfull",
      data: transactionInfo,
    });
  }
);

const WithdrawMoneyFromUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.user;
    const { receiverEmail, amount } = req.body;
    const payload = {
      userId,
      amount,
      receiverEmail,
    };
    const transactionInfo = await agentService.WithdrawMoneyFromUser(payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Withdrawn TK ${amount} From User successfull`,
      data: transactionInfo,
    });
  }
);
export const AgentController = {
  AddMoneyToUser,
  WithdrawMoneyFromUser,
};
