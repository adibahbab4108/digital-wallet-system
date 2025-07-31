import { User } from "../user/user.model";
import { ITransactionInfo } from "./wallet.interface";
import { Wallet } from "./wallet.model";

//USER | AGENT | ADMIN ACTION
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
const sendMoney = async (payload: {
  userId: string;
  amount: number;
  receiverId: string;
}) => {
  const { userId, amount, receiverId } = payload;
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }
  const fromUser = await User.findById(userId);
  if (!fromUser) {
    throw new Error("Sender not found");
  }
  const fromWallet = await Wallet.findOne({ user: userId });
  if (!fromWallet) {
    throw new Error("No wallet found for sender");
  }
  if (fromWallet.balance < amount) {
    throw new Error("Insufficient balance");
  }
  const toUser = await User.findById(receiverId);
  if (!toUser) {
    throw new Error("Receiver not found");
  }
  const toWallet = await Wallet.findOne({ user: receiverId });
  if (!toWallet) {
    throw new Error("No wallet found for receiver");
  }
  toWallet.balance += amount;
  fromWallet.balance -= amount;
  await toWallet.save();
  await fromWallet.save();
  const transactionInfo: ITransactionInfo = {
    senderWallet: {
      user: fromWallet.user,
      balance: fromWallet.balance,
    },
    send_amount: amount,
    receiverWallet: {
      user: toWallet.user,
      balance: toWallet.balance,
    },
  };

  return transactionInfo;
};

// AGENT ACTION
const cashIn = async (payload: {
  userId: string;
  amount: number;
  receiverId: string;
}) => {
  const { userId: agentId, amount, receiverId } = payload;
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }
  const agent = await User.findById(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }
  const agetWallet = await Wallet.findOne({ user: agentId });
  if (!agetWallet) {
    throw new Error("No wallet found for agent");
  }
  if (agetWallet.balance < amount) {
    throw new Error("Insufficient balance");
  }
  const toUser = await User.findById(receiverId);
  if (!toUser) {
    throw new Error("Receiver not found");
  }
  const receiverWallet = await Wallet.findOne({ user: receiverId });
  if (!receiverWallet) {
    throw new Error("No wallet found for receiver");
  }
  receiverWallet.balance += amount;
  agetWallet.balance -= amount;
  await receiverWallet.save();
  await agetWallet.save();
  const transactionInfo: ITransactionInfo = {
    senderWallet: {
      user: agetWallet.user,
      balance: agetWallet.balance,
    },
    send_amount: amount,
    receiverWallet: {
      user: receiverWallet.user,
      balance: receiverWallet.balance,
    },
  };

  return transactionInfo;
};
const cashOut = async (payload: {
  userId: string;
  amount: number;
  receiverId: string;
}) => {
  const { userId:agentId, amount, receiverId:customerId } = payload;
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }
  const agent = await User.findById(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }
  const agentWallet = await Wallet.findOne({ user: agentId });
  if (!agentWallet) {
    throw new Error("No wallet found for agent");
  }
  const customer = await User.findById(customerId);
 
  if (!customer) {
    throw new Error("Customer not found");
  }
  const customerWallet = await Wallet.findOne({ user: customerId });
  if (!customerWallet) {
    throw new Error("No wallet found for customer");
  }

   if (customerWallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  customerWallet.balance -= amount;
  agentWallet.balance += amount;
  await customerWallet.save();
  await agentWallet.save();
  const transactionInfo: ITransactionInfo = {
    senderWallet: {
      user: agentWallet.user,
      balance: agentWallet.balance,
    },
    send_amount: amount,
    receiverWallet: {
      user: customerWallet.user,
      balance: customerWallet.balance,
    },
  };

  return transactionInfo;
};

const myWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId }).populate(
    "user",
    "name email role"
  );
  if (!wallet) throw new Error("No wallet found");
  return wallet;
};
export const walletService = {
  addMoney,
  withdrawMoney,
  sendMoney,
  cashIn,
  cashOut,
  myWallet,
};
