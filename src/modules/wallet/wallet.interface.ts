import { Types } from "mongoose";

export enum walletStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
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
