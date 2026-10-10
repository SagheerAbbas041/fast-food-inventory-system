import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api";
import { Card } from "../components/UI";

export default function Reports() {
  const [r, setR] = useState(null);

  // Load reports from backend
  const load = async () => {
    try {
      const response = await api.get("/reports");
      setR(response.data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    }
  };

  // IMPORTANT:
  // Do not return the API Promise from useEffect
  useEffect(() => {
    load();
  }, []);

  if (!r) {
    return (
      <div className="loading reports-loading">
        Loading reports...
      </div>
    );
  }

  const data = [
    {
      name: "Sales",
      value: r.sales,
    },
    {
      name: "Purchase",
      value: r.purchase,
    },
    {
      name: "Profit",
      value: r.profit,
    },
  ];

  return (
    <>
      <div className="page-heading reports-page-heading">
        <div>
          <h1>Reports</h1>
          <p>
            Daily, monthly and yearly business analysis
          </p>
        </div>
      </div>

      <div className="stats-grid four reports-stats-grid">
        <Card>
          <div className="report-stat-content">
            <span>Sales</span>

            <strong>
              PKR {r.sales.toLocaleString()}
            </strong>
          </div>
        </Card>

        <Card>
          <div className="report-stat-content">
            <span>Purchases</span>

            <strong>
              PKR {r.purchase.toLocaleString()}
            </strong>
          </div>
        </Card>

        <Card>
          <div className="report-stat-content">
            <span>Profit/Loss</span>

            <strong>
              PKR {r.profit.toLocaleString()}
            </strong>
          </div>
        </Card>

        <Card>
          <div className="report-stat-content">
            <span>Invoices</span>

            <strong>{r.invoices}</strong>
          </div>
        </Card>
      </div>

      <Card className="chart-card reports-chart-card">
        <div className="reports-chart-header">
          <h3>Sales / Purchase / Profit</h3>
        </div>

        <div className="chart reports-chart">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}