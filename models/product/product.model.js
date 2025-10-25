
import { Schema, model } from "mongoose";

const productVariantSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() }, // optional custom ID
    sku: { type: String, required: true, unique: true },
    attributes: { type: Schema.Types.Mixed, default: {} }, // like JSONB
    actual_price: { type: Number, required: true },
    price: { type: Number, required: true },
    discount_percent: { type: Number, default: 0 },
    final_price: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
  },
  { _id: false } // prevent Mongoose from adding its own _id to subdocs
);

const productSchema = new Schema(
  {
    vendor_id: { type: String, required: true }, // assuming vendor ID is a string (UUID or ObjectId)
    productName: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    productCategory: { type: String, required: true },
    productSubCategory: String,
    brand: String,
    short_description: String,
    description: String,
    isAvailable: { type: Boolean, default: true },
    image_urls: [{ type: String }],
    video_urls: [{ type: String }],
    variants: [productVariantSchema] // embedded array of variants
  },
  {
    timestamps: true // adds createdAt, updatedAt
  }
);


productSchema.index({ slug: 1 }, { unique: true });

export default model("Product", productSchema);