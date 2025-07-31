import { model, Schema } from "mongoose";
import { currency, IWallet, walletStatus } from "./wallet.interface";

const walletSchema = new Schema<IWallet>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 50 },
  currency: {
    type: String,
    enum: Object.values(currency),
    default: currency.BDT,
  },
  walletStatus: { type: String, default: walletStatus.ACTIVE },
});
export const Wallet = model<IWallet>("Wallet", walletSchema);
