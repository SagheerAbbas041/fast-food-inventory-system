import { Router } from "express";

import MenuItem from "../models/MenuItem.js";

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
// FORMAT SIZE PRICES
// =====================================================

const formatSizePrices = (
  sizePrices
) => {
  if (!Array.isArray(sizePrices)) {
    return [];
  }

  return sizePrices
    .map((item) => {
      const size =
        String(
          item?.size || ""
        ).trim();

      const purchaseCost =
        Number(
          item?.purchaseCost || 0
        );

      const salePrice =
        Number(
          item?.salePrice
        );

      if (
        !size ||
        Number.isNaN(salePrice) ||
        salePrice < 0
      ) {
        return null;
      }

      return {
        size,

        purchaseCost:
          Math.max(
            0,
            Number.isNaN(
              purchaseCost
            )
              ? 0
              : purchaseCost
          ),

        salePrice,
      };
    })
    .filter(Boolean);
};

// =====================================================
// VALIDATE MULTI-SIZE PRODUCTS
// =====================================================

const validateMultiSizeProduct = (
  category,
  sizePrices
) => {
  if (
    !multiSizeCategories.includes(
      category
    )
  ) {
    return null;
  }

  if (
    !Array.isArray(sizePrices) ||
    sizePrices.length === 0
  ) {
    return "At least one size and price is required for this category.";
  }

  const sizes =
    sizePrices.map(
      (item) =>
        String(
          item.size || ""
        )
          .trim()
          .toLowerCase()
    );

  const duplicate =
    sizes.some(
      (size, index) =>
        sizes.indexOf(size) !==
        index
    );

  if (duplicate) {
    return "Duplicate sizes are not allowed.";
  }

  return null;
};

// =====================================================
// FORMAT DEAL ITEMS
// =====================================================
//
// Deal products now contain ONLY:
// - name
//
// Category, variant, size and quantity
// are completely removed.
// =====================================================

const formatDealItems = (
  category,
  dealItems
) => {
  if (
    category !== "Deals" ||
    !Array.isArray(dealItems)
  ) {
    return [];
  }

  return dealItems
    .map((item) => {
      const name =
        String(
          item?.name || ""
        ).trim();

      if (!name) {
        return null;
      }

      return {
        menuItem:
          item?.menuItem || null,

        name,
      };
    })
    .filter(Boolean);
};

// =====================================================
// GET ALL MENU ITEMS
// =====================================================

