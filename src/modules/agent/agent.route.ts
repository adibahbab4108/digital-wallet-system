import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { AgentController } from "./agent.controller";
export const agentRoutes = Router()
agentRoutes.post("/cash-in", checkAuth(Role.AGENT), AgentController.cashIn);
agentRoutes.post("/cash-out", checkAuth(Role.AGENT), AgentController.cashOut);