import { TransactionQuery } from "./transaction.interface";
import { Transaction } from "./transaction.model";

const getAllTransactions = async (filters: TransactionQuery) => {
  const { page = 1, limit = 10, type, status, userId } = filters;

  if (page < 1 || limit < 1) {
    throw new Error("Page and limit must be greater than 0");
  }
  const skip = (Number(page) - 1) * Number(limit);

  const query: any = {};
  if (type && type !== "ALL") {
    query.type = type;
  }

  if (status) query.status = status;

  const transactions = await Transaction.find(query)
    .populate("initiatedBy", "name")
    .populate({
      path: "senderWallet",
      populate: {
        path: "user",
        select: "email",
      },
    })
    .populate({
      path: "receiverWallet",
      populate: {
        path: "user",
        select: "email",
      },
    })
    .skip(skip)
    .limit(Number(limit));

  if (transactions.length === 0) throw new Error("No transactions found");

  const numberOfTransactions = await Transaction.countDocuments();
  const totalPages = Math.ceil(numberOfTransactions / Number(limit));
  const transactionsInThisPage = transactions.length;

  return {
    data: transactions,
    meta: {
      total: numberOfTransactions,
      transactionsInThisPage,
      totalPages,
    },
  };
};
const getMyTransactions = async (filters: TransactionQuery) => {
  const { page = 1, limit = 10, type, status, userId } = filters;
  if (page < 1 || limit < 1) {
    throw new Error("Page and limit must be greater than 0");
  }
  const skip = (Number(page) - 1) * Number(limit);

  const query: any = {};
  if (type && type !== "ALL") {
    query.type = type;
  }
  if (userId) {
    query.initiatedBy = userId;
  }

  if (status) query.status = status;

  const transactions = await Transaction.find(query)
    .populate("initiatedBy", "name")
    .populate({
      path: "senderWallet",
      populate: {
        path: "user",
        select: "email",
      },
    })
    .populate({
      path: "receiverWallet",
      populate: {
        path: "user",
        select: "email",
      },
    })
    .skip(skip)
    .limit(Number(limit));

  if (transactions.length === 0) throw new Error("No transactions found");

  const numberOfTransactions = await Transaction.countDocuments();
  const totalPages = Math.ceil(numberOfTransactions / Number(limit));
  const transactionsInThisPage = transactions.length;

  return {
    data: transactions,
    meta: {
      total: numberOfTransactions,
      transactionsInThisPage,
      totalPages,
    },
  };
};

export const transactionService = {
  getAllTransactions,
  getMyTransactions,
};
