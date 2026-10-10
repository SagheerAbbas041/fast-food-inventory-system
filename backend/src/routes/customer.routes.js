import { Router } from "express";
import Customer from "../models/Customer.js";
import { protect } from "../middleware/auth.js";
const router=Router();
router.get("/",protect,async(_req,res,next)=>{try{res.json(await Customer.find().sort({updatedAt:-1}));}catch(e){next(e);}});
router.post("/",protect,async(req,res,next)=>{try{res.status(201).json(await Customer.create(req.body));}catch(e){next(e);}});
export default router;
