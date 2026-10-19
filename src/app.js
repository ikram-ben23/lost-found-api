import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./openapi.js";
import { authRouter } from "./routes/auth.js";
import { itemsRouter } from "./routes/items.js";
import { errorHandler, notFound } from "./middleware/errors.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: "draft-8", legacyHeaders: false }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok", service: "Lost & Found API" } });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/items", itemsRouter);

app.use(notFound);
app.use(errorHandler);
