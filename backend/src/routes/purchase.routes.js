import { Router } from "express";
import Purchase from "../models/Purchase.js";
import Inventory from "../models/Inventory.js";
import { protect, allow } from "../middleware/auth.js";

const router = Router();

// =====================================================
// PURCHASE NUMBER
// =====================================================

const generatePurchaseNo = () => {
  return `PUR-${Date.now().toString().slice(-8)}`;
};

// =====================================================
// GET ALL PURCHASES
// =====================================================

router.get("/", protect, async (_req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .populate("items.inventoryItem", "itemName unit")
      .sort({ date: -1 });

    res.json(purchases);
  } catch (error) {
    next(error);
  }
});

// =====================================================
// GET SINGLE PURCHASE
// =====================================================

router.get("/:id", protect, async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("items.inventoryItem", "itemName unit");

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    res.json(purchase);
  } catch (error) {
    next(error);
  }
});

// =====================================================
// CREATE PURCHASE
// =====================================================

router.post("/", protect, allow("admin"), async (req, res, next) => {
  try {
    const {
      supplier = "",
      items = [],
      notes = "",
      date,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one purchase item is required",
      });
    }

    const purchaseItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);

      if (!item.inventoryItem) {
        return res.status(400).json({
          message: "Inventory item is required",
        });
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Quantity must be greater than 0",
        });
      }

      if (!Number.isFinite(unitCost) || unitCost < 0) {
        return res.status(400).json({
          message: "Unit cost cannot be negative",
        });
      }

      const inventoryItem = await Inventory.findById(
        item.inventoryItem
      );

      if (!inventoryItem) {
        return res.status(404).json({
          message: "Inventory item not found",
        });
      }

      const total = quantity * unitCost;

      purchaseItems.push({
        inventoryItem: inventoryItem._id,
        itemName: inventoryItem.itemName,
        quantity,
        unit: inventoryItem.unit,
        unitCost,
        total,
      });
    }

    const total = purchaseItems.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // Create purchase
    const purchase = await Purchase.create({
      purchaseNo: generatePurchaseNo(),
      supplier,
      items: purchaseItems,
      total,
      date: date || new Date(),
      status: "completed",
      stockApplied: false,
      notes,
    });

    // =================================================
    // UPDATE INVENTORY
    // =================================================

    for (const item of purchaseItems) {
      const inventoryItem = await Inventory.findById(
        item.inventoryItem
      );

      if (!inventoryItem) continue;

      const oldStock = Number(inventoryItem.currentStock) || 0;

      const oldAverageCost =
        Number(inventoryItem.averageCost) || 0;

      const quantity = Number(item.quantity) || 0;

      const unitCost = Number(item.unitCost) || 0;

      const newStock = oldStock + quantity;

      // Weighted average cost
      const newAverageCost =
        newStock > 0
          ? ((oldStock * oldAverageCost) +
              (quantity * unitCost)) /
            newStock
          : unitCost;

      inventoryItem.currentStock = newStock;

      inventoryItem.lastPurchaseCost = unitCost;

      inventoryItem.averageCost = Number(
        newAverageCost.toFixed(2)
      );

      await inventoryItem.save();
    }

    purchase.stockApplied = true;

    await purchase.save();

    res.status(201).json(purchase);
  } catch (error) {
    next(error);
  }
});

// =====================================================
// CANCEL PURCHASE
// =====================================================

router.put(
  "/:id/cancel",
  protect,
  allow("admin"),
  async (req, res, next) => {
    try {
      const purchase = await Purchase.findById(
        req.params.id
      );

      if (!purchase) {
        return res.status(404).json({
          message: "Purchase not found",
        });
      }

      if (purchase.status === "cancelled") {
        return res.status(400).json({
          message: "Purchase is already cancelled",
        });
      }

      if (purchase.stockApplied) {
        for (const item of purchase.items) {
          const inventoryItem =
            await Inventory.findById(
              item.inventoryItem
            );

          if (!inventoryItem) continue;

          const newStock =
            inventoryItem.currentStock -
            Number(item.quantity);

          if (newStock < 0) {
            return res.status(400).json({
              message:
                `Cannot cancel purchase because stock for ${inventoryItem.itemName} is already used.`,
            });
          }

          inventoryItem.currentStock = newStock;

          await inventoryItem.save();
        }

        purchase.stockApplied = false;
      }

      purchase.status = "cancelled";

      await purchase.save();

      res.json(purchase);
    } catch (error) {
      next(error);
    }
  }
);

export default router;