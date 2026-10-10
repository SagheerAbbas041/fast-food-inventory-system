import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Table from "./models/Table.js";
import MenuItem from "./models/MenuItem.js";
import Settings from "./models/Settings.js";
dotenv.config();
await connectDB();

await User.deleteMany({});
await Table.deleteMany({});
await MenuItem.deleteMany({});
await Settings.deleteMany({});

const pass = async p => bcrypt.hash(p,10);
await User.insertMany([
 {name:"System Admin",username:"admin",email:"admin@restaurant.local",password:await pass("admin123"),role:"admin"},
 {name:"Main Cashier",username:"cashier",email:"cashier@restaurant.local",password:await pass("cashier123"),role:"cashier"},
 {name:"Kitchen Staff",username:"kitchen",email:"kitchen@restaurant.local",password:await pass("kitchen123"),role:"kitchen"}
]);

await Table.insertMany(Array.from({length:12},(_,i)=>({name:`Table ${String(i+1).padStart(2,"0")}`,capacity:i%3===0?6:4})));
await MenuItem.insertMany([
 {name:"Zinger Burger",category:"Burgers",purchaseCost:220,salePrice:450,stock:35,minLevel:8,unit:"pcs"},
 {name:"Beef Burger",category:"Burgers",purchaseCost:250,salePrice:520,stock:22,minLevel:8,unit:"pcs"},
 {name:"Chicken Pizza",category:"Pizza",purchaseCost:550,salePrice:950,stock:12,minLevel:5,unit:"pcs"},
 {name:"Loaded Fries",category:"Fries",purchaseCost:120,salePrice:280,stock:40,minLevel:10,unit:"pcs"},
 {name:"Chicken Shawarma",category:"Shawarma",purchaseCost:110,salePrice:250,stock:30,minLevel:8,unit:"pcs"},
 {name:"Cold Drink",category:"Drinks",purchaseCost:55,salePrice:100,stock:50,minLevel:15,unit:"bottle"},
 {name:"Chocolate Cake",category:"Desserts",purchaseCost:150,salePrice:320,stock:4,minLevel:5,unit:"slice"}
]);
await Settings.create({restaurantName:"My Fast Food Restaurant",address:"Mandi Bahauddin, Punjab, Pakistan",phone:"+92 300 0000000",taxPercent:5,currency:"PKR"});
console.log("Seed complete.");
process.exit(0);
