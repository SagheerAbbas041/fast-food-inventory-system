import { Router } from "express";
import Settings from "../models/Settings.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { protect } from "../middleware/auth.js";
const router=Router();
router.get("/",protect,async(_req,res,next)=>{try{let s=await Settings.findOne();if(!s)s=await Settings.create({});res.json(s);}catch(e){next(e);}});
router.put("/",protect,async(req,res,next)=>{try{let s=await Settings.findOne();if(!s)s=await Settings.create(req.body);else{s.set(req.body);await s.save();}res.json(s);}catch(e){next(e);}});
router.put("/profile",protect,async(req,res,next)=>{
 try{
  const data={name:req.body.name,email:req.body.email,username:req.body.username};
  if(req.body.password)data.password=await bcrypt.hash(req.body.password,10);
  res.json(await User.findByIdAndUpdate(req.user.id,data,{new:true}).select("-password"));
 }catch(e){next(e);}
});
export default router;
