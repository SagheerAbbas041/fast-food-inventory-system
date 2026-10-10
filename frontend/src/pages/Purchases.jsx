import { useEffect, useState } from "react";
import api from "../api";
import { Button, Card, Modal } from "../components/UI";

export default function Purchases() {
  const [rows, setRows] = useState([]);

  const [inventory, setInventory] = useState([]);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    supplier: "",
    item: "",
    quantity: 1,
    unitCost: 0,
    notes: "",
  });

  // =====================================================
  // LOAD DATA
  // =====================================================

  const load = async () => {
    try {
      const [purchaseResponse, inventoryResponse] =
        await Promise.all([
          api.get("/purchases"),
          api.get("/inventory"),
        ]);

      setRows(purchaseResponse.data);

      setInventory(
        inventoryResponse.data.filter(
          (x) => x.status === "active"
        )
      );
    } catch (error) {
      console.error(
        "Failed to load purchases:",
        error
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =====================================================
  // SAVE PURCHASE
  // =====================================================

  const save = async (e) => {
    e.preventDefault();

    const selectedItem = inventory.find(
      (x) => x._id === form.item
    );

    if (!selectedItem) {
      alert("Please select an inventory item");

      return;
    }

    const quantity = Number(form.quantity);

    const unitCost = Number(form.unitCost);

    if (!quantity || quantity <= 0) {
      alert("Quantity must be greater than 0");

      return;
    }

    if (unitCost < 0) {
      alert("Unit cost cannot be negative");

      return;
    }

    try {
      await api.post("/purchases", {
        supplier: form.supplier,

        items: [
          {
            inventoryItem:
              selectedItem._id,

            quantity,

            unitCost,
          },
        ],

        notes: form.notes,
      });

      setOpen(false);

      setForm({
        supplier: "",
        item: "",
        quantity: 1,
        unitCost: 0,
        notes: "",
      });

      await load();

      alert(
        "Purchase saved and inventory stock updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save purchase:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to save purchase"
      );
    }
  };

  // =====================================================
  // CANCEL PURCHASE
  // =====================================================

  const cancelPurchase = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this purchase? Stock will also be reversed."
    );

    if (!confirmCancel) return;

    try {
      await api.put(
        `/purchases/${id}/cancel`
      );

      await load();
    } catch (error) {
      console.error(
        "Failed to cancel purchase:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to cancel purchase"
      );
    }
  };

  return (
    <>
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="page-heading purchases-page-heading">
        <div className="purchases-heading-content">
          <h1>Purchases</h1>

          <p>
            Record incoming stock purchases
          </p>
        </div>

        <div className="purchases-heading-action">
          <Button
            onClick={() => {
              setForm({
                supplier: "",
                item: "",
                quantity: 1,
                unitCost: 0,
                notes: "",
              });

              setOpen(true);
            }}
          >
            + New Purchase
          </Button>
        </div>
      </div>

      {/* ================================================= */}
      {/* PURCHASE TABLE */}
      {/* ================================================= */}

      <Card className="table-wrap purchases-table-wrap">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Purchase #</th>

                <th>Supplier</th>

                <th>Items</th>

                <th>Total</th>

                <th>Date</th>

                <th>Status</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No purchases found.
                  </td>
                </tr>
              ) : (
                rows.map((purchase) => (
                  <tr key={purchase._id}>
                    <td>
                      {purchase.purchaseNo}
                    </td>

                    <td>
                      {purchase.supplier ||
                        "-"}
                    </td>

                    <td>
                      <div className="purchase-items-list">
                        {purchase.items?.map(
                          (item, index) => (
                            <div
                              key={index}
                            >
                              {item.itemName}{" "}
                              ×{" "}
                              {item.quantity}{" "}
                              {item.unit}
                            </div>
                          )
                        )}
                      </div>
                    </td>

                    <td>
                      PKR{" "}
                      {Number(
                        purchase.total || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      {new Date(
                        purchase.date
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {purchase.status}
                    </td>

                    <td>
                      {purchase.status !==
                        "cancelled" && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            cancelPurchase(
                              purchase._id
                            )
                          }
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ================================================= */}
      {/* NEW PURCHASE MODAL */}
      {/* ================================================= */}

      {open && (
        <Modal
          title="New Purchase"
          onClose={() =>
            setOpen(false)
          }
        >
          <form
            className="form-grid purchases-form-grid"
            onSubmit={save}
          >
            {/* SUPPLIER */}

            <label>
              Supplier

              <input
                required
                placeholder="Supplier name"
                value={form.supplier}
                onChange={(e) =>
                  setForm({
                    ...form,
                    supplier:
                      e.target.value,
                  })
                }
              />
            </label>

            {/* INVENTORY ITEM */}

            <label>
              Inventory Item

              <select
                required
                value={form.item}
                onChange={(e) =>
                  setForm({
                    ...form,
                    item: e.target.value,
                  })
                }
              >
                <option value="">
                  Select inventory item
                </option>

                {inventory.map((item) => (
                  <option
                    value={item._id}
                    key={item._id}
                  >
                    {item.itemName} (
                    {item.unit})
                  </option>
                ))}
              </select>
            </label>

            {/* QUANTITY */}

            <label>
              Quantity

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity:
                      e.target.value,
                  })
                }
              />
            </label>

            {/* UNIT COST */}

            <label>
              Unit Cost

              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.unitCost}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unitCost:
                      e.target.value,
                  })
                }
              />
            </label>

            {/* NOTES */}

            <label>
              Notes

              <textarea
                rows="3"
                placeholder="Optional notes"
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes:
                      e.target.value,
                  })
                }
              />
            </label>

            <div className="purchases-form-action">
              <Button type="submit">
                Save Purchase
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}