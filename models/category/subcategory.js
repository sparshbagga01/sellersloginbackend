// models/subcategory/subcategory.model.js
import { Schema, model } from "mongoose";

const SubCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image_url: {
      type: String,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      // Note: Mongoose doesn't enforce referential integrity at DB level
    },
    // Optional: Soft delete fields
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


export const SubCategory = model("SubCategory", SubCategorySchema);