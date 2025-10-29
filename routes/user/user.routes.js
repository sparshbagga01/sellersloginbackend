import express from "express";
// import {
//   registerUser,
//   loginUser,
//   resetPassword,
//   getProfile,
//   updateProfile,
//   uploadProfilePhoto,
//   addAddress,
//   getAllAddresses,
//   deleteAddress,
// } from "../../controllers/user.controller.js";

import { verifyToken, verifyUser } from "../../services/jwt/index.js";
import { getVendorWithProducts } from "../../controllers/vendor/vendor.controller.js";

const router = express.Router();



// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/reset-password", resetPassword);


router.get("/:id/products", getVendorWithProducts);
router.use(verifyToken, verifyUser);
// router.get("/profile", getProfile);
// router.put("/profile", updateProfile);
// router.post("/profile/photo", upload.single("photo"), uploadProfilePhoto);

// router.post("/address", addAddress);
// router.get("/address", getAllAddresses);
// router.delete("/address/:addressId", deleteAddress);

export default router;
