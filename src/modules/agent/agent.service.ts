import mongoose from "mongoose";
import { ITransactionInfo, walletStatus } from "../wallet/wallet.interface";
import { User } from "../user/user.model";
import { AgentStatus, Role } from "../user/user.interface";
import { Wallet } from "../wallet/wallet.model";
import { TransactionStatus, TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";

interface CashInOutPayload {
  userId: string; // Agent's ID
  amount: number;
  receiverId: string;
}
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

export const agentService={
    cashIn, cashOut
}
