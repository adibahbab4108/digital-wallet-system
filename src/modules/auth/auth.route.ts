import { Router } from "express";
import { authController } from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/register", authController.createUserWithCredentials);
authRoutes.post("/login", authController.loginWithCredentials);
