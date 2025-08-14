import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";
import { validateWithZodSchema } from "../../middleware/ValidateWithZodSchema";
import { updateUserZodSchema } from "./user.validation";
export const userRoutes = Router();

// create user is delegated to auth
userRoutes.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.getUsers
);

userRoutes.get(
  "/profile",
  checkAuth(...Object.values(Role)),
  userController.getMe
);
userRoutes.patch(
  "/update-profile",
  validateWithZodSchema(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  userController.updateUser
);
userRoutes.delete(
  "/delete/:id",
  checkAuth(...Object.values(Role)),
  userController.deleteUser
);
userRoutes.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.getSingleUser
);
