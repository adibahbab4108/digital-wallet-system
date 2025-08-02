import { Types } from "mongoose";

export interface IAuth {
  provider?: "google" | "credentials" | "admin";
  providerId?: string;
}
export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}
export enum userStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}
export enum AgentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
}

export interface IUser {
  name?: string;
  email: string;  
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: boolean;
  isVerified?: boolean;
  userStatus?: userStatus;
  agentStatus?: AgentStatus;
  role: Role;
  auths: IAuth[];
}
