import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./lib/env.js";
import { authenticate } from "./middleware/auth.js";
import { authLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { customersRouter } from "./routes/customers.routes.js";
import { roomsRouter } from "./routes/rooms.routes.js";
import { reservationsRouter } from "./routes/reservations.routes.js";
import { invoicesRouter } from "./routes/invoices.routes.js";
import { complaintsRouter } from "./routes/complaints.routes.js";
import { interactionsRouter } from "./routes/interactions.routes.js";
import { campaignsRouter } from "./routes/campaigns.routes.js";
import { loyaltyRouter } from "./routes/loyalty.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "Manor CRM API" });
  });

  app.use("/auth", authLimiter, authRouter);

  app.use(authenticate);

  app.use("/users", usersRouter);
  app.use("/customers", customersRouter);
  app.use("/rooms", roomsRouter);
  app.use("/reservations", reservationsRouter);
  app.use("/invoices", invoicesRouter);
  app.use("/complaints", complaintsRouter);
  app.use("/interactions", interactionsRouter);
  app.use("/campaigns", campaignsRouter);
  app.use("/loyalty", loyaltyRouter);
  app.use("/dashboard", dashboardRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
