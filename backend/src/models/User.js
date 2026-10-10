import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: String,
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "cashier", "kitchen"], default: "cashier" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  profilePicture: String
}, { timestamps: true });
export default mongoose.model("User", schema);
