import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { makeToken } from "../utils/token.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || user.status !== "active" || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    res.json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, username: user.username, role: user.role, profilePicture: user.profilePicture }
    });
  } catch (e) { next(e); }
});

router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

export default router;
