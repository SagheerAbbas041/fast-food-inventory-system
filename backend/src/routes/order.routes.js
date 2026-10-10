import { Router } from "express";

import Order from "../models/Order.js";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";
import Invoice from "../models/Invoice.js";

import {
  protect,
  allow,
} from "../middleware/auth.js";

const router = Router();

// =====================================================
// MULTI-SIZE CATEGORIES
// =====================================================

const multiSizeCategories = [
  "Special Flavours",
  "Regular Pizza",
  "Wings",
];

// =====================================================
// NUMBER
// =====================================================

const number = (prefix) =>
  `${prefix}-${Date.now()
    .toString()
    .slice(-8)}`;

// =====================================================
// ROUND MONEY
// =====================================================

const roundMoney = (value) =>
  Math.round(Number(value || 0) * 100) / 100;

// =====================================================
// NORMALIZE TAX RATE
// =====================================================

const getTaxRate = (value) => {
  const rate = Number(value);

  if (!Number.isFinite(rate)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(rate, 100)
  );
};

// =====================================================
// GET CORRECT PRODUCT PRICE
// =====================================================

const getProductPrice = (
  product,
  requestedSize
) => {
  const category = product.category;

  const isMultiSize =
    multiSizeCategories.includes(category) &&
    Array.isArray(product.sizePrices) &&
    product.sizePrices.length > 0;

  // ===================================================
  // MULTI SIZE PRODUCT
  // ===================================================

  if (isMultiSize) {
    const selectedSize = String(
      requestedSize || ""
    ).trim();

    if (!selectedSize) {
      return {
        error: `Please select a size for ${product.name}.`,
      };
    }

    const sizeOption =
      product.sizePrices.find(
        (option) =>
          String(option.size).trim() ===
          selectedSize
      );

    if (!sizeOption) {
      return {
        error: `Selected size "${selectedSize}" is not available for ${product.name}.`,
      };
    }

    return {
      size: sizeOption.size,

      purchaseCost: Number(
        sizeOption.purchaseCost || 0
      ),

      unitPrice: Number(
        sizeOption.salePrice || 0
      ),
    };
  }

  // ===================================================
  // NORMAL PRODUCT
  // ===================================================

  return {
    size:
      requestedSize ||
      product.size ||
      "",

    purchaseCost: Number(
      product.purchaseCost || 0
    ),

    unitPrice: Number(
      product.salePrice || 0
    ),
  };
};

// =====================================================
// CALCULATE ORDER TOTALS
// =====================================================

const calculateTotals = ({
  subtotal,
  discount,
  taxRate,
}) => {
  const safeSubtotal = Math.max(
    0,
    roundMoney(subtotal)
  );

  const safeDiscount = Math.max(
    0,
    Math.min(
      Number(discount) || 0,
      safeSubtotal
    )
  );

  const safeTaxRate =
    getTaxRate(taxRate);

  const taxableAmount = Math.max(
    0,
    safeSubtotal - safeDiscount
  );

  const tax = roundMoney(
    taxableAmount *
      (safeTaxRate / 100)
  );

  const grandTotal = roundMoney(
    taxableAmount + tax
  );

  return {
    subtotal: safeSubtotal,

    discount: roundMoney(
      safeDiscount
    ),

    taxRate: safeTaxRate,

    tax,

    grandTotal,
  };
};

// =====================================================
// GET ALL ORDERS
// =====================================================

