import mongoose from "mongoose";
import { ITransactionInfo, walletStatus } from "../wallet/wallet.interface";
import { User } from "../user/user.model";
import { AgentStatus, Role } from "../user/user.interface";
import { Wallet } from "../wallet/wallet.model";
import { TransactionStatus, TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { th } from "zod/v4/locales/index.cjs";

interface AddMoneyToUserOutPayload {
  userId: string; // Agent's ID
  amount: number;
  receiverEmail: string;
}
// AGENT ACTION
const AddMoneyToUser = async (payload: AddMoneyToUserOutPayload): Promise<ITransactionInfo> => {
  const { userId: agentId, receiverEmail, amount } = payload;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (!agentId || !receiverEmail) {
      throw new Error("Invalid userinfo: Agent ID and Receiver Email are required.");
    }
    if(typeof amount !== "number" || amount <= 0){
      throw new Error("Invalid amount: Amount must be a positive number.");
    }

    if (agentId === receiverEmail) {
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

    const receiver = await User.findOne({email:receiverEmail}).session(session);
    if (!receiver) throw new Error("Receiver user not found.");

    const receiverWallet = await Wallet.findOne({ user: receiver._id }).session(
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
    if(agent.email === receiver.email){
      throw new Error("Agent cannot cash in to their own wallet");
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
          senderWallet: agentWallet._id,
          initiatedBy: agentId,
          receiver: receiver._id,
        },
        {
          type: TransactionType.CASH_IN,
          status: TransactionStatus.COMPLETED,
          amount,
          receiverWallet: receiverWallet._id,
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

const WithdrawMoneyFromUser = async (
  payload: AddMoneyToUserOutPayload
): Promise<ITransactionInfo> => {
  const { userId: agentId, amount, receiverEmail: customerEmail } = payload;

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

    const customer = await User.findOne({email:customerEmail}).session(session);
    if (!customer) throw new Error("Customer not found");

    const customerWallet = await Wallet.findOne({ user: customer._id }).session(
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
    if(agent.email === customer.email){
      throw new Error("Agent cannot withdraw from their own wallet");
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
          receiverWallet: customerWallet._id,
          initiatedBy: agentId,
          receiver: agentId,
        },
        {
          type: TransactionType.RECEIVE,
          status: TransactionStatus.COMPLETED,
          amount,
          senderWallet: agentWallet._id,
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
    throw new Error(`Withdraw failed: ${error.message}`);
  } finally {
    session.endSession();
  }
};

export const agentService={
    AddMoneyToUser, WithdrawMoneyFromUser
}
