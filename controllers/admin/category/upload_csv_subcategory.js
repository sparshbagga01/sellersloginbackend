import fs from 'fs';
import csv from 'csv-parser';
import slugify from 'slugify';
import { Category } from '../../../models/category/category.model.js';
import { SubCategory } from '../../../models/category/subcategory.js';

export const importSubCategories = async (req, res) => {
  console.log("📥 [importSubCategories] Request received");

  try {
    if (!req.file) {
      console.warn("⚠️ [importSubCategories] No file provided in request");
      return res.status(400).json({ success: false, message: "CSV file is required" });
    }

    const filePath = req.file.path;
    console.log(`📄 [importSubCategories] Processing file: ${filePath}`);

    const subcategories = [];

    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        console.log("🧾 [CSV Row] Raw row data:", row);

        if (row.name && row.category_name && row.image_url) {
          const sub = {
            name: row.name.trim(),
            slug: slugify(row.name, { lower: true, strict: true }),
            description: row.description || "",
            image_url: row.image_url,
            category_name: row.category_name.trim(),
          };
          subcategories.push(sub);
          console.log("✅ [Parsed SubCategory] Added to queue:", sub);
        } else {
          console.warn("⚠️ [CSV Row] Skipping invalid row (missing required fields):", row);
        }
      })
      .on("end", async () => {
        console.log(`🔚 [CSV Parsing] Finished. Total valid rows: ${subcategories.length}`);

        let inserted = 0;
        let skipped = 0;

        for (const sub of subcategories) {
          console.log(`🔍 [Processing] SubCategory: "${sub.name}" under category: "${sub.category_name}"`);

          // 🔍 Find category by NAME (MongoDB)
          const category = await Category.findOne({ name: sub.category_name });
          if (!category) {
            console.warn(`❌ [Skipped] Category "${sub.category_name}" not found for subcategory "${sub.name}"`);
            skipped++;
            continue;
          }
          console.log(`📂 [Found Category] ID: ${category._id}, Name: ${category.name}`);

          // 🔍 Check if subcategory already exists by NAME
          const exists = await SubCategory.findOne({ name: sub.name });
          if (exists) {
            console.warn(`🔄 [Skipped] SubCategory "${sub.name}" already exists`);
            skipped++;
            continue;
          }

          try {
            // ✅ Create subcategory with category ObjectId
            await SubCategory.create({
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
              image_url: sub.image_url,
              category_id: category._id, // ← MongoDB uses _id
            });
            inserted++;
            console.log(`✅ [Inserted] New SubCategory: "${sub.name}" (Category ID: ${category._id})`);
          } catch (createErr) {
            console.error(`💥 [Failed to Insert] SubCategory "${sub.name}":`, createErr.message);
            skipped++;
          }
        }

        // Clean up uploaded file
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️ [Cleanup] Temporary file deleted: ${filePath}`);
        } catch (unlinkErr) {
          console.error(`⚠️ [Cleanup Failed] Could not delete file ${filePath}:`, unlinkErr.message);
        }

        const result = {
          success: true,
          message: "SubCategories imported successfully",
          total: subcategories.length,
          inserted,
          skipped,
        };
        console.log("📤 [Response] Sending result:", result);
        res.status(201).json(result);
      })
      .on("error", (streamErr) => {
        console.error("🚨 [CSV Stream Error]:", streamErr);
        res.status(500).json({
          success: false,
          message: "Error reading CSV file",
          error: streamErr.message,
        });
      });
  } catch (err) {
    console.error("❌ [importSubCategories] Unexpected error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};