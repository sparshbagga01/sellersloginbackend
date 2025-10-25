import slugify from "slugify";
import { Category } from "../../../models/category/category.model.js";
import { SubCategory } from "../../../models/category/subcategory.js";

// ✅ Create SubCategory
export const createSubCategory = async (req, res) => {
  try {
    console.log("📤 [createSubCategory] Body:", req.body);
    console.log("🖼️ [createSubCategory] File:", req.file);

    const { name, description, category_name } = req.body;

    if (!name || !category_name) {
      return res.status(400).json({
        success: false,
        message: "Both name and category_name are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required for subcategory.",
      });
    }

    // 🔍 Find category by name (case-sensitive or use regex for flexibility)
    const category = await Category.findOne({
      name: category_name,
      isDeleted: { $ne: true },
    });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    const slug = slugify(name.trim(), { lower: true, strict: true });

    // 🔁 Check if subcategory already exists (optional but recommended)
    const existingSub = await SubCategory.findOne({
      name: name.trim(),
      category_id: category._id,
    });
    if (existingSub) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Subcategory already exists in this category.",
        });
    }

    const subCategory = await SubCategory.create({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      image_url: `/uploads/subcategory/${req.file.filename}`,
      category_id: category._id, // MongoDB ObjectId
    });

    res.status(201).json({
      success: true,
      message: "SubCategory created successfully",
      data: subCategory,
    });
  } catch (err) {
    console.error("❌ [createSubCategory] Error:", err);

    // Handle duplicate key (e.g., unique slug)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Subcategory with this slug already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// 📋 Get All SubCategories with Category Info
export const getAllSubCategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find({ isDeleted: { $ne: true } })
      .sort({ name: 1 })
      .populate({
        path: "category_id",
        model: Category,
        select: "name slug", // Only include needed fields
        match: { isDeleted: { $ne: true } },
      })
      .exec();

    // Optional: Filter out subcategories whose category was deleted (if populate returns null)
    const filtered = subcategories.filter((sub) => sub.category_id !== null);

    res.status(200).json({ success: true, data: filtered });
  } catch (err) {
    console.error("❌ [getAllSubCategories] Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔍 Get SubCategories by Category ID
export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const subcategories = await SubCategory.find({
      category_id: category_id,
      isDeleted: { $ne: true },
    }).sort({ name: 1 });

    res.status(200).json({ success: true, data: subcategories });
  } catch (err) {
    console.error("❌ [getSubCategoriesByCategory] Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update SubCategory
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!require("mongoose").Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subcategory ID." });
    }

    // Auto-update slug if name is provided
    if (req.body.name) {
      req.body.name = req.body.name.trim();
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    const subCategory = await SubCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory not found." });
    }

    res.status(200).json({
      success: true,
      message: "SubCategory updated successfully",
      data: subCategory,
    });
  } catch (err) {
    console.error("❌ [updateSubCategory] Error:", err);

    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Slug already exists." });
    }

    res.status(500).json({ message: err.message });
  }
};

// 🗑️ Delete SubCategory (soft delete)
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!require("mongoose").Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subcategory ID." });
    }

    // 🔹 Soft delete (recommended if you have isDeleted field)
    const deleted = await SubCategory.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: false }
    );

    // 🔹 For hard delete, use: await SubCategory.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory not found." });
    }

    res.status(200).json({
      success: true,
      message: "SubCategory deleted successfully",
    });
  } catch (err) {
    console.error("❌ [deleteSubCategory] Error:", err);
    res.status(500).json({ message: err.message });
  }
};
