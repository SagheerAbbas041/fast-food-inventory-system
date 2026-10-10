import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, allow } from "../middleware/auth.js";
const router=Router();
router.get("/",protect,allow("admin"),async(_req,res,next)=>{try{res.json(await User.find().select("-password"));}catch(e){next(e);}});
router.post("/",protect,allow("admin"),async(req,res,next)=>{
 try{const password=await bcrypt.hash(req.body.password||"123456",10);res.status(201).json(await User.create({...req.body,password}));}catch(e){next(e);}
});
router.put("/:id",protect,allow("admin"),async(req,res,next)=>{
 try{const data={...req.body};if(data.password)data.password=await bcrypt.hash(data.password,10);res.json(await User.findByIdAndUpdate(req.params.id,data,{new:true}).select("-password"));}catch(e){next(e);}
});
router.delete("/:id",protect,allow("admin"),async(req,res,next)=>{try{await User.findByIdAndDelete(req.params.id);res.json({message:"User deleted"});}catch(e){next(e);}});
export default router;
