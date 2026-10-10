
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import tableRoutes from "./routes/table.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import orderRoutes from "./routes/order.routes.js";
import kitchenRoutes from "./routes/kitchen.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import userRoutes from "./routes/user.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import backupRoutes from "./routes/backup.routes.js";
import reportRoutes from "./routes/report.routes.js";

dotenv.config();

// =====================================================
// DATABASE CONNECTION
// =====================================================

await connectDB();

// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header,
      // such as Postman and server-to-server requests.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(morgan("dev"));

// =====================================================
// HOME ROUTE - SERVER STATUS
// =====================================================

app.get("/", (_req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Fast Food Inventory System</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: linear-gradient(
              135deg,
              #f0fdf4,
              #dcfce7,
              #f8fafc
            );
            color: #1f2937;
          }

          .card {
            width: 100%;
            max-width: 500px;
            padding: 40px 25px;
            text-align: center;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
          }

          .icon {
            font-size: 52px;
            margin-bottom: 15px;
          }

          h1 {
            margin: 0 0 18px;
            font-size: 28px;
            color: #166534;
          }

          .status {
            display: inline-block;
            padding: 10px 18px;
            border-radius: 30px;
            background: #dcfce7;
            color: #166534;
            font-size: 15px;
            font-weight: bold;
          }

          p {
            line-height: 1.7;
            color: #4b5563;
          }

          .button {
            display: inline-block;
            margin-top: 12px;
            padding: 12px 20px;
            border-radius: 8px;
            background: #15803d;
            color: #ffffff;
            text-decoration: none;
            font-weight: bold;
          }

          .button:hover {
            background: #166534;
          }

          .footer {
            margin-top: 25px;
            font-size: 13px;
            color: #6b7280;
          }
        </style>
      </head>

      <body>
        <main class="card">
          <div class="icon">🍽️</div>

          <h1>Fast Food Inventory System</h1>

          <div class="status">
            ● Server is running successfully
          </div>

          <p>
            Your backend server is online and ready
            to receive API requests.
          </p>

          <a class="button" href="/api/health">
            Check API Health
          </a>

          <div class="footer">
            Fast Food Inventory System | Backend API
          </div>
        </main>
      </body>
    </html>
  `);
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Server is running successfully",
    application: "Fast Food Inventory System",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// API ROUTES
// =====================================================

// Authentication
app.use("/api/auth", authRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Tables
app.use("/api/tables", tableRoutes);

// Menu
app.use("/api/menu", menuRoutes);

// Orders
app.use("/api/orders", orderRoutes);

// Kitchen
app.use("/api/kitchen", kitchenRoutes);

// Invoices
app.use("/api/invoices", invoiceRoutes);

// Customers
app.use("/api/customers", customerRoutes);

// Inventory
app.use("/api/inventory", inventoryRoutes);

// Purchases
app.use("/api/purchases", purchaseRoutes);

// Users
app.use("/api/users", userRoutes);

// Settings
app.use("/api/settings", settingsRoutes);

// Backup
app.use("/api/backup", backupRoutes);

// Reports
app.use("/api/reports", reportRoutes);

// =====================================================
// 404 - ROUTE NOT FOUND
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, _req, res, _next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || "Server error",
  });
});

// =====================================================
// START SERVER
// =====================================================

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("======================================");
  console.log(" Fast Food Inventory System");
  console.log(" Server is running successfully!");
  console.log(` Local URL: http://localhost:${port}`);
  console.log(` Health:    http://localhost:${port}/api/health`);
  console.log("======================================");
});
