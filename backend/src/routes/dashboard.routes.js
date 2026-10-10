import { Router } from "express";
import Order from "../models/Order.js";
import Invoice from "../models/Invoice.js";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";
import Customer from "../models/Customer.js";
import Purchase from "../models/Purchase.js";
import { protect } from "../middleware/auth.js";
const router=Router();
router.get("/",protect,async(_req,res,next)=>{
 try{
  const [orders,invoices,tables,items,customers,purchases]=await Promise.all([
    Order.find().sort({createdAt:-1}).limit(10),Invoice.find(),Table.find(),MenuItem.find(),Customer.find(),Purchase.find()
  ]);
  const totalSales=invoices.reduce((s,x)=>s+x.total,0);
  const totalPurchase=purchases.reduce((s,x)=>s+x.total,0);
  const lowStock=items.filter(x=>x.stock<=x.minLevel);
  const today=new Date();today.setHours(0,0,0,0);
  const todayOrders=orders.filter(x=>new Date(x.createdAt)>=today);
  const todaySales=invoices.filter(x=>new Date(x.issuedAt)>=today).reduce((s,x)=>s+x.total,0);
  res.json({
    cards:{totalSales,todayProfit:todaySales-totalPurchase,todayOrders:todayOrders.length,
      occupiedTables:tables.filter(x=>x.status==="occupied").length,
      monthlySales:totalSales,pendingKitchen:orders.filter(x=>["pending","preparing","ready"].includes(x.status)).length,
      lowStock:lowStock.length,totalCustomers:customers.length},
    recentOrders:orders,lowStock
  });
 }catch(e){next(e);}
});
export default router;
