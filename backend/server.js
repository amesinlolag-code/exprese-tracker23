import path from "path";
import net from "net";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = process.env.NODE_ENV === "production" ? "change_this_to_a_long_random_string" : "dev_jwt_secret";
}

const port = Number(process.env.PORT || 5000);

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

const app = express();

const getOpenPort = (basePort) =>
  new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(getOpenPort(basePort + 1));
      } else {
        reject(error);
      }
    });

    server.once("listening", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });

    server.listen(basePort);
  });

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Serve frontend build in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => res.sendFile(path.join(frontendDist, "index.html")));
} else {
  app.get("/", (req, res) => res.send("API is running..."));
}

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  getOpenPort(port)
    .then((availablePort) => {
      app.listen(availablePort, () => console.log(`[Server] Hunter's Ledger API running on port ${availablePort}`));
    })
    .catch((error) => {
      console.error("[Server] Failed to start server:", error);
      process.exit(1);
    });
}

export default app;
