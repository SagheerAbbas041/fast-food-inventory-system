import mongoose from "mongoose";
const schema = new mongoose.Schema({
  restaurantName: { type: String, default: "My Fast Food Restaurant" },
  logo: String,
  address: String,
  phone: String,
  email: String,
  taxPercent: { type: Number, default: 5 },
  currency: { type: String, default: "PKR" },
  invoiceFooter: { type: String, default: "Thank you for visiting us!" }
});
export default mongoose.model("Settings", schema);
