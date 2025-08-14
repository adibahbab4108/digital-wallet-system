import { TransactionQuery } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { AgentStatus, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { walletStatus } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";

const getUsers = async () => {
  const users = await User.find({});

  if (users.length === 0) throw new Error("No user found");

  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};
const getWallet = async () => {
  const wallets = await Wallet.find({});

  if (wallets.length === 0) throw new Error("No wallets found");

  const totalWallet = await User.countDocuments();
  return {
    data: wallets,
    meta: {
      total: totalWallet,
    },
  };
};

const getTransactions = async (filters: TransactionQuery) => {
  const {
    page = 1,
    limit = 10,
    type,
    status,
    userId,
  } = filters;

  if (page < 1 || limit < 1) {
    throw new Error("Page and limit must be greater than 0");
  }
  const skip = (Number(page) - 1) * Number(limit);

  const transactions = await Transaction.find({}).skip(skip).limit(Number(limit));

  if (transactions.length === 0) throw new Error("No transactions found");

  const numberOfTransactions = await Transaction.countDocuments();
  const totalPages = Math.ceil(numberOfTransactions / Number(limit));
  const transactionsInThisPage =  transactions.length

  return {
    data: transactions,
    meta: {
      total: numberOfTransactions,
      transactionsInThisPage,
      totalPages
    },
  };
};
const agentStatusApproval = async (
  agentId: string,
  agentStatus: AgentStatus
) => {
  const agentAccount = await User.findById(agentId);

  if (!agentAccount) {
    throw new Error("Agent not found");
  }
  if (!agentStatus) {
    throw new Error("No status provided");
  }
  if (agentAccount.role != Role.AGENT) {
    throw new Error(`No such action required for ${agentAccount.role}`);
  }

  if (agentAccount.agentStatus) {
    agentAccount.agentStatus = agentStatus;
  }
  await agentAccount.save();

};
const updateWalletStatus = async (walletStatus: string, userId: string) => {
  const userWallet = await Wallet.findOne({ user: userId });
  const user = await User.findById(userId);
  if (!userWallet) {
    throw new Error("No wallet found for user");
  }
  if (!user) {
    throw new Error("No wallet found for user");
  }

  if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
    throw new Error("You cannot update ADMIN's role");
  }

  userWallet.walletStatus = walletStatus as walletStatus;
  userWallet.save();
  return userWallet;
};

export const adminActionService = {
  getUsers,
  getWallet,
  getTransactions,
  agentStatusApproval,
  updateWalletStatus,
};
