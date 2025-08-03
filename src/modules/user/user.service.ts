import { IUser } from "./user.interface";
import { User } from "./user.model";

const getUsers = async () => {
  const users = await User.find({});

  if (users.length === 0) throw new Error("No user found");

  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};
const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return user;
};

const updateUser = async (userId: string, updateData: Partial<IUser>) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new Error("User not found");
  return user;
};

export const userService = {
  getUsers,
  updateUser,
  getSingleUser,
};
