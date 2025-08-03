import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminActionService } from "./admin.service";
import { TransactionQuery } from "../transaction/transaction.interface";

// View all users, agents,
const getUsers = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
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

// Get all users wallets
const getWallet = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
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
const getTransactions = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters:TransactionQuery = req.query;
    const result = await adminActionService.getTransactions(filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Transactions fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

// Approve/suspend agents
const agentStatusApproval = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
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

// admins block/unblock wallets of users
const updateWalletStatus = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
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
  getTransactions,
  agentStatusApproval,
  updateWalletStatus,
};
