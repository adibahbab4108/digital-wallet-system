import { TransactionQuery } from "./transaction.interface";
import { Transaction } from "./transaction.model";

const getAllTransactions = async (filters: TransactionQuery) => {
  const { page = 1, limit = 10, type, status, userId } = filters;

  if (page < 1 || limit < 1) {
    throw new Error("Page and limit must be greater than 0");
  }
  const skip = (Number(page) - 1) * Number(limit);

  const filterQuery: any = {};
  if (type && type !== "ALL") {
    filterQuery.type = type;
  }

  if (status) filterQuery.status = status;
  if (userId) filterQuery.userId = userId;

  const transactions = await Transaction.find(filterQuery)
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
  const { page = 1, limit , type, status, userId } = filters;
  if (page < 1 || (limit && limit < 1)) {
    throw new Error("Page and limit must be greater than 0");
  }
  const skip = (Number(page) - 1) * Number(limit);

  const filterQuery: any = {};
  if (type && type !== "ALL") {
    filterQuery.type = type;
  }
  if (userId) {
    filterQuery.initiatedBy = userId;
  }

  if (status) filterQuery.status = status;
  
  const transactions = await Transaction.find(filterQuery)
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

  const numberOfTotalTransactions = await Transaction.countDocuments();
  const numberOfFilteredTransactions = await Transaction.countDocuments(filterQuery);
  const numberOfTransactions = userId ? numberOfFilteredTransactions : numberOfTotalTransactions;
  const totalPages = Math.ceil(numberOfTransactions / Number(limit));
  const transactionsInThisPage = transactions.length;

  return {
    data: transactions,
    meta: {
      total: numberOfTotalTransactions,
      transactionsInThisPage,
      totalPages,
    },
  };
};

export const transactionService = {
  getAllTransactions,
  getMyTransactions,
};
