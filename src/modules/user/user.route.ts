import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";
export const userRoutes = Router();

// create user is delegated to auth

userRoutes.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.getUsers
);
userRoutes.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.getSingleUser
);
