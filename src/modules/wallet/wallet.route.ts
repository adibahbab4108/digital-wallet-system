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

//ONLY AGENT ACCESS
walletRoutes.post("/cash-in", checkAuth(Role.AGENT), walletController.cashIn);
walletRoutes.post("/cash-out", checkAuth(Role.AGENT), walletController.cashOut);



walletRoutes.get(
  "/my-wallet",
  checkAuth(...Object.values(Role)),
  walletController.myWallet
);
