import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastPurchaseCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Inventory", schema);