import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminActionService } from "./admin.service";

const getUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminActionService.getUsers();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);
const getWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminActionService.getWallet();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Wallet fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);
const agentStatusApproval = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { agentId } = req.params;
    const { agentStatus } = req.body;

    const updatedAgentStatus = await adminActionService.agentStatusApproval(
      agentId,
      agentStatus
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Agent account is ${agentStatus}`,
      data: updatedAgentStatus,
    });
  }
);
const updateWalletStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletStatus } = req.body;
    const { userId } = req.params;

    const changedWallet = await adminActionService.updateWalletStatus(
      walletStatus,
      userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `User wallet ${walletStatus} successfully`,
      data: changedWallet,
    });
  }
);
export const adminActionConstroller = {
  getUsers,
  getWallet,
  agentStatusApproval,
  updateWalletStatus,
};
