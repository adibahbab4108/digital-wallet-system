import mongoose from "mongoose";
import { AgentStatus, Role, userStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { ITransactionInfo, walletStatus } from "./wallet.interface";
import { Wallet } from "./wallet.model";

interface CashInOutPayload {
  userId: string; // Agent's ID
  amount: number;
  receiverId: string;
}

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
  if (
    userWallet.walletStatus === walletStatus.BLOCKED ||
    userWallet.walletStatus === walletStatus.INACTIVE
  ) {
    throw new Error(`Wallet is ${userWallet.walletStatus}`);
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
  if (
    userWallet.walletStatus === walletStatus.BLOCKED ||
    userWallet.walletStatus === walletStatus.INACTIVE
  ) {
    throw new Error(`Wallet is ${userWallet.walletStatus}`);
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
  if (
    fromWallet.walletStatus === walletStatus.BLOCKED ||
    fromWallet.walletStatus === walletStatus.INACTIVE
  ) {
    throw new Error(`Your wallet is ${fromWallet.walletStatus}`);
  }
  if (
    toWallet.walletStatus === walletStatus.BLOCKED ||
    toWallet.walletStatus === walletStatus.INACTIVE
  ) {
    throw new Error(`Receiver wallet is ${fromWallet.walletStatus}`);
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
const cashIn = async (payload: CashInOutPayload): Promise<ITransactionInfo> => {
  const { userId: agentId, amount, receiverId } = payload;

  if (!agentId || !receiverId || typeof amount !== "number" || amount <= 0) {
    throw new Error("Invalid input: amount must be a positive number.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const agent = await User.findById(agentId).session(session);
    if (!agent) {
      throw new Error("Unauthorized access.");
    }

    if (agent.role !== Role.AGENT) {
      throw new Error("Only agents are allowed to perform cash-in.");
    }

    if (agent.agentStatus === AgentStatus.PENDING) {
      throw new Error("Your agent account is pending approval.");
    }
    if (agent.agentStatus === AgentStatus.SUSPENDED) {
      throw new Error("Your agent account is suspended.");
    }

    const agentWallet = await Wallet.findOne({ user: agentId }).session(
      session
    );
    if (!agentWallet) {
      throw new Error("Agent wallet not found.");
    }

    if (agentWallet.balance < amount) {
      throw new Error("Insufficient wallet balance.");
    }

    const receiver = await User.findById(receiverId).session(session);
    if (!receiver) {
      throw new Error("Receiver user not found.");
    }

    const receiverWallet = await Wallet.findOne({ user: receiverId }).session(
      session
    );
    if (!receiverWallet) {
      throw new Error("Receiver wallet not found.");
    }

    agentWallet.balance -= amount;
    receiverWallet.balance += amount;

    await agentWallet.save({ session });
    await receiverWallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    const transactionInfo: ITransactionInfo = {
      senderWallet: {
        user: agentWallet.user,
        balance: agentWallet.balance,
      },
      send_amount: amount,
      receiverWallet: {
        user: receiverWallet.user,
        balance: receiverWallet.balance,
      },
    };

    return transactionInfo;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Cash-in failed: ${error.message}`);
  }
};
const cashOut = async (payload: CashInOutPayload) => {
  const { userId: agentId, amount, receiverId: customerId } = payload;
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

//ADMIN ACTION


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
