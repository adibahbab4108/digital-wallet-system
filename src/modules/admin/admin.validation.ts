import z from "zod";
import { AgentStatus } from "../user/user.interface";

export const updateAgentWithZodSchema = z.object({
  agentStatus: z.enum(Object.values(AgentStatus)),
});
