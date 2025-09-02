import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { adminActionConstroller } from "./admin.controller";
import { validateWithZodSchema } from "../../middleware/ValidateWithZodSchema";
import { updateAgentWithZodSchema } from "./admin.validation";
import { updateWalletZodSchema } from "../wallet/wallet.validation";

export const adminRoutes = Router();
adminRoutes.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminActionConstroller.getUsers
);
adminRoutes.get(
  "/all-agents",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminActionConstroller.getAgents
);
adminRoutes.get(
  "/all-wallets",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminActionConstroller.getWallet
);

adminRoutes.get(
  "/transactions",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminActionConstroller.getTransactions
);

adminRoutes.patch(
  "/agent/:agentId/update-approval",
  validateWithZodSchema(updateAgentWithZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminActionConstroller.agentStatusApproval
);

adminRoutes.patch(
  "/user/:userId/update-wallet",
  validateWithZodSchema(updateWalletZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminActionConstroller.updateWalletStatus
);
