import { Router } from "express";
import Inventory from "../models/Inventory.js";
import { protect, allow } from "../middleware/auth.js";

const router = Router();

// =====================================================
// GET ALL INVENTORY
// =====================================================

router.get("/", protect, async (_req, res, next) => {
  try {
    const items = await Inventory.find().sort({
      itemName: 1,
    });

    res.json(items);
  } catch (error) {
    next(error);
  }
});

// =====================================================
// GET LOW STOCK ITEMS
// =====================================================

router.get("/low-stock", protect, async (_req, res, next) => {
  try {
    const items = await Inventory.find({
      $expr: {
        $lte: ["$currentStock", "$minStock"],
      },
      status: "active",
    }).sort({
      currentStock: 1,
    });

    res.json(items);
  } catch (error) {
    next(error);
  }
});

// =====================================================
// GET SINGLE INVENTORY ITEM
// =====================================================

router.get("/:id", protect, async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

// =====================================================
// CREATE INVENTORY ITEM
// =====================================================

router.post("/", protect, allow("admin"), async (req, res, next) => {
  try {
    const {
      itemName,
      unit,
      currentStock = 0,
      minStock = 0,
    } = req.body;

    if (!itemName?.trim()) {
      return res.status(400).json({
        message: "Item name is required",
      });
    }

    if (!unit?.trim()) {
      return res.status(400).json({
        message: "Unit is required",
      });
    }

    const existing = await Inventory.findOne({
      itemName: itemName.trim(),
    });

    if (existing) {
      return res.status(400).json({
        message: "Inventory item already exists",
      });
    }

    const item = await Inventory.create({
      itemName: itemName.trim(),
      unit: unit.trim(),
      currentStock: Number(currentStock) || 0,
      minStock: Number(minStock) || 0,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// =====================================================
// UPDATE INVENTORY ITEM
// =====================================================

router.put("/:id", protect, allow("admin"), async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    if (req.body.itemName !== undefined) {
      item.itemName = String(req.body.itemName).trim();
    }

    if (req.body.unit !== undefined) {
      item.unit = String(req.body.unit).trim();
    }

    if (req.body.minStock !== undefined) {
      item.minStock = Math.max(0, Number(req.body.minStock) || 0);
    }

    if (req.body.status !== undefined) {
      item.status = req.body.status;
    }

    await item.save();

    res.json(item);
  } catch (error) {
    next(error);
  }
});

// =====================================================
// MANUAL STOCK ADJUSTMENT
// =====================================================

router.post(
  "/:id/stock",
  protect,
  allow("admin"),
  async (req, res, next) => {
    try {
      const item = await Inventory.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          message: "Inventory item not found",
        });
      }

      const quantity = Number(req.body.quantity);

      if (!Number.isFinite(quantity) || quantity === 0) {
        return res.status(400).json({
          message: "Valid stock quantity is required",
        });
      }

      const newStock = item.currentStock + quantity;

      if (newStock < 0) {
        return res.status(400).json({
          message: "Stock cannot be negative",
        });
      }

      item.currentStock = newStock;

      await item.save();

      res.json(item);
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// DELETE INVENTORY ITEM
// =====================================================

router.delete("/:id", protect, allow("admin"), async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;