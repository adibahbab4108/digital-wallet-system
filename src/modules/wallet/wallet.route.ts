import { Router } from "express";
import { walletController } from "./wallet.controller.";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

export const walletRoutes = Router();
// USER | AGENT | ADMIN ACCESS
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
walletRoutes.post(
  "/send-money",
  checkAuth(...Object.values(Role)),
  walletController.sendMoney  
);

//ONLY ADMIN | SUPER ADMIN ACCESS


walletRoutes.get(
  "/my-wallet",
  checkAuth(...Object.values(Role)),
  walletController.myWallet
);
