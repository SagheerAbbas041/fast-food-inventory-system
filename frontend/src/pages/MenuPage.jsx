import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Button, Card, Modal } from "../components/UI";

// =====================================================
// CATEGORIES
// =====================================================

const regularCategories = [
  "Special Flavours",
  "Regular Pizza",
  "Burgers",
  "Fries",
  "Pasta",
  "Shawarma & Roll",
  "Sandwich",
  "Wings",
  "Beverages",
];

// =====================================================
// MULTI-SIZE CATEGORIES
// =====================================================

const multiSizeCategories = [
  "Special Flavours",
  "Regular Pizza",
  "Wings",
];

// =====================================================
// SIZE OPTIONS
// =====================================================

const sizeOptions = {
  "Special Flavours": [
    "Small",
    "Medium",
    "Large",
    "Family",
  ],

  "Regular Pizza": [
    "Small",
    "Medium",
    "Large",
    "Family",
  ],

  Burgers: [
    "Regular",
    "Large",
  ],

  Fries: [
    "Small",
    "Regular",
    "Large",
  ],

  Pasta: [
    "Regular",
    "Large",
  ],

  "Shawarma & Roll": [
    "Regular",
    "Large",
  ],

  Sandwich: [
    "Regular",
    "Large",
  ],

  Wings: [
    "6 Pieces",
    "10 Pieces",
    "12 Pieces",
    "20 Pieces",
  ],

  Beverages: [
    "250ml",
    "500ml",
    "1 Liter",
    "1.5 Liter",
    "2.25 Liter",
  ],
};

// =====================================================
// VARIANT PLACEHOLDERS
// =====================================================

const variantPlaceholder = {
  "Special Flavours": "e.g. Chicken Fajita",
  "Regular Pizza": "e.g. Chicken Tikka",
  Burgers: "e.g. Zinger",
  Fries: "e.g. Plain / Masala",
  Pasta: "e.g. Alfredo",
  "Shawarma & Roll": "e.g. Chicken Shawarma",
  Sandwich: "e.g. Club Sandwich",
  Wings: "e.g. BBQ / Hot",
  Beverages: "e.g. Coke / Pepsi",
};

// =====================================================
// DEFAULT REGULAR FORM
// =====================================================

const defaultRegularForm = {
  name: "",
  category: "Special Flavours",
  variant: "",
  size: "",
  purchaseCost: 0,
  salePrice: 0,
  sizePrices: [],
  image: "",
  status: "active",
};

// =====================================================
// DEFAULT DEAL PRODUCT
// =====================================================

const createDealProduct = () => ({
  name: "",
});

// =====================================================
// DEFAULT DEAL FORM
// =====================================================

const defaultDealForm = {
  name: "",
  salePrice: 0,
  status: "active",
  dealItems: [],
};

// =====================================================
// FORMAT PKR
// =====================================================

