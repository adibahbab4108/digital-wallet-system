import { Wallet } from "../wallet/wallet.model";
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
  if (updateData.role) {
    throw new Error("Role cannot be updated by users");
  }
  if (updateData.isDeleted || updateData.isVerified) {
    throw new Error("isDeleted and isVerified cannot be updated by users");
  }
  if (updateData.userStatus || updateData.agentStatus) {
    throw new Error("userStatus and agentStatus cannot be updated by users");
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new Error("User not found");
  return user;
};

const deleteUser = async (userId: string) => {
  const session = await User.startSession();

  try {
    session.startTransaction();
    if (!userId) throw new Error("User ID is required");
    const user = await User.findByIdAndDelete(userId).session(session);
    const userWallet = await Wallet.findOneAndDelete({ user: userId }).session(
      session
    );
    if (!user) throw new Error("User not found");
    session.commitTransaction();
    return { message: "User deleted successfully" };
  } catch (error: any) {
    session.endSession();
    throw new Error(`Error deleting user: ${error.message}`);
  } finally {
    session.endSession();
  }
};

export const userService = {
  getUsers,
  updateUser,
  getSingleUser,
  deleteUser,
};
