import express from "express";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../../controllers/admin/category/category.controller.js";
import { verifyAdmin, verifyToken } from "../../services/jwt/index.js";
import { uploadCategoryImage, uploadCSV, } from "../../middleware/multer/index.js";
import { importCategories } from "../../controllers/admin/category/upload_csv_category.js";



const router = express.Router();
router.get("/get-category", getAllCategories);
router.use(verifyToken, verifyAdmin);

// Admin protected routes
router.post("/create", uploadCategoryImage.single("image"), createCategory);

router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

router.post("/import", uploadCSV.single("file"), importCategories);
export default router;
