import { Router } from "express";
import Invoice from "../models/Invoice.js";
import Purchase from "../models/Purchase.js";
import { protect } from "../middleware/auth.js";
const router=Router();
router.get("/",protect,async(_req,res,next)=>{
 try{
  const invoices=await Invoice.find();const purchases=await Purchase.find();
  const sales=invoices.reduce((s,x)=>s+x.total,0), purchase=purchases.reduce((s,x)=>s+x.total,0);
  res.json({sales,purchase,profit:sales-purchase,invoices:invoices.length});
 }catch(e){next(e);}
});
export default router;
