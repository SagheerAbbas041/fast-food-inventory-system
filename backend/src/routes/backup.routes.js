import { Router } from "express";
import User from "../models/User.js";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import Purchase from "../models/Purchase.js";
import Settings from "../models/Settings.js";
import { protect, allow } from "../middleware/auth.js";
const router=Router();

router.get("/export",protect,allow("admin"),async(_req,res,next)=>{
 try{
  const data={exportedAt:new Date(),users:await User.find().select("-password"),tables:await Table.find(),menu:await MenuItem.find(),orders:await Order.find(),invoices:await Invoice.find(),customers:await Customer.find(),purchases:await Purchase.find(),settings:await Settings.find()};
  res.setHeader("Content-Disposition",`attachment; filename=restaurant-backup-${Date.now()}.json`);
  res.json(data);
 }catch(e){next(e);}
});
export default router;
