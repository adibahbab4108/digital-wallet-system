import express, { Request, Response } from "express";
import cors from "cors";
import { GlobalErrorHAndler } from "./middleware/GlobalErrorHandler";
import notFound from "./middleware/NotFound";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { walletRoutes } from "./modules/wallet/wallet.route";
import { adminRoutes } from "./modules/admin/admin.route";
const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
  })
);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wallet", walletRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! I am Connected.");
});

app.use(GlobalErrorHAndler);
app.use(notFound);
export default app;
