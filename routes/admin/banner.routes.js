import express from "express";
import { createBanner, deleteBanner, getBannerById, getBanners, updateBanner } from "../../controllers/admin/banner.controller.js";
import { uploadBanner } from "../../middleware/multer/index.js";



const router = express.Router();

router.post("/", uploadBanner.single("image"), createBanner);
router.get("/", getBanners);
router.get("/:id", getBannerById);
router.put("/:id", uploadBanner.single("image"), updateBanner);
router.delete("/:id", deleteBanner);

export default router;
