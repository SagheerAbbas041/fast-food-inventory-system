import { useEffect, useState } from "react";
import api from "../api";
import {
  Button,
  Card,
  Status,
  Modal,
} from "../components/UI";

// =====================================================
// STATUSES
// =====================================================

const statuses = [
  "pending",
  "preparing",
  "ready",
  "delivered",
];

const statusLabels = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
};

// =====================================================
// FORMAT PKR
// =====================================================

const formatPKR = (value) => {
  return `PKR ${Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// =====================================================
// ROUND MONEY
// =====================================================

const roundMoney = (value) => {
  return Math.round(Number(value || 0) * 100) / 100;
};

// =====================================================
// NORMALIZE TAX RATE
// =====================================================

const normalizeTaxRate = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericValue));
};

// =====================================================
// GET ORDER TAX RATE
// =====================================================

const getOrderTaxRate = (order) => {
  if (!order) {
    return 0;
  }

  if (
    order.taxRate !== undefined &&
    order.taxRate !== null &&
    order.taxRate !== ""
  ) {
    return normalizeTaxRate(order.taxRate);
  }

  if (
    order.taxPercentage !== undefined &&
    order.taxPercentage !== null &&
    order.taxPercentage !== ""
  ) {
    return normalizeTaxRate(order.taxPercentage);
  }

  if (
    order.taxPercent !== undefined &&
    order.taxPercent !== null &&
    order.taxPercent !== ""
  ) {
    return normalizeTaxRate(order.taxPercent);
  }

  return 0;
};

// =====================================================
// KITCHEN COMPONENT
// =====================================================

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [editingOrder, setEditingOrder] = useState(null);

  const [editItems, setEditItems] = useState([]);

  const [editDiscount, setEditDiscount] = useState(0);

  const [editTaxRate, setEditTaxRate] = useState(0);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [saving, setSaving] = useState(false);

  const [billing, setBilling] = useState(false);

  const [paymentOrder, setPaymentOrder] = useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  // =====================================================
  // GET SIZE PRICE
  // =====================================================

  const getSizePrice = (
    product,
    selectedSize
  ) => {
    if (!product || !selectedSize) {
      return null;
    }

    const sizePrices = product.sizePrices;

    if (!sizePrices) {
      return null;
    }

    if (
      typeof sizePrices === "object" &&
      !Array.isArray(sizePrices)
    ) {
      const directPrice =
        sizePrices[selectedSize];

      if (
        directPrice !== undefined &&
        directPrice !== null
      ) {
        return Number(directPrice);
      }

      const matchingKey =
        Object.keys(sizePrices).find(
          (key) =>
            String(key).toLowerCase() ===
            String(selectedSize).toLowerCase()
        );

      if (matchingKey) {
        return Number(
          sizePrices[matchingKey]
        );
      }
    }

    if (Array.isArray(sizePrices)) {
      const found = sizePrices.find(
        (item) =>
          String(item?.size || "").toLowerCase() ===
          String(selectedSize).toLowerCase()
      );

      if (found) {
        return Number(
          found.price ??
            found.salePrice ??
            0
        );
      }
    }

    return null;
  };

  // =====================================================
  // GET AVAILABLE SIZES
  // =====================================================

  const getProductSizes = (product) => {
    if (!product) {
      return [];
    }

    const sizePrices = product.sizePrices;

    if (!sizePrices) {
      return [];
    }

    if (
      typeof sizePrices === "object" &&
      !Array.isArray(sizePrices)
    ) {
      return Object.entries(sizePrices)
        .map(([size, price]) => ({
          size,
          price: Number(price || 0),
        }))
        .filter(
          (item) =>
            item.size &&
            item.price >= 0
        );
    }

    if (Array.isArray(sizePrices)) {
      return sizePrices
        .map((item) => ({
          size:
            item?.size ||
            item?.name ||
            "",

          price: Number(
            item?.price ??
              item?.salePrice ??
              0
          ),
        }))
        .filter(
          (item) => item.size
        );
    }

    return [];
  };

  // =====================================================
  // CHECK IF PRODUCT NEEDS SIZE
  // =====================================================

  const productNeedsSize = (product) => {
    if (!product) {
      return false;
    }

    const sizes = getProductSizes(product);

    return (
      sizes.length > 0 ||
      String(product.category || "").toLowerCase() ===
        "pizza"
    );
  };

  // =====================================================
  // LOAD KITCHEN ORDERS
  // =====================================================

  const load = async () => {
    try {
      const response = await api.get("/kitchen");

      setOrders(response.data || []);
    } catch (error) {
      console.error(
        "Kitchen loading error:",
        error
      );
    }
  };

  // =====================================================
  // LOAD MENU
  // =====================================================

  const loadMenu = async () => {
    try {
      const response = await api.get("/menu");

      setMenu(response.data || []);
    } catch (error) {
      console.error(
        "Menu loading error:",
        error
      );
    }
  };

  // =====================================================
  // LOAD INVOICES
  // =====================================================

  const loadInvoices = async () => {
    try {
      const response = await api.get("/invoices");

      setInvoices(response.data || []);
    } catch (error) {
      console.error(
        "Invoice loading error:",
        error
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    load();
    loadMenu();
    loadInvoices();

    const timer = setInterval(() => {
      load();
      loadInvoices();
    }, 10000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // =====================================================
  // FIND INVOICE
  // =====================================================

  const getInvoice = (orderId) => {
    return invoices.find((invoice) => {
      const invoiceOrderId =
        invoice.order?._id ||
        invoice.order;

      return (
        String(invoiceOrderId) ===
        String(orderId)
      );
    });
  };

  // =====================================================
  // CHECK IF INVOICE EXISTS
  // =====================================================

  const hasInvoice = (orderId) => {
    return Boolean(getInvoice(orderId));
  };

  // =====================================================
  // CHECK CURRENT INVOICE
  // =====================================================

  const isInvoiceCurrent = (order) => {
    const invoice = getInvoice(order._id);

    if (!invoice) {
      return false;
    }

    return (
      Number(invoice.orderVersion) ===
      Number(order.editVersion || 1)
    );
  };

  // =====================================================
  // COMPLETED ORDER
  // =====================================================

  const isCompleted = (order) => {
    return order.status === "delivered";
  };

  // =====================================================
  // PAID ORDER
  // =====================================================

  const isPaid = (order) => {
    return order.status === "paid";
  };

  // =====================================================
  // CHECK IF ORDER CAN BE EDITED
  // =====================================================

  const canEditOrder = (order) => {
    if (!order) {
      return false;
    }

    // Delivered orders ARE editable.
    // Paid orders remain locked.
    return !isPaid(order);
  };

  // =====================================================
  // CHANGE STATUS
  // =====================================================

  const changeStatus = async (
    order,
    status
  ) => {
    // Delivered order status cannot be changed.
    // It can still be edited.
    if (order.status === "delivered") {
      return;
    }

    if (order.status === status) {
      return;
    }

    if (status === "delivered") {
      if (!hasInvoice(order._id)) {
        alert(
          "Invoice must be generated before delivering this order."
        );

        return;
      }

      if (!isInvoiceCurrent(order)) {
        alert(
          "Order has been edited after the invoice was generated. Please update the same invoice before delivering the order."
        );

        return;
      }
    }

    try {
      await api.put(
        `/orders/${order._id}/status`,
        {
          status,
        }
      );

      await load();
      await loadInvoices();
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to update order status."
      );
    }
  };

  // =====================================================
  // OPEN EDIT ORDER
  // =====================================================

  const openEdit = (order) => {
    // Paid order cannot be edited.
    // Delivered order CAN be edited.
    if (!canEditOrder(order)) {
      alert(
        "Paid orders cannot be edited."
      );

      return;
    }

    setEditingOrder(order);

    setEditItems(
      (order.items || []).map((item) => {
        const menuItemId =
          item.menuItem?._id ||
          item.menuItem;

        const price = Number(
          item.unitPrice ??
            item.price ??
            item.salePrice ??
            item.menuItem?.salePrice ??
            0
        );

        return {
          menuItem: menuItemId,

          name:
            item.name ||
            item.menuItem?.name ||
            "Unknown Product",

          category:
            item.category ||
            item.menuItem?.category ||
            "",

          variant:
            item.variant ||
            item.menuItem?.variant ||
            "",

          size: item.size || "",

          price,

          quantity: Number(
            item.quantity || 1
          ),

          dealItems:
            Array.isArray(
              item.dealItems
            )
              ? item.dealItems.map(
                  (dealItem) => ({
                    name:
                      dealItem?.name ||
                      "",
                  })
                )
              : [],
        };
      })
    );

    // =================================================
    // LOAD SAVED TAX
    // =================================================

    const savedTaxRate =
      getOrderTaxRate(order);

    setEditDiscount(
      Number(order.discount || 0)
    );

    setEditTaxRate(savedTaxRate);

    setSearch("");

    setSelectedCategory("All");
  };

  // =====================================================
  // ADD PRODUCT WHILE EDITING
  // =====================================================

  const addProductToEdit = (product) => {
    const existing =
      editItems.find(
        (item) =>
          String(item.menuItem) ===
          String(product._id)
      );

    if (existing) {
      alert(
        "This product is already in the order. Use + to increase its quantity."
      );

      return;
    }

    if (productNeedsSize(product)) {
      const sizes =
        getProductSizes(product);

      if (!sizes.length) {
        alert(
          `No size prices are configured for ${product.name}. Please configure the product sizes first.`
        );

        return;
      }

      setEditItems((current) => [
        ...current,
        {
          menuItem: product._id,

          name:
            product.name ||
            "Unknown Product",

          category:
            product.category || "",

          variant:
            product.variant || "",

          size: "",

          price: 0,

          quantity: 1,

          dealItems:
            Array.isArray(
              product.dealItems
            )
              ? product.dealItems.map(
                  (dealItem) => ({
                    name:
                      dealItem?.name ||
                      "",
                  })
                )
              : [],
        },
      ]);

      return;
    }

    setEditItems((current) => [
      ...current,
      {
        menuItem: product._id,

        name:
          product.name ||
          "Unknown Product",

        category:
          product.category || "",

        variant:
          product.variant || "",

        size:
          product.size || "",

        price: Number(
          product.salePrice ??
            product.price ??
            0
        ),

        quantity: 1,

        dealItems:
          Array.isArray(
            product.dealItems
          )
            ? product.dealItems.map(
                (dealItem) => ({
                  name:
                    dealItem?.name ||
                    "",
                })
              )
            : [],
      },
    ]);
  };

  // =====================================================
  // CHANGE SIZE
  // =====================================================

  const changeEditSize = (
    menuItem,
    selectedSize
  ) => {
    const product = menu.find(
      (item) =>
        String(item._id) ===
        String(menuItem)
    );

    if (!product) {
      return;
    }

    const price = getSizePrice(
      product,
      selectedSize
    );

    setEditItems((current) =>
      current.map((item) =>
        String(item.menuItem) ===
        String(menuItem)
          ? {
              ...item,

              size: selectedSize,

              price:
                price !== null
                  ? price
                  : 0,
            }
          : item
      )
    );
  };

  // =====================================================
  // CHANGE QUANTITY
  // =====================================================

  const changeEditQuantity = (
    menuItem,
    difference
  ) => {
    setEditItems((current) =>
      current
        .map((item) =>
          String(item.menuItem) ===
          String(menuItem)
            ? {
                ...item,

                quantity: Math.max(
                  0,
                  Number(
                    item.quantity || 0
                  ) + difference
                ),
              }
            : item
        )
        .filter(
          (item) =>
            Number(item.quantity) > 0
        )
    );
  };

  // =====================================================
  // REMOVE PRODUCT
  // =====================================================

  const removeEditItem = (
    menuItem
  ) => {
    setEditItems((current) =>
      current.filter(
        (item) =>
          String(item.menuItem) !==
          String(menuItem)
      )
    );
  };

  // =====================================================
  // EDIT TOTALS
  // =====================================================

  const editSubtotal = roundMoney(
    editItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    )
  );

  const safeEditDiscount =
    Math.max(
      0,
      Math.min(
        Number(editDiscount || 0),
        editSubtotal
      )
    );

  const editTaxable = Math.max(
    0,
    editSubtotal -
      safeEditDiscount
  );

  const safeEditTaxRate =
    normalizeTaxRate(
      editTaxRate
    );

  const editTax = roundMoney(
    (editTaxable *
      safeEditTaxRate) /
      100
  );

  const editGrandTotal = roundMoney(
    editTaxable + editTax
  );

  // =====================================================
  // SAVE EDITED ORDER
  // =====================================================

  const saveEditedOrder = async () => {
    if (!editingOrder) {
      return;
    }

    // Paid order remains locked.
    // Delivered order is allowed.
    if (isPaid(editingOrder)) {
      alert(
        "Paid orders cannot be edited."
      );

      return;
    }

    if (!editItems.length) {
      alert(
        "Order must contain at least one product."
      );

      return;
    }

    // =================================================
    // CHECK SIZE
    // =================================================

    const missingSizeItem =
      editItems.find((item) => {
        const product = menu.find(
          (menuItem) =>
            String(menuItem._id) ===
            String(item.menuItem)
        );

        return (
          product &&
          productNeedsSize(product) &&
          !item.size
        );
      });

    if (missingSizeItem) {
      alert(
        `Please select a size for ${missingSizeItem.name}.`
      );

      return;
    }

    // =================================================
    // VALIDATE ITEMS
    // =================================================

    const invalidItem =
      editItems.find(
        (item) =>
          !item.menuItem ||
          Number(item.quantity) <= 0
      );

    if (invalidItem) {
      alert(
        "One or more products have invalid information."
      );

      return;
    }

    try {
      setSaving(true);

      // =================================================
      // FINAL VALUES
      // =================================================

      const finalTaxRate =
        normalizeTaxRate(
          editTaxRate
        );

      const finalDiscount =
        Math.max(
          0,
          Math.min(
            Number(
              editDiscount || 0
            ),
            editSubtotal
          )
        );

      // =================================================
      // REQUEST BODY
      // =================================================

      const requestBody = {
        items: editItems.map(
          (item) => ({
            menuItem:
              item.menuItem,

            quantity: Number(
              item.quantity
            ),

            size:
              item.size ||
              undefined,

            dealItems:
              Array.isArray(
                item.dealItems
              )
                ? item.dealItems.map(
                    (dealItem) => ({
                      name:
                        dealItem?.name ||
                        "",
                    })
                  )
                : [],
          })
        ),

        discount:
          Number(finalDiscount),

        taxRate:
          Number(finalTaxRate),

        taxPercentage:
          Number(finalTaxRate),

        taxPercent:
          Number(finalTaxRate),
      };

      console.log(
        "Saving edited order:",
        requestBody
      );

      // =================================================
      // UPDATE ORDER
      // =================================================

      const response =
        await api.put(
          `/orders/${editingOrder._id}`,
          requestBody
        );

      console.log(
        "Updated order response:",
        response.data
      );

      // =================================================
      // CHECK INVOICE
      // =================================================

      const hadInvoice =
        hasInvoice(
          editingOrder._id
        );

      // =================================================
      // IMMEDIATELY UPDATE LOCAL ORDER
      // =================================================

      if (
        response.data &&
        response.data._id
      ) {
        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) =>
                String(order._id) ===
                String(
                  response.data._id
                )
                  ? response.data
                  : order
            )
        );
      }

      // =================================================
      // CLOSE EDIT MODAL
      // =================================================

      setEditingOrder(null);

      setEditItems([]);

      setEditDiscount(0);

      setEditTaxRate(0);

      // =================================================
      // RELOAD DATABASE DATA
      // =================================================

      await load();

      await loadInvoices();

      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      if (hadInvoice) {
        alert(
          "Order updated successfully. The invoice is now outdated. Please click Update Invoice to synchronize it."
        );
      } else {
        alert(
          "Order updated successfully."
        );
      }
    } catch (error) {
      console.error(
        "Edit order error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Unable to update order."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // OPEN INVOICE MODAL
  // =====================================================

  const openInvoiceModal = (
    order
  ) => {
    // IMPORTANT:
    // Delivered orders ARE allowed to update invoice.
    // Only paid orders are blocked.

    if (isPaid(order)) {
      alert(
        "Paid order invoice cannot be changed."
      );

      return;
    }

    const invoice =
      getInvoice(order._id);

    setPaymentMethod(
      invoice?.paymentMethod ||
        order.paymentMethod ||
        "Cash"
    );

    setPaymentOrder(order);
  };

  // =====================================================
  // GENERATE / UPDATE INVOICE
  // =====================================================

  const generateBill = async (
    order
  ) => {
    if (!order) {
      return;
    }

    try {
      setBilling(true);

      const existingInvoice =
        getInvoice(order._id);

      let response;

      // =================================================
      // CREATE NEW INVOICE
      // =================================================

      if (!existingInvoice) {
        response =
          await api.post(
            "/invoices",
            {
              orderId:
                order._id,

              paymentMethod,
            }
          );

        alert(
          `Invoice generated successfully for ${order.orderNo}.`
        );
      }

      // =================================================
      // UPDATE EXISTING INVOICE
      // =================================================

      else {
        response =
          await api.put(
            `/invoices/order/${order._id}`,
            {
              paymentMethod,
            }
          );

        alert(
          `Invoice updated successfully for ${order.orderNo}.`
        );
      }

      console.log(
        "Invoice response:",
        response.data
      );

      setPaymentOrder(null);

      await load();

      await loadInvoices();
    } catch (error) {
      console.error(
        "Generate/update invoice error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to generate/update invoice."
      );
    } finally {
      setBilling(false);
    }
  };

  // =====================================================
  // MENU CATEGORIES
  // =====================================================

  const categories = [
    "All",
    ...new Set(
      menu
        .map(
          (item) =>
            item.category
        )
        .filter(Boolean)
    ),
  ];

  // =====================================================
  // FILTER MENU
  // =====================================================

  const filteredMenu =
    menu.filter((item) => {
      const categoryMatch =
        selectedCategory ===
          "All" ||
        item.category ===
          selectedCategory;

      const searchMatch =
        String(
          item.name || ""
        )
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        categoryMatch &&
        searchMatch
      );
    });

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <div className="page-heading kitchen-page-heading">
        <div>
          <h1>Kitchen</h1>

          <p>
            Live kitchen order queue
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* KITCHEN ORDERS */}
      {/* ================================================= */}

      <div className="kitchen-grid">
        {orders.length === 0 ? (
          <div className="empty">
            No kitchen orders
            available.
          </div>
        ) : (
          orders.map((order) => {
            const invoiceGenerated =
              hasInvoice(order._id);

            const invoiceCurrent =
              isInvoiceCurrent(order);

            const completed =
              isCompleted(order);

            const paid =
              isPaid(order);

            const orderTaxRate =
              getOrderTaxRate(order);

            const editable =
              canEditOrder(order);

            return (
              <Card
                className="kitchen-card"
                key={order._id}
                style={{
                  position:
                    "relative",

                  border: completed
                    ? "2px solid #10b981"
                    : undefined,

                  background:
                    completed
                      ? "#f0fdf4"
                      : undefined,
                }}
              >
                {/* ================================================= */}
                {/* DELIVERED BADGE */}
                {/* ================================================= */}

                {completed && (
                  <div
                    className="kitchen-done-badge"
                    style={{
                      position:
                        "absolute",

                      top: 12,

                      right: 12,

                      background:
                        "#10b981",

                      color: "#fff",

                      padding:
                        "6px 12px",

                      borderRadius:
                        20,

                      fontSize: 12,

                      fontWeight: 700,
                    }}
                  >
                    ✓ DELIVERED
                  </div>
                )}

                {/* ================================================= */}
                {/* PAID BADGE */}
                {/* ================================================= */}

                {paid && (
                  <div
                    style={{
                      position:
                        "absolute",

                      top: 12,

                      right: 12,

                      background:
                        "#2563eb",

                      color: "#fff",

                      padding:
                        "6px 12px",

                      borderRadius:
                        20,

                      fontSize: 12,

                      fontWeight: 700,
                    }}
                  >
                    ✓ PAID
                  </div>
                )}

                <div className="card-head kitchen-card-head">
                  <div>
                    <strong>
                      {order.orderNo}
                    </strong>

                    <small
                      style={{
                        display:
                          "block",

                        marginTop: 4,
                      }}
                    >
                      {new Date(
                        order.createdAt
                      ).toLocaleTimeString()}
                    </small>
                  </div>

                  <Status
                    value={
                      order.status
                    }
                  />
                </div>

                <h3>
                  {order.tableName ||
                    order.table?.name ||
                    "Table"}
                </h3>

                <small
                  style={{
                    display:
                      "block",

                    marginBottom: 10,
                  }}
                >
                  Customer:{" "}
                  {order.customerName ||
                    order.customer
                      ?.name ||
                    "Walk-in"}
                </small>

                {/* ================================================= */}
                {/* ITEMS */}
                {/* ================================================= */}

                <div className="kitchen-items">
                  {(order.items || []).map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="k-item"
                        key={
                          item._id ||
                          index
                        }
                        style={{
                          display:
                            "block",
                        }}
                      >
                        <div
                          className="kitchen-item-main"
                          style={{
                            display:
                              "flex",

                            justifyContent:
                              "space-between",

                            gap: 10,
                          }}
                        >
                          <span>
                            {
                              item.quantity
                            }{" "}
                            ×{" "}
                            {
                              item.name
                            }
                          </span>

                          <b>
                            {formatPKR(
                              item.total
                            )}
                          </b>
                        </div>

                        {(item.variant ||
                          item.size) && (
                          <div
                            style={{
                              marginTop: 3,

                              paddingLeft:
                                18,

                              color:
                                "#6b7280",

                              fontSize: 12,
                            }}
                          >
                            {item.variant ||
                              ""}

                            {item.variant &&
                            item.size
                              ? " • "
                              : ""}

                            {item.size ||
                              ""}
                          </div>
                        )}

                        {Array.isArray(
                          item.dealItems
                        ) &&
                          item
                            .dealItems
                            .length >
                            0 && (
                            <div
                              style={{
                                marginTop: 5,

                                paddingLeft:
                                  18,

                                color:
                                  "#6b7280",

                                fontSize: 12,
                              }}
                            >
                              {item.dealItems.map(
                                (
                                  dealItem,
                                  dealIndex
                                ) => (
                                  <div
                                    key={
                                      dealItem._id ||
                                      dealIndex
                                    }
                                  >
                                    •{" "}
                                    {
                                      dealItem.name
                                    }
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    )
                  )}
                </div>

                {/* ================================================= */}
                {/* TAX / DISCOUNT / TOTAL */}
                {/* ================================================= */}

                <div
                  className="kitchen-total-row"
                  style={{
                    display:
                      "grid",

                    gap: 7,

                    marginTop: 12,

                    paddingTop: 12,

                    borderTop:
                      "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "center",
                    }}
                  >
                    <strong>
                      Tax (
                      {
                        orderTaxRate
                      }
                      %)
                    </strong>

                    <strong>
                      {formatPKR(
                        order.tax
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "center",
                    }}
                  >
                    <strong>
                      Discount
                    </strong>

                    <strong>
                      -{" "}
                      {formatPKR(
                        order.discount
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "center",

                      marginTop: 4,

                      paddingTop: 8,

                      borderTop:
                        "1px solid #e5e7eb",

                      fontSize: 16,
                    }}
                  >
                    <strong>
                      Total
                    </strong>

                    <strong>
                      {formatPKR(
                        order.grandTotal
                      )}
                    </strong>
                  </div>
                </div>

                {/* ================================================= */}
                {/* INVOICE STATUS */}
                {/* ================================================= */}

                <div
                  className="kitchen-invoice-status"
                  style={{
                    marginTop: 12,

                    padding:
                      "8px 10px",

                    borderRadius: 7,

                    background:
                      !invoiceGenerated
                        ? "#fff7ed"
                        : invoiceCurrent
                        ? "#ecfdf5"
                        : "#fef2f2",

                    color:
                      !invoiceGenerated
                        ? "#c2410c"
                        : invoiceCurrent
                        ? "#047857"
                        : "#b91c1c",

                    fontSize: 12,

                    fontWeight: 600,
                  }}
                >
                  {!invoiceGenerated
                    ? "Invoice Required Before Delivery"
                    : invoiceCurrent
                    ? "✓ Invoice Generated & Current"
                    : "⚠ Invoice Update Required"}
                </div>

                {/* ================================================= */}
                {/* STATUS BUTTONS */}
                {/* ================================================= */}

                <div
                  className="kitchen-status-buttons"
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(4, 1fr)",

                    gap: 6,

                    marginTop: 15,
                  }}
                >
                  {statuses.map(
                    (status) => {
                      const isCurrent =
                        order.status ===
                        status;

                      // Delivered status cannot be
                      // changed once completed.
                      const disabled =
                        completed ||
                        paid;

                      const invoiceRequired =
                        status ===
                          "delivered" &&
                        (!invoiceGenerated ||
                          !invoiceCurrent) &&
                        !completed &&
                        !paid;

                      const buttonDisabled =
                        disabled ||
                        invoiceRequired;

                      return (
                        <button
                          type="button"
                          key={status}
                          disabled={
                            buttonDisabled
                          }
                          onClick={() =>
                            changeStatus(
                              order,
                              status
                            )
                          }
                          style={{
                            padding:
                              "8px 5px",

                            border:
                              isCurrent
                                ? "1px solid #111827"
                                : "1px solid #d1d5db",

                            borderRadius: 6,

                            cursor:
                              buttonDisabled
                                ? "not-allowed"
                                : "pointer",

                            fontSize: 11,

                            fontWeight: 600,

                            background:
                              isCurrent
                                ? "#111827"
                                : completed
                                ? "#e5e7eb"
                                : invoiceRequired
                                ? "#f3f4f6"
                                : "#fff",

                            color:
                              isCurrent
                                ? "#fff"
                                : completed
                                ? "#6b7280"
                                : invoiceRequired
                                ? "#9ca3af"
                                : "#374151",

                            opacity:
                              buttonDisabled
                                ? 0.8
                                : 1,
                          }}
                        >
                          {
                            statusLabels[
                              status
                            ]
                          }
                        </button>
                      );
                    }
                  )}
                </div>

                {/* ================================================= */}
                {/* ACTION BUTTONS */}
                {/* ================================================= */}

                <div
                  className="actions kitchen-actions"
                  style={{
                    display:
                      "flex",

                    gap: 8,

                    marginTop: 12,

                    flexWrap:
                      "wrap",
                  }}
                >
                  {/* EDIT ORDER */}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      openEdit(order)
                    }
                    disabled={
                      !editable
                    }
                  >
                    {paid
                      ? "Order Paid"
                      : "Edit Order"}
                  </Button>

                  {/* INVOICE */}
                  {!paid && (
                    <Button
                      onClick={() =>
                        openInvoiceModal(
                          order
                        )
                      }
                    >
                      {!invoiceGenerated
                        ? "Generate Invoice"
                        : "Update Invoice"}
                    </Button>
                  )}

                  {/* DELIVERED INFORMATION */}
                  {completed &&
                    !paid && (
                      <div
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          padding:
                            "0 8px",

                          fontSize: 12,

                          fontWeight: 600,

                          color:
                            "#047857",
                        }}
                      >
                        ✓ Delivered — Still Editable
                      </div>
                    )}

                  {/* PAID INFORMATION */}
                  {paid && (
                    <Button
                      variant="secondary"
                      disabled
                    >
                      ✓ Order Paid
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ================================================= */}
      {/* EDIT ORDER MODAL */}
      {/* ================================================= */}

      {editingOrder && (
        <Modal
          title={`Edit Order ${editingOrder.orderNo}`}
          onClose={() => {
            if (!saving) {
              setEditingOrder(null);
            }
          }}
        >
          <div
            className="kitchen-modal-scroll"
            style={{
              maxHeight:
                "70vh",

              overflowY:
                "auto",

              overflowX:
                "hidden",

              paddingRight: 10,
            }}
          >
            <div
              className="kitchen-edit-layout"
              style={{
                display:
                  "grid",

                gap: 20,

                paddingBottom: 10,
              }}
            >
              {/* ================================================= */}
              {/* CURRENT ORDER */}
              {/* ================================================= */}

              <div>
                <h3>
                  Current Order
                </h3>

                {editItems.length ===
                0 ? (
                  <div className="empty">
                    No products in this
                    order.
                  </div>
                ) : (
                  <div
                    className="kitchen-edit-items"
                    style={{
                      display:
                        "grid",

                      gap: 8,
                    }}
                  >
                    {editItems.map(
                      (
                        item,
                        index
                      ) => {
                        const product =
                          menu.find(
                            (
                              menuItem
                            ) =>
                              String(
                                menuItem._id
                              ) ===
                              String(
                                item.menuItem
                              )
                          );

                        const sizes =
                          product
                            ? getProductSizes(
                                product
                              )
                            : [];

                        const needsSize =
                          product
                            ? productNeedsSize(
                                product
                              )
                            : Boolean(
                                item.size
                              );

                        return (
                          <div
                            className="kitchen-edit-item"
                            key={`${item.menuItem}-${index}`}
                            style={{
                              display:
                                "grid",

                              gap: 10,

                              padding: 12,

                              border:
                                "1px solid #e5e7eb",

                              borderRadius:
                                8,
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "space-between",

                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,

                                  minWidth: 0,
                                }}
                              >
                                <strong>
                                  {
                                    item.name
                                  }
                                </strong>

                                {item.variant && (
                                  <small
                                    style={{
                                      display:
                                        "block",

                                      marginTop: 3,

                                      color:
                                        "#6b7280",
                                    }}
                                  >
                                    {
                                      item.variant
                                    }
                                  </small>
                                )}

                                {Array.isArray(
                                  item.dealItems
                                ) &&
                                  item
                                    .dealItems
                                    .length >
                                    0 && (
                                    <div
                                      style={{
                                        marginTop: 5,

                                        color:
                                          "#6b7280",

                                        fontSize: 12,
                                      }}
                                    >
                                      {item.dealItems.map(
                                        (
                                          dealItem,
                                          dealIndex
                                        ) => (
                                          <div
                                            key={
                                              dealItem._id ||
                                              dealIndex
                                            }
                                          >
                                            •{" "}
                                            {
                                              dealItem.name
                                            }
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>

                              <strong>
                                {formatPKR(
                                  Number(
                                    item.price ||
                                      0
                                  ) *
                                    Number(
                                      item.quantity ||
                                        0
                                    )
                                )}
                              </strong>
                            </div>

                            {/* SIZE */}
                            {needsSize && (
                              <div>
                                <label
                                  style={{
                                    display:
                                      "block",

                                    fontSize:
                                      13,

                                    fontWeight:
                                      600,

                                    marginBottom:
                                      5,
                                  }}
                                >
                                  Size
                                </label>

                                <select
                                  value={
                                    item.size ||
                                    ""
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    changeEditSize(
                                      item.menuItem,
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  style={{
                                    width:
                                      "100%",

                                    padding: 9,

                                    border:
                                      "1px solid #d1d5db",

                                    borderRadius:
                                      7,

                                    boxSizing:
                                      "border-box",
                                  }}
                                >
                                  <option value="">
                                    Select size
                                  </option>

                                  {sizes.map(
                                    (
                                      sizeItem
                                    ) => (
                                      <option
                                        key={
                                          sizeItem.size
                                        }
                                        value={
                                          sizeItem.size
                                        }
                                      >
                                        {
                                          sizeItem.size
                                        }{" "}
                                        —{" "}
                                        {formatPKR(
                                          sizeItem.price
                                        )}
                                      </option>
                                    )
                                  )}
                                </select>

                                {!item.size && (
                                  <small
                                    style={{
                                      display:
                                        "block",

                                      marginTop: 5,

                                      color:
                                        "#dc2626",
                                    }}
                                  >
                                    Please select a
                                    size.
                                  </small>
                                )}
                              </div>
                            )}

                            {/* SELECTED SIZE */}
                            {item.size && (
                              <div
                                style={{
                                  display:
                                    "flex",

                                  justifyContent:
                                    "space-between",

                                  alignItems:
                                    "center",

                                  padding:
                                    "7px 10px",

                                  background:
                                    "#f9fafb",

                                  borderRadius:
                                    6,

                                  fontSize: 13,
                                }}
                              >
                                <span>
                                  Selected
                                  Size:
                                </span>

                                <strong>
                                  {
                                    item.size
                                  }
                                </strong>
                              </div>
                            )}

                            {/* UNIT PRICE */}
                            <div
                              style={{
                                display:
                                  "flex",

                                justifyContent:
                                  "space-between",

                                fontSize: 13,

                                color:
                                  "#4b5563",
                              }}
                            >
                              <span>
                                Unit Price
                              </span>

                              <strong>
                                {formatPKR(
                                  item.price
                                )}
                              </strong>
                            </div>

                            {/* QUANTITY */}
                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "space-between",

                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  gap: 8,
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeEditQuantity(
                                      item.menuItem,
                                      -1
                                    )
                                  }
                                  style={{
                                    width: 30,

                                    height: 30,

                                    cursor:
                                      "pointer",
                                  }}
                                >
                                  −
                                </button>

                                <strong>
                                  {
                                    item.quantity
                                  }
                                </strong>

                                <button
                                  type="button"
                                  onClick={() =>
                                    changeEditQuantity(
                                      item.menuItem,
                                      1
                                    )
                                  }
                                  style={{
                                    width: 30,

                                    height: 30,

                                    cursor:
                                      "pointer",
                                  }}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeEditItem(
                                    item.menuItem
                                  )
                                }
                                style={{
                                  border:
                                    "none",

                                  background:
                                    "transparent",

                                  color:
                                    "#dc2626",

                                  cursor:
                                    "pointer",

                                  fontWeight:
                                    600,
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* ================================================= */}
              {/* ADD PRODUCT */}
              {/* ================================================= */}

              <div>
                <h3>
                  Add Product
                </h3>

                <input
                  type="text"
                  placeholder="Search product..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",

                    padding: 10,

                    marginBottom: 10,

                    border:
                      "1px solid #d1d5db",

                    borderRadius: 8,

                    boxSizing:
                      "border-box",
                  }}
                />

                <div
                  style={{
                    display:
                      "flex",

                    gap: 6,

                    flexWrap:
                      "wrap",

                    marginBottom: 12,
                  }}
                >
                  {categories.map(
                    (category) => (
                      <button
                        type="button"
                        key={
                          category
                        }
                        onClick={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                        style={{
                          padding:
                            "6px 10px",

                          borderRadius:
                            6,

                          border:
                            "1px solid #d1d5db",

                          background:
                            selectedCategory ===
                            category
                              ? "#111827"
                              : "#fff",

                          color:
                            selectedCategory ===
                            category
                              ? "#fff"
                              : "#374151",

                          cursor:
                            "pointer",
                        }}
                      >
                        {
                          category
                        }
                      </button>
                    )
                  )}
                </div>

                <div
                  style={{
                    maxHeight:
                      300,

                    overflowY:
                      "auto",

                    display:
                      "grid",

                    gap: 6,

                    paddingRight: 4,
                  }}
                >
                  {filteredMenu.length ===
                  0 ? (
                    <div
                      className="empty"
                      style={{
                        padding: 15,
                      }}
                    >
                      No products found.
                    </div>
                  ) : (
                    filteredMenu.map(
                      (product) => {
                        const sizes =
                          getProductSizes(
                            product
                          );

                        const needsSize =
                          productNeedsSize(
                            product
                          );

                        return (
                          <div
                            key={
                              product._id
                            }
                            style={{
                              border:
                                "1px solid #e5e7eb",

                              borderRadius:
                                8,

                              padding: 10,

                              background:
                                "#fff",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",

                                justifyContent:
                                  "space-between",

                                alignItems:
                                  "flex-start",

                                gap: 10,
                              }}
                            >
                              <div>
                                <strong>
                                  {
                                    product.name
                                  }
                                </strong>

                                {(product.variant ||
                                  product.size) && (
                                  <small
                                    style={{
                                      display:
                                        "block",

                                      marginTop: 3,

                                      color:
                                        "#6b7280",
                                    }}
                                  >
                                    {
                                      product.variant ||
                                      ""
                                    }

                                    {product.variant &&
                                    product.size
                                      ? " • "
                                      : ""}

                                    {
                                      product.size ||
                                      ""
                                    }
                                  </small>
                                )}

                                {Array.isArray(
                                  product.dealItems
                                ) &&
                                  product
                                    .dealItems
                                    .length >
                                    0 && (
                                    <small
                                      style={{
                                        display:
                                          "block",

                                        marginTop: 4,

                                        color:
                                          "#6b7280",
                                      }}
                                    >
                                      {product.dealItems
                                        .map(
                                          (
                                            dealItem
                                          ) =>
                                            dealItem.name
                                        )
                                        .filter(
                                          Boolean
                                        )
                                        .join(
                                          ", "
                                        )}
                                    </small>
                                  )}
                              </div>

                              {!needsSize && (
                                <strong>
                                  {formatPKR(
                                    product.salePrice ??
                                      product.price ??
                                      0
                                  )}
                                </strong>
                              )}
                            </div>

                            {/* SIZE PRODUCT */}
                            {needsSize ? (
                              <div
                                style={{
                                  marginTop:
                                    10,
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",

                                    justifyContent:
                                      "space-between",

                                    alignItems:
                                      "center",

                                    marginBottom:
                                      6,
                                  }}
                                >
                                  <small
                                    style={{
                                      fontWeight:
                                        600,
                                    }}
                                  >
                                    Available
                                    Sizes
                                  </small>

                                  <small
                                    style={{
                                      color:
                                        "#6b7280",
                                    }}
                                  >
                                    Select size
                                    before
                                    adding
                                  </small>
                                </div>

                                {sizes.length >
                                0 ? (
                                  <div
                                    style={{
                                      display:
                                        "grid",

                                      gridTemplateColumns:
                                        "repeat(auto-fit, minmax(130px, 1fr))",

                                      gap: 6,
                                    }}
                                  >
                                    {sizes.map(
                                      (
                                        sizeItem
                                      ) => (
                                        <button
                                          type="button"
                                          key={`${product._id}-${sizeItem.size}`}
                                          onClick={() => {
                                            const existing =
                                              editItems.find(
                                                (
                                                  item
                                                ) =>
                                                  String(
                                                    item.menuItem
                                                  ) ===
                                                    String(
                                                      product._id
                                                    ) &&
                                                  String(
                                                    item.size ||
                                                      ""
                                                  ) ===
                                                    String(
                                                      sizeItem.size
                                                    )
                                              );

                                            if (
                                              existing
                                            ) {
                                              alert(
                                                `${product.name} (${sizeItem.size}) is already in the order. Use + to increase quantity.`
                                              );

                                              return;
                                            }

                                            setEditItems(
                                              (
                                                current
                                              ) => [
                                                ...current,
                                                {
                                                  menuItem:
                                                    product._id,

                                                  name:
                                                    product.name ||
                                                    "Unknown Product",

                                                  category:
                                                    product.category ||
                                                    "",

                                                  variant:
                                                    product.variant ||
                                                    "",

                                                  size:
                                                    sizeItem.size,

                                                  price:
                                                    Number(
                                                      sizeItem.price ||
                                                        0
                                                    ),

                                                  quantity: 1,

                                                  dealItems:
                                                    Array.isArray(
                                                      product.dealItems
                                                    )
                                                      ? product.dealItems.map(
                                                          (
                                                            dealItem
                                                          ) => ({
                                                            name:
                                                              dealItem?.name ||
                                                              "",
                                                          })
                                                        )
                                                      : [],
                                                },
                                              ]
                                            );
                                          }}
                                          style={{
                                            padding:
                                              "8px 10px",

                                            border:
                                              "1px solid #d1d5db",

                                            borderRadius:
                                              7,

                                            background:
                                              "#f9fafb",

                                            cursor:
                                              "pointer",

                                            textAlign:
                                              "left",
                                          }}
                                        >
                                          <div
                                            style={{
                                              fontWeight:
                                                600,
                                            }}
                                          >
                                            {
                                              sizeItem.size
                                            }
                                          </div>

                                          <div
                                            style={{
                                              fontSize:
                                                12,

                                              color:
                                                "#4b5563",

                                              marginTop:
                                                2,
                                            }}
                                          >
                                            {formatPKR(
                                              sizeItem.price
                                            )}
                                          </div>
                                        </button>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      color:
                                        "#dc2626",

                                      fontSize:
                                        12,
                                    }}
                                  >
                                    No size prices
                                    configured
                                    for this
                                    product.
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  addProductToEdit(
                                    product
                                  )
                                }
                                style={{
                                  width:
                                    "100%",

                                  marginTop:
                                    10,

                                  padding:
                                    "8px 10px",

                                  border:
                                    "1px solid #d1d5db",

                                  borderRadius:
                                    7,

                                  background:
                                    "#f9fafb",

                                  cursor:
                                    "pointer",

                                  fontWeight:
                                    600,
                                }}
                              >
                                + Add Product
                              </button>
                            )}
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </div>

              {/* ================================================= */}
              {/* DISCOUNT */}
              {/* ================================================= */}

              <label>
                Discount

                <input
                  type="number"
                  min="0"
                  max={
                    editSubtotal
                  }
                  value={
                    editDiscount
                  }
                  onChange={(e) =>
                    setEditDiscount(
                      Math.max(
                        0,
                        Number(
                          e.target
                            .value ||
                            0
                        )
                      )
                    )
                  }
                  style={{
                    display:
                      "block",

                    width:
                      "100%",

                    marginTop: 6,

                    padding: 9,

                    border:
                      "1px solid #d1d5db",

                    borderRadius: 7,

                    boxSizing:
                      "border-box",
                  }}
                />
              </label>

              {/* ================================================= */}
              {/* TAX */}
              {/* ================================================= */}

              <label>
                Tax (%)

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    editTaxRate
                  }
                  onChange={(e) => {
                    const value =
                      Number(
                        e.target
                          .value ||
                          0
                      );

                    setEditTaxRate(
                      normalizeTaxRate(
                        value
                      )
                    );
                  }}
                  style={{
                    display:
                      "block",

                    width:
                      "100%",

                    marginTop: 6,

                    padding: 9,

                    border:
                      "1px solid #d1d5db",

                    borderRadius: 7,

                    boxSizing:
                      "border-box",
                  }}
                />

                <small
                  style={{
                    display:
                      "block",

                    marginTop: 5,

                    color:
                      "#6b7280",
                  }}
                >
                  Existing tax is
                  loaded
                  automatically.
                  Change the
                  percentage if
                  required.
                </small>
              </label>

              {/* ================================================= */}
              {/* TOTALS */}
              {/* ================================================= */}

              <div
                style={{
                  display:
                    "grid",

                  gap: 8,
                }}
              >
                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",
                  }}
                >
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatPKR(
                      editSubtotal
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",
                  }}
                >
                  <span>
                    Discount
                  </span>

                  <strong>
                    -{" "}
                    {formatPKR(
                      safeEditDiscount
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",
                  }}
                >
                  <span>
                    Tax (
                    {
                      safeEditTaxRate
                    }
                    %)
                  </span>

                  <strong>
                    {formatPKR(
                      editTax
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    paddingTop:
                      10,

                    borderTop:
                      "1px solid #e5e7eb",
                  }}
                >
                  <strong>
                    Grand Total
                  </strong>

                  <strong>
                    {formatPKR(
                      editGrandTotal
                    )}
                  </strong>
                </div>
              </div>

              {/* ================================================= */}
              {/* SAVE */}
              {/* ================================================= */}

              <Button
                onClick={
                  saveEditedOrder
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================================================= */}
      {/* INVOICE MODAL */}
      {/* ================================================= */}

      {paymentOrder && (
        <Modal
          title={`${
            hasInvoice(
              paymentOrder._id
            )
              ? "Update Invoice"
              : "Generate Invoice"
          } — ${
            paymentOrder.orderNo
          }`}
          onClose={() => {
            if (!billing) {
              setPaymentOrder(
                null
              );
            }
          }}
        >
          <div
            className="kitchen-modal-scroll"
            style={{
              maxHeight:
                "70vh",

              overflowY:
                "auto",

              overflowX:
                "hidden",

              paddingRight: 10,
            }}
          >
            <div
              style={{
                display:
                  "grid",

                gap: 15,

                paddingBottom:
                  5,
              }}
            >
              <div>
                <strong>
                  {
                    paymentOrder.orderNo
                  }
                </strong>

                <p>
                  Table:{" "}
                  {paymentOrder.tableName ||
                    paymentOrder
                      .table
                      ?.name ||
                    "-"}
                </p>

                <p>
                  Customer:{" "}
                  {paymentOrder.customerName ||
                    paymentOrder
                      .customer
                      ?.name ||
                    "Walk-in"}
                </p>

                {/* DELIVERED NOTICE */}
                {isCompleted(
                  paymentOrder
                ) && (
                  <div
                    style={{
                      marginTop: 10,

                      padding:
                        "8px 10px",

                      background:
                        "#ecfdf5",

                      color:
                        "#047857",

                      borderRadius:
                        7,

                      fontSize: 12,

                      fontWeight: 600,
                    }}
                  >
                    ✓ This order is
                    delivered. You can
                    still update its
                    invoice after editing
                    the order.
                  </div>
                )}
              </div>

              {/* ================================================= */}
              {/* ITEMS */}
              {/* ================================================= */}

              <div>
                {(
                  paymentOrder.items ||
                  []
                ).map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      style={{
                        padding:
                          "6px 0",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "space-between",

                          gap: 10,
                        }}
                      >
                        <span>
                          {
                            item.quantity
                          }{" "}
                          ×{" "}
                          {
                            item.name
                          }
                        </span>

                        <strong>
                          {formatPKR(
                            item.total
                          )}
                        </strong>
                      </div>

                      {(item.variant ||
                        item.size) && (
                        <div
                          style={{
                            paddingLeft:
                              18,

                            marginTop: 3,

                            color:
                              "#6b7280",

                            fontSize: 12,
                          }}
                        >
                          {item.variant ||
                            ""}

                          {item.variant &&
                          item.size
                            ? " • "
                            : ""}

                          {item.size ||
                            ""}
                        </div>
                      )}

                      {Array.isArray(
                        item.dealItems
                      ) &&
                        item
                          .dealItems
                          .length >
                          0 && (
                          <div
                            style={{
                              paddingLeft:
                                18,

                              marginTop: 3,

                              color:
                                "#6b7280",

                              fontSize: 12,
                            }}
                          >
                            {item.dealItems.map(
                              (
                                dealItem,
                                dealIndex
                              ) => (
                                <div
                                  key={
                                    dealItem._id ||
                                    dealIndex
                                  }
                                >
                                  •{" "}
                                  {
                                    dealItem.name
                                  }
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  )
                )}
              </div>

              {/* ================================================= */}
              {/* INVOICE TOTALS */}
              {/* ================================================= */}

              <div
                style={{
                  borderTop:
                    "1px solid #e5e7eb",

                  paddingTop: 12,
                }}
              >
                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",
                  }}
                >
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatPKR(
                      paymentOrder.subtotal
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    marginTop: 6,
                  }}
                >
                  <span>
                    Discount
                  </span>

                  <strong>
                    -{" "}
                    {formatPKR(
                      paymentOrder.discount
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    marginTop: 6,
                  }}
                >
                  <span>
                    Tax{" "}
                    {getOrderTaxRate(
                      paymentOrder
                    )}
                    %
                  </span>

                  <strong>
                    {formatPKR(
                      paymentOrder.tax
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    marginTop: 10,

                    paddingTop: 10,

                    borderTop:
                      "1px solid #e5e7eb",
                  }}
                >
                  <strong>
                    Grand Total
                  </strong>

                  <strong>
                    {formatPKR(
                      paymentOrder.grandTotal
                    )}
                  </strong>
                </div>
              </div>

              {/* ================================================= */}
              {/* PAYMENT METHOD */}
              {/* ================================================= */}

              <label>
                Payment Method

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  style={{
                    display:
                      "block",

                    width:
                      "100%",

                    marginTop: 6,

                    padding: 10,

                    border:
                      "1px solid #d1d5db",

                    borderRadius: 7,

                    boxSizing:
                      "border-box",
                  }}
                >
                  {[
                    "Cash",
                    "EasyPaisa",
                    "JazzCash",
                    "Bank Account",
                    "Card",
                  ].map(
                    (method) => (
                      <option
                        key={
                          method
                        }
                        value={
                          method
                        }
                      >
                        {method}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* ================================================= */}
              {/* UPDATE / GENERATE */}
              {/* ================================================= */}

              <Button
                onClick={() =>
                  generateBill(
                    paymentOrder
                  )
                }
                disabled={
                  billing
                }
              >
                {billing
                  ? hasInvoice(
                      paymentOrder._id
                    )
                    ? "Updating Invoice..."
                    : "Generating Invoice..."
                  : hasInvoice(
                      paymentOrder._id
                    )
                    ? "Update Invoice"
                    : "Generate Invoice"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}