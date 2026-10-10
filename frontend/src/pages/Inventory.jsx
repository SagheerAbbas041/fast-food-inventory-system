import { useEffect, useState } from "react";
import api from "../api";
import { Plus, Pencil } from "lucide-react";
import {
  Button,
  Card,
  Modal,
  Status,
} from "../components/UI";

export default function Inventory() {
  const [rows, setRows] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openStock, setOpenStock] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [qty, setQty] = useState(1);

  const [form, setForm] = useState({
    itemName: "",
    unit: "kg",
    currentStock: 0,
    minStock: 0,
  });

  // =====================================================
  // LOAD INVENTORY
  // =====================================================

  const load = async () => {
    try {
      const response = await api.get("/inventory");

      setRows(response.data);
    } catch (error) {
      console.error(
        "Failed to load inventory:",
        error
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      itemName: "",
      unit: "kg",
      currentStock: 0,
      minStock: 0,
    });
  };

  // =====================================================
  // ADD INVENTORY ITEM
  // =====================================================

  const addItem = async (e) => {
    e.preventDefault();

    try {
      await api.post("/inventory", {
        itemName: form.itemName,
        unit: form.unit,
        currentStock: Number(form.currentStock),
        minStock: Number(form.minStock),
      });

      setOpenAdd(false);

      resetForm();

      await load();
    } catch (error) {
      console.error(
        "Failed to add inventory item:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to add inventory item"
      );
    }
  };

  // =====================================================
  // ADD / ADJUST STOCK
  // =====================================================

  const addStock = async () => {
    if (!selectedItem) return;

    if (!qty || Number(qty) <= 0) {
      alert("Enter a valid quantity");

      return;
    }

    try {
      await api.post(
        `/inventory/${selectedItem._id}/stock`,
        {
          quantity: Number(qty),
        }
      );

      setOpenStock(false);

      setSelectedItem(null);

      setQty(1);

      await load();
    } catch (error) {
      console.error(
        "Failed to add stock:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to add stock"
      );
    }
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditModal = (item) => {
    setSelectedItem(item);

    setForm({
      itemName: item.itemName,
      unit: item.unit,
      currentStock: item.currentStock,
      minStock: item.minStock,
    });

    setOpenEdit(true);
  };

  // =====================================================
  // UPDATE INVENTORY ITEM
  // =====================================================

  const updateItem = async (e) => {
    e.preventDefault();

    if (!selectedItem) return;

    try {
      await api.put(
        `/inventory/${selectedItem._id}`,
        {
          itemName: form.itemName,
          unit: form.unit,
          minStock: Number(form.minStock),
        }
      );

      setOpenEdit(false);

      setSelectedItem(null);

      await load();
    } catch (error) {
      console.error(
        "Failed to update inventory:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update inventory"
      );
    }
  };

  return (
    <>
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="page-heading inventory-page-heading">
        <div>
          <h1>Inventory</h1>

          <p>
            Manage raw materials and current stock
          </p>
        </div>

        <div className="inventory-header-action">
          <Button
            onClick={() => {
              resetForm();

              setOpenAdd(true);
            }}
          >
            <Plus size={16} />

            Add Item
          </Button>
        </div>
      </div>

      {/* ================================================= */}
      {/* INVENTORY TABLE */}
      {/* ================================================= */}

      <Card className="table-wrap inventory-table-card">
        <div className="responsive-table inventory-responsive-table">
          <table>
            <thead>
              <tr>
                <th>Item</th>

                <th>Current Stock</th>

                <th>Unit</th>

                <th>Min Level</th>

                <th>Last Cost</th>

                <th>Average Cost</th>

                <th>Status</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                rows.map((x) => (
                  <tr key={x._id}>
                    <td>
                      <strong>{x.itemName}</strong>
                    </td>

                    <td>
                      {x.currentStock}
                    </td>

                    <td>
                      {x.unit}
                    </td>

                    <td>
                      {x.minStock}
                    </td>

                    <td>
                      PKR{" "}
                      {Number(
                        x.lastPurchaseCost || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      PKR{" "}
                      {Number(
                        x.averageCost || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      <Status
                        value={
                          x.currentStock === 0
                            ? "out of stock"
                            : x.currentStock <=
                              x.minStock
                            ? "low stock"
                            : "in stock"
                        }
                      />
                    </td>

                    <td>
                      <div className="inventory-actions">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelectedItem(x);

                            setQty(1);

                            setOpenStock(true);
                          }}
                        >
                          <Plus size={15} />

                          Stock
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() =>
                            openEditModal(x)
                          }
                        >
                          <Pencil size={15} />

                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ================================================= */}
      {/* ADD INVENTORY ITEM MODAL */}
      {/* ================================================= */}

      {openAdd && (
        <Modal
          title="Add Inventory Item"
          onClose={() => {
            setOpenAdd(false);

            resetForm();
          }}
        >
          <form
            className="form-grid inventory-form-grid"
            onSubmit={addItem}
          >
            <label>
              Item Name

              <input
                required
                placeholder="e.g. Chicken"
                value={form.itemName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    itemName: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Unit

              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
              >
                <option value="kg">
                  Kilogram (kg)
                </option>

                <option value="gram">
                  Gram (g)
                </option>

                <option value="liter">
                  Liter (L)
                </option>

                <option value="ml">
                  Milliliter (ml)
                </option>

                <option value="pcs">
                  Pieces (pcs)
                </option>

                <option value="pack">
                  Pack
                </option>

                <option value="box">
                  Box
                </option>

                <option value="dozen">
                  Dozen
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </label>

            <label>
              Opening Stock

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.currentStock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currentStock:
                      e.target.value,
                  })
                }
              />
            </label>

            <label>
              Minimum Stock Level

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minStock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minStock:
                      e.target.value,
                  })
                }
              />
            </label>

            <div className="inventory-form-action">
              <Button type="submit">
                Add Inventory Item
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================================================= */}
      {/* STOCK MODAL */}
      {/* ================================================= */}

      {openStock && selectedItem && (
        <Modal
          title={`Add Stock — ${selectedItem.itemName}`}
          onClose={() => {
            setOpenStock(false);

            setSelectedItem(null);
          }}
        >
          <div className="inventory-stock-form">
            <label>
              Quantity

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={qty}
                onChange={(e) =>
                  setQty(e.target.value)
                }
              />
            </label>

            <div className="inventory-form-action">
              <Button onClick={addStock}>
                Add Stock
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================================================= */}
      {/* EDIT MODAL */}
      {/* ================================================= */}

      {openEdit && selectedItem && (
        <Modal
          title={`Edit — ${selectedItem.itemName}`}
          onClose={() => {
            setOpenEdit(false);

            setSelectedItem(null);
          }}
        >
          <form
            className="form-grid inventory-form-grid"
            onSubmit={updateItem}
          >
            <label>
              Item Name

              <input
                required
                value={form.itemName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    itemName: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Unit

              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
              >
                <option value="kg">
                  Kilogram (kg)
                </option>

                <option value="gram">
                  Gram (g)
                </option>

                <option value="liter">
                  Liter (L)
                </option>

                <option value="ml">
                  Milliliter (ml)
                </option>

                <option value="pcs">
                  Pieces (pcs)
                </option>

                <option value="pack">
                  Pack
                </option>

                <option value="box">
                  Box
                </option>

                <option value="dozen">
                  Dozen
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </label>

            <label>
              Minimum Stock Level

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minStock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minStock:
                      e.target.value,
                  })
                }
              />
            </label>

            <div className="inventory-form-action">
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}