import mongoose from "mongoose";

// =====================================================
// ORDER ITEM SCHEMA
// =====================================================

const itemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
    },

    name: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    variant: {
      type: String,
      default: "",
    },

    size: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    dealItems: {
      type: Array,
      default: [],
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// ORDER SCHEMA
// =====================================================

const schema = new mongoose.Schema(
  {
    // ===================================================
    // ORDER NUMBER
    // ===================================================

    orderNo: {
      type: String,
      unique: true,
    },

    // ===================================================
    // TABLE
    // ===================================================

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },

    tableName: {
      type: String,
      default: "",
    },

    // ===================================================
    // CUSTOMER
    // ===================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    customerName: {
      type: String,
      default: "",
    },

    // ===================================================
    // ORDER ITEMS
    // ===================================================

    items: {
      type: [itemSchema],
      default: [],
    },

    // ===================================================
    // FINANCIAL DETAILS
    // ===================================================

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===================================================
    // TAX RATE
    // ===================================================

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ===================================================
    // ACTUAL TAX AMOUNT
    // ===================================================

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===================================================
    // GRAND TOTAL
    // ===================================================

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===================================================
    // STATUS
    // ===================================================

    status: {
      type: String,
      enum: [
        "created",
        "pending",
        "preparing",
        "ready",
        "delivered",
        "paid",
      ],
      default: "created",
    },

    // ===================================================
    // PAYMENT METHOD
    // ===================================================

    paymentMethod: {
      type: String,
      default: "",
    },

    // ===================================================
    // ORDER EDIT VERSION
    // ===================================================

    editVersion: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ===================================================
    // CREATED BY
    // ===================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// EXPORT
// =====================================================

export default mongoose.model("Order", schema);