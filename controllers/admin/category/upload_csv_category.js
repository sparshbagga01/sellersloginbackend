import fs from "fs";
import csv from "csv-parser";
import slugify from "slugify";
import { Category } from "../../../models/category/category.model.js";


/**
 * POST /api/category/import
 * Upload and import categories from CSV
 */
export const importCategories = async (req, res) => {
  try {
    console.log("📁 [importCategories] File uploaded:", req.file?.path);

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const filePath = req.file.path;
    const categories = [];

    // Stream and parse CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.name) {
          categories.push({
            name: row.name.trim(),
            slug: slugify(row.name.trim(), { lower: true, strict: true }),
            description: row.description || "",
            meta_title: row.meta_title || "",
            meta_description: row.meta_description || "",
            meta_keywords: row.meta_keywords || "",
            image_url: "/uploads/categories/default.jpg",
          });
        }
      })
      .on("end", async () => {
        let inserted = 0;

        // Insert only non-existing categories
        for (const cat of categories) {
          const exists = await Category.findOne({ name: cat.name });
          if (!exists) {
            await Category.create(cat);
            inserted++;
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(201).json({
          success: true,
          message: "Categories imported successfully",
          total: categories.length,
          inserted,
        });
      })
      .on("error", (err) => {
        console.error("❌ CSV parsing error:", err);
        fs.unlinkSync(filePath); // Clean up on error
        res.status(500).json({
          message: "Error parsing CSV file",
          error: err.message,
        });
      });
  } catch (err) {
    console.error("❌ [importCategories] Unexpected error:", err);

    // Attempt to clean up file if it still exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};