import mongoose from "mongoose";

const line = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    unitCost: {
      type: Number,
      required: true,
      min: 0,
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

const schema = new mongoose.Schema(
  {
    purchaseNo: {
      type: String,
      unique: true,
    },

    supplier: {
      type: String,
      trim: true,
    },

    items: {
      type: [line],
      default: [],
    },

    total: {
      type: Number,
      default: 0,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["completed", "cancelled"],
      default: "completed",
    },

    stockApplied: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Purchase", schema);