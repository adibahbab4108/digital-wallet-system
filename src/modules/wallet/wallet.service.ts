import mongoose, { Types } from "mongoose";
import { User } from "../user/user.model";
import { walletStatus } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import { Transaction } from "../transaction/transaction.model";
import {
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { AgentStatus, Role } from "../user/user.interface";

//USER | AGENT | ADMIN ACTION
const addMoney = async (payload: { userId: string; amount: number }) => {
  const { userId, amount } = payload;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }
    if (user._id.toString() !== userId) {
      throw new Error("Unauthorized access");
    }

    const userWallet = await Wallet.findOne({ user: userId }).session(session);
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
    await userWallet.save({ session });

    await Transaction.create(
      [
        {
          type: TransactionType.TOP_UP,
          status: TransactionStatus.COMPLETED,
          amount: amount,
          initiatedBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return userWallet;
  } catch (error: any) {
    await session.abortTransaction();
    throw new Error(`Failed to add money: ${error.message}`);
  } finally {
    session.endSession();
  }
};
const withdrawMoney = async (payload: {
  userId: string;
  agentEmail: string;
  amount: number;
}) => {
  const { userId, agentEmail, amount } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount. Must be greater than 0.");
    }

    if (amount < 50) {
      throw new Error("At least 50 is required to withdraw.");
    }

    const user = await User.findById(userId).session(session);
    const agent = await User.findOne({ email: agentEmail }).session(session);

    
    if (!user) {
      throw new Error("User not found.");
    }
    if (!agent || agent.role !== Role.AGENT) {
      throw new Error("Agent not found with the provided email.");
    }
    if(agent.agentStatus=== AgentStatus.PENDING){
      throw new Error("Agent account is still under review");
    }
    const agentWallet = await Wallet.findOne({ user: agent._id }).session(
      session
    );
    if (!agentWallet) {
      throw new Error("Agent wallet not found.");
    }

    const userWallet = await Wallet.findOne({ user: userId }).session(session);
    if (!userWallet) {
      throw new Error("User wallet not found.");
    }

    if (
      userWallet.walletStatus === walletStatus.BLOCKED ||
      userWallet.walletStatus === walletStatus.INACTIVE
    ) {
      throw new Error(`Wallet is currently ${userWallet.walletStatus}.`);
    }

    if (userWallet.balance < amount) {
      throw new Error("Insufficient balance.");
    }

    userWallet.balance -= amount;
    agentWallet.balance += amount;
    await userWallet.save({ session });
    await agentWallet.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          senderWallet: agentWallet._id,
          receiverWallet: userWallet._id,
          initiatedBy: userId,
          type: TransactionType.WITHDRAW,
          status: TransactionStatus.COMPLETED,
          amount,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return transaction;
  } catch (error: any) {
    await session.abortTransaction();
    throw new Error(`Failed to withdraw: ${error.message}`);
  } finally {
    session.endSession();
  }
};
const sendMoney = async (payload: {
  userId: string;
  amount: number;
  receiverId: string;
}) => {
  const { userId, amount, receiverId } = payload;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (!amount || amount <= 0) throw new Error("Invalid amount");

    if (userId === receiverId) throw new Error("Cannot send money to yourself");

    const sender = await User.findById(userId).session(session);
    const receiver = await User.findById(receiverId).session(session);
    if (!sender || !receiver) throw new Error("Sender or Receiver not found");

    const senderWallet = await Wallet.findOne({ user: userId }).session(
      session
    );
    const receiverWallet = await Wallet.findOne({ user: receiverId }).session(
      session
    );

    if (!senderWallet || !receiverWallet) {
      throw new Error("Wallets for sender or receiver not found");
    }

    if (
      senderWallet.walletStatus !== walletStatus.ACTIVE ||
      receiverWallet.walletStatus !== walletStatus.ACTIVE
    ) {
      throw new Error("Sender or Receiver wallet not active");
    }

    if (senderWallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    //Update balances
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    //Create two transaction records
    await Transaction.create(
      [
        {
          type: TransactionType.SEND,
          amount,
          status: TransactionStatus.COMPLETED,
          senderWallet: senderWallet._id,
          initiatedBy: userId,
          receiverWallet: receiverId,
        },
        {
          type: TransactionType.RECEIVE,
          amount,
          status: TransactionStatus.COMPLETED,
          receiverWallet: receiverWallet._id,
          initiatedBy: userId,
          senderWallet: userId,
        },
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();

    return {
      senderWallet: {
        user: userId,
        balance: senderWallet.balance,
      },
      receiverWallet: {
        user: receiverId,
        balance: receiverWallet.balance,
      },
      amountSent: amount,
    };
  } catch (error: any) {
    await session.abortTransaction();
    throw new Error(`Failed to send money: ${error.message}`);
  } finally {
    session.endSession();
  }
};

const myWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId }).populate(
    "user",
    "name email role"
  );
  if (!wallet) throw new Error("No wallet found");

  const summary = await Transaction.aggregate([
    {
      $match: {
        initiatedBy: new Types.ObjectId(userId),
        status: TransactionStatus.COMPLETED,
      },
    },
    {
      $group: { _id: "$type", totalAmount: { $sum: "$amount" } },
    },
    {
      $project: {
        _id: 0,
        type: "$_id",
        totalAmount: 1,
      },
    },
  ]);

  const walletDoc = wallet.toObject();
  Object.assign(walletDoc, { transactionSummary: summary });

  return walletDoc;
};

export const walletService = {
  addMoney,
  withdrawMoney,
  sendMoney,
  myWallet,
};
