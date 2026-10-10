import { Router } from "express";

import Order from "../models/Order.js";

import { protect, allow } from "../middleware/auth.js";

const router = Router();

// =====================================================
// GET KITCHEN ORDERS
// =====================================================

router.get(
  "/",
  protect,
  allow(
    "admin",
    "cashier",
    "kitchen"
  ),
  async (_req, res, next) => {
    try {
      const orders = await Order.find({
        status: {
          $in: [
            "pending",
            "preparing",
            "ready",
            "delivered",
          ],
        },
      })
        .populate(
          "table",
          "name status"
        )
        .populate(
          "customer",
          "name phone"
        )
        .populate(
          "items.menuItem",
          "name salePrice"
        )
        .sort({
          createdAt: 1,
        });

      res.json(orders);
    } catch (error) {
      console.error(
        "KITCHEN ORDERS ERROR:",
        error
      );

      next(error);
    }
  }
);

export default router;