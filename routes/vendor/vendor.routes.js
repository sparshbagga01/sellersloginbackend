import express from "express";
import { getvendorcategory, getVendorProfile, getVendorProfilewithquery, sendEmailOtp, sendPhoneOtp, updateBusinessDetails, updatePersonalDetails, verifyEmailOtp, verifyPhoneOtp } from "../../controllers/vendor/vendor.controller.js";
import { verifyToken, verifyVendor } from "../../services/jwt/index.js";
import {  uploadVendorPDF } from "../../middleware/multer/index.js";


const router = express.Router();

router.get("/vendorprofile",getVendorProfilewithquery)
router.post("/send-otp", sendPhoneOtp);
router.post("/verify-otp", verifyPhoneOtp);

router.get("/category",getvendorcategory)

router.use(verifyToken, verifyVendor);
// Details update (protected)


router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);

router.put("/personal", updatePersonalDetails);

router.put("/business", uploadVendorPDF.fields([
    { name: "gst_cert", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
  ]), updateBusinessDetails);

router.get("/profile", getVendorProfile);


//category



export default router;
