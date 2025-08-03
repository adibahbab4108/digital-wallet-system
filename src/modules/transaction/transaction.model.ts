import { model, Schema } from "mongoose";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
      default: TransactionStatus.PENDING,
    },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    senderWallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
    receiverWallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
