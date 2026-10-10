import mongoose from "mongoose";

// =====================================================
// DEAL ITEM SCHEMA
// =====================================================
// Each deal product only stores:
// - Optional existing menu item ID
// - Product name
//
// Category, variant, size and quantity are NOT used.
// =====================================================

const dealItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// SIZE PRICE SCHEMA
// =====================================================

const sizePriceSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },

    purchaseCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// MAIN MENU ITEM SCHEMA
// =====================================================

const schema = new mongoose.Schema(
  {
    // =================================================
    // BASIC INFORMATION
    // =================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
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
        "Other",
      ],
      default: "Other",
      trim: true,
    },

    // =================================================
    // VARIANT / TYPE
    // =================================================

    variant: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // OLD / SINGLE SIZE
    // =================================================

    size: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // IMAGE
    // =================================================

    image: {
      type: String,
      default: "",
    },

    // =================================================
    // OLD / SINGLE PURCHASE COST
    // =================================================

    purchaseCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // OLD / SINGLE SALE PRICE
    // =================================================

    salePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // MULTI SIZE + PRICE
    // =================================================

    sizePrices: {
      type: [sizePriceSchema],
      default: [],
    },

    // =================================================
    // STATUS
    // =================================================

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // =================================================
    // DEAL PRODUCTS
    // =================================================
    //
    // Used only when category = "Deals".
    //
    // Each product only contains its name.
    // =================================================

    dealItems: {
      type: [dealItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "MenuItem",
  schema
);