const formatPKR = (value) =>
  `PKR ${Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

// =====================================================
// CHECK MULTI-SIZE CATEGORY
// =====================================================

const isMultiSizeCategory = (category) =>
  multiSizeCategories.includes(category);

// =====================================================
// CREATE SIZE PRICE ROW
// =====================================================

const createSizePrice = (size = "") => ({
  size,
  purchaseCost: 0,
  salePrice: 0,
});

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [regularModal, setRegularModal] =
    useState(false);

  const [editingRegularId, setEditingRegularId] =
    useState(null);

  const [regularForm, setRegularForm] = useState(
    defaultRegularForm
  );

  const [dealModal, setDealModal] = useState(false);
  const [editingDealId, setEditingDealId] =
    useState(null);

  const [dealForm, setDealForm] = useState(
    defaultDealForm
  );

  const [saving, setSaving] = useState(false);

  const loadMenu = async () => {
    try {
      setLoading(true);

      const response = await api.get("/menu");

      setItems(response.data || []);
    } catch (error) {
      console.error("Menu loading error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load menu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const regularItems = useMemo(
    () =>
      items.filter(
        (item) => item.category !== "Deals"
      ),
    [items]
  );

  const dealItems = useMemo(
    () =>
      items.filter(
        (item) => item.category === "Deals"
      ),
    [items]
  );

  const filteredRegularItems = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return regularItems.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      const sizeText = Array.isArray(
        item.sizePrices
      )
        ? item.sizePrices
            .map((x) => x.size)
            .join(" ")
        : item.size || "";

      const searchableText = [
        item.name,
        item.category,
        item.variant,
        item.size,
        sizeText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchMatch =
        !searchText ||
        searchableText.includes(searchText);

      return categoryMatch && searchMatch;
    });
  }, [
    regularItems,
    search,
    selectedCategory,
  ]);

  const openCreateRegular = () => {
    setEditingRegularId(null);

    setRegularForm({
      ...defaultRegularForm,
      sizePrices: [],
    });

    setRegularModal(true);
  };

  const openEditRegular = (item) => {
    const multiSize = isMultiSizeCategory(
      item.category
    );

    setEditingRegularId(item._id);

    setRegularForm({
      name: item.name || "",

      category:
        item.category || "Special Flavours",

      variant: item.variant || "",

      size: item.size || "",

      purchaseCost: Number(
        item.purchaseCost || 0
      ),

      salePrice: Number(
        item.salePrice || 0
      ),

      sizePrices:
        multiSize &&
        Array.isArray(item.sizePrices)
          ? item.sizePrices.map((x) => ({
              size: x.size || "",

              purchaseCost: Number(
                x.purchaseCost || 0
              ),

              salePrice: Number(
                x.salePrice || 0
              ),
            }))
          : [],

      image: item.image || "",

      status: item.status || "active",
    });

    setRegularModal(true);
  };

  const closeRegularModal = () => {
    if (saving) {
      return;
    }

    setRegularModal(false);

    setEditingRegularId(null);

    setRegularForm({
      ...defaultRegularForm,
      sizePrices: [],
    });
  };

  const updateRegularField = (field, value) => {
    setRegularForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const changeRegularCategory = (category) => {
    const multiSize =
      isMultiSizeCategory(category);

    setRegularForm((current) => ({
      ...current,

      category,

      size: multiSize
        ? ""
        : current.size,

      salePrice: multiSize
        ? 0
        : current.salePrice,

      purchaseCost: multiSize
        ? 0
        : current.purchaseCost,

      sizePrices: [],
    }));
  };

  const addSizePrice = () => {
    const category =
      regularForm.category;

    const availableSizes =
      sizeOptions[category] || [];

    const usedSizes =
      regularForm.sizePrices.map(
        (item) => item.size
      );

    const nextSize =
      availableSizes.find(
        (size) =>
          !usedSizes.includes(size)
      ) || "";

    setRegularForm((current) => ({
      ...current,

      sizePrices: [
        ...current.sizePrices,
        createSizePrice(nextSize),
      ],
    }));
  };

  const removeSizePrice = (index) => {
    setRegularForm((current) => ({
      ...current,

      sizePrices:
        current.sizePrices.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const updateSizePrice = (
    index,
    field,
    value
  ) => {
    setRegularForm((current) => ({
      ...current,

      sizePrices:
        current.sizePrices.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  };

  const getAvailableSizesForRow = (
    currentIndex
  ) => {
    const category =
      regularForm.category;

    const available =
      sizeOptions[category] || [];

    const selectedByOthers =
      regularForm.sizePrices
        .filter(
          (_, index) =>
            index !== currentIndex
        )
        .map((item) => item.size);

    return available.filter(
      (size) =>
        !selectedByOthers.includes(size)
    );
  };

  const validateRegularForm = () => {
    if (!regularForm.name.trim()) {
      alert(
        "Product name is required."
      );

      return false;
    }

    if (
      isMultiSizeCategory(
        regularForm.category
      )
    ) {
      if (
        regularForm.sizePrices.length ===
        0
      ) {
        alert(
          "Please add at least one size and price."
        );

        return false;
      }

      const invalid =
        regularForm.sizePrices.find(
          (item) =>
            !item.size ||
            Number(item.salePrice) < 0 ||
            Number(item.purchaseCost) < 0
        );

      if (invalid) {
        alert(
          "Please enter a valid size, purchase cost and sale price for every size."
        );

        return false;
      }

      const sizes =
        regularForm.sizePrices.map(
          (item) =>
            item.size
              .trim()
              .toLowerCase()
        );

      const duplicate = sizes.some(
        (size, index) =>
          sizes.indexOf(size) !== index
      );

      if (duplicate) {
        alert(
          "Duplicate sizes are not allowed."
        );

        return false;
      }
    } else {
      if (
        Number(
          regularForm.salePrice
        ) < 0
      ) {
        alert(
          "Sale price cannot be negative."
        );

        return false;
      }

      if (
        Number(
          regularForm.purchaseCost
        ) < 0
      ) {
        alert(
          "Purchase cost cannot be negative."
        );

        return false;
      }
    }

    return true;
  };

  const saveRegularItem = async () => {
    if (!validateRegularForm()) {
      return;
    }

    try {
      setSaving(true);

      const multiSize =
        isMultiSizeCategory(
          regularForm.category
        );

      const payload = {
        name: regularForm.name.trim(),

        category:
          regularForm.category,

        variant:
          regularForm.variant.trim(),

        size: multiSize
          ? ""
          : regularForm.size,

        purchaseCost: multiSize
          ? 0
          : Number(
              regularForm.purchaseCost ||
                0
            ),

        salePrice: multiSize
          ? 0
          : Number(
              regularForm.salePrice ||
                0
            ),

        sizePrices: multiSize
          ? regularForm.sizePrices.map(
              (item) => ({
                size:
                  item.size.trim(),

                purchaseCost:
                  Number(
                    item.purchaseCost ||
                      0
                  ),

                salePrice:
                  Number(
                    item.salePrice ||
                      0
                  ),
              })
            )
          : [],

        image:
          regularForm.image || "",

        status:
          regularForm.status ||
          "active",
      };

      if (editingRegularId) {
        await api.put(
          `/menu/${editingRegularId}`,
          payload
        );

        alert(
          "Menu item updated successfully."
        );
      } else {
        await api.post(
          "/menu",
          payload
        );

        alert(
          "Menu item added successfully."
        );
      }

      closeRegularModal();

      await loadMenu();
    } catch (error) {
      console.error(
        "Save menu item error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to save menu item."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this menu item?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/menu/${id}`
      );

      alert(
        "Menu item deleted successfully."
      );

      await loadMenu();
    } catch (error) {
      console.error(
        "Delete menu item error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to delete menu item."
      );
    }
  };

  const openCreateDeal = () => {
    setEditingDealId(null);

    setDealForm({
      ...defaultDealForm,

      dealItems: [
        createDealProduct(),
      ],
    });

    setDealModal(true);
  };

  const openEditDeal = (deal) => {
    setEditingDealId(
      deal._id
    );

    setDealForm({
      name: deal.name || "",

      salePrice: Number(
        deal.salePrice || 0
      ),

      status:
        deal.status || "active",

      dealItems:
        Array.isArray(
          deal.dealItems
        ) &&
        deal.dealItems.length
          ? deal.dealItems.map(
              (item) => ({
                name:
                  item.name || "",
              })
            )
          : [
              createDealProduct(),
            ],
    });

    setDealModal(true);
  };

  const closeDealModal = () => {
    if (saving) {
      return;
    }

    setDealModal(false);

    setEditingDealId(null);

    setDealForm({
      ...defaultDealForm,
      dealItems: [],
    });
  };

  const addDealProduct = () => {
    setDealForm((current) => ({
      ...current,

      dealItems: [
        ...current.dealItems,
        createDealProduct(),
      ],
    }));
  };

  const updateDealProduct = (
    index,
    value
  ) => {
    setDealForm((current) => ({
      ...current,

      dealItems:
        current.dealItems.map(
          (item, i) =>
            i === index
              ? {
                  name: value,
                }
              : item
        ),
    }));
  };

  const removeDealProduct = (
    index
  ) => {
    setDealForm((current) => ({
      ...current,

      dealItems:
        current.dealItems.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const validateDealForm = () => {
    if (!dealForm.name.trim()) {
      alert(
        "Deal name is required."
      );

      return false;
    }

    if (
      Number(
        dealForm.salePrice
      ) < 0
    ) {
      alert(
        "Deal price cannot be negative."
      );

      return false;
    }

    if (
      !dealForm.dealItems.length
    ) {
      alert(
        "Please add at least one product to the deal."
      );

      return false;
    }

    const invalidProduct =
      dealForm.dealItems.find(
        (item) =>
          !item.name.trim()
      );

    if (invalidProduct) {
      alert(
        "Please enter a Product Name for every deal product."
      );

      return false;
    }

    return true;
  };

  const saveDeal = async () => {
    if (!validateDealForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name:
          dealForm.name.trim(),

        category: "Deals",

        variant: "",

        size: "",

        purchaseCost: 0,

        salePrice: Number(
          dealForm.salePrice || 0
        ),

        status:
          dealForm.status || "active",

        dealItems:
          dealForm.dealItems.map(
            (item) => ({
              name:
                item.name.trim(),
            })
          ),
      };

      if (editingDealId) {
        await api.put(
          `/menu/${editingDealId}`,
          payload
        );

        alert(
          "Deal updated successfully."
        );
      } else {
        await api.post(
          "/menu",
          payload
        );

        alert(
          "Deal created successfully."
        );
      }

      closeDealModal();

      await loadMenu();
    } catch (error) {
      console.error(
        "Save deal error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to save deal."
      );
    } finally {
      setSaving(false);
    }
  };

  const getRegularProfit = (item) => {
    if (
      isMultiSizeCategory(
        item.category
      ) &&
      Array.isArray(
        item.sizePrices
      ) &&
      item.sizePrices.length
    ) {
      return null;
    }

    return (
      Number(item.salePrice || 0) -
      Number(
        item.purchaseCost || 0
      )
    );
  };

  const getDealProductText = (
    item
  ) => {
    return item.name || "";
  };

  return (
    <div className="menu-page-responsive">
      <div className="page-heading menu-page-heading">
        <div>
          <h1>Menu</h1>

          <p>
            Manage products,
            sizes, prices and
            deals.
          </p>
        </div>

        <div
          className="menu-page-actions"
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={
              openCreateRegular
            }
          >
            Add Product
          </Button>

          <Button
            variant="secondary"
            onClick={
              openCreateDeal
            }
          >
            Add Deal
          </Button>
        </div>
      </div>

      <Card
        className="menu-filter-card"
        style={{
          marginBottom: 20,
        }}
      >
        <div
          className="menu-filter-content"
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <input
            className="menu-search-input"
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
              padding: 11,
              border:
                "1px solid #d1d5db",
              borderRadius: 8,
            }}
          />

          <div
            className="menu-category-filters"
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {[
              "All",
              ...regularCategories,
              "Deals",
            ].map(
              (category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                  style={{
                    padding:
                      "7px 12px",
                    borderRadius: 7,
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
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {category}
                </button>
              )
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="loading menu-loading">
          Loading menu...
        </div>
      ) : (
        <>
          {selectedCategory !==
            "Deals" && (
            <Card className="menu-products-card">
              <div className="card-head menu-card-head">
                <h3>Products</h3>

                <span>
                  {
                    filteredRegularItems.length
                  }{" "}
                  products
                </span>
              </div>

              <div
                className="responsive-table menu-products-table"
                style={{
                  overflowX:
                    "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>
                        Name
                      </th>

                      <th style={tableHeaderStyle}>
                        Variant / Type
                      </th>

                      <th style={tableHeaderStyle}>
                        Size / Prices
                      </th>

                      <th style={tableHeaderStyle}>
                        Purchase Cost
                      </th>

                      <th style={tableHeaderStyle}>
                        Sale Price
                      </th>

                      <th style={tableHeaderStyle}>
                        Profit
                      </th>

                      <th style={tableHeaderStyle}>
                        Status
                      </th>

                      <th style={tableHeaderStyle}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRegularItems.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{
                            padding: 30,
                            textAlign:
                              "center",
                          }}
                        >
                          No products
                          found.
                        </td>
                      </tr>
                    ) : (
                      filteredRegularItems.map(
                        (item) => {
                          const multiSize =
                            isMultiSizeCategory(
                              item.category
                            ) &&
                            Array.isArray(
                              item.sizePrices
                            ) &&
                            item
                              .sizePrices
                              .length >
                              0;

                          const profit =
                            getRegularProfit(
                              item
                            );

                          return (
                            <tr
                              key={
                                item._id
                              }
                            >
                              <td
                                className="menu-product-cell"
                                style={tableCellStyle}
                              >
                                <strong>
                                  {
                                    item.name
                                  }
                                </strong>

                                <small
                                  style={{
                                    display:
                                      "block",
                                    marginTop:
                                      3,
                                    color:
                                      "#6b7280",
                                  }}
                                >
                                  {
                                    item.category
                                  }
                                </small>
                              </td>

                              <td style={tableCellStyle}>
                                {item.variant ||
                                  "-"}
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  minWidth: 180,
                                }}
                              >
                                {multiSize ? (
                                  <div
                                    style={{
                                      display:
                                        "grid",
                                      gap: 5,
                                    }}
                                  >
                                    {item.sizePrices.map(
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
                                            gap: 10,
                                            fontSize:
                                              12,
                                          }}
                                        >
                                          <strong>
                                            {
                                              option.size
                                            }
                                          </strong>

                                          <span>
                                            {formatPKR(
                                              option.salePrice
                                            )}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  item.size ||
                                  "-"
                                )}
                              </td>

                              <td style={tableCellStyle}>
                                {multiSize ? (
                                  <div
                                    style={{
                                      display:
                                        "grid",
                                      gap: 5,
                                    }}
                                  >
                                    {item.sizePrices.map(
                                      (
                                        option
                                      ) => (
                                        <div
                                          key={
                                            option.size
                                          }
                                          style={{
                                            fontSize:
                                              12,
                                          }}
                                        >
                                          {
                                            option.size
                                          }
                                          :{" "}
                                          {formatPKR(
                                            option.purchaseCost
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  formatPKR(
                                    item.purchaseCost
                                  )
                                )}
                              </td>

                              <td style={tableCellStyle}>
                                {multiSize ? (
                                  <div
                                    style={{
                                      display:
                                        "grid",
                                      gap: 5,
                                    }}
                                  >
                                    {item.sizePrices.map(
                                      (
                                        option
                                      ) => (
                                        <div
                                          key={
                                            option.size
                                          }
                                          style={{
                                            fontSize:
                                              12,
                                          }}
                                        >
                                          {
                                            option.size
                                          }
                                          :{" "}
                                          {formatPKR(
                                            option.salePrice
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  formatPKR(
                                    item.salePrice
                                  )
                                )}
                              </td>

                              <td style={tableCellStyle}>
                                {multiSize ? (
                                  <div
                                    style={{
                                      display:
                                        "grid",
                                      gap: 5,
                                    }}
                                  >
                                    {item.sizePrices.map(
                                      (
                                        option
                                      ) => {
                                        const sizeProfit =
                                          Number(
                                            option.salePrice ||
                                              0
                                          ) -
                                          Number(
                                            option.purchaseCost ||
                                              0
                                          );

                                        return (
                                          <div
                                            key={
                                              option.size
                                            }
                                            style={{
                                              fontSize:
                                                12,
                                            }}
                                          >
                                            {
                                              option.size
                                            }
                                            :{" "}
                                            {formatPKR(
                                              sizeProfit
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                ) : (
                                  formatPKR(
                                    profit
                                  )
                                )}
                              </td>

                              <td style={tableCellStyle}>
                                <span
                                  style={{
                                    display:
                                      "inline-block",
                                    padding:
                                      "4px 8px",
                                    borderRadius:
                                      20,
                                    fontSize:
                                      11,
                                    fontWeight:
                                      700,
                                    background:
                                      item.status ===
                                      "active"
                                        ? "#dcfce7"
                                        : "#fee2e2",
                                    color:
                                      item.status ===
                                      "active"
                                        ? "#166534"
                                        : "#991b1b",
                                  }}
                                >
                                  {
                                    item.status
                                  }
                                </span>
                              </td>

                              <td style={tableCellStyle}>
                                <div
                                  className="menu-action-buttons"
                                  style={{
                                    display:
                                      "flex",
                                    gap: 6,
                                    flexWrap:
                                      "wrap",
                                  }}
                                >
                                  <Button
                                    variant="secondary"
                                    onClick={() =>
                                      openEditRegular(
                                        item
                                      )
                                    }
                                  >
                                    Edit
                                  </Button>

                                  <Button
                                    variant="danger"
                                    onClick={() =>
                                      deleteItem(
                                        item._id
                                      )
                                    }
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {selectedCategory ===
            "Deals" && (
            <Card className="menu-deals-card">
              <div className="card-head menu-card-head">
                <h3>Deals</h3>

                <span>
                  {dealItems.length} deals
                </span>
              </div>

              {dealItems.length ===
              0 ? (
                <div className="empty">
                  No deals found.
                </div>
              ) : (
                <div
                  className="menu-deals-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 15,
                  }}
                >
                  {dealItems
                    .filter((deal) => {
                      const text =
                        search
                          .toLowerCase()
                          .trim();

                      if (!text) {
                        return true;
                      }

                      return [
                        deal.name,
                        ...(deal.dealItems ||
                          []).map(
                            (x) => x.name
                          ),
                      ]
                        .join(" ")
                        .toLowerCase()
                        .includes(text);
                    })
                    .map((deal) => (
                      <div
                        className="menu-deal-card"
                        key={deal._id}
                        style={{
                          border:
                            "1px solid #e5e7eb",
                          borderRadius: 10,
                          padding: 15,
                        }}
                      >
                        <div
                          className="menu-deal-header"
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: 10,
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                fontSize: 16,
                              }}
                            >
                              {deal.name}
                            </strong>

                            <small
                              style={{
                                display:
                                  "block",
                                marginTop: 4,
                                color:
                                  "#6b7280",
                              }}
                            >
                              Deal
                            </small>
                          </div>

                          <strong>
                            {formatPKR(
                              deal.salePrice
                            )}
                          </strong>
                        </div>

                        <div
                          className="menu-deal-products"
                          style={{
                            marginTop: 12,
                            paddingTop: 10,
                            borderTop:
                              "1px solid #e5e7eb",
                            display: "grid",
                            gap: 7,
                          }}
                        >
                          {(
                            deal.dealItems ||
                            []
                          ).map(
                            (
                              product,
                              index
                            ) => (
                              <div
                                key={`${product._id || index}-${index}`}
                                style={{
                                  display:
                                    "flex",
                                  gap: 10,
                                  fontSize: 13,
                                }}
                              >
                                <span>
                                  •{" "}
                                  {getDealProductText(
                                    product
                                  )}
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        <div
                          className="menu-deal-actions"
                          style={{
                            display: "flex",
                            gap: 7,
                            marginTop: 15,
                          }}
                        >
                          <Button
                            variant="secondary"
                            onClick={() =>
                              openEditDeal(
                                deal
                              )
                            }
                          >
                            Edit
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() =>
                              deleteItem(
                                deal._id
                              )
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {regularModal && (
        <Modal
          title={
            editingRegularId
              ? "Edit Product"
              : "Add Product"
          }
          onClose={
            closeRegularModal
          }
        >
          <div className="menu-modal-content menu-regular-modal-content">
            <label>
              Product Name

              <input
                type="text"
                value={
                  regularForm.name
                }
                onChange={(e) =>
                  updateRegularField(
                    "name",
                    e.target.value
                  )
                }
                placeholder="Enter product name"
                style={inputStyle}
              />
            </label>

            <label>
              Category

              <select
                value={
                  regularForm.category
                }
                onChange={(e) =>
                  changeRegularCategory(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                {regularCategories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Variant / Type

              <input
                type="text"
                value={
                  regularForm.variant
                }
                onChange={(e) =>
                  updateRegularField(
                    "variant",
                    e.target.value
                  )
                }
                placeholder={
                  variantPlaceholder[
                    regularForm.category
                  ] ||
                  "Enter variant / type"
                }
                style={inputStyle}
              />
            </label>

            {isMultiSizeCategory(
              regularForm.category
            ) ? (
              <div
                className="menu-size-options"
                style={{
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 15,
                  background:
                    "#f9fafb",
                }}
              >
                <div
                  className="menu-size-options-header"
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <strong>
                      Size & Price Options
                    </strong>

                    <small
                      style={{
                        display:
                          "block",
                        marginTop: 4,
                        color:
                          "#6b7280",
                      }}
                    >
                      Add different prices for each size.
                    </small>
                  </div>

                  <Button
                    variant="secondary"
                    type="button"
                    onClick={
                      addSizePrice
                    }
                    disabled={
                      regularForm
                        .sizePrices
                        .length >=
                      (
                        sizeOptions[
                          regularForm.category
                        ] || []
                      ).length
                    }
                  >
                    + Add Size
                  </Button>
                </div>

                {regularForm.sizePrices
                  .length === 0 ? (
                  <div
                    style={{
                      padding: 15,
                      textAlign:
                        "center",
                      border:
                        "1px dashed #d1d5db",
                      borderRadius: 8,
                      color:
                        "#6b7280",
                    }}
                  >
                    No sizes added.
                    Click "Add Size"
                    to add size and
                    price.
                  </div>
                ) : (
                  <div
                    className="menu-size-price-list"
                    style={{
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    {regularForm.sizePrices.map(
                      (
                        option,
                        index
                      ) => (
                        <div
                          className="menu-size-price-row"
                          key={index}
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "1fr 1fr 1fr auto",
                            gap: 8,
                            alignItems:
                              "end",
                            padding: 10,
                            background:
                              "#fff",
                            border:
                              "1px solid #e5e7eb",
                            borderRadius: 8,
                          }}
                        >
                          <label>
                            <small>
                              Size
                            </small>

                            <select
                              value={
                                option.size
                              }
                              onChange={(
                                e
                              ) =>
                                updateSizePrice(
                                  index,
                                  "size",
                                  e.target
                                    .value
                                )
                              }
                              style={inputStyleSmall}
                            >
                              <option value="">
                                Select Size
                              </option>

                              {getAvailableSizesForRow(
                                index
                              ).map(
                                (
                                  size
                                ) => (
                                  <option
                                    key={
                                      size
                                    }
                                    value={
                                      size
                                    }
                                  >
                                    {size}
                                  </option>
                                )
                              )}

                              {option.size &&
                                !getAvailableSizesForRow(
                                  index
                                ).includes(
                                  option.size
                                ) && (
                                  <option
                                    value={
                                      option.size
                                    }
                                  >
                                    {
                                      option.size
                                    }
                                  </option>
                                )}
                            </select>
                          </label>

                          <label>
                            <small>
                              Purchase Cost
                            </small>

                            <input
                              type="number"
                              min="0"
                              value={
                                option.purchaseCost
                              }
                              onChange={(
                                e
                              ) =>
                                updateSizePrice(
                                  index,
                                  "purchaseCost",
                                  Math.max(
                                    0,
                                    Number(
                                      e
                                        .target
                                        .value ||
                                        0
                                    )
                                  )
                                )
                              }
                              style={inputStyleSmall}
                            />
                          </label>

                          <label>
                            <small>
                              Sale Price
                            </small>

                            <input
                              type="number"
                              min="0"
                              value={
                                option.salePrice
                              }
                              onChange={(
                                e
                              ) =>
                                updateSizePrice(
                                  index,
                                  "salePrice",
                                  Math.max(
                                    0,
                                    Number(
                                      e
                                        .target
                                        .value ||
                                        0
                                    )
                                  )
                                )
                              }
                              style={inputStyleSmall}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              removeSizePrice(
                                index
                              )
                            }
                            className="menu-remove-button"
                            style={{
                              padding:
                                "9px 12px",
                              border:
                                "1px solid #fecaca",
                              borderRadius: 7,
                              background:
                                "#fef2f2",
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
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <label>
                  Size

                  <select
                    value={
                      regularForm.size
                    }
                    onChange={(e) =>
                      updateRegularField(
                        "size",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Select Size
                    </option>

                    {(
                      sizeOptions[
                        regularForm.category
                      ] || []
                    ).map((size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Purchase Cost

                  <input
                    type="number"
                    min="0"
                    value={
                      regularForm.purchaseCost
                    }
                    onChange={(e) =>
                      updateRegularField(
                        "purchaseCost",
                        Math.max(
                          0,
                          Number(
                            e.target.value ||
                              0
                          )
                        )
                      )
                    }
                    style={inputStyle}
                  />
                </label>

                <label>
                  Sale Price

                  <input
                    type="number"
                    min="0"
                    value={
                      regularForm.salePrice
                    }
                    onChange={(e) =>
                      updateRegularField(
                        "salePrice",
                        Math.max(
                          0,
                          Number(
                            e.target.value ||
                              0
                          )
                        )
                      )
                    }
                    style={inputStyle}
                  />
                </label>

                <div
                  className="menu-profit-box"
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background:
                      "#f0fdf4",
                    color:
                      "#166534",
                  }}
                >
                  <strong>
                    Profit:{" "}
                    {formatPKR(
                      Number(
                        regularForm.salePrice ||
                          0
                      ) -
                        Number(
                          regularForm.purchaseCost ||
                            0
                        )
                    )}
                  </strong>
                </div>
              </>
            )}

            <label>
              Status

              <select
                value={
                  regularForm.status
                }
                onChange={(e) =>
                  updateRegularField(
                    "status",
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </label>

            <Button
              onClick={
                saveRegularItem
              }
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingRegularId
                ? "Update Product"
                : "Add Product"}
            </Button>
          </div>
        </Modal>
      )}

      {dealModal && (
        <Modal
          title={
            editingDealId
              ? "Edit Deal"
              : "Add Deal"
          }
          onClose={
            closeDealModal
          }
        >
          <div className="menu-modal-scroll">
            <div className="menu-modal-content menu-deal-modal-content">
              <label>
                Deal Name

                <input
                  type="text"
                  value={
                    dealForm.name
                  }
                  onChange={(e) =>
                    setDealForm(
                      (current) => ({
                        ...current,
                        name: e.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Family Deal"
                  style={inputStyle}
                />
              </label>

              <label>
                Final Deal Price

                <input
                  type="number"
                  min="0"
                  value={
                    dealForm.salePrice
                  }
                  onChange={(e) =>
                    setDealForm(
                      (current) => ({
                        ...current,
                        salePrice:
                          Math.max(
                            0,
                            Number(
                              e.target
                                .value ||
                                0
                            )
                          ),
                      })
                    )
                  }
                  placeholder="Enter deal price"
                  style={inputStyle}
                />
              </label>

              <div>
                <div
                  className="menu-deal-products-header"
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      Deal Products
                    </h3>

                    <small
                      style={{
                        display:
                          "block",
                        marginTop: 4,
                        color:
                          "#6b7280",
                      }}
                    >
                      Add the product names included in this deal.
                    </small>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={
                      addDealProduct
                    }
                  >
                    + Add Product
                  </Button>
                </div>

                {!dealForm
                  .dealItems
                  .length ? (
                  <div
                    style={{
                      padding: 15,
                      border:
                        "1px dashed #d1d5db",
                      borderRadius: 8,
                      textAlign:
                        "center",
                      color:
                        "#6b7280",
                    }}
                  >
                    No products added.
                  </div>
                ) : (
                  <div
                    className="menu-deal-product-list"
                    style={{
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    {dealForm.dealItems.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          className="menu-deal-product-row"
                          key={index}
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "flex-end",
                            gap: 8,
                            border:
                              "1px solid #e5e7eb",
                            borderRadius: 10,
                            padding: 12,
                            background:
                              "#f9fafb",
                          }}
                        >
                          <label
                            style={{
                              flex: 1,
                            }}
                          >
                            Product Name

                            <input
                              type="text"
                              value={
                                item.name
                              }
                              onChange={(
                                e
                              ) =>
                                updateDealProduct(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Zinger Burger"
                              style={inputStyle}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              removeDealProduct(
                                index
                              )
                            }
                            className="menu-remove-button"
                            style={{
                              padding:
                                "10px 12px",
                              border:
                                "1px solid #fecaca",
                              borderRadius: 7,
                              background:
                                "#fef2f2",
                              color:
                                "#dc2626",
                              cursor:
                                "pointer",
                              fontWeight:
                                600,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <label>
                Status

                <select
                  value={
                    dealForm.status
                  }
                  onChange={(e) =>
                    setDealForm(
                      (current) => ({
                        ...current,
                        status:
                          e.target.value,
                      })
                    )
                  }
                  style={inputStyle}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </label>

              <Button
                onClick={saveDeal}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingDealId
                  ? "Update Deal"
                  : "Create Deal"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// =====================================================
// RESPONSIVE UI STYLES
// =====================================================

const tableHeaderStyle = {
  textAlign: "left",
  padding: 10,
  borderBottom: "1px solid #e5e7eb",
};

const tableCellStyle = {
  padding: 10,
  borderBottom: "1px solid #f0f0f0",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: 10,
  border: "1px solid #d1d5db",
  borderRadius: 7,
};

const inputStyleSmall = {
  display: "block",
  width: "100%",
  marginTop: 5,
  padding: 9,
  border: "1px solid #d1d5db",
  borderRadius: 7,
};