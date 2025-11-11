import express from "express";
import { verifyToken, verifyVendor } from "../../services/jwt/index.js";
import { createProductWithVariants, getAllProducts, getProductById, getVendorProducts } from "../../controllers/product/product.controller.js";
import { uploadVariantsAndGlobal } from "../../middleware/multer/index_.js";
import { generateDescription } from "../gemini/index.js";


const router = express.Router();


router.get("/all", getAllProducts);
router.get("/:id", getProductById);

router.post("/generate-description", async (req, res) => {
  try {
    const { productName, features, tone = "friendly" } = req.body;

    if (!productName || !features) {
      return res
        .status(400)
        .json({ error: "productName and features are required" });
    }

    const result = await generateDescription(productName, features, tone);
    res.json(result);
  } catch (err) {
    console.error("Error generating description:", err);
    res.status(500).json({ error: "Failed to generate description" });
  }
});

router.use(verifyToken, verifyVendor);
router.get("/vendor", getVendorProducts);
router.post("/create", uploadVariantsAndGlobal(20), createProductWithVariants);





export default router;
