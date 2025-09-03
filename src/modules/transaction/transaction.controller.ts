import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionQuery } from "./transaction.interface";
import { transactionService } from "./transaction.service";

const getAllTransactions = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters: TransactionQuery = req.query;
    const result = await transactionService.getAllTransactions(filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Transactions fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);
const getMyTransactions = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters: TransactionQuery = req.query;
    const {userId} = req.user;
    filters.userId = userId as string; 
    
    const result = await transactionService.getMyTransactions(filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Transactions fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const transactionController = {
  getAllTransactions,
  getMyTransactions
};
