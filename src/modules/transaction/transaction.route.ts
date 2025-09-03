import { Router } from "express";
import { transactionController } from "./transaction.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

export const transactionRoutes = Router();
transactionRoutes.get(
  "/all",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  transactionController.getAllTransactions
);
transactionRoutes.get(
  "/my-transaction",
  checkAuth(...Object.values(Role)),
  transactionController.getMyTransactions
);
