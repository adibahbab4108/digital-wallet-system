import { Router } from "express";
import { authController } from "./auth.controller";
import { validateWithZodSchema } from "../../middleware/ValidateWithZodSchema";
import { createUserZodSchema } from "../user/user.validation";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validateWithZodSchema(createUserZodSchema),
  authController.createUser
);
authRoutes.post("/login", authController.loginWithCredentials);
authRoutes.post("/logout",authController.logout)