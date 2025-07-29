import express, { Request, Response } from "express";
import { GlobalErrorHAndler } from "./middleware/GlobalErrorHandler";
import notFound from "./middleware/NotFound";
import { userRoutes } from "./modules/user/user.routes";
const app = express();

app.use(express.json())
app.use('/api/v1/user',userRoutes)

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! I am Connected.");
});

app.use(GlobalErrorHAndler);
app.use(notFound);
export default app;
