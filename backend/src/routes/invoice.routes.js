import { Router } from "express";
import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";
import { protect, allow } from "../middleware/auth.js";

const router = Router();

const number = (prefix) =>
  `${prefix}-${Date.now().toString().slice(-8)}`;

const allowedPaymentMethods = [
  "Cash",
  "EasyPaisa",
  "JazzCash",
  "Bank Account",
  "Card",
];

// =====================================================
// GET ALL INVOICES
// =====================================================

router.get(
  "/",
  protect,
  async (_req, res, next) => {
    try {
      const invoices = await Invoice.find()
        .populate(
          "order",
          "orderNo status grandTotal editVersion"
        )
        .sort({
          issuedAt: -1,
        });

      res.json(invoices);
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// GET INVOICE BY ORDER ID
// =====================================================

router.get(
  "/order/:orderId",
  protect,
  async (req, res, next) => {
    try {
      const invoice = await Invoice.findOne({
        order: req.params.orderId,
      }).populate(
        "order",
        "orderNo status grandTotal editVersion"
      );

      if (!invoice) {
        return res.status(404).json({
          message:
            "Invoice not found for this order.",
        });
      }

      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// CREATE FIRST INVOICE
// =====================================================

router.post(
  "/",
  protect,
  allow(
    "admin",
    "cashier",
    "kitchen"
  ),
  async (req, res, next) => {
    try {
      const {
        orderId,
        paymentMethod,
      } = req.body;

      if (!orderId) {
        return res.status(400).json({
          message:
            "Order ID is required.",
        });
      }

      const order =
        await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found.",
        });
      }

      // =================================================
      // DELIVERED ORDERS CANNOT CREATE FIRST INVOICE
      // =================================================

      if (
        order.status ===
        "delivered"
      ) {
        return res.status(400).json({
          message:
            "A delivered order already requires an existing invoice. Use the update invoice function.",
        });
      }

      // =================================================
      // VALID PAYMENT METHOD
      // =================================================

      if (
        !allowedPaymentMethods.includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid payment method.",
        });
      }

      // =================================================
      // CHECK EXISTING INVOICE
      // =================================================

      const existingInvoice =
        await Invoice.findOne({
          order: order._id,
        });

      if (existingInvoice) {
        return res.status(409).json({
          message:
            "Invoice already exists. Use the update invoice function.",
          invoice:
            existingInvoice,
        });
      }

      // =================================================
      // CREATE INVOICE
      // =================================================

      const invoice =
        await Invoice.create({
          invoiceNo:
            number("INV"),

          order:
            order._id,

          tableName:
            order.tableName,

          customerName:
            order.customerName ||
            "Walk-in",

          items:
            (order.items || []).map(
              (item) => ({
                menuItem:
                  item.menuItem,

                name:
                  item.name || "",

                category:
                  item.category || "",

                variant:
                  item.variant || "",

                size:
                  item.size || "",

                quantity:
                  Number(
                    item.quantity || 0
                  ),

                unitPrice:
                  Number(
                    item.unitPrice || 0
                  ),

                total:
                  Number(
                    item.total || 0
                  ),
              })
            ),

          subtotal:
            Number(
              order.subtotal || 0
            ),

          discount:
            Number(
              order.discount || 0
            ),

          tax:
            Number(
              order.tax || 0
            ),

          total:
            Number(
              order.grandTotal || 0
            ),

          paymentMethod,

          orderVersion:
            Number(
              order.editVersion || 1
            ),

          createdBy:
            req.user.id,
        });

      // =================================================
      // SAVE PAYMENT METHOD TO ORDER
      // =================================================

      order.paymentMethod =
        paymentMethod;

      await order.save();

      res.status(201).json(
        invoice
      );
    } catch (error) {
      console.error(
        "CREATE INVOICE ERROR:",
        error
      );

      next(error);
    }
  }
);

// =====================================================
// UPDATE EXISTING INVOICE BY ORDER
// =====================================================
//
// IMPORTANT:
//
// This updates the SAME invoice.
//
// It does NOT create a new invoice.
//
// This route also allows updating the invoice
// of an already delivered order.
//
// =====================================================

router.put(
  "/order/:orderId",
  protect,
  allow(
    "admin",
    "cashier",
    "kitchen"
  ),
  async (req, res, next) => {
    try {
      const {
        paymentMethod,
      } = req.body;

      const order =
        await Order.findById(
          req.params.orderId
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found.",
        });
      }

      // =================================================
      // IMPORTANT
      // =================================================
      //
      // DO NOT BLOCK DELIVERED ORDERS HERE.
      //
      // A delivered order can be edited.
      // After editing, its invoice becomes stale.
      // This route updates that existing invoice.
      //
      // =================================================

      // =================================================
      // PAYMENT METHOD
      // =================================================

      if (
        !allowedPaymentMethods.includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid payment method.",
        });
      }

      // =================================================
      // FIND EXISTING INVOICE
      // =================================================

      const invoice =
        await Invoice.findOne({
          order: order._id,
        });

      if (!invoice) {
        return res.status(404).json({
          message:
            "No existing invoice was found for this order. Generate the invoice first.",
        });
      }

      // =================================================
      // UPDATE SAME INVOICE
      // =================================================

      invoice.tableName =
        order.tableName;

      invoice.customerName =
        order.customerName ||
        "Walk-in";

      // =================================================
      // COPY COMPLETE PRODUCT INFORMATION
      // ORDER -> INVOICE
      // =================================================

      invoice.items =
        (order.items || []).map(
          (item) => ({
            menuItem:
              item.menuItem,

            name:
              item.name || "",

            category:
              item.category || "",

            variant:
              item.variant || "",

            size:
              item.size || "",

            quantity:
              Number(
                item.quantity || 0
              ),

            unitPrice:
              Number(
                item.unitPrice || 0
              ),

            total:
              Number(
                item.total || 0
              ),
          })
        );

      // =================================================
      // UPDATE TOTALS
      // =================================================

      invoice.subtotal =
        Number(
          order.subtotal || 0
        );

      invoice.discount =
        Number(
          order.discount || 0
        );

      invoice.tax =
        Number(
          order.tax || 0
        );

      invoice.total =
        Number(
          order.grandTotal || 0
        );

      // =================================================
      // UPDATE PAYMENT METHOD
      // =================================================

      invoice.paymentMethod =
        paymentMethod;

      // =================================================
      // IMPORTANT:
      // SET INVOICE TO CURRENT ORDER VERSION
      // =================================================

      invoice.orderVersion =
        Number(
          order.editVersion || 1
        );

      await invoice.save();

      // =================================================
      // SAVE PAYMENT METHOD TO ORDER
      // =================================================

      order.paymentMethod =
        paymentMethod;

      await order.save();

      res.json(
        invoice
      );
    } catch (error) {
      console.error(
        "UPDATE INVOICE ERROR:",
        error
      );

      next(error);
    }
  }
);

// =====================================================
// DELETE INVOICE
// =====================================================

router.delete(
  "/:id",
  protect,
  allow("admin"),
  async (req, res, next) => {
    try {
      const invoice =
        await Invoice.findById(
          req.params.id
        );

      if (!invoice) {
        return res.status(404).json({
          message:
            "Invoice not found.",
        });
      }

      await Invoice.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Invoice deleted successfully.",

        invoiceId:
          req.params.id,
      });
    } catch (error) {
      console.error(
        "DELETE INVOICE ERROR:",
        error
      );

      next(error);
    }
  }
);

export default router;