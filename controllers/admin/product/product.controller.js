import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import slugify from "slugify";


// Helper: compute final price
const computeFinal = (price, discount = 0) => {
  return Number((price * (1 - discount / 100)).toFixed(2));
};

export const createProductWithVariants = async (req, res) => {
  const session = await Product.startSession();
  session.startTransaction();

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
    if (!vendorId) {
      return res.status(401).json({ message: "Vendor ID missing" });
    }

    // Parse variants
    let parsedVariants = [];
    try {
      parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid variants JSON" });
    }

    if (!productName || !productCategory || !Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "productName, productCategory, and at least one variant are required",
      });
    }

    // Generate slug
    let slug = slugify(productName, { lower: true, strict: true });
    let slugExists = await Product.findOne({ slug }).session(session);
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(productName, { lower: true, strict: true })}-${counter}`;
      slugExists = await Product.findOne({ slug }).session(session);
      counter++;
    }

    // Handle media
    const images = [];
    const videos = [];
    if (req.files) {
      const imageFiles = req.files.images || [];
      const videoFiles = req.files.videos || [];

      imageFiles.forEach((f) => images.push(`/uploads/products/images/${f.filename}`));
      videoFiles.forEach((f) => videos.push(`/uploads/products/videos/${f.filename}`));
    }

    // Create product
    const product = await Product.create(
      [
        {
          productName,
          productCategory,
          productSubCategory,
          brand,
          short_description,
          description,
          isAvailable: isAvailable === "true" || isAvailable === true,
          slug,
          vendor_id: vendorId,
          image_urls: images,
          video_urls: videos,
        },
      ],
      { session }
    );

    const productId = product[0]._id;

    // Prepare variants
    const variantPayloads = parsedVariants.map((v) => {
      const discountPercent = v.discount_percent ?? 0;
      const finalPrice = computeFinal(v.price, discountPercent);

      return {
        product_id: productId,
        sku: v.sku,
        attributes: v.attributes || {},
        actual_price: v.actual_price ?? v.price,
        price: v.price,
        discount_percent: discountPercent,
        final_price: finalPrice,
        stockQuantity: v.stockQuantity ?? 0,
      };
    });

    // Create variants
    await ProductVariant.insertMany(variantPayloads, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "✅ Product with variants created successfully",
      product: product[0],
      variants: variantPayloads,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
      .populate({
        path: "variants",
        model: "ProductVariant",
      })
      .populate({
        path: "productCategory", // ⚠️ Note: In MongoDB, this assumes productCategory is an ObjectId
        model: "Category",
        select: "name",
      })
      .sort({ createdAt: -1 });

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    // If productCategory is stored as string (not ObjectId), skip populate and map manually
    // For now, assuming it's a string → so we fetch category names separately if needed
    // Alternative: if you store categoryId instead of categoryName, change schema accordingly

    // If productCategory is just a string (not ref), then:
    const formattedProducts = products.map((p) => ({
      ...p.toObject(),
      // productCategory remains as string; no need to replace
    }));

    res.status(200).json({
      message: "✅ Products fetched successfully",
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("❌ getAllProducts error:", error);
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user?.user_id;
    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized: Vendor not found" });
    }

    const products = await Product.find({ vendor_id: vendorId })
      .populate("variants")
      .sort({ createdAt: -1 });

    if (!products.length) {
      return res.status(404).json({ message: "No products found for this vendor" });
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