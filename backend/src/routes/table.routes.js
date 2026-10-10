import { Router } from "express";
import Table from "../models/Table.js";
import { protect, allow } from "../middleware/auth.js";
const router = Router();

router.get("/", protect, async (_req, res, next) => {
  try { res.json(await Table.find().sort({ name: 1 })); } catch(e) { next(e); }
});
router.post("/", protect, allow("admin","cashier"), async (req,res,next)=>{
  try { res.status(201).json(await Table.create(req.body)); } catch(e){ next(e); }
});
router.put("/:id", protect, allow("admin","cashier"), async(req,res,next)=>{
  try { res.json(await Table.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})); } catch(e){next(e);}
});
router.delete("/:id", protect, allow("admin"), async(req,res,next)=>{
  try { await Table.findByIdAndDelete(req.params.id); res.json({message:"Table deleted"}); } catch(e){next(e);}
});
export default router;
