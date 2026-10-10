import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  Search,
  Minus,
  Plus,
  Trash2,
  Send,
  X,
} from "lucide-react";

import api from "../api";

import {
  Button,
  Card,
  Status,
} from "../components/UI";

// =====================================================
// MENU CATEGORIES
// =====================================================

const cats = [
  "All",
  "Special Flavours",
  "Regular Pizza",
  "Burgers",
  "Fries",
  "Pasta",
  "Shawarma & Roll",
  "Sandwich",
  "Wings",
  "Beverages",
  "Deals",
];

// =====================================================
// MULTI-SIZE CATEGORIES
// =====================================================

const multiSizeCategories = [
  "Special Flavours",
  "Regular Pizza",
  "Wings",
];

export default function POS() {
  const { tableId } = useParams();

  const nav = useNavigate();

  const [table, setTable] = useState(null);

  const [menu, setMenu] = useState([]);

  const [cart, setCart] = useState([]);

  const [search, setSearch] = useState("");

  const [cat, setCat] = useState("All");

  // ===================================================
  // DISCOUNT
  // ===================================================

  const [discount, setDiscount] = useState(0);

  // ===================================================
  // TAX
  // ===================================================
  // Default = 0%
  //
  // User can enter:
  // 0  = No tax
  // 5  = 5% tax
  // 10 = 10% tax
  // ===================================================

  const [taxPercent, setTaxPercent] = useState(0);

  const [sending, setSending] = useState(false);

  // ===================================================
  // SIZE SELECTION MODAL
  // ===================================================

  const [
    sizeProduct,
    setSizeProduct,
  ] = useState(null);

  // ===================================================
  // LOAD TABLE + MENU
  // ===================================================

  const load = async () => {
    try {
      const [
        tablesResponse,
        menuResponse,
      ] = await Promise.all([
        api.get("/tables"),
        api.get("/menu"),
      ]);

      const selectedTable =
        tablesResponse.data.find(
          (x) =>
            x._id === tableId
        );

      setTable(
        selectedTable || null
      );

      setMenu(
        menuResponse.data || []
      );
    } catch (error) {
      console.error(
        "POS loading error:",
        error
      );
    }
  };

  useEffect(() => {
    load();
  }, [tableId]);

  // ===================================================
  // CHECK MULTI SIZE PRODUCT
  // ===================================================

  const isMultiSizeProduct = (
    product
  ) => {
    return (
      multiSizeCategories.includes(
        product.category
      ) &&
      Array.isArray(
        product.sizePrices
      ) &&
      product.sizePrices.length > 0
    );
  };

  // ===================================================
  // ADD PRODUCT TO CART
  // ===================================================

  const add = (
    product,
    selectedSize = null,
    selectedPrice = null
  ) => {
    const finalSize =
      selectedSize ||
      product.size ||
      "";

    const finalPrice =
      selectedPrice !== null
        ? Number(selectedPrice)
        : Number(
            product.salePrice || 0
          );

    setCart(
      (currentCart) => {
        const oldItem =
          currentCart.find(
            (x) =>
              String(
                x.menuItem
              ) ===
                String(
                  product._id
                ) &&
              x.variant ===
                (product.variant ||
                  "") &&
              x.size ===
                finalSize
          );

        // EXISTING ITEM

        if (oldItem) {
          return currentCart.map(
            (x) =>
              String(
                x.menuItem
              ) ===
                String(
                  product._id
                ) &&
              x.variant ===
                (product.variant ||
                  "") &&
              x.size ===
                finalSize
                ? {
                    ...x,
                    quantity:
                      Number(
                        x.quantity
                      ) + 1,
                  }
                : x
          );
        }

        // NEW ITEM

        return [
          ...currentCart,
          {
            menuItem:
              product._id,

            name:
              product.name,

            category:
              product.category ||
              "",

            variant:
              product.variant ||
              "",

            size:
              finalSize,

            price:
              finalPrice,

            quantity: 1,

            dealItems:
              product.dealItems ||
              [],
          },
        ];
      }
    );
  };

  // ===================================================
  // CLICK PRODUCT
  // ===================================================

  const handleProductClick =
    (product) => {
      if (
        isMultiSizeProduct(
          product
        )
      ) {
        setSizeProduct(
          product
        );

        return;
      }

      add(product);
    };

  // ===================================================
  // SELECT SIZE
  // ===================================================

  const selectSize = (
    sizeOption
  ) => {
    if (!sizeProduct) {
      return;
    }

    add(
      sizeProduct,
      sizeOption.size,
      sizeOption.salePrice
    );

    setSizeProduct(null);
  };

  // ===================================================
  // CHANGE QUANTITY
  // ===================================================

  const change = (
    menuItemId,
    variant,
    size,
    difference
  ) => {
    setCart(
      (currentCart) =>
        currentCart.map(
          (item) =>
            String(
              item.menuItem
            ) ===
              String(
                menuItemId
              ) &&
            item.variant ===
              variant &&
            item.size ===
              size
              ? {
                  ...item,
                  quantity:
                    Math.max(
                      1,
                      Number(
                        item.quantity
                      ) +
                        difference
                    ),
                }
              : item
        )
    );
  };

  // ===================================================
  // REMOVE PRODUCT
  // ===================================================

  const remove = (
    menuItemId,
    variant,
    size
  ) => {
    setCart(
      (currentCart) =>
        currentCart.filter(
          (item) =>
            !(
              String(
                item.menuItem
              ) ===
                String(
                  menuItemId
                ) &&
              item.variant ===
                variant &&
              item.size ===
                size
            )
        )
    );
  };

  // ===================================================
  // FILTER PRODUCTS
  // ===================================================

  const filtered =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      return menu.filter(
        (item) => {
          const categoryMatch =
            cat === "All" ||
            item.category ===
              cat;

          const sizeSearchText =
            Array.isArray(
              item.sizePrices
            )
              ? item.sizePrices
                  .map(
                    (x) =>
                      x.size
                  )
                  .join(" ")
              : "";

          const searchableText = [
            item.name,
            item.category,
            item.variant,
            item.size,
            sizeSearchText,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const searchMatch =
            !searchText ||
            searchableText.includes(
              searchText
            );

          return (
            categoryMatch &&
            searchMatch
          );
        }
      );
    }, [
      menu,
      cat,
      search,
    ]);

  // ===================================================
  // BILL CALCULATION
  // ===================================================

  const subtotal =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );

  // ===================================================
  // SAFE DISCOUNT
  // ===================================================

  const safeDiscount =
    Math.max(
      0,
      Math.min(
        Number(
          discount || 0
        ),
        subtotal
      )
    );

  // ===================================================
  // AMOUNT AFTER DISCOUNT
  // ===================================================

  const taxableAmount =
    Math.max(
      0,
      subtotal -
        safeDiscount
    );

  // ===================================================
  // SAFE TAX PERCENT
  // ===================================================

  const safeTaxPercent =
    Math.max(
      0,
      Math.min(
        Number(
          taxPercent || 0
        ),
        100
      )
    );

  // ===================================================
  // TAX
  // ===================================================

  const tax =
    taxableAmount *
    (safeTaxPercent / 100);

  // ===================================================
  // GRAND TOTAL
  // ===================================================

  const total =
    taxableAmount + tax;

  // ===================================================
  // SEND ORDER TO KITCHEN
  // ===================================================

  const send = async () => {
    if (!cart.length) {
      alert(
        "Please add products to the order."
      );

      return;
    }

    try {
      setSending(true);

      const response =
        await api.post(
          "/orders",
          {
            tableId,

            items: cart.map(
              (item) => ({
                menuItem:
                  item.menuItem,

                name:
                  item.name,

                category:
                  item.category,

                variant:
                  item.variant,

                size:
                  item.size,

                quantity:
                  item.quantity,

                unitPrice:
                  item.price,

                total:
                  Number(
                    item.price || 0
                  ) *
                  Number(
                    item.quantity || 0
                  ),

                dealItems:
                  item.dealItems ||
                  [],
              })
            ),

            // DISCOUNT
            discount:
              safeDiscount,

            // TAX PERCENT
            // 0 means no tax
            taxPercent:
              safeTaxPercent,
          }
        );

      alert(
        `Order ${
          response.data
            ?.orderNo || ""
        } sent to kitchen successfully.`
      );

      setCart([]);

      setDiscount(0);

      setTaxPercent(0);

      await load();
    } catch (error) {
      console.error(
        "Send order error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Unable to send order to kitchen."
      );
    } finally {
      setSending(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (!table) {
    return (
      <div className="loading">
        Loading table...
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <>
      {/* PAGE HEADER */}

      <div className="page-heading pos-page-heading">
        <div>
          <h1>
            {table.name} — Order
          </h1>

          <p>
            <Status
              value={
                table.status
              }
            />

            {" "}
            Create an order
            and send it directly
            to the kitchen.
          </p>
        </div>

        <div className="pos-page-heading-action">
          <Button
            variant="secondary"
            onClick={() =>
              nav("/tables")
            }
          >
            Back to Tables
          </Button>
        </div>
      </div>

      {/* POS LAYOUT */}

      <div className="pos-layout pos-responsive-layout">

        {/* PRODUCTS PANEL */}

        <Card className="products-panel pos-products-panel">

          {/* SEARCH */}

          <div className="searchbar pos-searchbar">
            <Search
              size={18}
            />

            <input
              placeholder="Search product, variant, size..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          {/* CATEGORIES */}

          <div className="filters pos-filters">
            {cats.map(
              (category) => (
                <button
                  type="button"
                  className={
                    cat ===
                    category
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setCat(
                      category
                    )
                  }
                  key={
                    category
                  }
                >
                  {category}
                </button>
              )
            )}
          </div>

          {/* PRODUCTS */}

          <div className="product-grid pos-product-grid">
            {filtered.length >
            0 ? (
              filtered.map(
                (product) => (
                  <button
                    type="button"
                    className="product-card pos-product-card"
                    onClick={() =>
                      handleProductClick(
                        product
                      )
                    }
                    key={
                      product._id
                    }
                  >
                    {/* PRODUCT ICON */}

                    <div className="product-placeholder">
                      {product.category ===
                      "Beverages"
                        ? "🥤"
                        : product.category ===
                          "Burgers"
                        ? "🍔"
                        : product.category ===
                          "Fries"
                        ? "🍟"
                        : product.category ===
                          "Wings"
                        ? "🍗"
                        : product.category ===
                          "Pasta"
                        ? "🍝"
                        : product.category ===
                          "Sandwich"
                        ? "🥪"
                        : product.category ===
                          "Shawarma & Roll"
                        ? "🌯"
                        : product.category ===
                          "Deals"
                        ? "🎁"
                        : "🍕"}
                    </div>

                    {/* NAME */}

                    <strong>
                      {
                        product.name
                      }
                    </strong>

                    {/* CATEGORY */}

                    <small>
                      {
                        product.category
                      }
                    </small>

                    {/* VARIANT */}

                    {product.variant && (
                      <small>
                        Type:{" "}
                        <strong>
                          {
                            product.variant
                          }
                        </strong>
                      </small>
                    )}

                    {/* MULTI SIZE PRICES */}

                    {isMultiSizeProduct(
                      product
                    ) ? (
                      <div
                        className="pos-product-size-prices"
                        style={{
                          display:
                            "grid",
                          gap: 3,
                          marginTop:
                            5,
                          width:
                            "100%",
                        }}
                      >
                        {product.sizePrices.map(
                          (
                            option
                          ) => (
                            <div
                              key={
                                option.size
                              }
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                fontSize:
                                  11,
                                gap: 8,
                              }}
                            >
                              <span>
                                {
                                  option.size
                                }
                              </span>

                              <strong>
                                PKR{" "}
                                {Number(
                                  option.salePrice ||
                                    0
                                ).toLocaleString()}
                              </strong>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <>
                        {product.size && (
                          <small>
                            Size:{" "}
                            <strong>
                              {
                                product.size
                              }
                            </strong>
                          </small>
                        )}

                        <b>
                          PKR{" "}
                          {Number(
                            product.salePrice ||
                              0
                          ).toLocaleString()}
                        </b>
                      </>
                    )}

                    {/* DEAL PRODUCTS */}

                    {product.category ===
                      "Deals" &&
                      product.dealItems
                        ?.length >
                        0 && (
                        <small
                          className="pos-deal-products"
                          style={{
                            marginTop: 4,
                            whiteSpace:
                              "normal",
                          }}
                        >
                          {product.dealItems
                            .map(
                              (
                                dealItem
                              ) =>
                                dealItem.name
                            )
                            .join(
                              " + "
                            )}
                        </small>
                      )}
                  </button>
                )
              )
            ) : (
              <div className="empty">
                No products found.
              </div>
            )}
          </div>
        </Card>

        {/* CURRENT ORDER */}

        <Card className="order-panel pos-order-panel">

          <div className="card-head pos-order-card-head">
            <h3>
              Current Order
            </h3>

            <button
              type="button"
              onClick={() => {
                setCart([]);
                setDiscount(0);
                setTaxPercent(0);
              }}
              disabled={
                !cart.length
              }
            >
              Clear
            </button>
          </div>

          {/* EMPTY ORDER */}

          {!cart.length ? (
            <div className="empty">
              Add products to
              start the order.
            </div>
          ) : (
            <div className="cart-list pos-cart-list">
              {cart.map(
                (item) => (
                  <div
                    className="cart-row pos-cart-row"
                    key={`${item.menuItem}-${item.variant}-${item.size}`}
                  >
                    {/* PRODUCT INFO */}

                    <div className="pos-cart-item-info">
                      <strong>
                        {
                          item.name
                        }
                      </strong>

                      {item.variant && (
                        <small>
                          Type:{" "}
                          {
                            item.variant
                          }
                        </small>
                      )}

                      {item.size && (
                        <small>
                          Size:{" "}
                          {
                            item.size
                          }
                        </small>
                      )}

                      <small>
                        PKR{" "}
                        {Number(
                          item.price ||
                            0
                        ).toLocaleString()}
                        {" "}
                        each
                      </small>
                    </div>

                    {/* QUANTITY */}

                    <div className="qty pos-qty">
                      <button
                        type="button"
                        onClick={() =>
                          change(
                            item.menuItem,
                            item.variant,
                            item.size,
                            -1
                          )
                        }
                      >
                        <Minus
                          size={14}
                        />
                      </button>

                      <b>
                        {
                          item.quantity
                        }
                      </b>

                      <button
                        type="button"
                        onClick={() =>
                          change(
                            item.menuItem,
                            item.variant,
                            item.size,
                            1
                          )
                        }
                      >
                        <Plus
                          size={14}
                        />
                      </button>
                    </div>

                    {/* ITEM TOTAL */}

                    <strong className="pos-cart-item-total">
                      PKR{" "}
                      {(
                        Number(
                          item.price ||
                            0
                        ) *
                        Number(
                          item.quantity ||
                            0
                        )
                      ).toLocaleString()}
                    </strong>

                    {/* REMOVE */}

                    <button
                      type="button"
                      className="pos-cart-remove"
                      onClick={() =>
                        remove(
                          item.menuItem,
                          item.variant,
                          item.size
                        )
                      }
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* ORDER SUMMARY */}

          <div className="bill-box pos-bill-box">

            {/* DISCOUNT */}

            <label>
              Discount

              <input
                type="number"
                min="0"
                max={subtotal}
                value={
                  discount
                }
                onChange={(e) =>
                  setDiscount(
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
              />
            </label>

            {/* TAX */}

            <label>
              Tax %

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={
                  taxPercent
                }
                onChange={(e) =>
                  setTaxPercent(
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Number(
                          e.target
                            .value ||
                            0
                        )
                      )
                    )
                  )
                }
                placeholder="0"
              />

              <small
                className="pos-tax-help"
                style={{
                  display:
                    "block",
                  marginTop: 4,
                  color:
                    "#6b7280",
                }}
              >
                Enter 0 if you do not
                want to apply tax.
              </small>
            </label>

            {/* SUBTOTAL */}

            <div>
              <span>
                Subtotal
              </span>

              <b>
                PKR{" "}
                {subtotal.toLocaleString()}
              </b>
            </div>

            {/* DISCOUNT */}

            {safeDiscount >
              0 && (
              <div>
                <span>
                  Discount
                </span>

                <b>
                  - PKR{" "}
                  {safeDiscount.toLocaleString()}
                </b>
              </div>
            )}

            {/* TAX */}

            {safeTaxPercent >
              0 && (
              <div>
                <span>
                  Tax{" "}
                  {safeTaxPercent}%
                </span>

                <b>
                  PKR{" "}
                  {tax.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </b>
              </div>
            )}

            {/* GRAND TOTAL */}

            <div className="grand">
              <span>
                Grand Total
              </span>

              <b>
                PKR{" "}
                {total.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </b>
            </div>

            {/* SEND */}

            <div className="actions pos-actions">
              <Button
                onClick={send}
                disabled={
                  !cart.length ||
                  sending
                }
              >
                <Send
                  size={16}
                />

                {sending
                  ? "Sending..."
                  : "Send to Kitchen"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* SIZE SELECTION MODAL */}

      {sizeProduct && (
        <div
          className="pos-size-modal-overlay"
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.5)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() =>
            setSizeProduct(null)
          }
        >
          <div
            className="pos-size-modal"
            style={{
              width: "100%",
              maxWidth: 450,
              background:
                "#fff",
              borderRadius:
                12,
              padding: 20,
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.2)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* HEADER */}

            <div
              className="pos-size-modal-header"
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  15,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  {
                    sizeProduct.name
                  }
                </h2>

                {sizeProduct.variant && (
                  <small
                    style={{
                      display:
                        "block",
                      marginTop:
                        4,
                      color:
                        "#6b7280",
                    }}
                  >
                    Type:{" "}
                    {
                      sizeProduct.variant
                    }
                  </small>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSizeProduct(
                    null
                  )
                }
                style={{
                  border:
                    "none",
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                }}
              >
                <X
                  size={20}
                />
              </button>
            </div>

            <p
              style={{
                marginTop: 0,
                color:
                  "#6b7280",
              }}
            >
              Select size
            </p>

            {/* SIZE OPTIONS */}

            <div
              className="pos-size-options"
              style={{
                display:
                  "grid",
                gap: 10,
              }}
            >
              {sizeProduct.sizePrices?.map(
                (option) => (
                  <button
                    type="button"
                    key={
                      option.size
                    }
                    onClick={() =>
                      selectSize(
                        option
                      )
                    }
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      padding:
                        "14px 16px",
                      border:
                        "1px solid #d1d5db",
                      borderRadius:
                        8,
                      background:
                        "#fff",
                      cursor:
                        "pointer",
                      fontSize:
                        14,
                    }}
                  >
                    <strong>
                      {
                        option.size
                      }
                    </strong>

                    <strong>
                      PKR{" "}
                      {Number(
                        option.salePrice ||
                          0
                      ).toLocaleString()}
                    </strong>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}