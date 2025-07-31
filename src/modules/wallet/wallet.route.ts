import { Router } from "express";
import { walletController } from "./wallet.controller.";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

export const walletRoutes = Router();
walletRoutes.get("/", checkAuth(...Object.values(Role)));
walletRoutes.post(
  "/add-money",
  checkAuth(...Object.values(Role)),
  walletController.addMoney
);
walletRoutes.post(
  "/withdraw",
  checkAuth(...Object.values(Role)),
  walletController.withdrawMoney
);
walletRoutes.get(
  "/my-wallet",
  checkAuth(...Object.values(Role)),
  walletController.myWallet
);
