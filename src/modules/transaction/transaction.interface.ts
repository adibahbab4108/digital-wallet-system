import { Types } from "mongoose";

export enum TransactionType {
  SEND = "SEND", //user action
  TOP_UP = "TOP_UP", //user action
  WITHDRAW = "WITHDRAW", //user action
  CASH_IN = "CASH_IN", //agent action
  CASH_OUT = "CASH_OUT", // agent action
  RECEIVE = "RECEIVE", //user action
}
export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REVERSED = "REVERSED",
  FAILED = "FAILED",
}

export interface ITransaction {
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee?: number;
  commission?: number;
  senderWallet?: Types.ObjectId; // For SEND, WITHDRAW
  receiverWallet?: Types.ObjectId; // For SEND, TOP_UP
  initiatedBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}
