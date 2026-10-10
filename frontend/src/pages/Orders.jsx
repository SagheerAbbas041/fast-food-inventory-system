import { useEffect, useState } from "react";
import api from "../api";
import { Status } from "../components/UI";

export default function Orders() {
  const [rows, setRows] = useState([]);
  const [deleting, setDeleting] = useState(null);

  const loadOrders = async () => {
    try {
      const response = await api.get("/orders");
      setRows(response.data);
    } catch (error) {
      console.error("Load orders error:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to load orders."
      );
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDelete = async (id, orderNo) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Order #${orderNo}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(id);

      await api.delete(`/orders/${id}`);

      setRows((previousRows) =>
        previousRows.filter(
          (order) => order._id !== id
        )
      );

      alert("Order deleted successfully.");
    } catch (error) {
      console.error("Delete order error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete order."
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Page
      title="Orders"
      sub="All restaurant orders"
    >
      <div className="card table-wrap orders-table-wrap">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((x) => (
                <tr key={x._id}>
                  <td>{x.orderNo}</td>

                  <td>{x.tableName}</td>

                  <td>
                    {x.items?.length || 0}
                  </td>

                  <td>
                    PKR{" "}
                    {Number(
                      x.grandTotal || 0
                    ).toLocaleString()}
                  </td>

                  <td>
                    <Status value={x.status} />
                  </td>

                  <td>
                    {new Date(
                      x.createdAt
                    ).toLocaleString()}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          x._id,
                          x.orderNo
                        )
                      }
                      disabled={
                        deleting === x._id
                      }
                      style={{
                        background:
                          deleting === x._id
                            ? "#9ca3af"
                            : "#dc2626",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        padding:
                          "7px 12px",
                        cursor:
                          deleting === x._id
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: 700,
                        fontSize: "13px",
                        opacity:
                          deleting === x._id
                            ? 0.7
                            : 1,
                      }}
                    >
                      {deleting === x._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign:
                        "center",
                      padding: "24px",
                    }}
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

function Page({
  title,
  sub,
  children,
}) {
  return (
    <>
      <div className="page-heading orders-page-heading">
        <div>
          <h1>{title}</h1>

          <p>{sub}</p>
        </div>
      </div>

      {children}
    </>
  );
}