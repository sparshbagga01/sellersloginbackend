import slugify from "slugify";
import { Category } from "../../../models/category/category.model.js";
import { SubCategory } from "../../../models/category/subcategory.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description, meta_title, meta_description, meta_keywords } =
      req.body;

    // ✅ Validate required fields
    if (
      !name ||
      !description ||
      !meta_title ||
      !meta_description ||
      !meta_keywords
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Validate image upload
    if (!req.file) {
      return res.status(400).json({ message: "Category image is required" });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName, { lower: true, strict: true });

    // ✅ Check for existing category by name (case-insensitive optional)
    const exists = await Category.findOne({ name: trimmedName });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const image_url = `/uploads/category/${req.file.filename}`;

    // ✅ Create new category
    const category = await Category.create({
      name: trimmedName,
      slug,
      description,
      image_url,
      meta_title,
      meta_description,
      meta_keywords,
      created_by: req.user?.user_id ? req.user.user_id : null,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    console.error("❌ createCategory error:", err);

    // 🔍 Handle duplicate key (e.g., unique slug or name)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Category with this name or slug already exists" });
    }

    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// 📋 Get all categories with subcategories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: { $ne: true } }) // Exclude soft-deleted
      .sort({ display_order: 1 });

    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error("❌ getAllCategories error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: auto-update slug if name changes
    if (req.body.name) {
      req.body.name = req.body.name.trim();
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { ...req.body, updated_by: req.user?.user_id || null },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    console.error("❌ updateCategory error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Slug or name already exists" });
    }

    res.status(500).json({ message: err.message });
  }
};

// 🗑️ Delete category (soft delete if using isDeleted/deletedAt)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Option 1: Hard delete
    // const deleted = await Category.findByIdAndDelete(id);

    // 🔹 Option 2: Soft delete (recommended if you added isDeleted/deletedAt)
    const deleted = await Category.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: false }
    );

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Optional: Also soft-delete related subcategories
    await SubCategory.updateMany(
      { category_id: id },
      { isDeleted: true, deletedAt: new Date() }
    );

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error("❌ deleteCategory error:", err);
    res.status(500).json({ message: err.message });
  }
};