router.get(
  "/",
  protect,
  async (
    _req,
    res,
    next
  ) => {
    try {
      const orders =
        await Order.find()
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
            "name salePrice category variant size sizePrices"
          )
          .sort({
            createdAt: -1,
          })
          .limit(500);

      res.json(orders);
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// GET SINGLE ORDER
// =====================================================

router.get(
  "/:id",
  protect,
  async (
    req,
    res,
    next
  ) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        )
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
            "name salePrice category variant size sizePrices"
          );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// CREATE ORDER
// =====================================================

router.post(
  "/",
  protect,
  allow(
    "admin",
    "cashier"
  ),
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        tableId,
        customerName,
        items,
        discount = 0,
        taxRate,
        taxPercentage,
        taxPercent,
      } = req.body;

      if (!tableId) {
        return res.status(400).json({
          message:
            "Table is required",
        });
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          message:
            "Order must contain at least one product",
        });
      }

      const table =
        await Table.findById(
          tableId
        );

      if (!table) {
        return res.status(404).json({
          message:
            "Table not found",
        });
      }

      const ids = items.map(
        (item) =>
          item.menuItem
      );

      const dbItems =
        await MenuItem.find({
          _id: {
            $in: ids,
          },
        });

      const normalized = [];

      for (
        const item of items
      ) {
        const product =
          dbItems.find(
            (dbItem) =>
              String(
                dbItem._id
              ) ===
              String(
                item.menuItem
              )
          );

        if (!product) {
          return res.status(404).json({
            message:
              "Menu item not found",
          });
        }

        const quantity =
          Math.max(
            1,
            Number(
              item.quantity
            ) || 1
          );

        const priceResult =
          getProductPrice(
            product,
            item.size
          );

        if (
          priceResult.error
        ) {
          return res.status(400).json({
            message:
              priceResult.error,
          });
        }

        const unitPrice =
          priceResult.unitPrice;

        const total =
          roundMoney(
            unitPrice *
              quantity
          );

        normalized.push({
          menuItem:
            product._id,

          name:
            product.name,

          category:
            product.category ||
            "",

          variant:
            product.variant ||
            "",

          size:
            priceResult.size,

          quantity,

          unitPrice,

          total,

          dealItems:
            Array.isArray(
              item.dealItems
            )
              ? item.dealItems
              : [],
        });
      }

      const subtotal =
        roundMoney(
          normalized.reduce(
            (
              sum,
              item
            ) =>
              sum +
              Number(
                item.total || 0
              ),
            0
          )
        );

      let selectedTaxRate;

      if (
        taxRate !== undefined &&
        taxRate !== null &&
        taxRate !== ""
      ) {
        selectedTaxRate =
          taxRate;
      } else if (
        taxPercentage !==
          undefined &&
        taxPercentage !== null &&
        taxPercentage !== ""
      ) {
        selectedTaxRate =
          taxPercentage;
      } else if (
        taxPercent !== undefined &&
        taxPercent !== null &&
        taxPercent !== ""
      ) {
        selectedTaxRate =
          taxPercent;
      } else {
        selectedTaxRate = 0;
      }

      const totals =
        calculateTotals({
          subtotal,
          discount,
          taxRate:
            selectedTaxRate,
        });

      const order =
        await Order.create({
          orderNo:
            number("ORD"),

          table:
            table._id,

          tableName:
            table.name,

          customerName:
            customerName ||
            "Walk-in",

          items:
            normalized,

          subtotal:
            totals.subtotal,

          discount:
            totals.discount,

          taxRate:
            totals.taxRate,

          tax:
            totals.tax,

          grandTotal:
            totals.grandTotal,

          status:
            "pending",

          createdBy:
            req.user.id,

          editVersion: 1,
        });

      table.status =
        "occupied";

      await table.save();

      res.status(201).json(
        order
      );
    } catch (error) {
      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      next(error);
    }
  }
);

// =====================================================
// UPDATE ORDER
// =====================================================
//
// Delivered orders CAN be edited.
// Paid orders remain locked.
//
// Editing a delivered order:
// 1. Updates products
// 2. Recalculates totals
// 3. Increases editVersion
// 4. Makes existing invoice stale
// 5. Order remains delivered
//
// =====================================================

