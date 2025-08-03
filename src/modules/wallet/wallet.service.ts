import mongoose from "mongoose";
import { AgentStatus, Role, userStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { ITransactionInfo, walletStatus } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import { Transaction } from "../transaction/transaction.model";
import {
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";

interface CashInOutPayload {
  userId: string; // Agent's ID
  amount: number;
  receiverId: string;
}

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
const withdrawMoney = async (payload: { userId: string; amount: number }) => {
  const { userId, amount } = payload;

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
    if (!user) {
      throw new Error("User not found.");
    }

    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      throw new Error("Wallet not found.");
    }

    if (
      wallet.walletStatus === walletStatus.BLOCKED ||
      wallet.walletStatus === walletStatus.INACTIVE
    ) {
      throw new Error(`Wallet is currently ${wallet.walletStatus}.`);
    }

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance.");
    }

    wallet.balance -= amount;
    await wallet.save({ session });

    await Transaction.create(
      [
        {
          wallet: wallet._id,
          initiatedBy: userId,
          type: TransactionType.WITHDRAW,
          status: TransactionStatus.COMPLETED,
          amount,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return wallet;
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

// AGENT ACTION
const cashIn = async (payload: CashInOutPayload): Promise<ITransactionInfo> => {
  const { userId: agentId, receiverId, amount } = payload;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (!agentId || !receiverId || typeof amount !== "number" || amount <= 0) {
      throw new Error("Invalid input: amount must be a positive number.");
    }

    if (agentId === receiverId) {
      throw new Error("Agent cannot cash in to their own wallet.");
    }

    const agent = await User.findById(agentId).session(session);
    if (!agent || agent.role !== Role.AGENT) {
      throw new Error("Only agents can perform cash-in.");
    }

    if (
      agent.agentStatus === AgentStatus.PENDING ||
      agent.agentStatus === AgentStatus.SUSPENDED
    ) {
      throw new Error(
        `Your agent account is ${agent.agentStatus}. Please contact support.`
      );
    }

    const agentWallet = await Wallet.findOne({ user: agentId }).session(
      session
    );
    if (!agentWallet) throw new Error("Agent wallet not found.");

    if (agentWallet.balance < amount) {
      throw new Error("Insufficient agent wallet balance.");
    }

    const receiver = await User.findById(receiverId).session(session);
    if (!receiver) throw new Error("Receiver user not found.");

    const receiverWallet = await Wallet.findOne({ user: receiverId }).session(
      session
    );
    if (!receiverWallet) throw new Error("Receiver wallet not found.");

    if (
      receiverWallet.walletStatus === walletStatus.BLOCKED ||
      receiverWallet.walletStatus === walletStatus.INACTIVE
    ) {
      throw new Error(`Receiver's wallet is ${receiverWallet.walletStatus}`);
    }

    if (
      agentWallet.walletStatus === walletStatus.BLOCKED ||
      agentWallet.walletStatus === walletStatus.INACTIVE
    ) {
      throw new Error(`Agent's wallet is ${agentWallet.walletStatus}`);
    }

    //Balance update
    agentWallet.balance -= amount;
    receiverWallet.balance += amount;

    await agentWallet.save({ session });
    await receiverWallet.save({ session });

    // Create transactions
    await Transaction.create(
      [
        {
          type: TransactionType.SEND,
          status: TransactionStatus.COMPLETED,
          amount,
          wallet: agentWallet._id,
          initiatedBy: agentId,
          receiver: receiverId,
        },
        {
          type: TransactionType.CASH_IN,
          status: TransactionStatus.COMPLETED,
          amount,
          wallet: receiverWallet._id,
          initiatedBy: agentId,
          sender: agentId,
        },
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();

    return {
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
  } catch (error: any) {
    await session.abortTransaction();
    throw new Error(`Cash-in failed: ${error.message}`);
  } finally {
    session.endSession();
  }
};

const cashOut = async (
  payload: CashInOutPayload
): Promise<ITransactionInfo> => {
  const { userId: agentId, amount, receiverId: customerId } = payload;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    const agent = await User.findById(agentId).session(session);
    if (!agent || agent.role !== Role.AGENT) {
      throw new Error("Only agents can perform cash-out.");
    }

    if (
      agent.agentStatus === AgentStatus.PENDING ||
      agent.agentStatus === AgentStatus.SUSPENDED
    ) {
      throw new Error(
        `Agent account is ${agent.agentStatus}. Please contact support.`
      );
    }

    const agentWallet = await Wallet.findOne({ user: agentId }).session(
      session
    );
    if (!agentWallet) throw new Error("No wallet found for agent");

    const customer = await User.findById(customerId).session(session);
    if (!customer) throw new Error("Customer not found");

    const customerWallet = await Wallet.findOne({ user: customerId }).session(
      session
    );
    if (!customerWallet) throw new Error("No wallet found for customer");

    if (
      customerWallet.walletStatus === walletStatus.BLOCKED ||
      customerWallet.walletStatus === walletStatus.INACTIVE
    ) {
      throw new Error(`Customer wallet is ${customerWallet.walletStatus}`);
    }

    if (
      agentWallet.walletStatus === walletStatus.BLOCKED ||
      agentWallet.walletStatus === walletStatus.INACTIVE
    ) {
      throw new Error(`Agent wallet is ${agentWallet.walletStatus}`);
    }

    if (customerWallet.balance < amount) {
      throw new Error("Customer has insufficient balance");
    }

    customerWallet.balance -= amount;
    agentWallet.balance += amount;

    await customerWallet.save({ session });
    await agentWallet.save({ session });

    await Transaction.create(
      [
        {
          type: TransactionType.SEND,
          status: TransactionStatus.COMPLETED,
          amount,
          wallet: customerWallet._id,
          initiatedBy: agentId,
          receiver: agentId,
        },
        {
          type: TransactionType.RECEIVE,
          status: TransactionStatus.COMPLETED,
          amount,
          wallet: agentWallet._id,
          initiatedBy: agentId,
          sender: customer._id,
        },
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();

    return {
      senderWallet: {
        user: customerWallet.user,
        balance: customerWallet.balance,
      },
      send_amount: amount,
      receiverWallet: {
        user: agentWallet.user,
        balance: agentWallet.balance,
      },
    };
  } catch (error: any) {
    await session.abortTransaction();
    throw new Error(`Cash-out failed: ${error.message}`);
  } finally {
    session.endSession();
  }
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
