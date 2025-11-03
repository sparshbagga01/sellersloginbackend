import express from "express";
import ImageKit from "imagekit";
import { IMAGEKIT_IO_PRIVATE_KEY, IMAGEKIT_IO_PUBLIC_KEY, IMAGEKIT_IO_URL } from "../../config/variables.js";

const router = express.Router();

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_IO_PUBLIC_KEY,
  privateKey: IMAGEKIT_IO_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_IO_URL,
});


//this is upload structure of imagekit io 

// const uploadResponse = await imagekit.upload({
//   file: imageBase64,   // required: Base64 string, URL, or file buffer
//   fileName: fileName,  // optional but recommended
//   folder: "/products", // optional: upload folder in ImageKit
//   tags: ["product"],   // optional
// });

router.get("/imagekit-auth", (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json(authParams);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    res.status(500).json({ error: "Failed to get auth parameters" });
  }
});

export default router;
