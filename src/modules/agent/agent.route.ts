import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { AgentController } from "./agent.controller";
export const agentRoutes = Router()
agentRoutes.post("/add-money-to-user", checkAuth(Role.AGENT), AgentController.AddMoneyToUser);
agentRoutes.post("/withdraw-money-from-user", checkAuth(Role.AGENT), AgentController.WithdrawMoneyFromUser);