router.get(
  "/",
  protect,
  async (req, res, next) => {
    try {
      const query = {};

      // -----------------------------------------------
      // CATEGORY FILTER
      // -----------------------------------------------

      if (
        req.query.category &&
        req.query.category !== "All"
      ) {
        query.category =
          req.query.category;
      }

      // -----------------------------------------------
      // SEARCH BY NAME
      // -----------------------------------------------

      if (req.query.search) {
        query.name = {
          $regex:
            req.query.search,
          $options: "i",
        };
      }

      // -----------------------------------------------
      // GET MENU ITEMS
      // -----------------------------------------------

      const items =
        await MenuItem.find(
          query
        ).sort({
          category: 1,
          name: 1,
          variant: 1,
          size: 1,
        });

      res.json(items);
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// CREATE MENU ITEM
// =====================================================

router.post(
  "/",
  protect,
  allow("admin"),
  async (req, res, next) => {
    try {
      const {
        name,
        category,
        variant,
        size,
        image,
        purchaseCost,
        salePrice,
        sizePrices,
        status,
        dealItems,
      } = req.body;

      // =================================================
      // BASIC VALIDATION
      // =================================================

      if (
        !name ||
        !name.trim()
      ) {
        return res.status(400).json({
          message:
            "Menu item name is required.",
        });
      }

      const cleanCategory =
        category?.trim() ||
        "Other";

      // =================================================
      // FORMAT SIZE PRICES
      // =================================================

      const formattedSizePrices =
        formatSizePrices(
          sizePrices
        );

      // =================================================
      // MULTI SIZE VALIDATION
      // =================================================

      const sizeError =
        validateMultiSizeProduct(
          cleanCategory,
          formattedSizePrices
        );

      if (sizeError) {
        return res.status(400).json({
          message: sizeError,
        });
      }

      // =================================================
      // SALE PRICE VALIDATION
      // =================================================

      if (
        !multiSizeCategories.includes(
          cleanCategory
        )
      ) {
        if (
          salePrice === undefined ||
          salePrice === null ||
          Number(salePrice) < 0
        ) {
          return res.status(400).json({
            message:
              "Valid sale price is required.",
          });
        }
      }

      // =================================================
      // PREPARE DEAL ITEMS
      // =================================================

      const formattedDealItems =
        formatDealItems(
          cleanCategory,
          dealItems
        );

      // =================================================
      // CREATE MENU ITEM
      // =================================================

      const item =
        await MenuItem.create({
          name:
            name.trim(),

          category:
            cleanCategory,

          variant:
            variant?.trim() ||
            "",

          size:
            size?.trim() ||
            "",

          image:
            image || "",

          purchaseCost:
            Number(
              purchaseCost || 0
            ),

          salePrice:
            multiSizeCategories.includes(
              cleanCategory
            )
              ? 0
              : Number(
                  salePrice || 0
                ),

          sizePrices:
            formattedSizePrices,

          status:
            status ||
            "active",

          dealItems:
            formattedDealItems,
        });

      res.status(201).json(
        item
      );
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// UPDATE MENU ITEM
// =====================================================

router.put(
  "/:id",
  protect,
  allow("admin"),
  async (req, res, next) => {
    try {
      const {
        name,
        category,
        variant,
        size,
        image,
        purchaseCost,
        salePrice,
        sizePrices,
        status,
        dealItems,
      } = req.body;

      const cleanCategory =
        category?.trim() ||
        "Other";

      // =================================================
      // FORMAT SIZE PRICES
      // =================================================

      const formattedSizePrices =
        formatSizePrices(
          sizePrices
        );

      // =================================================
      // MULTI SIZE VALIDATION
      // =================================================

      const sizeError =
        validateMultiSizeProduct(
          cleanCategory,
          formattedSizePrices
        );

      if (sizeError) {
        return res.status(400).json({
          message: sizeError,
        });
      }

      // =================================================
      // REGULAR PRICE VALIDATION
      // =================================================

      if (
        !multiSizeCategories.includes(
          cleanCategory
        )
      ) {
        if (
          salePrice === undefined ||
          salePrice === null ||
          Number(salePrice) < 0
        ) {
          return res.status(400).json({
            message:
              "Valid sale price is required.",
          });
        }
      }

      // =================================================
      // UPDATE DATA
      // =================================================

      const updateData = {
        name:
          name?.trim(),

        category:
          cleanCategory,

        variant:
          variant?.trim() ||
          "",

        size:
          size?.trim() ||
          "",

        image:
          image || "",

        purchaseCost:
          Number(
            purchaseCost || 0
          ),

        salePrice:
          multiSizeCategories.includes(
            cleanCategory
          )
            ? 0
            : Number(
                salePrice || 0
              ),

        sizePrices:
          formattedSizePrices,

        status:
          status ||
          "active",
      };

      // =================================================
      // UPDATE DEAL PRODUCTS
      // =================================================

      if (
        cleanCategory ===
        "Deals"
      ) {
        updateData.dealItems =
          formatDealItems(
            cleanCategory,
            dealItems
          );
      } else {
        updateData.dealItems =
          [];
      }

      // =================================================
      // UPDATE DATABASE
      // =================================================

      const updatedItem =
        await MenuItem.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      if (
        !updatedItem
      ) {
        return res.status(404).json({
          message:
            "Menu item not found.",
        });
      }

      res.json(
        updatedItem
      );
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// DELETE MENU ITEM
// =====================================================

router.delete(
  "/:id",
  protect,
  allow("admin"),
  async (req, res, next) => {
    try {
      const deletedItem =
        await MenuItem.findByIdAndDelete(
          req.params.id
        );

      if (
        !deletedItem
      ) {
        return res.status(404).json({
          message:
            "Menu item not found.",
        });
      }

      res.json({
        message:
          "Item deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// EXPORT
// =====================================================

export default router;