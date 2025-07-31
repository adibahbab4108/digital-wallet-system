import { model, Schema } from "mongoose";
import { IAuth, IUser, Role, userStatus } from "./user.interface";

const authProviderSchema = new Schema<IAuth>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Password should not be returned in queries
    phone: { type: String, unique: true, sparse: true }, // Sparse make it optional but ensure uniqueness when it available
    picture: { type: String, default: "" },
    address: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    userStatus: {
      type: String,
      enum: Object.values(userStatus),
      default: userStatus.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    auths: [authProviderSchema],
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
