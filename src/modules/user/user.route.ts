import { Router } from "express";
import { userController } from "./user.controller";
import { validateWithZodSchema } from "../../middleware/ValidateWithZodSchema";
import { createUserZodSchema } from "./user.validation";
import jwt from "jsonwebtoken";
import { envVars } from "../../config/env.config";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";
export const userRoutes = Router();
userRoutes.post(
  "/register",
  validateWithZodSchema(createUserZodSchema),
  userController.createUser
);
userRoutes.get(
  "/",
  checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
  userController.getUsers
);
userRoutes.get("/:id", userController.getSingleUser);
