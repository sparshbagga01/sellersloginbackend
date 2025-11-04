// routes/cloudinaryAuth.js
import express from "express";
import cloudinary from "../../services/cloudnary/index.js";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../../config/variables.js";

const router = express.Router();

router.get("/signature", async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "ecommerce" },
      CLOUDINARY_API_SECRET
    );

    res.json({
      timestamp,
      signature,
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate signature", err });
  }
});

export default router;
