import { User } from "../user/user.model";
import { Wallet } from "./wallet.model";

const addMoney = async (payload: { userId: string; amount: number }) => {
  const { userId, amount } = payload;

  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const userWallet = await Wallet.findOne({ user: userId });

  if (!userWallet) {
    throw new Error("No wallet found for this user");
  }

  userWallet.balance += amount;
  await userWallet.save();
  console.log(userWallet);

  return userWallet;
};
const withdrawMoney = async (payload: { userId: string; amount: number }) => {
  const { userId, amount } = payload;

  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const userWallet = await Wallet.findOne({ user: userId });

  if (!userWallet) {
    throw new Error("No wallet found for this user");
  }
  if (userWallet.balance < amount) throw new Error("Insufficient balance");
  if (amount <= 49) throw new Error("At least 50 required to withdraw");

  userWallet.balance -= amount;
  await userWallet.save();
  console.log(userWallet);

  return userWallet;
};
const myWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId }).populate("user", "name email role");
  if (!wallet) throw new Error("No wallet found");
  return wallet;
};
export const walletService = {
  addMoney,
  withdrawMoney,
  myWallet,
};
