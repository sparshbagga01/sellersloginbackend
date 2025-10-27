import express from "express";
import { verifyToken, verifyVendor } from "../../services/jwt/index.js";
import { createProductWithVariants, getAllProducts, getVendorProducts } from "../../controllers/product/product.controller.js";
import { uploadProduct } from "../../middleware/multer/index.js";
import { uploadVariantsAndGlobal } from "../../middleware/multer/index_.js";


const router = express.Router();


router.get("/all", getAllProducts);


router.use(verifyToken, verifyVendor);
router.get("/vendor", getVendorProducts);
router.post("/create", uploadVariantsAndGlobal(20), createProductWithVariants);





export default router;
