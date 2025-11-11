import mongoose, { Schema } from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    sku: { type: String, required: true, unique: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
    actual_price: { type: Number, required: true },
    price: { type: Number, required: true },
    discount_percent: { type: Number, default: 0 },
    final_price: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    image_urls: [{ type: String }],
    is_active: { type: Boolean, default: true },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    vendor_id: { type: String, required: true },
    productName: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    productCategory: { type: String, required: true },
    productSubCategory: String,
    brand: String,
    productSubCategory: {
      type: [String],
      default: [],
    },
    short_description: String,
    description: String,
    default_images: {
      type: [String],
      default: [],
    },
    isAvailable: { type: Boolean, default: true },
    variants: [productVariantSchema],
    specifications: { type: Schema.Types.Mixed, default: {} },
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
