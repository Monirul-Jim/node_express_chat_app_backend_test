import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import notFound from "./app/middleware/notFound";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import router from "./app/routes";
const app: Application = express();
// parsers
app.use(express.json());
app.use(cors());
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use(globalErrorHandler);
app.use(notFound);
export default app;
