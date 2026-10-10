import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  email: String,
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrder: Date,
  status: { type: String, default: "active" }
}, { timestamps: true });
export default mongoose.model("Customer", schema);
