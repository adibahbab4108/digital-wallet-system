import { Types } from "mongoose";

export interface ISimpleWalletInfo {
  user: Types.ObjectId
  balance: number;
}

export interface ITransactionInfo {
  senderWallet: ISimpleWalletInfo;
  send_amount: number;
  receiverWallet: ISimpleWalletInfo;
}

export enum walletStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DEACTIVE = "DEACTIVE",
  BLOCKED = "BLOCKED",
}
export enum currency {
  BDT = "BDT",
  USD = "USD",
  EUR = "EUR",
}
export interface IWallet {
  user: Types.ObjectId;
  balance: number;
  currency: currency;
  walletStatus: walletStatus;
}
