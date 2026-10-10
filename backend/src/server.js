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
// DATABASE
// =====================================================

await connectDB();

const app = express();

// =====================================================
// CORS
// =====================================================

const allowedOrigins =
  process.env.CLIENT_URL
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) || [];

app.use(
  cors({
    origin:
      allowedOrigins.length > 0
        ? allowedOrigins
        : "http://localhost:5173",

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
// HEALTH CHECK
// =====================================================

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "API is running",
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

// =====================================================
// ORDERS
// =====================================================

app.use("/api/orders", orderRoutes);

// =====================================================
// KITCHEN
// =====================================================

app.use("/api/kitchen", kitchenRoutes);

// =====================================================
// INVOICES
// =====================================================

app.use("/api/invoices", invoiceRoutes);

// =====================================================
// CUSTOMERS
// =====================================================

app.use("/api/customers", customerRoutes);

// =====================================================
// INVENTORY
// =====================================================
// GET    /api/inventory
// GET    /api/inventory/low-stock
// GET    /api/inventory/:id
// POST   /api/inventory
// PUT    /api/inventory/:id
// POST   /api/inventory/:id/stock
// DELETE /api/inventory/:id
// =====================================================

app.use("/api/inventory", inventoryRoutes);

// =====================================================
// PURCHASES
// =====================================================
// GET  /api/purchases
// GET  /api/purchases/:id
// POST /api/purchases
// PUT  /api/purchases/:id/cancel
// =====================================================

app.use("/api/purchases", purchaseRoutes);

// =====================================================
// USERS
// =====================================================

app.use("/api/users", userRoutes);

// =====================================================
// SETTINGS
// =====================================================

app.use("/api/settings", settingsRoutes);

// =====================================================
// BACKUP
// =====================================================

app.use("/api/backup", backupRoutes);

// =====================================================
// REPORTS
// =====================================================

app.use("/api/reports", reportRoutes);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, _req, res, _next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

// =====================================================
// START SERVER
// =====================================================

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(
    `API listening on http://localhost:${port}`
  );
});