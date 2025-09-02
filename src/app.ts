import express, { Request, Response } from "express";
import cors from "cors";
import { GlobalErrorHandler } from "./middleware/GlobalErrorHandler";
import notFound from "./middleware/NotFound";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { walletRoutes } from "./modules/wallet/wallet.route";
import { adminRoutes } from "./modules/admin/admin.route";
import cookieParser from "cookie-parser";
import { envVars } from "./config/env.config";
import { agentRoutes } from "./modules/agent/agent.route";
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form-data

app.use(
  cors({
    origin: envVars.FRONTEND_URI,
    credentials: true,
  })
);

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/agent", agentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wallet", walletRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! I am Connected.");
});

app.use(notFound);
app.use(GlobalErrorHandler);
export default app;
