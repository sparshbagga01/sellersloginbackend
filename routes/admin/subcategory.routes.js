import express from "express";
import { createSubCategory, deleteSubCategory, getAllSubCategories, getSubCategoriesByCategory, updateSubCategory } from "../../controllers/admin/category/subcategory.controller.js";
import { uploadCSV, uploadSubCategoryImage } from "../../middleware/multer/index.js";
import { importSubCategories } from "../../controllers/admin/category/upload_csv_subcategory.js";



const router = express.Router();

// CREATE
router.post("/create", uploadSubCategoryImage.single("image"), createSubCategory);

// READ
router.get("/", getAllSubCategories);
router.get("/category/:category_id", getSubCategoriesByCategory);

// UPDATE
router.put("/:id", updateSubCategory);

// DELETE
router.delete("/:id", deleteSubCategory);

router.post("/import", uploadCSV.single("file"), importSubCategories);

export default router;
