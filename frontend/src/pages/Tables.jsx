import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Armchair,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Button, Card, Modal, Status } from "../components/UI";

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    capacity: 4,
  });

  const nav = useNavigate();

  // Load tables from backend
  const load = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tables");

      const tableData = Array.isArray(response.data)
        ? response.data
        : [];

      setTables(tableData);
    } catch (error) {
      console.error("Failed to load tables:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load tables when page opens
  useEffect(() => {
    load();
  }, []);

  // Create new table
  const save = async (e) => {
    e.preventDefault();

    try {
      await api.post("/tables", {
        ...form,
        status: "available",
      });

      setModal(false);

      setForm({
        name: "",
        capacity: 4,
      });

      await load();
    } catch (error) {
      console.error("Failed to create table:", error);
    }
  };

  // Release table
  const releaseTable = async (id) => {
    try {
      await api.put(`/tables/${id}`, {
        status: "available",
      });

      await load();
    } catch (error) {
      console.error("Failed to release table:", error);
    }
  };

  // Delete table
  const del = async (id) => {
    if (!confirm("Delete this table?")) {
      return;
    }

    try {
      await api.delete(`/tables/${id}`);
      await load();
    } catch (error) {
      console.error("Failed to delete table:", error);
    }
  };

  // Open current order
  const openOrder = (table) => {
    nav(`/tables/${table._id}/order`);
  };

  // Filter tables
  const list =
    filter === "all"
      ? tables
      : tables.filter((table) => table.status === filter);

  return (
    <>
      <div className="page-heading tables-page-heading">
        <div className="tables-heading-content">
          <h1>Tables</h1>

          <p>
            Manage restaurant seating and current orders
          </p>
        </div>

        <div className="actions tables-page-actions">
          <Button onClick={() => setModal(true)}>
            <Plus size={17} />
            Add Table
          </Button>

          <Button
            variant="secondary"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="filters tables-filters">
        {[
          "all",
          "available",
          "occupied",
          "reserved",
        ].map((status) => (
          <button
            key={status}
            className={
              filter === status ? "selected" : ""
            }
            onClick={() => setFilter(status)}
          >
            {status === "all"
              ? "All"
              : status.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      <div className="table-grid tables-responsive-grid">
        {list.map((table) => {
          const isAvailable =
            table.status === "available";

          const isOccupied =
            table.status === "occupied";

          return (
            <Card
              key={table._id}
              className={`table-card ${table.status}`}
            >
              <div className="table-number tables-table-number">
                <Armchair />

                <strong>{table.name}</strong>
              </div>

              <Status value={table.status} />

              <small>
                Capacity: {table.capacity}
              </small>

              {/* Current order information */}
              {!isAvailable && (
                <div
                  className="table-current-order"
                  style={{
                    marginTop: "12px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div
                    className="table-current-order-heading"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "6px",
                    }}
                  >
                    <ShoppingCart size={16} />

                    <strong>Current Order</strong>
                  </div>

                  {table.currentOrder ? (
                    <>
                      {Array.isArray(
                        table.currentOrder.items
                      ) &&
                      table.currentOrder.items.length > 0 ? (
                        <div className="table-order-items">
                          {table.currentOrder.items.map(
                            (item, index) => (
                              <div
                                key={
                                  item._id ||
                                  item.product ||
                                  index
                                }
                                className="table-order-item"
                                style={{
                                  display: "flex",
                                  justifyContent:
                                    "space-between",
                                  gap: "10px",
                                  marginBottom: "4px",
                                }}
                              >
                                <span>
                                  {item.name ||
                                    item.productName ||
                                    "Item"}{" "}
                                  × {item.quantity || 1}
                                </span>

                                <span>
                                  PKR{" "}
                                  {Number(
                                    item.price || 0
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )
                          )}

                          <hr />

                          <div
                            className="table-order-total"
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              fontWeight: "600",
                            }}
                          >
                            <span>Total</span>

                            <span>
                              PKR{" "}
                              {Number(
                                table.currentOrder.total ||
                                  table.currentOrder.totalAmount ||
                                  0
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <small>
                          No items in current order
                        </small>
                      )}
                    </>
                  ) : (
                    <small>
                      Current order is available from
                      View Order.
                    </small>
                  )}
                </div>
              )}

              <div className="table-actions tables-responsive-actions">
                {isAvailable ? (
                  <Button
                    onClick={() => openOrder(table)}
                  >
                    Open Order
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => openOrder(table)}
                  >
                    View Order
                  </Button>
                )}

                {isOccupied && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      releaseTable(table._id)
                    }
                  >
                    Release
                  </Button>
                )}

                <button
                  className="icon-btn"
                  onClick={() => del(table._id)}
                  title="Delete table"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {modal && (
        <Modal
          title="Add Table"
          onClose={() => setModal(false)}
        >
          <form
            className="form-grid tables-form-grid"
            onSubmit={save}
          >
            <label>
              Table name

              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Capacity

              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacity: Number(
                      e.target.value
                    ),
                  })
                }
              />
            </label>

            <div className="tables-form-action">
              <Button type="submit">
                Create Table
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}