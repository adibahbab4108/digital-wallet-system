import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";
export const userRoutes = Router();


userRoutes.get(
  "/",
  checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
  userController.getUsers
);
userRoutes.post('/add-money',checkAuth(Role.USER),)
userRoutes.get("/:id", userController.getSingleUser);
