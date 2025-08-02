import z, { optional } from "zod";
import { currency, walletStatus } from "./wallet.interface";

export const walletZodSchema = z.object({
  user: z.string(),
  balance: z.number(),
  currency: z.enum(Object.values(currency)),
  walletStatus: z.enum(Object.values(walletStatus)),
});
export const updateWalletZodSchema = z.object({
  user: z.string().optional(),
  balance: z.number().optional(),
  currency: z.enum(Object.values(currency)).optional(),
  walletStatus: z.enum(Object.values(walletStatus)).optional(),
});