router.put(
  "/:id",
  protect,
  allow(
    "admin",
    "cashier",
    "kitchen"
  ),
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        items,
        discount = 0,
        taxRate,
        taxPercentage,
        taxPercent,
      } = req.body;

      if (
        !Array.isArray(items)
      ) {
        return res.status(400).json({
          message:
            "Items must be an array",
        });
      }

      if (
        items.length === 0
      ) {
        return res.status(400).json({
          message:
            "Order must contain at least one product",
        });
      }

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      // =================================================
      // PAID ORDER LOCK
      // =================================================
      //
      // Delivered orders are intentionally NOT blocked.
      //
      // =================================================

      if (
        order.status ===
        "paid"
      ) {
        return res.status(400).json({
          message:
            "A paid order cannot be edited.",
        });
      }

      const ids = items.map(
        (item) =>
          item.menuItem
      );

      const dbItems =
        await MenuItem.find({
          _id: {
            $in: ids,
          },
        });

      const normalized = [];

      for (
        const item of items
      ) {
        const product =
          dbItems.find(
            (dbItem) =>
              String(
                dbItem._id
              ) ===
              String(
                item.menuItem
              )
          );

        if (!product) {
          return res.status(404).json({
            message:
              "One or more menu products were not found.",
          });
        }

        const quantity =
          Math.max(
            1,
            Number(
              item.quantity
            ) || 1
          );

        const priceResult =
          getProductPrice(
            product,
            item.size
          );

        if (
          priceResult.error
        ) {
          return res.status(400).json({
            message:
              priceResult.error,
          });
        }

        const unitPrice =
          priceResult.unitPrice;

        const total =
          roundMoney(
            unitPrice *
              quantity
          );

        normalized.push({
          menuItem:
            product._id,

          name:
            product.name,

          category:
            product.category ||
            "",

          variant:
            product.variant ||
            "",

          size:
            priceResult.size,

          quantity,

          unitPrice,

          total,

          dealItems:
            Array.isArray(
              item.dealItems
            )
              ? item.dealItems
              : [],
        });
      }

      const subtotal =
        roundMoney(
          normalized.reduce(
            (
              sum,
              item
            ) =>
              sum +
              Number(
                item.total || 0
              ),
            0
          )
        );

      let selectedTaxRate;

      if (
        taxRate !== undefined &&
        taxRate !== null &&
        taxRate !== ""
      ) {
        selectedTaxRate =
          taxRate;
      } else if (
        taxPercentage !==
          undefined &&
        taxPercentage !== null &&
        taxPercentage !== ""
      ) {
        selectedTaxRate =
          taxPercentage;
      } else if (
        taxPercent !== undefined &&
        taxPercent !== null &&
        taxPercent !== ""
      ) {
        selectedTaxRate =
          taxPercent;
      } else {
        selectedTaxRate =
          order.taxRate || 0;
      }

      const totals =
        calculateTotals({
          subtotal,
          discount,
          taxRate:
            selectedTaxRate,
        });

      order.items =
        normalized;

      order.subtotal =
        totals.subtotal;

      order.discount =
        totals.discount;

      order.taxRate =
        totals.taxRate;

      order.tax =
        totals.tax;

      order.grandTotal =
        totals.grandTotal;

      // =================================================
      // INCREASE EDIT VERSION
      // =================================================

      order.editVersion =
        Number(
          order.editVersion || 1
        ) + 1;

      await order.save();

      const updatedOrder =
        await Order.findById(
          order._id
        )
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
            "name salePrice category variant size sizePrices"
          );

      res.json(
        updatedOrder
      );
    } catch (error) {
      console.error(
        "UPDATE ORDER ERROR:",
        error
      );

      next(error);
    }
  }
);

// =====================================================
// DELETE ORDER
// =====================================================

router.delete(
  "/:id",
  protect,
  allow(
    "admin",
    "cashier"
  ),
  async (
    req,
    res,
    next
  ) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      await Invoice.deleteMany({
        order: order._id,
      });

      await Order.findByIdAndDelete(
        order._id
      );

      res.json({
        success: true,

        message:
          "Order deleted successfully.",

        orderId:
          order._id,

        orderNo:
          order.orderNo,
      });
    } catch (error) {
      console.error(
        "DELETE ORDER ERROR:",
        error
      );

      next(error);
    }
  }
);

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

router.put(
  "/:id/status",
  protect,
  allow(
    "admin",
    "cashier",
    "kitchen"
  ),
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "created",
        "pending",
        "preparing",
        "ready",
        "delivered",
        "paid",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order status",
        });
      }

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      // =================================================
      // DELIVERED STATUS IS FINAL
      // =================================================
      //
      // Editing the order itself is allowed.
      // Changing its status is NOT allowed.
      //
      // =================================================

      if (
        order.status ===
        "delivered"
      ) {
        return res.status(400).json({
          message:
            "A delivered order cannot have its status changed.",
        });
      }

      // =================================================
      // INVOICE REQUIRED BEFORE DELIVERED
      // =================================================

      if (
        status ===
        "delivered"
      ) {
        const invoice =
          await Invoice.findOne({
            order:
              order._id,
          });

        if (!invoice) {
          return res.status(400).json({
            message:
              "Invoice must be generated before this order can be delivered.",
          });
        }

        if (
          Number(
            invoice.orderVersion
          ) !==
          Number(
            order.editVersion ||
              1
          )
        ) {
          return res.status(400).json({
            message:
              "The order was edited after the invoice was generated. Please update the existing invoice before delivering the order.",
          });
        }
      }

      order.status =
        status;

      await order.save();

      // =================================================
      // DELIVERED = RELEASE TABLE
      // =================================================

      if (
        status ===
          "delivered" &&
        order.table
      ) {
        await Table.findByIdAndUpdate(
          order.table,
          {
            status:
              "available",
          }
        );
      }

      // =================================================
      // PAID = RELEASE TABLE
      // =================================================

      if (
        status ===
          "paid" &&
        order.table
      ) {
        await Table.findByIdAndUpdate(
          order.table,
          {
            status:
              "available",
          }
        );
      }

      const updatedOrder =
        await Order.findById(
          order._id
        )
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
            "name salePrice category variant size sizePrices"
          );

      res.json(
        updatedOrder
      );
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      next(error);
    }
  }
);

export default router;