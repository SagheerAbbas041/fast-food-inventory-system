import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Armchair,
  CalendarDays,
  ChefHat,
  AlertTriangle,
  Users,
  Wallet,
} from "lucide-react";

import api from "../api";
import { Card, Status } from "../components/UI";

const periods = [
  ["daily", "Daily"],
  ["weekly", "Weekly"],
  ["monthly", "Monthly"],
  ["yearly", "Yearly"],
];

const periodLabels = {
  daily: "Today",
  weekly: "Last 7 Days",
  monthly: "Last 1 Month",
  yearly: "Last 12 Months",
};

const formatPKR = (value) => {
  const amount = Number(value || 0);

  return `PKR ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getNumber = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      const number = Number(value);

      if (!Number.isNaN(number)) {
        return number;
      }
    }
  }

  return 0;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard(period);
  }, [period]);

  const loadDashboard = async (selectedPeriod) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/dashboard?period=${selectedPeriod}`
      );

      setData(response.data || {});
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const cards = data?.cards || {};

  const recentOrders = Array.isArray(data?.recentOrders)
    ? data.recentOrders
    : [];

  const lowStock = Array.isArray(data?.lowStock)
    ? data.lowStock
    : [];

  /*
   * =========================
   * PERIOD DATA
   * =========================
   */

  const totalSales = getNumber(
    cards.totalSales,
    data?.totalSales
  );

  const profit = getNumber(
    cards.profit,
    cards.todayProfit,
    data?.profit,
    data?.todayProfit
  );

  const totalOrders = getNumber(
    cards.orders,
    cards.todayOrders,
    data?.orders,
    data?.todayOrders
  );

  const totalCustomers = getNumber(
    cards.customers,
    cards.totalCustomers,
    data?.customers,
    data?.totalCustomers
  );

  /*
   * =========================
   * LIVE CURRENT DATA
   * =========================
   */

  const occupiedTables = getNumber(
    cards.occupiedTables,
    data?.occupiedTables
  );

  const pendingKitchen = getNumber(
    cards.pendingKitchen,
    data?.pendingKitchen
  );

  /*
   * =========================
   * PERIOD EXPENSE
   * =========================
   */

  const expense = getNumber(
    data?.expense,
    data?.expenses?.total,
    cards.expense,
    cards.dailyExpense
  );

  const selectedPeriodLabel =
    periodLabels[period] || "Today";

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <div className="loading">
        Loading dashboard...
      </div>
    );
  }

  /*
   * =========================
   * ERROR
   * =========================
   */

  if (error) {
    return (
      <div className="empty dashboard-error">
        <strong>Dashboard Error</strong>

        <p>{error}</p>

        <button
          className="btn"
          onClick={() => loadDashboard(period)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="page-heading dashboard-page-heading">
        <div className="dashboard-heading-content">
          <h1>Dashboard</h1>

          <p>
            Restaurant performance overview
          </p>

          {/* =========================
              PERIOD BUTTONS
          ========================== */}

          <div className="period-tabs">
            {periods.map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`period-btn ${
                  period === value ? "active" : ""
                }`}
                onClick={() => setPeriod(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <small className="period-info">
            Showing data for{" "}
            <strong>
              {selectedPeriodLabel}
            </strong>
          </small>
        </div>
      </div>

      {/* =========================
          STATISTICS CARDS
      ========================== */}

      <div className="stats-grid dashboard-stats-grid">

        {/* SALES */}

        <Card className="stat-card">
          <div className="stat-icon">
            <DollarSign size={20} />
          </div>

          <div className="stat-content">
            <span>
              {period === "daily"
                ? "Today's Sales"
                : `${selectedPeriodLabel} Sales`}
            </span>

            <strong>
              {formatPKR(totalSales)}
            </strong>
          </div>
        </Card>

        {/* PROFIT */}

        <Card className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>

          <div className="stat-content">
            <span>
              {period === "daily"
                ? "Today's Profit"
                : `${selectedPeriodLabel} Profit`}
            </span>

            <strong>
              {formatPKR(profit)}
            </strong>
          </div>
        </Card>

        {/* ORDERS */}

        <Card className="stat-card">
          <div className="stat-icon">
            <ShoppingBag size={20} />
          </div>

          <div className="stat-content">
            <span>
              {period === "daily"
                ? "Today's Orders"
                : `${selectedPeriodLabel} Orders`}
            </span>

            <strong>
              {totalOrders.toLocaleString()}
            </strong>
          </div>
        </Card>

        {/* OCCUPIED TABLES */}

        <Card className="stat-card">
          <div className="stat-icon">
            <Armchair size={20} />
          </div>

          <div className="stat-content">
            <span>
              Occupied Tables
            </span>

            <strong>
              {occupiedTables.toLocaleString()}
            </strong>
          </div>
        </Card>

        {/* PERIOD SALES */}

        <Card className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={20} />
          </div>

          <div className="stat-content">
            <span>
              {selectedPeriodLabel} Sales
            </span>

            <strong>
              {formatPKR(totalSales)}
            </strong>
          </div>
        </Card>

        {/* PENDING KITCHEN */}

        <Card className="stat-card">
          <div className="stat-icon">
            <ChefHat size={20} />
          </div>

          <div className="stat-content">
            <span>
              Pending Kitchen
            </span>

            <strong>
              {pendingKitchen.toLocaleString()}
            </strong>
          </div>
        </Card>

        {/* LOW STOCK */}

        <Card className="stat-card">
          <div className="stat-icon">
            <AlertTriangle size={20} />
          </div>

          <div className="stat-content">
            <span>
              Low Stock Alerts
            </span>

            <strong>
              {lowStock.length.toLocaleString()}
            </strong>
          </div>
        </Card>

        {/* CUSTOMERS */}

        <Card className="stat-card">
          <div className="stat-icon">
            <Users size={20} />
          </div>

          <div className="stat-content">
            <span>
              {period === "daily"
                ? "Today's Customers"
                : `${selectedPeriodLabel} Customers`}
            </span>

            <strong>
              {totalCustomers.toLocaleString()}
            </strong>
          </div>
        </Card>

        {/* EXPENSE */}

        <Card className="stat-card expense-card">
          <div className="stat-icon">
            <Wallet size={20} />
          </div>

          <div className="stat-content">
            <span>
              {period === "daily"
                ? "Today's Expense"
                : `${selectedPeriodLabel} Expense`}
            </span>

            <strong>
              {formatPKR(expense)}
            </strong>
          </div>
        </Card>
      </div>

      {/* =========================
          RECENT ORDERS + LOW STOCK
      ========================== */}

      <div className="two-col dashboard-two-col">

        {/* RECENT ORDERS */}

        <Card>
          <div className="card-head dashboard-card-head">
            <div>
              <h3>
                Recent Orders
              </h3>

              <small>
                {selectedPeriodLabel}
              </small>
            </div>

            <a href="/orders">
              View all
            </a>
          </div>

          <TableOrders
            rows={recentOrders}
            period={period}
          />
        </Card>

        {/* LOW STOCK */}

        <Card>
          <div className="card-head dashboard-card-head">
            <div>
              <h3>
                Low Stock Alerts
              </h3>

              <small>
                Current inventory status
              </small>
            </div>

            <a href="/inventory">
              View inventory
            </a>
          </div>

          {lowStock.length > 0 ? (
            <div className="stock-list">

              {lowStock.map((item) => (
                <div
                  className="stock-row"
                  key={item._id}
                >
                  <div className="stock-item-info">
                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {item.category}
                    </small>
                  </div>

                  <Status
                    value={
                      Number(item.stock || 0) === 0
                        ? "out of stock"
                        : "low stock"
                    }
                  />

                  <b className="stock-quantity">
                    {Number(item.stock || 0)}{" "}
                    {item.unit}
                  </b>
                </div>
              ))}

            </div>
          ) : (
            <div className="empty">
              Inventory is healthy.
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

/* =========================
   RECENT ORDERS TABLE
========================= */

function TableOrders({
  rows = [],
  period,
}) {
  return (
    <div className="table-wrap dashboard-orders-table">
      <div className="responsive-table">
        <table>
          <thead>
            <tr>
              <th>
                Order
              </th>

              <th>
                Table
              </th>

              <th>
                Total
              </th>

              <th>
                Status
              </th>
            </tr>
          </thead>

          <tbody>

            {rows.length > 0 ? (

              rows.map((order) => (
                <tr
                  key={order._id}
                >
                  <td>
                    {order.orderNo || "-"}
                  </td>

                  <td>
                    {order.tableName || "-"}
                  </td>

                  <td>
                    {formatPKR(
                      order.grandTotal
                    )}
                  </td>

                  <td>
                    <Status
                      value={
                        order.status ||
                        "unknown"
                      }
                    />
                  </td>
                </tr>
              ))

            ) : (

              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  No orders found for{" "}
                  {periodLabels[period] ||
                    "this period"}.
                </td>
              </tr>

            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}