import "@/src/configs/app.config.js"; // MUST be first — loads .env into process.env
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from 'cookie-parser'
import {
  requestLogger,
  securityHeaders,
} from "@/src/rest-resources/middlewares/request.middleware.js";
import errorMiddleware from "@/src/rest-resources/middlewares/error.middleware.js";
import { HealthService } from "@/src/services/health.service.js";
import router from "./routes";
import { contextMiddleware } from "./middlewares/context.middleware";
import { registerInvoiceListeners } from "@/src/services/invoice/invoice-event.listener.js";

// Register event listeners (must be before app initialization)
registerInvoiceListeners();

const app = express();

// Security & Parsing
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// General
app.use(securityHeaders);
app.use(requestLogger);

// Base Context (no transaction)
app.use(contextMiddleware());
app.use(router);

// Health check
app.get("/health", async (req, res, next) => {
  try {
    const healthData = await HealthService.execute({}, req.context);
    const statusCode = healthData.status === "ok" ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    next(error);
  }
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

// Error handler (MUST BE LAST)
app.use(errorMiddleware);

export default app;
