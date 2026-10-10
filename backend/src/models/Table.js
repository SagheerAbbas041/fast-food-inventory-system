import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ["available", "occupied", "bill_pending", "reserved"], default: "available" }
}, { timestamps: true });
export default mongoose.model("Table", schema);
