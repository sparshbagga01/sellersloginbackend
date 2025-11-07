import slugify from "slugify";
import { Product } from "../../models/product/product.model.js";
import mongoose from "mongoose";

export const createProductWithVariants = async (req, res) => {
  try {
    const {
      productName,
      productCategory,
      productSubCategory,
      brand,
      short_description,
      description,
      isAvailable,
      variants,
    } = req.body;
    const vendorId = req.user?.user_id;
    if (!vendorId)
      return res.status(401).json({ message: "Vendor ID missing" });

    let parsedVariants = [];
    try {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch {
      return res.status(400).json({ message: "Invalid variants JSON" });
    }

    if (!productName || !productCategory || parsedVariants.length === 0)
      return res.status(400).json({
        message:
          "productName, productCategory, and at least one variant are required",
      });

    let parsedSubCategories = [];

    if (productSubCategory) {
      if (Array.isArray(productSubCategory)) {
        parsedSubCategories = productSubCategory;
      } else if (typeof productSubCategory === "string") {
        try {
          const parsed = JSON.parse(productSubCategory);
          parsedSubCategories = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // If JSON.parse fails, maybe user sent comma-separated string
          parsedSubCategories = productSubCategory
            .split(",")
            .map((s) => s.trim());
        }
      }
    }

    // Generate unique slug
    let baseSlug = slugify(productName, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Global images
    const globalFiles = req.files?.globalImages || [];
    const global_image_urls = globalFiles.map(
      (file) => `/uploads/products/default/${file.filename}`
    );

    // Map variant images
    const embeddedVariants = parsedVariants.map((v, idx) => {
      const actualPrice = v.actual_price ?? v.price;
      const sellingPrice = v.price;
      let discountPercent = 0;
      if (actualPrice > sellingPrice)
        discountPercent = parseFloat(
          (((actualPrice - sellingPrice) / actualPrice) * 100).toFixed(2)
        );
      const finalPrice = Number(
        (sellingPrice * (1 - discountPercent / 100)).toFixed(2)
      );

      const variantFiles = req.files?.[`images-${idx}`] || [];
      const image_urls = variantFiles.map(
        (file) => `/uploads/products/variants/${file.filename}`
      );

      return {
        sku: v.sku,
        attributes: v.attributes || {},
        actual_price: actualPrice,
        price: sellingPrice,
        discount_percent: discountPercent,
        final_price: finalPrice,
        stockQuantity: v.stockQuantity ?? 0,
        is_active: v.is_active !== false,
        image_urls,
      };
    });

    const product = await Product.create({
      vendor_id: vendorId,
      productName,
      slug,
      productCategory,
      productSubCategory: parsedSubCategories,
      brand,
      short_description,
      description,
      isAvailable: isAvailable === "true" || isAvailable === true,
      default_images: global_image_urls,
      variants: embeddedVariants,
    });

    return res.status(201).json({
      message: "Product with variants created successfully",
      product,
    });
  } catch (error) {
    console.error("❌ createProductWithVariants error:", error);
    return res.status(500).json({
      message: "Failed to create product with variants",
      error: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .select(
        "_id productName productCategory productSubCategory brand default_images variants"
      );

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({
      message: "✅ Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

 const result = await Product.aggregate([
  {
    $match: { _id: new mongoose.Types.ObjectId(id) },
  },
  {
    $lookup: {
      from: "vendors",
      let: { vendorObjId: { $toObjectId: "$vendor_id" } },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$vendorObjId"] } } },
        { $project: { name: 1, _id: 1 } },
      ],
      as: "vendor",
    },
  },
  {
    $unwind: {
      path: "$vendor",
      preserveNullAndEmptyArrays: true, // keeps vendor null if not found
    },
  },
]);

    if (!result.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "✅ Product fetched successfully",
      product: result[0],
    });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({
      message: "Failed to fetch product details",
      error: error.message,
    });
  }
};

export const getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user?.user_id;
    if (!vendorId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Vendor not found" });
    }

    const products = await Product.find({ vendor_id: vendorId }).sort({
      createdAt: -1,
    });

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found for this vendor" });
    }

    res.status(200).json({
      message: "✅ Vendor products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ getVendorProducts error:", error);
    res.status(500).json({
      message: "Failed to fetch vendor products",
      error: error.message,
    });
  }
};
