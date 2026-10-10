import mongoose from "mongoose";

// =====================================================
// INVOICE ITEM SCHEMA
// =====================================================

const invoiceItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
    },

    name: {
      type: String,
      default: "",
    },

    // =================================================
    // PRODUCT CATEGORY
    // =================================================

    category: {
      type: String,
      default: "",
    },

    // =================================================
    // PRODUCT VARIANT
    // =================================================

    variant: {
      type: String,
      default: "",
    },

    // =================================================
    // PRODUCT SIZE
    // =================================================

    size: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      default: 0,
    },

    unitPrice: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// INVOICE SCHEMA
// =====================================================

const schema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      unique: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    tableName: {
      type: String,
      default: "",
    },

    customerName: {
      type: String,
      default: "Walk-in",
    },

    // =================================================
    // CURRENT ORDER ITEMS
    // =================================================

    items: {
      type: [invoiceItemSchema],
      default: [],
    },

    // =================================================
    // TOTALS
    // =================================================

    subtotal: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    // =================================================
    // PAYMENT
    // =================================================

    paymentMethod: {
      type: String,
      default: "Cash",
    },

    // =================================================
    // ORDER VERSION
    // =================================================

    orderVersion: {
      type: Number,
      default: 1,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Invoice",
  schema
);