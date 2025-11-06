import path from "path";
import { Vendor } from "../../models/vendor/vendor.model.js";
import { generateOtp, hashedPassword } from "../../functions/common/index.js";
import { encodeToken } from "../../services/jwt/index.js";
import { sendMail } from "../../services/mail/index.js";
import mongoose from "mongoose";
import { Product } from "../../models/product/product.model.js";

const otpStore = new Map();
const emailOtpStore = new Map();
const OTP_EXPIRY = 5 * 60 * 1000;

export const sendPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res.status(400).json({ message: "Phone number required" });

    const otp = generateOtp();
    console.log(`Sending OTP ${otp} to phone ${phone}`);
    otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY });

    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ message: "Phone and OTP required" });

    const record = otpStore.get(phone);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    otpStore.delete(phone);

    let vendor = await Vendor.findOne({ phone });
    if (!vendor) {
      vendor = await Vendor.create({ phone });
    }

    const token = encodeToken({ id: vendor._id, role: vendor.role });
    res.status(200).json({ message: "Phone verified successfully", token });
  } catch (error) {
    console.error("verifyPhoneOtp error:", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message || error });
  }
};

export const sendEmailOtp = async (req, res) => {
  try {
    const { id } = req.user;
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await Vendor.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.is_profile_completed) {
      return res.status(400).json({ message: "Profile already completed" });
    }

    const otp = generateOtp();
    emailOtpStore.set(email, { otp, expiresAt: Date.now() + OTP_EXPIRY });

    await sendMail(
      email,
      "Your email verification code",
      `Your OTP is: ${otp}`
    );

    return res
      .status(200)
      .json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("sendEmailOtp error:", error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { id } = req.user;
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await Vendor.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const record = emailOtpStore.get(email);
    if (!record)
      return res.status(400).json({ message: "No OTP found, please resend" });
    if (Date.now() > record.expiresAt) {
      emailOtpStore.delete(email);
      return res
        .status(400)
        .json({ message: "OTP expired, please request a new one" });
    }
    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.is_email_verified = true;
    user.email = email;
    await user.save();
    emailOtpStore.delete(email);

    return res
      .status(200)
      .json({ message: "Email verified successfully", user });
  } catch (error) {
    console.error("verifyEmailOtp error:", error);
    return res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
};

export const updatePersonalDetails = async (req, res) => {
  try {
    const { id } = req.user;
    const { email, password } = req.body;

    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    if (password && password.trim() !== "") {
      vendor.password = await hashedPassword(password);
    }

    if (email) vendor.email = email;

    await vendor.save();
    res.status(200).json({ message: "Personal details updated", vendor });
  } catch (error) {
    console.error("updatePersonalDetails error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateBusinessDetails = async (req, res) => {
  try {
    const { id } = req.user;
    const vendor = await Vendor.findById(id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Destructure incoming data
    const {
      registrar_name,
      email,
      phone_no,
      name,
      business_type,
      gst_number,
      pan_number,
      alternate_contact_name,
      alternate_contact_phone,
      address_line_1,
      address_line_2,
      street,
      city,
      state,
      pincode,
      country,
      bank_name,
      bank_account,
      ifsc_code,
      branch,
      upi_id,
      categories,
      return_policy,
      operating_hours,
      established_year,
      business_nature,
      annual_turnover,
      dealing_area,
      office_employees,
    } = req.body;

    // Handle file uploads (preserve old paths if not replaced)
    const gst_cert_path = req.files?.gst_cert
      ? `/uploads/vendor/${path.basename(req.files.gst_cert[0].path)}`
      : vendor.gst_cert;

    const pan_card_path = req.files?.pan_card
      ? `/uploads/vendor/${path.basename(req.files.pan_card[0].path)}`
      : vendor.pan_card;

    // Convert categories to array if it's a comma-separated string
    const categoryArray =
      typeof categories === "string"
        ? categories.split(",").map((c) => c.trim())
        : categories;

    // Optional: hash password (example, replace with real logic if needed)
    const haspassword = await hashedPassword("pankajverma");

    // Update fields
    Object.assign(vendor, {
      registrar_name,
      email,
      phone: phone_no || vendor.phone,
      name,
      business_type,
      gst_number,
      pan_number,
      alternate_contact_name,
      alternate_contact_phone,
      // Combine address lines into single address field
      address: [address_line_1, address_line_2].filter(Boolean).join(", "),
      street,
      city,
      state,
      pincode,
      country,
      bank_name,
      bank_account,
      ifsc_code,
      branch,
      upi_id,
      categories: categoryArray,
      return_policy,
      operating_hours,
      established_year,
      business_nature,
      annual_turnover,
      dealing_area,
      office_employees,
      gst_cert: gst_cert_path,
      pan_card: pan_card_path,
      password: haspassword,
      is_profile_completed: true,
      profile_complete_level: 100,
    });

    await vendor.save();

    res.status(200).json({
      message: "Business details updated successfully",
      vendor,
    });
  } catch (error) {
    console.error("updateBusinessDetails error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getVendorProfilewithquery = async (req, res) => {
  try {
    const id =  req.query?.id;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor id",
      });
    }

    const vendor = await Vendor.findById(id).select("-password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.status(200).json({
      success: true,
      message: "Vendor profile fetched successfully",
      vendor,
    });
  } catch (error) {
    console.error("getVendorProfile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const id = req.user?.id ?? req.query?.id;

    const vendor = await Vendor.findById(id).select("-password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.status(200).json({
      success: true,
      message: "Vendor profile fetched successfully",
      vendor,
    });
  } catch (error) {
    console.error("getVendorProfile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getVendorWithProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate vendor ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    // Fetch vendor details
    const vendor = await Vendor.findById(id).select(
      "name email logo description"
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Fetch all products linked to the vendor
    const products = await Product.find({ vendor_id: id })
      .select("productName price default_images productCategory createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      vendor,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching vendor catalog:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching vendor details",
    });
  }
};



//category

export const getvendorcategory = async (req, res) => {
  try {
    const { vendor_id } = req.query;

    if (!vendor_id) {
      return res.status(400).json({ message: "vendor_id is required" });
    }

    const is_vendor_exists = await Vendor.findById(vendor_id);
    if (!is_vendor_exists) {
      return res.status(404).json({ message: "Vendor does not exist" });
    }

    // Fetch categories
    const categories = await Product.find({ vendor_id })
      .select("productCategory -_id"); // only return category field

    // Extract unique categories
    const uniqueCategories = [...new Set(categories.map(c => c.productCategory))];

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: uniqueCategories,
    });

  } catch (error) {
    console.error("Error fetching vendor categories:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
