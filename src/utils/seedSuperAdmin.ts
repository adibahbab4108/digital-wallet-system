import mongoose from "mongoose";
import { envVars } from "../config/env.config";
import { Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcrypt from "bcryptjs";
import { Wallet } from "../modules/wallet/wallet.model";

export const seedSuperAdmin = async () => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    }).session(session); // 🛡 Ensures read is inside the transaction

    if (isSuperAdminExist) {
      console.log("⚠️ Super Admin already exists");
      await session.abortTransaction();
      return;
    }

    const hashedPassword = await bcrypt.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );

    const [superAdmin] = await User.create(
      [
        {
          name: "Super Admin",
          email: envVars.SUPER_ADMIN_EMAIL,
          password: hashedPassword,
          role: Role.SUPER_ADMIN,
          isVerified: true,
          auths: {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL,
          },
        },
      ],
      { session }
    );

    await Wallet.create(
      [
        {
          user: superAdmin._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    console.log("✅ Super Admin seeded successfully");
  } catch (error: any) {
    await session.abortTransaction();
    console.error("❌ Failed to seed Super Admin:", error.message);
    throw error;
  } finally {
    session.endSession();
  }
};
