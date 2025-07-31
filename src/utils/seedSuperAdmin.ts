import { envVars } from "../config/env.config";
import { Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcrypt from "bcryptjs";
export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });
    
    if (isSuperAdminExist){
      return console.log("Super Admin already exist");
    } 
    const hashedPassword =await bcrypt.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );

    const superAdmin = new User({
      name:"Super Admin",
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isVerified: true,
      auths: {
        provider: "credentials",
        providerId: envVars.SUPER_ADMIN_EMAIL,
      },
    });

    await superAdmin.save();
    console.log("✅ Super Admin created successfully");
  } catch (error) {
     console.error("❌ Failed to seed super admin:", error);
  }
}